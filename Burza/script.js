// Проверка авторизации при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    // Проверяем, находимся ли мы на странице входа
    const isLoginPage = window.location.pathname.includes('login.html');
    
    if (!currentUser && !isLoginPage) {
        window.location.href = 'login.html';
        return;
    }

    // Инициализация тестовых данных
    if (currentUser) {
        initializeTestData(currentUser.username);

        // Отображаем имя пользователя в хедере
        const usernameDisplay = document.getElementById('username-display');
        if (usernameDisplay) {
            usernameDisplay.textContent = currentUser.username;
        }

        // Отображаем имя пользователя в профиле
        const profileUsername = document.getElementById('profile-username');
        if (profileUsername) {
            profileUsername.textContent = currentUser.username;
        }

        // Загружаем случайную фотку профиля
        loadRandomProfileImage();

        // Загружаем избранные акции
        loadFavorites();
    }
});

// Функция для инициализации тестовых данных
function initializeTestData(username) {
    const favorites = JSON.parse(localStorage.getItem('favorites') || '{}');
    
    // Если у пользователя еще нет избранных, добавляем тестовые данные
    if (!favorites[username] || favorites[username].length === 0) {
        favorites[username] = [
            { symbol: 'AAPL', name: 'Apple Inc.' },
            { symbol: 'GOOGL', name: 'Alphabet Inc.' },
            { symbol: 'MSFT', name: 'Microsoft Corporation' },
            { symbol: 'AMZN', name: 'Amazon.com Inc.' },
            { symbol: 'TSLA', name: 'Tesla Inc.' }
        ];
        localStorage.setItem('favorites', JSON.stringify(favorites));
    }
}

// Функция для генерации случайного цвета
function getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

// Функция для генерации случайного SVG аватара
function generateRandomAvatar(username) {
    const colors = [
        getRandomColor(),
        getRandomColor(),
        getRandomColor()
    ];

    // Создаем уникальный seed на основе имени пользователя
    const seed = username.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);

    // Генерируем случайные параметры для аватара
    const size = 150;
    const elements = Math.floor(Math.random() * 5) + 3; // от 3 до 7 элементов
    const rotation = Math.floor(Math.random() * 360);

    let svg = `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">`;
    
    // Добавляем фон
    svg += `<rect width="${size}" height="${size}" fill="${colors[0]}" />`;

    // Добавляем случайные элементы
    for (let i = 0; i < elements; i++) {
        const x = Math.random() * size;
        const y = Math.random() * size;
        const width = Math.random() * 50 + 20;
        const height = Math.random() * 50 + 20;
        const elementRotation = Math.random() * 360;
        
        svg += `<rect 
            x="${x}" 
            y="${y}" 
            width="${width}" 
            height="${height}" 
            fill="${colors[1 + i % 2]}"
            transform="rotate(${elementRotation} ${x + width/2} ${y + height/2})"
            opacity="0.8"
        />`;
    }

    svg += '</svg>';
    return svg;
}

// Функция для загрузки случайной фотки профиля
function loadRandomProfileImage() {
    const profileImage = document.getElementById('profileImage');
    if (!profileImage) return;

    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) return;

    // Генерируем новый аватар
    const avatarSVG = generateRandomAvatar(currentUser.username);
    profileImage.innerHTML = avatarSVG;
}

// Функция для загрузки избранных акций
function loadFavorites() {
    const favoritesList = document.getElementById('favoritesList');
    if (!favoritesList) return;

    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) return;

    const favorites = JSON.parse(localStorage.getItem('favorites') || '{}');
    const userFavorites = favorites[currentUser.username] || [];

    if (userFavorites.length === 0) {
        favoritesList.innerHTML = '<p class="no-favorites">You haven\'t added any favorites yet.</p>';
        return;
    }

    favoritesList.innerHTML = '';
    userFavorites.forEach(stock => {
        const favoriteItem = document.createElement('div');
        favoriteItem.className = 'favorite-item';
        favoriteItem.innerHTML = `
            <div class="stock-info">
                <h4>${stock.symbol}</h4>
                <p>${stock.name}</p>
            </div>
            <button class="remove-favorite" onclick="removeFavorite('${stock.symbol}')">
                <i class="fas fa-times"></i>
            </button>
        `;
        favoritesList.appendChild(favoriteItem);
    });
}

// Функция для удаления из избранного
function removeFavorite(symbol) {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) return;

    const favorites = JSON.parse(localStorage.getItem('favorites') || '{}');
    if (!favorites[currentUser.username]) return;

    const userFavorites = favorites[currentUser.username];
    const index = userFavorites.findIndex(stock => stock.symbol === symbol);
    
    if (index !== -1) {
        userFavorites.splice(index, 1);
        localStorage.setItem('favorites', JSON.stringify(favorites));
        loadFavorites(); // Обновляем список избранного
    }
}

