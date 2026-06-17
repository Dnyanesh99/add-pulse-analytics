# AdPulse 🚀

**AdPulse** is a high-performance, real-time ad technology platform designed to handle massive volumes of ad traffic (impressions, clicks, conversions) with sub-millisecond validation and instantaneous analytics. Built on a strictly typed, event-driven architecture, AdPulse ensures that budgets are respected in real time while providing robust, high-performance dashboards for advertisers.

---

## 🏗 System Architecture overview

AdPulse is composed of a specialized microservice architecture utilizing modern event-streaming and multi-database patterns to separate high-velocity write operations from complex read analytics. 

* **Simulator (Java 21):** Generates high-volume synthetic ad traffic.
* **Ingestion API (Java 21 / Spring Boot):** The front door for ad events. It validates budgets sub-millisecond using Redis Lua scripts before putting events into Kafka.
* **Analytics API (Java 21 / Spring Boot):** Joins relational metadata with real-time aggregates. Broadcasts the unified state to the frontend via WebSockets (STOMP).
* **Frontend (React 19 / Vite):** A production-grade dashboard utilizing Redux Toolkit, Emotion, and Echarts for real-time visualization of ad campaigns.

### The Stack

| Component         | Technologies Used |
| :---------------- | :---------------- |
| **Frontend**      | React 19, TypeScript, Redux Toolkit, Emotion, Vite, ECharts, Cypress |
| **Backend**       | Java 21, Spring Boot 3.2.5, Virtual Threads |
| **Streaming**     | Apache Kafka (KRaft mode) |
| **Cache/KV**      | Redis 7 |
| **Relational DB** | PostgreSQL 15 |
| **OLAP DB**       | ClickHouse |
| **Deployment**    | Docker, Docker Compose |

---

## 🚀 Getting Started

### Prerequisites

* **Docker** & **Docker Compose**
* **Node.js** (v18+ recommended) & **Yarn** (v4.16.0)
* **Java 21** & **Maven** (If running backend locally outside Docker)

### 1. Environment Setup

Copy the example environment file and fill in any required local overrides. *Note: Do not commit `.env` containing sensitive passwords!*

```bash
cp .env.example .env
```

### 2. Running the Application (Docker Compose)

The entire stack (Infrastructure, Microservices, and Frontend) is orchestrated via Docker Compose.

```bash
docker compose up -d --build
```

**Services will be exposed at:**
* **Frontend UI:** `http://localhost:3000`
* **Analytics API:** `http://localhost:8081`
* **Ingestion API:** `http://localhost:8082`

### 3. Local Development

**Frontend:**
```bash
cd client
yarn install
yarn dev
```

**Backend (Services):**
```bash
cd services
mvn clean install
```

---

## 📡 API Endpoints

### Ingestion Service (`:8082`)
| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/api/v1/events/track` | `POST` | Receives ad traffic. Validates against Redis budget before queuing to Kafka. |

### Analytics Service (`:8081`)
| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/api/v1/campaigns` | `GET` | Lists all campaigns from PostgreSQL. |
| `/api/v1/campaigns/with-metrics` | `GET` | Returns campaigns joined with real-time ClickHouse metrics. |
| `/api/v1/campaigns` | `POST` | Creates a campaign in Postgres and initializes Redis budget state. |
| `/api/v1/campaigns/{id}` | `PUT` | Updates a campaign and synchronizes changes to Redis instantly. |
| `/topic/metrics` | `WebSocket` | Real-time broadcast of aggregated campaign data. |

---

## 🧪 Testing

We use Cypress for end-to-end testing of our client dashboard.

```bash
cd client
yarn cypress:open  # For interactive UI testing
# OR
yarn cypress:run   # For headless testing (used in CI)
```

---

## 🏛 Architecture & Technology Choices Explained

### Why this specific Database & Infrastructure Architecture?

Ad tech platforms face a unique challenge: they must handle thousands of incoming events per second (writes) while simultaneously allowing users to view complex aggregations over millions of rows (reads) in real time. A standard monolithic database architecture cannot scale effectively for both workloads.

1. **PostgreSQL as the Source of Truth:**
   * **Why:** We need strict ACID compliance for transactional data like billing setups, campaign configuration, and user metadata. Postgres guarantees data integrity for our core business entities.

2. **Redis for Budget Validation:**
   * **Why:** In ad tech, you cannot overspend a campaign budget. Budget validation must happen on the hot path (Ingestion) before an event is accepted. Redis Lua scripts provide atomic, sub-millisecond check-and-decrement operations that easily scale to thousands of requests per second.

3. **Apache Kafka for Event Streaming:**
   * **Why:** Once validated, events must not be lost, but processing them synchronously would bottleneck the Ingestion API. Kafka acts as a durable, highly partitioned buffer that reliably delivers events from Ingestion to our analytics engine in strict order.

4. **ClickHouse for Real-Time Analytics (OLAP):**
   * **Why:** Aggregating metrics across massive event streams is too slow in Postgres. ClickHouse natively integrates with Kafka via its Kafka Engine, instantly transforming and aggregating raw event data using Materialized Views. This allows us to run millisecond analytical queries (`sumIf` pivots) without grinding the system to a halt.

### Why Java 21 & Spring Boot?
Java 21 introduces **Virtual Threads**, which completely transforms the scalability of standard I/O heavy operations (like waiting for database queries or API calls). Combined with Spring Boot's robust ecosystem, it provides enterprise-grade structure, observability, and performance without the complexity of traditional reactive programming frameworks like Project Reactor.

### Why React 19, Redux Toolkit, and Vite?
Handling a constant stream of WebSocket data pushes UI frameworks to their limits. 
* **Redux Toolkit (RTK):** We leverage RTK's `createEntityAdapter` to provide **O(1) update performance** when normalizing streaming campaign data, entirely avoiding UI stutter.
* **React & Vite:** Vite ensures lightning-fast developer experience, and React combined with smart memoization (`useMemo`, `reselect`) ensures we only render components that actually receive new data points during the high-frequency broadcasts.