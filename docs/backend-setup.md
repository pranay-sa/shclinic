# Sugar & Heart Clinic Backend Setup and Azure Deployment

This backend lives in `apps/api` and supports frontdesk, doctor, and lab portals with:

- JWT authentication
- clinic-scoped RBAC context
- PostgreSQL persistence
- realtime updates via Socket.IO

This guide includes both local setup and production hosting on Azure.

## 1) Local Development Setup

### Prerequisites

- Node.js 20+
- PostgreSQL 15+

### Configure environment

Copy:

- `apps/api/.env.example` -> `apps/api/.env` (local)
- `apps/api/.env.production.example` as reference for production

Set:

- `DATABASE_URL`
- `JWT_SECRET` (minimum 64 characters in production)
- `API_CORS_ORIGIN`

### Install and initialize

From repo root:

```bash
npm install
npm run db:init:api
```

### Run apps

```bash
npm run dev:api
npm run dev:web
```

### Demo users (initial seed)

- Frontdesk: `frontdesk / password123 / main`
- Doctor: `doctor / password123 / main`
- Lab: `labtech / password123 / main`

Important: change seeded passwords before any public rollout.

---

## 2) Is Azure the best choice?

For this project, Azure is a very strong fit because you get:

- managed PostgreSQL with backup/PITR
- secure networking options (public access restrictions or private endpoints)
- Key Vault for secret management
- App Service with autoscaling and Application Insights
- WAF/Front Door integration for edge security

If your team is already using Microsoft stack (AAD/Defender/Sentinel), Azure is often the best operational choice.

---

## 3) Azure production architecture (recommended)

- **Backend API**: Azure App Service (Linux, Node 20)
- **Database**: Azure Database for PostgreSQL Flexible Server
- **Secrets**: Azure Key Vault
- **File storage**: Azure Blob Storage
- **Monitoring**: Application Insights + Log Analytics
- **Edge**: Azure Front Door + WAF (recommended for public internet)

---

## 4) Deploy PostgreSQL on Azure

### 4.1 Create resource group

```bash
az group create --name rg-shc-prod --location centralindia
```

### 4.2 Create PostgreSQL Flexible Server

```bash
az postgres flexible-server create \
  --resource-group rg-shc-prod \
  --name shc-pg-prod \
  --location centralindia \
  --admin-user shcadmin \
  --admin-password "<STRONG_PASSWORD>" \
  --sku-name Standard_D2s_v3 \
  --tier GeneralPurpose \
  --storage-size 128 \
  --version 16 \
  --public-access <YOUR_PUBLIC_IP>
```

### 4.3 Create database

```bash
az postgres flexible-server db create \
  --resource-group rg-shc-prod \
  --server-name shc-pg-prod \
  --database-name shc
```

### 4.4 Initialize schema and seed data

Set local `apps/api/.env` temporarily to Azure `DATABASE_URL`, then run:

```bash
npm run db:init:api
```

---

## 5) What "deployed postgres link" means

PostgreSQL does not provide a browser URL like a web app. Share:

- host/FQDN: `shc-pg-prod.postgres.database.azure.com`
- port: `5432`
- database name: `shc`
- username: `shcadmin`

Connection string format:

```env
DATABASE_URL=postgresql://shcadmin:<PASSWORD>@shc-pg-prod.postgres.database.azure.com:5432/shc?sslmode=require
```

Never share the DB password publicly.

---

## 6) Deploy backend API on Azure App Service

### 6.1 Create App Service plan and app

```bash
az appservice plan create \
  --resource-group rg-shc-prod \
  --name shc-api-plan \
  --is-linux \
  --sku P1v3

az webapp create \
  --resource-group rg-shc-prod \
  --plan shc-api-plan \
  --name shc-api-prod \
  --runtime "NODE|20-lts"
```

### 6.2 Configure app settings

```bash
az webapp config appsettings set \
  --resource-group rg-shc-prod \
  --name shc-api-prod \
  --settings \
  NODE_ENV=production \
  API_PORT=8080 \
  API_CORS_ORIGIN=https://<your-frontend-domain> \
  JWT_SECRET=<LONG_RANDOM_SECRET> \
  DATABASE_URL="postgresql://shcadmin:<PASSWORD>@shc-pg-prod.postgres.database.azure.com:5432/shc?sslmode=require"
```

### 6.3 Enable production runtime options

```bash
az webapp config set \
  --resource-group rg-shc-prod \
  --name shc-api-prod \
  --always-on true \
  --web-sockets-enabled true
```

### 6.4 Deploy application code

Use one of:

- Azure Deployment Center (GitHub Actions)
- Zip deploy
- CI pipeline

After deployment, API URL is:

- `https://shc-api-prod.azurewebsites.net`

Health check:

- `https://shc-api-prod.azurewebsites.net/health`

---

## 7) Frontend configuration after API deploy

Set frontend env:

```env
VITE_API_BASE_URL=https://shc-api-prod.azurewebsites.net/api
```

---

## 8) Security and compliance checklist

- Store secrets in Key Vault (not plaintext env in source control).
- Restrict CORS to exact production domains.
- Enable DB backup and point-in-time restore.
- Add audit logs for auth, record updates, billing, and cancellations.
- Add rate limiting and request validation for all public endpoints.
- Use private endpoint/VNet for database in final production posture.
- Enable WAF via Front Door for public API.
- Enable App Insights alerts on 5xx, latency, CPU, memory, and DB connectivity.

---

## 9) Realtime behavior

Socket.IO uses JWT auth and clinic room segmentation:

- room key: `clinic:<clinicId>`
- events: patient, queue, billing, lab, and records updates

For realtime UI sync, add `socket.io-client` in web and subscribe by clinic context.