// Функция для показа формы регистрации
function showRegister() {
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('registerForm').style.display = 'block';
}

// Функция для показа формы логина
function showLogin() {
    document.getElementById('registerForm').style.display = 'none';
    document.getElementById('loginForm').style.display = 'block';
}

// Функция для регистрации нового пользователя
function register() {
    const username = document.getElementById('newUsername').value;
    const password = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    // Проверка совпадения паролей
    if (password !== confirmPassword) {
        alert('Passwords do not match!');
        return;
    }

    // Проверка длины пароля
    if (password.length < 6) {
        alert('Password must be at least 6 characters long!');
        return;
    }

    // Проверка длины имени пользователя
    if (username.length < 3) {
        alert('Username must be at least 3 characters long!');
        return;
    }

    // Сохраняем пользователя в localStorage
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    
    // Проверяем, не существует ли уже такой пользователь
    if (users.some(user => user.username === username)) {
        alert('Username already exists!');
        return;
    }

    // Добавляем нового пользователя
    users.push({ username, password });
    localStorage.setItem('users', JSON.stringify(users));
    
    alert('Registration successful! Please login.');
    showLogin();
}

// Функция для обработки нажатия Enter в форме входа
function handleLoginKeyPress(event) {
    if (event.key === 'Enter') {
        login();
    }
}

// Функция для обработки нажатия Enter в форме регистрации
function handleRegisterKeyPress(event) {
    if (event.key === 'Enter') {
        register();
    }
}

// Функция для входа
function login() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const user = users.find(u => u.username === username && u.password === password);

    if (user) {
        // Сохраняем текущего пользователя
        localStorage.setItem('currentUser', JSON.stringify({ username }));
        // Перенаправляем на главную страницу
        window.location.href = 'index.html';
    } else {
        alert('Invalid username or password!');
    }
}

// Функция для поиска акций
async function searchStocks() {
    const searchInput = document.getElementById('searchInput').value;
    if (!searchInput) {
        alert('Please enter a search term');
        return;
    }

    const resultsContainer = document.getElementById('searchResults');
    resultsContainer.innerHTML = '<div class="loading">Searching...</div>';

    try {
        // Здесь нужно будет добавить ваш API ключ Tiingo
        const response = await fetch(`https://api.tiingo.com/tiingo/utilities/search?query=${searchInput}&token=YOUR_API_KEY`);
        const data = await response.json();

        if (data.length === 0) {
            resultsContainer.innerHTML = '<div class="no-results">No results found</div>';
            return;
        }

        resultsContainer.innerHTML = '';
        data.forEach(stock => {
            const stockElement = document.createElement('div');
            stockElement.className = 'stock-item';
            stockElement.innerHTML = `
                <div class="stock-info">
                    <h3>${stock.name}</h3>
                    <p>Symbol: ${stock.ticker}</p>
                </div>
                <button class="favorite-btn" onclick="toggleFavorite('${stock.ticker}')">
                    <i class="far fa-heart"></i>
                </button>
            `;
            resultsContainer.appendChild(stockElement);
        });
    } catch (error) {
        resultsContainer.innerHTML = '<div class="error">Error fetching data. Please try again later.</div>';
        console.error('Error:', error);
    }
}

// Функция для добавления/удаления из избранного
function toggleFavorite(ticker) {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) return;

    const favorites = JSON.parse(localStorage.getItem('favorites') || '{}');
    if (!favorites[currentUser.username]) {
        favorites[currentUser.username] = [];
    }

    const userFavorites = favorites[currentUser.username];
    const index = userFavorites.indexOf(ticker);

    if (index === -1) {
        userFavorites.push(ticker);
    } else {
        userFavorites.splice(index, 1);
    }

    localStorage.setItem('favorites', JSON.stringify(favorites));
    updateFavoriteButton(ticker);
}

// Функция для обновления состояния кнопки избранного
function updateFavoriteButton(ticker) {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) return;

    const favorites = JSON.parse(localStorage.getItem('favorites') || '{}');
    const userFavorites = favorites[currentUser.username] || [];
    const isFavorite = userFavorites.includes(ticker);

    const button = document.querySelector(`.favorite-btn[onclick="toggleFavorite('${ticker}')"]`);
    if (button) {
        button.innerHTML = `<i class="${isFavorite ? 'fas' : 'far'} fa-heart"></i>`;
    }
}

// Функция для выхода из аккаунта
function logout() {
    // Удаляем данные текущего пользователя
    localStorage.removeItem('currentUser');
    // Перенаправляем на страницу входа
    window.location.href = 'login.html';
}
