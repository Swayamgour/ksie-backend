# KSIE Air & Sea Cargo Management System — Backend

Node.js + Express (ES6 Modules) + MongoDB (Mongoose) + JWT/RBAC backend, built from the
**Developer Scope of Work** and **Architecture Document** provided.

> ⚠️ **Scope note**: The architecture document itself estimates this full ERP at **24–28 weeks**
> with a 10-person team (architect, PM, designers, 4 backend + 3 frontend devs, QA, DevOps).
> This scaffold delivers a **fully wired, runnable backend foundation** covering every module in
> the SOW with real models, auth, RBAC, and working CRUD + workflow endpoints — verified to boot
> cleanly. Some integrations (ICEGATE, GST e-invoice IRP, SMS/WhatsApp/Email providers, X-Ray/ETD
> device SDKs, payment gateway) are wired as clearly marked stubs (`TODO` comments) since they
> need real vendor credentials/sandbox access that only you can provide.

## Tech Stack

- **Runtime**: Node.js 18+, native ES Modules (`"type": "module"`)
- **Framework**: Express 4
- **Database**: MongoDB via Mongoose ODM
- **Auth**: JWT (access + refresh tokens), bcrypt password hashing
- **Authorization**: Role-based (RBAC) + fine-grained permission strings
- **Security**: helmet, cors, rate-limiting, express-validator

> Note: document `_id`s are MongoDB ObjectIds (24-char hex strings), not UUIDs. Any place that
> previously said "UUID" in requests/responses now takes/returns a Mongo ObjectId string instead.

## Project Structure

```
src/
  config/db.js            # Mongoose connection
  models/                 # 27 Mongoose schemas/models, refs declared inline (index.js re-exports)
  middleware/              # auth (JWT), rbac, validate, errorHandler
  controllers/              # business logic per module (+ generic CRUD factory)
  routes/                   # Express routers per module, mounted in routes/index.js
  seed/seed.js              # creates default roles + super admin user
  app.js                    # Express app (middleware + routes)
  server.js                 # DB connect + listen
```

## Modules Implemented (matches SOW numbering)

| # | Module | Key Endpoints |
|---|--------|----------------|
| 0 | Auth / Admin / Dashboard | `/api/v1/auth`, `/api/v1/users`, `/api/v1/roles`, `/api/v1/customers`, `/api/v1/dashboard` |
| 1 | Air Cargo (Import/Export/Courier/Transshipment/RA-RA3) | `/api/v1/air-cargo`, `/api/v1/manifests`, `/api/v1/courier`, `/api/v1/transshipment`, `/api/v1/ra-compliance` |
| 2 | Warehouse (Racks, Bins, Inventory, Aging, Damage) | `/api/v1/warehouses` |
| 3 | Security (Screening, Audit Logs) | `/api/v1/security` |
| 4 | Customs (Declarations, ICEGATE stub, Documents) | `/api/v1/customs` |
| 5 | Billing (Tariffs, GST Invoices, Payments, Revenue) | `/api/v1/billing` |
| 6 | Sea Cargo (Containers, Gate, Weighment, Stuffing, Reefer) | `/api/v1/sea-cargo` |
| 7 | Tracking (public + internal events) | `/api/v1/tracking` |
| 8 | Reports & Analytics | `/api/v1/reports` |
| 9 | Third-party integration points | ICEGATE stub in customs controller; others marked `TODO` |
| 10 | Admin Panel (Users, Roles, Masters) | `/api/v1/users`, `/api/v1/roles`, `/api/v1/masters` |

## Setup

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env
# edit .env with your MongoDB connection string and JWT secrets

# 3. Make sure MongoDB is running
#    - Local: install MongoDB Community Server and start the `mongod` service, or
#    - Cloud: create a free cluster on MongoDB Atlas and paste its connection string
#      into MONGODB_URI in .env

# 4. Start the server (collections are created automatically on first insert)
npm run dev            # nodemon, auto-restart
# or
npm start

