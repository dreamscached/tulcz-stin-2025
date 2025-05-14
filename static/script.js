// Updated testStocks with historical prices
const testStocks = [
    {
        symbol: 'AAPL', name: 'Apple Inc.', sector: 'Technology',
        prices: [179, 177, 176, 175, 174]
    },
    {
        symbol: 'MSFT', name: 'Microsoft Corporation', sector: 'Technology',
        prices: [417, 416, 415, 414, 413]
    },
    {
        symbol: 'GOOGL', name: 'Alphabet Inc.', sector: 'Technology',
        prices: [144, 143, 144, 143, 142]
    },
    {
        symbol: 'AMZN', name: 'Amazon.com Inc.', sector: 'Consumer Cyclical',
        prices: [180, 179, 178, 179, 178]
    },
    {
        symbol: 'TSLA', name: 'Tesla Inc.', sector: 'Automotive',
        prices: [178, 177, 176, 177, 178]
    }
];

function filterLast3DaysDecreasing(stocks) {
    return stocks.filter(stock => {
        const p = stock.prices;
        return p.length >= 3 && p[p.length - 3] > p[p.length - 2] && p[p.length - 2] > p[p.length - 1];
    });
}

function filterAtLeast3DecreasingIn5Days(stocks) {
    return stocks.filter(stock => {
        const p = stock.prices;
        if (p.length < 5) return false;
        let dec = 0;
        for (let i = 1; i < p.length; i++) {
            if (p[i] < p[i - 1]) dec++;
        }
        return dec >= 2;
    });
}

function applyFavoritesFilter(type) {
    const favorites = JSON.parse(localStorage.getItem('sharedFavorites') || '[]');
    const enrichedFavorites = favorites.map(fav => {
        const full = testStocks.find(s => s.symbol === fav.symbol);
        return full ? full : fav;
    }).filter(s => s.prices);

    let filtered;
    if (type === 'last3') {
        filtered = filterLast3DaysDecreasing(enrichedFavorites);
    } else if (type === '3of5') {
        filtered = filterAtLeast3DecreasingIn5Days(enrichedFavorites);
    }

    displayFavorites(filtered);
}

function displayFavorites(stocks) {
    const favoritesList = document.getElementById('favoritesList');
    if (!favoritesList) return;
    favoritesList.innerHTML = '';

    if (!stocks.length) {
        favoritesList.innerHTML = '<p class="no-favorites">No matching favorites found.</p>';
        return;
    }

    stocks.forEach(stock => {
        const favoriteItem = document.createElement('div');
        favoriteItem.className = 'favorite-item';
        favoriteItem.innerHTML = `
            <div class="stock-info">
                <h4>${stock.symbol}</h4>
                <p>${stock.name}</p>
                <div class="stock-price">
                    <span class="price">$${stock.prices[stock.prices.length - 1].toFixed(2)}</span>
                </div>
            </div>
            <button class="remove-favorite" onclick="removeFavorite('${stock.symbol}')">
                <i class="fas fa-times"></i>
            </button>
        `;
        favoritesList.appendChild(favoriteItem);
    });
}

function fetchServerStocks() {
    // Эмуляция получения данных с сервера
    const serverStocks = [
        { symbol: 'NFLX', name: 'Netflix Inc.', sector: 'Communication', prices: [420, 418, 417, 416, 415] },
        { symbol: 'DIS', name: 'Walt Disney Co.', sector: 'Communication', prices: [95, 94, 93, 92, 91] }
    ];

    displayFavorites(serverStocks);
}

// Add filter buttons only on favorites page
window.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.includes('favorites.html')) {
        const container = document.querySelector('.favorites-container');

        const filterBar = document.createElement('div');
        filterBar.className = 'filter-buttons';
        filterBar.innerHTML = `
            <style>
                .filter-buttons {
                    margin-bottom: 1rem;
                }
                .filter-buttons button {
                    background-color: #328E6E;
                    color: white;
                    border: none;
                    padding: 10px 16px;
                    margin-right: 10px;
                    border-radius: 5px;
                    font-weight: bold;
                    cursor: pointer;
                    transition: background-color 0.3s;
                }
                .filter-buttons button:hover {
                    background-color: #28775B;
                }
            </style>
            <button onclick="applyFavoritesFilter('last3')">Poslední 3 dny poklesu</button>
            <button onclick="applyFavoritesFilter('3of5')">2 a více dnů poklesu</button>
            <button onclick="fetchServerStocks()">Získat ze serveru</button>
        `;
        container.prepend(filterBar);

        loadFavorites();
    }
});

// Initialize shared favorites on page load
document.addEventListener('DOMContentLoaded', function() {
    // Инициализация favorites
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

    // Если мы на странице избранного
    if (window.location.pathname.includes('favorites.html')) {
        loadFavorites();
    }

    // Инициализация поля поиска
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', handleSearchInput);
        searchInput.addEventListener('focus', handleSearchInput);
        searchInput.addEventListener('keydown', function(event) {
            if (event.key === 'Enter') {
                const firstSuggestion = document.querySelector('.suggestion-item');
                if (firstSuggestion) firstSuggestion.click();
            }
        });
    }
});

document.addEventListener('click', function(event) {
    const searchContainer = document.querySelector('.search-container');
    const suggestionsContainer = document.getElementById('searchSuggestions');
    if (!searchContainer.contains(event.target)) {
        suggestionsContainer.style.display = 'none';
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

async function handleSearchInput(event) {
    const query = event.target.value.trim().toLowerCase();
    const suggestionsContainer = document.getElementById("searchSuggestions");

    if (!query) {
        suggestionsContainer.style.display = "none";
        suggestionsContainer.innerHTML = "";
        return;
    }

    try {
        const response = await fetch(`/search?query=${encodeURIComponent(query)}`);
        if (!response.ok) throw new Error("Failed to fetch search results");

        const results = await response.json();

        if (!Array.isArray(results) || results.length === 0) {
            suggestionsContainer.style.display = "none";
            return;
        }

        suggestionsContainer.innerHTML = "";
        results.forEach(symbol => {
            const suggestionItem = document.createElement("div");
            suggestionItem.className = "suggestion-item";
            suggestionItem.innerHTML = `
                <div class="suggestion-symbol">${symbol}</div>
            `;
            suggestionItem.addEventListener("click", () => {
                selectStock({
                    symbol,
                    name: symbol,
                    price: 0,
                    change: 0,
                    sector: ""
                });
            });
            suggestionsContainer.appendChild(suggestionItem);
        });

        suggestionsContainer.style.display = "block";
    } catch (err) {
        console.error("Search error:", err);
        suggestionsContainer.style.display = "none";
    }
}

// Function to handle clicks outside of search
function handleClickOutside(event) {
    const searchContainer = document.querySelector('.search-container');
    const suggestionsContainer = document.getElementById('searchSuggestions');

    if (!searchContainer.contains(event.target) && !event.target.classList.contains('suggestion-item')) {
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
