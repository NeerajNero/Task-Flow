# SimpleCRM — Multi-Tenant Backend

A production-ready, event-driven CRM backend built with **NestJS**, **Docker**, and **PostgreSQL**.

This project serves as a reference implementation for **Enterprise Centre of Excellence (CoE)** standards, demonstrating strict separation of concerns, secure multi-tenancy, and asynchronous microservice patterns within a modular monolith.

---

## 🏗️ Architecture & Design Patterns

This project adheres to a strict 4-Layer Architecture to decouple Business Logic from Data Access and External frameworks.

### 1. The 4-Layer Pattern
* **🎮 Controller Layer (`src/api`):** Handles HTTP requests, DTO validation (`class-validator`), and Swagger documentation.
* **🧠 Service Layer (`src/api`):** Pure business logic. Authentication flows, hashing, and calculations. **Never touches the DB directly.**
* **🛡️ DB Manager Layer (`src/db`):** Acts as a "Safety Net." Translates raw database errors (like Prisma `P2002`) into clean NestJS HTTP Exceptions (`ConflictException`).
* **💾 Repository Layer (`src/db`):** The only layer allowed to touch **Prisma**. Executes raw queries and enforces security filters (e.g., `where: { tenantId }`).

### 2. Event-Driven Architecture
We use **BullMQ (Redis)** to offload heavy tasks from the main API thread.
* **Flow:** User creates Ticket (API) → Job added to Queue (Producer) → API responds "201 Created" (Fast) → Worker processes job & logs to DB (Consumer).

### 3. Secure Multi-Tenancy
* **Strategy:** Logical Separation (Row-Level Security).
* **Implementation:** Every request requires a JWT. A custom Global Guard extracts the `tenantId` from the token, and Repositories force a `tenantId` filter on every database query.

---

## 🛠️ Tech Stack

* **Runtime:** Node.js (LTS) & NestJS
* **Database:** PostgreSQL 15
* **ORM:** Prisma (Used strictly as a Query Builder; migrations are SQL-first)
* **Queue:** Redis & BullMQ
* **Containerization:** Docker Compose (Supports Colima/Rancher Desktop)
* **Observability:** Winston (Structured Logging), Loki, Promtail, Grafana, Prometheus
* **Testing:** Jest (Unit & Integration)
* **Docs:** Swagger / OpenAPI

---

## 🚀 Getting Started

### Prerequisites
* Node.js (v18+)
* Docker (Docker Desktop, Colima, or Rancher Desktop)

### 1. Installation
Clone the repository and install dependencies for both the root (orchestration) and the backend (application).

```bash
# 1. Install Root Scripts
npm install

# 2. Install Backend Dependencies
cd backend
npm install
cd ..