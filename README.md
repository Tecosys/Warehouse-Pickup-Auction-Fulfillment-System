# Warehouse Pickup & Auction Fulfillment System

Welcome to the **Warehouse Pickup & Auction Fulfillment System**! This system is designed to streamline warehouse management, sorting, appointment scheduling, and order releases. It bridges the gap between auction results (from platforms like HiBid or AuctionFlex) and physical item pickup by integrating structured appointment bookings with efficient warehouse sorting and release mechanics.

---

## 📌 1. System Overview

This platform manages workflows for multiple key roles:
- **Administrators**: To manage complete oversight, perform bulk data imports, and oversee order classifications and statuses.
- **Workers/Clerks**: To maintain warehouse prep queues, sort orders by bins, scan/release items, and conduct customer check-ins.
- **Customers**: To view available schedules, book time slots via unique generated links, and review order confirmations.

The codebase is organized as a single **NPM Workspaces Monorepo** ensuring that both frontend components and your Node.js backend can be developed consistently side-by-side.

---

## 🏗️ 2. Monorepo Architecture

This project is a centralized Monorepo that houses three interconnected applications. It handles dependencies optimally at the root level.

```text
warehouse-pickup/
│
├── package.json           # Root workspace configuration
├── .gitignore             # Root git ignore
├── README.md              # Project Documentation
│
├── apps/
│   ├── client/            # Main Website & Customer Booking Engine
│   │   └── (Next.js, Next App Router, Tailwind CSS, TS)
│   │
│   ├── admin/             # Backend UI & Staff Dashboard
│   │   └── (React, Vite, TS)
│   │
│   └── api/               # API Gateway & Core System Logic
│       └── (Node.js, Express, Mongoose, dotenv)
```

---

## 🧩 3. Application Components & Requirements (Phase 1)

According to the defined Work Breakdown Structure limits, there are three primary micro-environments included here:

### 3.1 `apps/client` (Main Website / Customer App)
Built on **Next.js**, it operates the customer-centric flows with high performance and SEO capability:
- **Booking Flow**: Users receive a unique booking link to securely select available time slots. Static capacity slot-engine.
- **Confirmation Flow**: Users view summary confirmations for what items/lots they are scheduled to pick up statically.
- **Limitation Notes**: In Phase 1, there is no rescheduling feature or multi-language support.

### 3.2 `apps/admin` (Backend Dashboard / Staff App)
Built on **React (Vite)**, serving as an internal Single Page Application (SPA) for workforce administration:
- **Data Imports**: Allows uploading CSV/Excel sheets parsed for systems like HiBid, AuctionFlex, or ManyFastScan. 
- **Queue Views & Sorting**: Includes a mobile-responsive interface for the warehouse ground floor to allow scanning (camera support where permitted), lot tracking, and sorting into appointment or rack-based BIN allocations.
- **Pickup Log & Releases**: Front-desk operations to support check-in sequences, customer search (by bidder/name), and lot-level partial or full releases.
- **Admin Utilities**: Broad overview dashboards, order filtering, and basic CSV exports.
- **Limitation Notes**: AI BI dashboard analysis and offline-mode functionalities are explicitly out of scope.

### 3.3 `apps/api` (Backend Express Services)
Built on **Node.js + Express** communicating with a **MongoDB** (using Mongoose):
- **Authentication**: JWT-based session handling with explicit role mappings (Admin, Clerk, Worker).
- **Core Entities Mapping**: Schema designs heavily link Orders, Lots, Bookings, and Users. Data parsed from imported files execute a fixed constraint classification logic (such as identifying B-prefix structures). 
- **Notification Engine Services**: Emits event-based automated prompts like SMS (using 3rd party providers) or standard configured Email templates.
- **Limitation Notes**: Excludes complex matching AI algorithms and robust custom format parsers beyond standard rules.

---

## 🚀 4. How to Setup and Run Locally

**Requirements**:
- Node.js (`>=18.x.x`)
- NPM (`>=9.x.x`)
- Optional: MongoDB local installation or MongoDB Atlas Cloud URI

### Installation Actions

1. **Install all dependencies** across the entire project (run from the root directory):
   ```bash
   npm install
   ```

2. **Environment Variables**:
   Create a `.env` in the `apps/api` folder referencing your standard keys:
   ```env
   PORT=5000
   MONGO_URI="mongodb://localhost:27017/warehouse-system"
   JWT_SECRET="YOUR_SECURE_TOKEN_PASSWORD"
   ```

### Running the Services

Since it is an NPM workspace, you can boot up applications explicitly based on your need, traversing into respective directories. For now, navigate into the directory of the application you want to run:

**For API Gateway**:
```bash
cd apps/api
node index.js
```

**For Admin Dashboard**:
```bash
cd apps/admin
npm run dev
```

**For Client Website**:
```bash
cd apps/client
npm run dev
```

> **Pro-Tip**: You can extend the root `package.json` with scripts like `"dev:client": "npm run dev -w apps/client"` to run them concurrently in the future.

---

## 📝 5. Next Development Steps
1. Configure MongoDB Mongoose schemas based on the import criteria inside `apps/api`.
2. Connect standard backend routes for CSV parsing securely through the React Admin file upload page.
3. Establish robust slot-engine DB relationships to empower the Client Next.js booking process.