# 5. Seed default roles + super admin user
npm run seed
```

Default super admin (from `.env.example`, override before production):
```
email:    admin@ksie.com
password: Admin@12345
```

Health check: `GET /health`

## Authentication Flow

1. `POST /api/v1/auth/login` → `{ email, password }` → returns `accessToken` + `refreshToken`
2. Send `Authorization: Bearer <accessToken>` on all subsequent requests
3. `POST /api/v1/auth/refresh-token` → `{ refreshToken }` → new `accessToken` when it expires
4. Only `super_admin` can `POST /api/v1/auth/register` new staff users (assign `roleId`)

## Roles Seeded

`super_admin`, `operations_manager`, `customs_officer`, `billing_officer`, `security_officer`, `customer`
— edit `src/seed/seed.js` to add more (e.g. split Air vs Sea operations roles) or manage via
`/api/v1/roles` once logged in as super_admin.

## Example: End-to-end Air Import Flow

```
POST /api/v1/air-cargo/import          → create AWB (status: awb_created)
POST /api/v1/manifests                 → upload manifest for the flight
PATCH /api/v1/air-cargo/:id/status     → { "status": "cargo_arrived" }
POST /api/v1/customs/declarations      → file Bill of Entry
POST /api/v1/customs/declarations/:id/file-icegate   → ICEGATE stub filing
POST /api/v1/warehouses/storage        → store cargo in a rack
PATCH /api/v1/warehouses/storage/:id/release → release for delivery
POST /api/v1/billing/invoices/generate → generate GST invoice against tariffs
POST /api/v1/billing/payments          → record payment
GET  /api/v1/tracking/public/:awbNumber → customer-facing tracking
```

## What's Genuinely Production-Ready vs. What Needs Real Integration

**Ready to use as-is:**
- Auth, RBAC, all CRUD + workflow-transition endpoints for every module
- GST invoice line-item calculation logic
- Cargo aging / warehouse capacity logic
- Reefer temperature deviation alerting logic
- Unified public tracking lookup (AWB / container / courier number)

**Stubbed — needs your real credentials/sandbox to finish:**
- ICEGATE electronic filing (`src/controllers/customsController.js` → `fileWithIcegate`)
- GST e-invoice IRN generation (`src/controllers/billingController.js` → `generateEInvoice`)
- SMS/Email/WhatsApp dispatch (`src/controllers/notificationController.js` → wire to a queue + provider)
- X-Ray/ETD device integration (`src/controllers/securityController.js` → currently accepts a manual result payload; replace with device webhook/SDK)
- Payment gateway webhook confirmation (`src/controllers/billingController.js` → `recordPayment` currently marks confirmed immediately)
- File uploads currently expect a `fileUrl` string — wire `multer` (already in dependencies) + S3/MinIO for real uploads

## Next Steps

1. Point `.env` at your MongoDB instance (local or Atlas) and run `npm run dev` + `npm run seed`
2. Test endpoints with Postman/Insomnia using the flow above
3. Fill in the stubbed integrations one at a time as vendor sandbox access becomes available
4. Add automated tests (Jest + supertest recommended) before production deployment
5. Add explicit indexes (`schema.index(...)`) on any additional high-traffic query fields as data volume grows


## Enhanced completion package

This version adds explicit operational entities/endpoints that were not represented as first-class resources in the original scaffold:

- `/api/v1/operations/vehicles` — vehicle master + GPS/location update
- `/api/v1/operations/vessels` — vessel/voyage master
- `/api/v1/operations/delivery-orders` — delivery order create/approve/issue
- `/api/v1/operations/uld-allocations` — ULD allocation transaction
- `/api/v1/operations/flight-loading` — flight loading transaction
- `/api/v1/operations/cargo-movements` — cargo movement history
- `/api/v1/operations/audit-logs` — central audit-log listing
- `/api/v1/files` — authenticated multipart file upload with validation
- Public tracking now also supports transshipment and vehicle references.

These additions improve the internal business-workflow coverage. They do **not** fabricate third-party connectivity. Real ICEGATE, GST/IRP, airline, freight-forwarder, ERP, X-Ray/ETD, SMS/email/WhatsApp and payment-gateway connectivity still requires the real vendor contracts, credentials, certificates, SDKs and sandbox/webhook details.
