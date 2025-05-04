# 📈 Burzalupa – Stock Tracker App

Burzalupa is a full-stack application for tracking stock favorites. It includes:

- ✅ A NestJS-based backend (API + static serving)
- ✅ A static frontend with favorites and search functionality
- ✅ User preferences persisted on the server
- ✅ Vitest test coverage and CI integration

## 👥 Contributors

- @dreamscached &mdash; backend development
- @inaleka &mdash; frontend development, UI design, logo design

---

## 🛠 Project Structure

```
.
├── backend/           # NestJS backend source
│   ├── src/
│   ├── .env           # Environment variables
│   └── ...
├── frontend/          # Static frontend (HTML/CSS/JS)
├── static/            # Built frontend (copied from frontend/)
├── Dockerfile         # Full build + runtime container
├── docker-compose.yml
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

## 🧪 Testing

Run unit, e2e, and coverage tests:

```bash
cd backend
yarn install
yarn test           # Unit tests
yarn test:e2e       # End-to-end tests
yarn test:cov       # Coverage (HTML + summary)
```

To view HTML coverage report:

```bash
open coverage/index.html
```

Or print summary in CLI:

```bash
./scripts/coverage.sh
```

---

## 🌍 Environment Variables

Located in `backend/.env`:

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

### 1. Install backend

```bash
cd backend
yarn install
yarn build
```

### 2. Copy frontend to static dir

```bash
cp -r frontend static
```

### 3. Start server

```bash
yarn start:prod
```

Then visit: [http://localhost:3000](http://localhost:3000)

---

## 📂 Preferences Storage

Preferences are saved as a JSON file at:

```
backend/files/preferences.json
```

Automatically initialized on first run.
