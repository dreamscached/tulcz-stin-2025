// favorites.js

document.addEventListener("DOMContentLoaded", loadFavorites);

async function loadFavorites() {
    const container = document.getElementById("favoritesList");
    showLoading(container);

    try {
        const response = await fetch("/preferences");
        if (!response.ok) throw new Error("Failed to load preferences");

        const data = await response.json();
        renderFavorites(data.favoriteTickers || []);
    } catch (error) {
        console.error("Error loading favorites:", error);
        showError(container, "Could not load favorites.");
    }
}

function renderFavorites(favorites) {
    const container = document.getElementById("favoritesList");
    container.innerHTML = "";

    if (!favorites.length) {
        container.innerHTML = `<div class="no-favorites">No favorite stocks selected yet.</div>`;
        return;
    }

    favorites.forEach((ticker) => {
        const item = document.createElement("div");
        item.className = "favorite-item";
        item.innerHTML = `
            <div class="stock-info">
                <h4>${ticker}</h4>
                <p>Ticker symbol</p>
            </div>
            <button class="remove-favorite" onclick="removeFavorite('${ticker}')">
                <i class="fas fa-times"></i>
            </button>
        `;
        container.appendChild(item);
    });
}

async function removeFavorite(ticker) {
    const container = document.getElementById("favoritesList");

    try {
        const res = await fetch("/preferences");
        if (!res.ok) throw new Error("Failed to fetch preferences");

        const data = await res.json();
        const updatedFavorites = (data.favoriteTickers || []).filter((t) => t !== ticker);

        const patchRes = await fetch("/preferences", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ favoriteTickers: updatedFavorites })
        });

        if (!patchRes.ok) throw new Error("Failed to update preferences");

        renderFavorites(updatedFavorites);
    } catch (error) {
        console.error("Error removing favorite:", error);
        showError(container, "Failed to remove favorite.");
    }
}

function showLoading(container) {
    container.innerHTML = `<div class="no-favorites">Loading favorites...</div>`;
}

function showError(container, message) {
    container.innerHTML = `<div class="no-favorites">${message}</div>`;
}

document.addEventListener("DOMContentLoaded", () => {
    setupTabs();
    loadFavorites(); // Default tab
});

function setupTabs() {
    const buttons = document.querySelectorAll(".tab-button");
    buttons.forEach((btn) => {
        btn.addEventListener("click", () => {
            buttons.forEach((b) => b.classList.remove("active"));
            btn.classList.add("active");

            const filter = btn.dataset.filter;
            loadFavorites(filter);
        });
    });
}

async function loadFavorites(filter = "recommended") {
    const container = document.getElementById("favoritesList");
    showLoading(container);

    try {
        let tickers = [];

        if (filter === "3d") {
            const res = await fetch("/search/filter/3d");
            tickers = await res.json();
        } else if (filter === "5d") {
            const res = await fetch("/search/filter/5d");
            tickers = await res.json();
        } else {
            const res = await fetch("/preferences");
            const data = await res.json();
            tickers = data.favoriteTickers || [];
        }

        renderFavorites(tickers);
    } catch (error) {
        console.error("Error loading favorites:", error);
        showError(container, "Could not load favorites.");
    }
}

document.getElementById("updateFavoritesBtn")?.addEventListener("click", async () => {
    const button = document.getElementById("updateFavoritesBtn");
    button.disabled = true;
    button.textContent = "Updating...";

    try {
        const res = await fetch("/search/update", {
            method: "POST"
        });

        if (!res.ok) throw new Error("Update failed");

        button.textContent = "Updating!";
        setTimeout(() => {
            button.textContent = "Update";
            button.disabled = false;
        }, 2000);
    } catch (err) {
        console.error("Update error:", err);
        button.textContent = "Error!";
        setTimeout(() => {
            button.textContent = "Update";
            button.disabled = false;
        }, 3000);
    }
});
