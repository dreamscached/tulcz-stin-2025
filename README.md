# 📈 Burzalupa – Stock Tracker App

Burzalupa is a full-stack application for tracking stock favorites. It includes:

- ✅ A NestJS-based backend (API + static serving)
- ✅ A static frontend with favorites and search functionality
- ✅ User preferences persisted on the server
- ✅ Vitest test coverage and CI integration

## 👥 Contributors

- @dreamscached &mdash; backend development, unit/e2e testing
- @inaleka &mdash; frontend development, UI design, logo design

---

## 🧪 Testing

Run unit, e2e, and coverage tests:

```bash
yarn install
yarn test           # Unit tests
yarn test:e2e       # End-to-end tests
yarn test:cov       # Coverage (HTML + summary)
```

To view HTML coverage report:

```bash
open coverage/index.html
```

---

## 🚀 Deployment

### 🐳 Docker

#### 📦 Build & Run with Docker Compose

```bash
docker compose up --build
```

- Backend listens on: [http://localhost:8080](http://localhost:8080)
- Static frontend is served by NestJS under the same address.

> Ensure port 8080 is available on your host.

---

## 🌍 Environment Variables

Located in `.env` or `.env.local`:

```env
APP_PORT=3000
NODE_ENV=dev
```

You can override in production like:

```bash
docker run -e APP_PORT=4000 -e NODE_ENV=production ...
```

---

## 📦 Manual

### 1. Build backend

```bash
yarn install
yarn build
```

### 2. Start server

```bash
yarn start:prod
```

Then visit: [http://localhost:3000](http://localhost:3000)

---

## 📂 Preferences Storage

Preferences are saved as a JSON file at:

```
files/preferences.json
```

Automatically initialized on first run.

## 📉 Price History Storage

Historical stock prices are saved in:

```
files/stock_prices_history.json
```

This file is updated periodically (every 6 hours) using scheduled background
jobs, and records older than 5 days are automatically purged to reduce size.
