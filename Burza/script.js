// Test stock data
const testStocks = [
    { symbol: 'AAPL', name: 'Apple Inc.', price: 175.04, change: 1.2, sector: 'Technology' },
    { symbol: 'MSFT', name: 'Microsoft Corporation', price: 415.32, change: 0.8, sector: 'Technology' },
    { symbol: 'GOOGL', name: 'Alphabet Inc.', price: 142.56, change: -0.5, sector: 'Technology' },
    { symbol: 'AMZN', name: 'Amazon.com Inc.', price: 178.75, change: 1.5, sector: 'Consumer Cyclical' },
    { symbol: 'TSLA', name: 'Tesla Inc.', price: 177.77, change: -2.1, sector: 'Automotive' },
    { symbol: 'META', name: 'Meta Platforms Inc.', price: 485.58, change: 2.3, sector: 'Technology' },
    { symbol: 'NVDA', name: 'NVIDIA Corporation', price: 875.28, change: 3.2, sector: 'Technology' },
    { symbol: 'JPM', name: 'JPMorgan Chase & Co.', price: 195.63, change: 0.4, sector: 'Financial Services' },
    { symbol: 'V', name: 'Visa Inc.', price: 280.33, change: -0.3, sector: 'Financial Services' },
    { symbol: 'WMT', name: 'Walmart Inc.', price: 60.11, change: 0.7, sector: 'Consumer Defensive' },
    { symbol: 'JNJ', name: 'Johnson & Johnson', price: 157.95, change: -0.2, sector: 'Healthcare' },
    { symbol: 'PG', name: 'Procter & Gamble Co.', price: 160.84, change: 0.5, sector: 'Consumer Defensive' },
    { symbol: 'MA', name: 'Mastercard Inc.', price: 475.96, change: 1.1, sector: 'Financial Services' },
    { symbol: 'HD', name: 'Home Depot Inc.', price: 362.35, change: -0.8, sector: 'Consumer Cyclical' },
    { symbol: 'BAC', name: 'Bank of America Corp.', price: 37.49, change: 0.6, sector: 'Financial Services' }
];

// Initialize shared favorites on page load
document.addEventListener('DOMContentLoaded', function() {
    // Initialize shared favorites if they don't exist
    if (!localStorage.getItem('sharedFavorites')) {
        const initialFavorites = [
            { symbol: 'AAPL', name: 'Apple Inc.' },
            { symbol: 'GOOGL', name: 'Alphabet Inc.' },
            { symbol: 'MSFT', name: 'Microsoft Corporation' },
            { symbol: 'AMZN', name: 'Amazon.com Inc.' },
            { symbol: 'TSLA', name: 'Tesla Inc.' }
        ];
        localStorage.setItem('sharedFavorites', JSON.stringify(initialFavorites));
    }

    // Load favorites if we're on the favorites page
    if (window.location.pathname.includes('favorites.html')) {
        loadFavorites();
    }

    // Initialize search input event listeners
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', handleSearchInput);
        searchInput.addEventListener('focus', handleSearchInput);
        document.addEventListener('click', handleClickOutside);
    }
});

// Function to load favorites
function loadFavorites() {
    const favoritesList = document.getElementById('favoritesList');
    if (!favoritesList) return;

    const favorites = JSON.parse(localStorage.getItem('sharedFavorites') || '[]');

    if (favorites.length === 0) {
        favoritesList.innerHTML = '<p class="no-favorites">No favorites added yet.</p>';
        return;
    }

    favoritesList.innerHTML = '';
    favorites.forEach(stock => {
        const stockData = testStocks.find(s => s.symbol === stock.symbol) || stock;
        const favoriteItem = document.createElement('div');
        favoriteItem.className = 'favorite-item';
        favoriteItem.innerHTML = `
            <div class="stock-info">
                <h4>${stockData.symbol}</h4>
                <p>${stockData.name}</p>
                ${stockData.price ? `
                    <div class="stock-price">
                        <span class="price">$${stockData.price.toFixed(2)}</span>
                        <span class="change ${stockData.change >= 0 ? 'positive' : 'negative'}">
                            ${stockData.change >= 0 ? '+' : ''}${stockData.change}%
                        </span>
                    </div>
                ` : ''}
            </div>
            <button class="remove-favorite" onclick="removeFavorite('${stock.symbol}')">
                <i class="fas fa-times"></i>
            </button>
        `;
        favoritesList.appendChild(favoriteItem);
    });
}

// Function to remove from favorites
function removeFavorite(symbol) {
    const favorites = JSON.parse(localStorage.getItem('sharedFavorites') || '[]');
    const index = favorites.findIndex(stock => stock.symbol === symbol);
    
    if (index !== -1) {
        favorites.splice(index, 1);
        localStorage.setItem('sharedFavorites', JSON.stringify(favorites));
        loadFavorites();
    }
}

// Function to toggle favorite status
function toggleFavorite(ticker) {
    const favorites = JSON.parse(localStorage.getItem('sharedFavorites') || '[]');
    const index = favorites.findIndex(stock => stock.symbol === ticker);
    
    if (index === -1) {
        // Add to favorites
        const stockData = testStocks.find(s => s.symbol === ticker);
        favorites.push({ 
            symbol: ticker, 
            name: stockData ? stockData.name : ticker 
        });
    } else {
        // Remove from favorites
        favorites.splice(index, 1);
    }
    
    localStorage.setItem('sharedFavorites', JSON.stringify(favorites));
    updateFavoriteButton(ticker);
}

