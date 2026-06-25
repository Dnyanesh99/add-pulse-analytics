# AdPulse Analytics - Frontend Architecture

AdPulse Analytics is a high-performance, real-time Single Page Application (SPA) designed to visualize complex advertising metrics, manage live campaigns, and configure budget thresholds. 

This document serves as the central engineering reference for the frontend architecture, state management, testing, and deployment pipelines.

## 🏗 Tech Stack

- **Core Engine:** React 19, TypeScript 5.x
- **Build System:** Vite 8, Yarn Berry (v4) with Corepack
- **State Management:** Redux Toolkit (RTK), RTK Query
- **Real-Time Data:** STOMP over SockJS (WebSockets)
- **Styling & UI:** Emotion (CSS-in-JS), Custom Fluid Grid System
- **Data Visualization:** Apache ECharts (Canvas), MapLibre GL (WebGL)
- **Testing:** Vitest (Unit), Cypress (E2E)
- **Deployment:** Nginx, Docker

---

## 📂 Project Structure

```text
client/
├── cypress/                # Cypress End-to-End Test Specifications
├── public/                 # Static assets
├── src/
│   ├── api/                # RTK Query definitions & API slices
│   ├── components/         # Reusable UI components & Layouts
│   │   ├── campaigns/      # Campaign-specific UI (Tables, Drawers)
│   │   ├── charts/         # ECharts wrapper components
│   │   └── dashboard/      # Core dashboard masonry & widgets
│   ├── pages/              # Top-level route components (Login, Dashboard)
│   ├── store/              # Redux store configuration & hooks
│   ├── types/              # Global TypeScript interfaces
│   ├── utils/              # Helper functions (Number formatting, etc)
│   └── App.tsx             # Root Component & Route Provider
├── Dockerfile              # Multi-stage production build blueprint
├── nginx.conf              # SPA-optimized Nginx routing rules
├── vite.config.ts          # Vite build & transpilation configuration
└── package.json            # Scripts & Workspace Dependencies
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: v22.x or strictly higher.
- **Package Manager**: Yarn v4.x (managed via Corepack).

### Local Development

1. **Enable Corepack & Install**
   ```bash
   corepack enable
   yarn install
   ```
2. **Start the Development Server**
   ```bash
   yarn dev
   ```
   The application will be available at `http://localhost:5173`. 
   *(Note: Ensure the backend Java API is running on `localhost:8081`)*

---

## 🧠 Architecture & Protocols

### State Management & Caching
All asynchronous server state is managed exclusively via **RTK Query** (`apiSlice.ts`). 
- **Caching**: RTK Query heavily deduplicates requests and aggressively caches responses.
- **Optimistic Updates**: Mutations (like pausing a campaign) utilize optimistic cache updates for zero-latency UI feedback, seamlessly reverting if the server responds with an error.

### Real-Time Telemetry (WebSockets)
Live metrics and immediate campaign alerts are pushed to the client via WebSockets (`STOMP` protocol over `SockJS`).
- The connection is initialized inside `App.tsx` upon successful authentication.
- Events update the global Redux store (`metricsSlice.ts`, `alertsSlice.ts`), instantly triggering highly-optimized React re-renders.

### Styling & CSS-in-JS
We strictly use **@emotion/styled** for component isolation. 
- **No Global CSS**: With the exception of `index.css` resets, all styling is tightly coupled to components.
- **Theming**: A strict Dark/Light theme token system is injected via Emotion's `<ThemeProvider>`. Hardcoded hex colors are discouraged.

---

## 🧪 Testing Methodology

We enforce a strict testing culture to guarantee production integrity.

### 1. Static Analysis (Linting & TypeScript)
We run a rigorous ESLint configuration equipped with TypeScript-specific rules to catch implicit `any` types and unused variables.
```bash
yarn build  # Runs strict `tsc` compilation
yarn lint   # Runs ESLint checks
```

### 2. Unit Testing (Vitest)
Business logic, utility functions, and isolated components are tested using **Vitest** (running the JSDOM environment).
```bash
yarn test:run
```

### 3. End-to-End Testing (Cypress)
Crucial user journeys (Authentication, Campaign Toggling, Alert Creation) are validated using **Cypress**. E2E tests strictly interact with elements using `data-cy` attributes to decouple tests from CSS refactors.
```bash
yarn cypress:run
```

---

## 🚢 Deployment

The frontend is containerized using a **multi-stage Docker build**.
1. **Stage 1 (Build)**: A Node 20+ Alpine image compiles the application via `yarn build`.
2. **Stage 2 (Runtime)**: The minified static assets (`/dist`) are copied into an **Nginx Alpine** image. 
3. **Routing**: `nginx.conf` is optimized to natively support SPA HTML5 History API routing by redirecting 404s to `index.html`.

**Build Command:**
```bash
docker build -t adpulse-frontend .
```
