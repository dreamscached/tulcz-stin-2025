# 📈 STIN 2025 – Burza Module

This repository contains the **Burza module** for the STIN 2025 semester project.
It is responsible for fetching, filtering, and managing stock data, as well as
interacting with an external News (Zprávy) module to receive sentiment-based
stock ratings.

Developed with a responsive frontend and a modular NestJS backend, the system
supports scheduled data updates, user-defined filtering, and REST-based
integration.

---

## 👨‍💻 Contributors

- German Semin
- Mikhail Belov
- Inal Ekashaev

---

## 🧩 Features

### 🔄 Data Management

- Scheduled and manual updates of historical stock data at `0:00`, `6:00`, `12:00`, `18:00`
- Retrieves current/historical prices for user-specified favorite tickers
- Persistent storage of user-defined preferences in a JSON file

### ⭐ Favorites

- REST API to update and retrieve favorite tickers (`/preferences`)
- Favorites are used as the base scope for all filters and ratings
- Fully responsive UI to manage favorites on desktop and mobile

### 🔍 Filtering

- `/search/filter/3d`: Filters tickers that dropped 3 consecutive business days
- `/search/filter/5d`: Filters tickers that dropped on more than 2 of the last 5 business days
- Filters always intersect results with user favorites

### 🔗 Integration with Zprávy (News) Module

- `/search/ratings`: Calls the external News API to get ratings for tickers
- Ratings are integer values between `-10` and `10`
- Recommended stocks (rating > 5) are visually highlighted in the UI

### ⚙️ Technical Highlights

- Developed in **TypeScript** using **NestJS** and **Vitest**
- > 80% **test coverage** (unit + e2e)
- **Dockerized** deployment using `Dockerfile` and `docker-compose.yml`
- **CI/CD** with GitHub Actions (`check.yml`, `docker_build.yml`)
- **Externalized configuration** using `.env` and `ConfigService`
- Strict schema validation for API data (DTOs for rating, preferences, search)

---

## 📁 JSON Data Format

Used for internal communication and rating payloads:

```json
[
	{ "name": "Microsoft", "date": 12345678, "rating": -10, "sell": 1 },
	{ "name": "Google", "date": 12345678, "rating": 10, "sell": 0 },
	{ "name": "OpenAI", "date": 12345678, "rating": 2, "sell": 0 }
]
```

- `rating`: range from `-10` (strongly negative) to `+10` (strongly positive)
- `sell`: 1 = sell recommended, 0 = hold/buy

---

## 🖥 UI Features

- Desktop & mobile-friendly
- Filter tabs for 3d and 5d drop filters
- Star icons to manage favorites directly from search
- "★ Recommended" label on highly-rated tickers
- Manual update button to trigger data refresh

---

## 📦 Endpoints Overview

| Method | Endpoint            | Description                                  |
| ------ | ------------------- | -------------------------------------------- |
| GET    | `/preferences`      | Get current user preferences                 |
| PATCH  | `/preferences`      | Update user favorite tickers                 |
| GET    | `/search?query=...` | Autocomplete/search for ticker names         |
| GET    | `/search/filter/3d` | Get favorite tickers with 3-day drop         |
| GET    | `/search/filter/5d` | Get favorite tickers with 3+ drops in 5 days |
| GET    | `/search/ratings`   | Request ratings from News module             |
| POST   | `/search/update`    | Manually trigger stock data update           |

---

## 🧪 Development

- Run tests: `yarn test`
- Run app: `docker-compose up`
- View logs: Visit `/log` (WebSocket live log view)
