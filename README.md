# ResearchForge — Full-Stack Next.js App

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Copy env and fill your values
cp .env.example .env

# 3. Generate Prisma client
npm run db:generate

# 4. Push schema to database
npm run db:push

# 5. Seed test data
npm run db:seed

# 6. Start dev server
npm run dev
```

Visit: http://localhost:3000

---

## Test Accounts

| Role        | Email                      | Password     |
|-------------|----------------------------|--------------|
| Admin       | researchforgeconsulting@gmail.com | Consultus2026 |
| Client      | aisha@unicef.org           | client123    |
| Researcher  | tunde@researchforge.com     | research123  |
| Finance     | ngozi@researchforge.com     | finance123   |

---

## API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET/POST | `/api/auth/[...nextauth]` | NextAuth — login, session, signout |

### Orders (core workflow)
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/orders` | All | List orders (filtered by role) |
| POST | `/api/orders` | Client, Admin | Submit new order with brief |
| GET | `/api/orders/[id]` | Owner, Admin, Researcher | Get single order |
| PATCH | `/api/orders/[id]` | Admin | Set `projectId` (client must own project); send `null` to clear |
| POST | `/api/orders/[id]/status` | Admin, Researcher | Change order status + notify client |
| POST | `/api/orders/[id]/assign` | Admin | Assign researcher to order |
| POST | `/api/orders/[id]/briefs` | Client | Attach uploaded brief files |
| GET | `/api/orders/[id]/messages` | Owner, Admin, Researcher | Get messages |
| POST | `/api/orders/[id]/messages` | All | Send message / internal note |
| POST | `/api/orders/[id]/deliver` | Admin, Researcher | Upload deliverables → auto email + dashboard |

### Files & Delivery
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/upload` | Authenticated | Upload file → R2/S3, returns URL |
| GET | `/api/deliverables/[id]/download` | Owner, Admin | Download deliverable (tracks count) |

### Projects
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/projects` | Authenticated | List projects (role-filtered) |
| POST | `/api/projects` | Admin | Create project |

### Quotes
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/quotes` | Admin | Create quote for a project |
| PATCH | `/api/quotes` | Admin | Approve quote → creates first invoice (idempotent) |

### Invoices & Payments
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/invoices` | Client, Admin, Finance | List invoices |
| POST | `/api/invoices/send` | Admin, Finance | Send payment reminder email |
| POST | `/api/payments` | Client | Initialise Paystack payment |
| POST | `/api/payments/webhook` | Paystack | Webhook: verify + update invoice + log |

### Users & Notifications
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/users` | Admin, Finance | List all users |
| POST | `/api/contact` | Public | Submit contact form |
| GET | `/api/notifications` | Authenticated | Get user notifications |
| PATCH | `/api/notifications` | Authenticated | Mark all notifications read |

---

## Pages by Role

### Client (`/dashboard/client/...`)
| Page | Path |
|------|------|
| Overview dashboard | `/dashboard/client` |
| My orders (tracker) | `/dashboard/client/orders` |
| Submit new order (3-step wizard + file upload) | `/dashboard/client/orders/new` |
| Order detail: progress tracker, timeline, deliverables, messages | `/dashboard/client/orders/[id]` |
| Invoices & payment | `/dashboard/client/invoices` |

### Admin (`/dashboard/admin/...`)
| Page | Path |
|------|------|
| Overview | `/dashboard/admin` |
| All orders — review, assign, update status | `/dashboard/admin/orders` |
| Single order — read brief, upload work, message | `/dashboard/admin/orders/[id]` |
| Projects | `/dashboard/admin/projects` |
| Clients | `/dashboard/admin/clients` |
| Invoices | `/dashboard/admin/invoices` |

### Researcher (`/dashboard/researcher/...`)
| Page | Path |
|------|------|
| Task overview | `/dashboard/researcher` |
| Assigned orders | `/dashboard/researcher/orders` |
| Order detail — read brief, upload work, message | `/dashboard/researcher/orders/[id]` |

### Finance (`/dashboard/finance/...`)
| Page | Path |
|------|------|
| Finance overview | `/dashboard/finance` |
| Invoice tracker + send reminders | `/dashboard/finance/invoices` |

---

## Order Workflow

```
Client submits order (+ uploads brief docs), ideally linked to a project
         ↓
Admin receives notification + email
         ↓
Admin links order to project (if needed), ensures quote approved + client paid first invoice
         ↓
Admin assigns researcher → status: IN_PROGRESS (blocked until initial invoice is paid)
         ↓  
Client notified by email + dashboard notification
         ↓
Researcher reads brief files, does the work
         ↓
Researcher uploads deliverables via dashboard
         ↓
System auto-sends files to client email (if BOTH or EMAIL delivery)
         ↓
Client downloads from dashboard OR email link
         ↓
Order marked COMPLETED
```

## Payment Workflow

```
Admin creates Quote → Client approves
         ↓
Invoice auto-created (FULL or 50% INSTALLMENT)
         ↓
Client sees "Pay Now" → Paystack/Stripe
         ↓
Paystack webhook → signature verified → Invoice updated
         ↓
If INSTALLMENT: 2nd invoice created at project delivery
         ↓
Finance dashboard tracks all revenue
```

## Stack
- **Framework**: Next.js 14 (App Router, Server Components)
- **Auth**: NextAuth v5 + bcrypt (credentials)
- **Database**: PostgreSQL + Prisma ORM
- **Payments**: Paystack (Nigeria) / Stripe (global)
- **Email**: Resend (transactional)
- **Storage**: Cloudflare R2 / AWS S3
- **Notifications**: In-app bell + email
- **Styling**: Tailwind CSS + CSS variables
- **Deploy**: Vercel + Railway/Neon + Upstash Redis
