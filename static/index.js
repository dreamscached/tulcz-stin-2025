// index.js

document.addEventListener("DOMContentLoaded", async () => {
    window.favoriteTickers = [];

    try {
        const response = await fetch("/preferences");
        if (response.ok) {
            const data = await response.json();
            window.favoriteTickers = Array.isArray(data.favoriteTickers) ? data.favoriteTickers : [];
        }
    } catch (error) {
        console.error("Failed to load favorites:", error);
    }

    const searchInput = document.getElementById("searchInput");
    const suggestionBox = document.getElementById("searchSuggestions");

    let debounceTimeout = null;

    searchInput.addEventListener("input", () => {
        clearTimeout(debounceTimeout);
        const query = searchInput.value.trim();

        if (!query) {
            hideSuggestions();
            return;
        }

        debounceTimeout = setTimeout(() => fetchSuggestions(query), 300);
    });

    document.addEventListener("click", (e) => {
        if (!suggestionBox.contains(e.target) && e.target !== searchInput) {
            hideSuggestions();
        }
    });
});

async function fetchSuggestions(query) {
    const suggestionBox = document.getElementById("searchSuggestions");

    try {
        const response = await fetch(`/search?query=${encodeURIComponent(query)}`);
        if (!response.ok) throw new Error("Search failed");

        const tickers = await response.json();
        showSuggestions(tickers);
    } catch (error) {
        console.error("Suggestion error:", error);
        hideSuggestions();
    }
}

function showSuggestions(tickers) {
    const suggestionBox = document.getElementById("searchSuggestions");

    if (!tickers.length) {
        hideSuggestions();
        return;
    }

    suggestionBox.innerHTML = "";

    tickers.forEach((ticker) => {
        const isFavorite = window.favoriteTickers.includes(ticker);

        const item = document.createElement("div");
        item.className = "suggestion-item";
        item.innerHTML = `
            <div class="suggestion-info">
                <span class="suggestion-symbol">${ticker}</span>
            </div>
            <div class="favorite-toggle">
                <i class="${isFavorite ? "fas" : "far"} fa-star"></i>
            </div>
        `;

        item.addEventListener("click", () => toggleFavorite(ticker, item));
        suggestionBox.appendChild(item);
    });

    suggestionBox.classList.add("active");
}

function hideSuggestions() {
    const suggestionBox = document.getElementById("searchSuggestions");
    suggestionBox.classList.remove("active");
    suggestionBox.innerHTML = "";
}

async function toggleFavorite(ticker, item) {
    const isFav = window.favoriteTickers.includes(ticker);
    const updated = isFav
        ? window.favoriteTickers.filter((t) => t !== ticker)
        : [...window.favoriteTickers, ticker];

    try {
        const patchRes = await fetch("/preferences", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ favoriteTickers: updated })
        });

        if (!patchRes.ok) throw new Error("Failed to update favorites");

        window.favoriteTickers = updated;

        const icon = item.querySelector(".fa-star");
        if (icon) {
            icon.className = isFav ? "far fa-star" : "fas fa-star";
        }
    } catch (error) {
        console.error("Error toggling favorite:", error);
    }
}