// Function to update favorite button state
function updateFavoriteButton(ticker) {
    const favorites = JSON.parse(localStorage.getItem('sharedFavorites') || '[]');
    const isFavorite = favorites.some(stock => stock.symbol === ticker);
    
    const favoriteButton = document.querySelector(`[data-ticker="${ticker}"] .favorite-button`);
    if (favoriteButton) {
        favoriteButton.innerHTML = isFavorite ? 
            '<i class="fas fa-star"></i>' : 
            '<i class="far fa-star"></i>';
    }
}

// Function to handle search input
function handleSearchInput(event) {
    const query = event.target.value.trim();
    const suggestionsContainer = document.getElementById('searchSuggestions');
    
    if (!query) {
        suggestionsContainer.style.display = 'none';
        return;
    }

    // Filter stocks based on query
    const suggestions = testStocks.filter(stock => 
        stock.symbol.toLowerCase().includes(query.toLowerCase()) || 
        stock.name.toLowerCase().includes(query.toLowerCase())
    );

    if (suggestions.length === 0) {
        suggestionsContainer.style.display = 'none';
        return;
    }

    // Display suggestions
    suggestionsContainer.innerHTML = '';
    suggestions.forEach(stock => {
        const suggestionItem = document.createElement('div');
        suggestionItem.className = 'suggestion-item';
        suggestionItem.innerHTML = `
            <div class="suggestion-info">
                <div class="suggestion-symbol">${stock.symbol}</div>
                <div class="suggestion-name">${stock.name}</div>
                <div class="suggestion-sector">${stock.sector}</div>
            </div>
            <div class="suggestion-price">
                $${stock.price.toFixed(2)}
            </div>
        `;
        suggestionItem.addEventListener('click', () => selectStock(stock));
        suggestionsContainer.appendChild(suggestionItem);
    });

    suggestionsContainer.style.display = 'block';
}

// Function to handle clicks outside of search
function handleClickOutside(event) {
    const searchContainer = document.querySelector('.search-container');
    const suggestionsContainer = document.getElementById('searchSuggestions');
    
    if (!searchContainer.contains(event.target)) {
        suggestionsContainer.style.display = 'none';
    }
}

// Function to select a stock
function selectStock(stock) {
    const selectedStocksContainer = document.getElementById('selectedStocks');
    const searchInput = document.getElementById('searchInput');
    const suggestionsContainer = document.getElementById('searchSuggestions');

    // Check if stock is already selected
    if (document.querySelector(`[data-symbol="${stock.symbol}"]`)) {
        return;
    }

    // Check if in favorites
    const favorites = JSON.parse(localStorage.getItem('sharedFavorites') || '[]');
    const isFavorite = favorites.some(s => s.symbol === stock.symbol);

    // Create selected stock element
    const selectedStock = document.createElement('div');
    selectedStock.className = 'selected-stock';
    selectedStock.setAttribute('data-symbol', stock.symbol);
    selectedStock.innerHTML = `
        <div class="selected-stock-info">
            <div class="selected-stock-symbol">${stock.symbol}</div>
            <div class="selected-stock-name">${stock.name}</div>
            <div class="selected-stock-price">
                <span class="price">$${stock.price.toFixed(2)}</span>
                <span class="change ${stock.change >= 0 ? 'positive' : 'negative'}">
                    ${stock.change >= 0 ? '+' : ''}${stock.change}%
                </span>
            </div>
        </div>
        <button class="favorite-button" onclick="toggleFavoriteFromSelected('${stock.symbol}', this)">
            <i class="${isFavorite ? 'fas' : 'far'} fa-heart"></i>
        </button>
        <button class="remove-selected" onclick="removeSelectedStock('${stock.symbol}')">
            <i class="fas fa-times"></i>
        </button>
    `;

    selectedStocksContainer.appendChild(selectedStock);
    
    // Clear search input and hide suggestions
    searchInput.value = '';
    suggestionsContainer.style.display = 'none';
}

// Add this function to handle favorite from selected
function toggleFavoriteFromSelected(symbol, btn) {
    const favorites = JSON.parse(localStorage.getItem('sharedFavorites') || '[]');
    const index = favorites.findIndex(stock => stock.symbol === symbol);
    let isFavorite = false;
    if (index === -1) {
        // Add to favorites
        const stockData = testStocks.find(s => s.symbol === symbol);
        favorites.push({ 
            symbol: symbol, 
            name: stockData ? stockData.name : symbol 
        });
        isFavorite = true;
    } else {
        // Remove from favorites
        favorites.splice(index, 1);
        isFavorite = false;
    }
    localStorage.setItem('sharedFavorites', JSON.stringify(favorites));
    // Update heart icon
    const icon = btn.querySelector('i');
    if (icon) {
        icon.className = isFavorite ? 'fas fa-heart' : 'far fa-heart';
    }
}

// Function to remove selected stock
function removeSelectedStock(symbol) {
    const selectedStock = document.querySelector(`[data-symbol="${symbol}"]`);
    if (selectedStock) {
        selectedStock.remove();
    }
}
