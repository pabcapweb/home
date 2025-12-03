let allContent = [];

// Load JSON data
async function loadContent() {
    try {
        const response = await fetch('content.json');
        const data = await response.json();
        
        allContent = data.galleryItems;
        
        // Set site name
        document.getElementById('siteName').textContent = data.siteName;
        
        // Render hero section
        renderHero(data.mainContent);
        
        // Render gallery
        renderGallery(allContent);
        
        // Set footer
        document.getElementById('footerText').textContent = `© 2025 ${data.siteName}. All rights reserved.`;
        
    } catch (error) {
        console.error('Error loading content:', error);
    }
}

// Render hero section
function renderHero(content) {
    const heroSection = document.getElementById('heroSection');
    
    let buttonHTML = '';
    if (content.button && content.button.text) {
        const btnClass = content.button.primary ? 'btn-primary' : 'btn-secondary';
        buttonHTML = `<a href="${content.button.link}" class="btn ${btnClass}">${content.button.text}</a>`;
    }
    
    heroSection.innerHTML = `
        <h1 class="hero-title">${content.title}</h1>
        <p class="hero-description">${content.description}</p>
        ${buttonHTML}
    `;
}

// Calculate time ago
function getTimeAgo(dateString) {
    const now = new Date();
    const publishDate = new Date(dateString);
    const diffMs = now - publishDate;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    let text, isNew;
    
    if (diffMins < 60) {
        text = `${diffMins} ${diffMins === 1 ? 'minute' : 'minutes'} ago`;
        isNew = true;
    } else if (diffHours < 24) {
        text = `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
        isNew = true;
    } else if (diffDays <= 7) {
        text = `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`;
        isNew = diffDays <= 3;
    } else {
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        text = publishDate.toLocaleDateString('en-US', options);
        isNew = false;
    }
    
    return { text, isNew };
}

// Render gallery
function renderGallery(items) {
    const galleryGrid = document.getElementById('galleryGrid');
    const noResults = document.getElementById('noResults');
    
    if (items.length === 0) {
        galleryGrid.innerHTML = '';
        noResults.style.display = 'block';
        return;
    }
    
    noResults.style.display = 'none';
    
    galleryGrid.innerHTML = items.map(item => {
        const timeInfo = getTimeAgo(item.publishDate);
        const sizeClass = `item-size-${item.size}`;
        const timeClass = timeInfo.isNew ? 'new' : 'old';
        
        let buttonHTML = '';
        if (item.button && item.button.text) {
            const btnClass = item.button.primary ? 'btn-primary' : 'btn-secondary';
            buttonHTML = `<a href="${item.button.link}" class="btn ${btnClass} item-button">${item.button.text}</a>`;
        }
        
        return `
            <div class="gallery-item ${sizeClass}">
                <div class="item-content-wrapper">
                    <div class="item-header">
                        <svg class="time-icon ${timeClass}" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                            <circle cx="12" cy="12" r="10"></circle>
                            <polyline points="12 6 12 12 16 14"></polyline>
                        </svg>
                        <span class="time-text ${timeClass}">${timeInfo.text}</span>
                    </div>
                    <h3 class="item-title">${item.title}</h3>
                    <p class="item-description">${item.description}</p>
                </div>
                ${buttonHTML}
            </div>
        `;
    }).join('');
}

// Render search suggestions
function renderSuggestions(items) {
    const suggestionsDropdown = document.getElementById('suggestionsDropdown');
    
    if (items.length === 0) {
        suggestionsDropdown.classList.remove('show');
        return;
    }
    
    suggestionsDropdown.innerHTML = items.map(item => {
        const timeInfo = getTimeAgo(item.publishDate);
        const timeClass = timeInfo.isNew ? 'new' : 'old';
        
        return `
            <div class="suggestion-item" data-title="${item.title}">
                <svg class="suggestion-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                    <circle cx="11" cy="11" r="8"></circle>
                    <path d="m21 21-4.35-4.35"></path>
                </svg>
                <div class="suggestion-content">
                    <div class="suggestion-title">${item.title}</div>
                    <div class="suggestion-description">${item.description}</div>
                    <div class="suggestion-time ${timeClass}">${timeInfo.text}</div>
                </div>
            </div>
        `;
    }).join('');
    
    suggestionsDropdown.classList.add('show');
    
    // Add click handlers to suggestions
    document.querySelectorAll('.suggestion-item').forEach(item => {
        item.addEventListener('click', function() {
            const title = this.getAttribute('data-title');
            document.getElementById('searchInput').value = title;
            suggestionsDropdown.classList.remove('show');
            
            // Filter gallery
            const filtered = allContent.filter(content =>
                content.title.toLowerCase().includes(title.toLowerCase()) ||
                content.description.toLowerCase().includes(title.toLowerCase())
            );
            renderGallery(filtered);
        });
    });
}

// Search functionality
document.addEventListener('DOMContentLoaded', () => {
    loadContent();
    
    const searchInput = document.getElementById('searchInput');
    const suggestionsDropdown = document.getElementById('suggestionsDropdown');
    
    // Search input handler
    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        
        const filtered = allContent.filter(item =>
            item.title.toLowerCase().includes(searchTerm) ||
            item.description.toLowerCase().includes(searchTerm)
        );
        
        renderGallery(filtered);
        
        // Show suggestions
        if (searchTerm.length > 0) {
            renderSuggestions(filtered.slice(0, 5));
        } else {
            renderSuggestions(allContent.slice(0, 5));
        }
    });
    
    // Focus handler
    searchInput.addEventListener('focus', () => {
        if (allContent.length > 0) {
            renderSuggestions(allContent.slice(0, 5));
        }
    });
    
    // Blur handler
    searchInput.addEventListener('blur', () => {
        setTimeout(() => {
            suggestionsDropdown.classList.remove('show');
        }, 200);
    });
    
    // Close suggestions when clicking outside
    document.addEventListener('click', (e) => {
        if (!searchInput.contains(e.target) && !suggestionsDropdown.contains(e.target)) {
            suggestionsDropdown.classList.remove('show');
        }
    });
});