# 🇵🇰 Easypaisa / JazzCash Fintech Engine

A production-grade, full-stack digital wallet and branchless banking engine built with **Next.js 16 (App Router)**, **TypeScript**, **Prisma ORM 7**, **Neon Serverless PostgreSQL**, and **Stripe Checkout**.

Designed with authentic Pakistani fintech architecture, featuring ACID-compliant transactions, relational promotion junction rules, idempotency protection against duplicate charges, and real-time ledger accounting.

---

## 🌟 Key Features

### 1. 💳 Digital Wallet & Balance Management
* **Real-Time Balance Display:** Synced with PostgreSQL database with sub-second precision.
* **Privacy Toggle:** Interactive balance hide/show (`👁️` eye toggle: `Rs. 5,000.00` ↔ `• • • • • •`).
* **Instant Inflow & Outflow:** Atomic balance updates with zero balance discrepancy.

### 2. 📱 Mobile Easyload (Recharge) Engine
* **All Pakistani Operators:** Jazz (Super 4G), Zong (4G Data), Telenor (4G Digital), and Ufone (4G Super).
* **Regex Phone Validation:** Pakistani mobile number verification (`03XXXXXXXXX`).
* **Quick Amount Chips:** Instant selection (`Rs. 100`, `Rs. 200`, `Rs. 500`, `Rs. 1,000`, `Rs. 2,000`).
* **Promotional Junction Rules:** Relational promotion engine supporting custom percentage/fixed discounts with caps per telecom network (e.g., `SUNDAY5` gives 5% on Jazz & 10% on Zong; `EID_BONUS` gives 15% on Telenor).
* **Live Receipt Preview:** Shows base amount, voucher discount, and net payable before confirmation.

### 3. 💸 Send Money (P2P Transfer)
* Instant 24/7 wallet-to-wallet transfer to any mobile number or CNIC.
* Validation preventing transfer to self or transferring more than the available balance.
* Purpose tags (*Family Support, Personal Gift, Business, Loan Repayment*).

### 4. 🧾 Utility Bill Payments
* Clear electricity, gas, and internet bills with 14-digit consumer reference numbers.
* Supported Providers: **LESCO Electricity**, **K-Electric (Karachi)**, **SNGPL Sui Gas**, and **PTCL Landline/EVO**.

### 5. 💳 Stripe International Card Top-Up
* Add funds via Debit/Credit Cards (Visa / Mastercard) using Stripe Checkout.
* Automatic payment verification and balance crediting upon return (`/api/stripe/verify`).
* Enforced international minimum thresholds (Rs. 200 / ~$0.50 USD).

### 6. 🛡️ Financial Security & Concurrency Controls
* **ACID Transactions:** All debits, credits, and ledger logs execute inside `prisma.$transaction`.
* **Idempotency Protection:** Every request includes an `Idempotency-Key` to eliminate race conditions and double-spending.
* **Insufficient Balance Guard:** Real-time dual-layer protection (instant client-side warning + database-level block).

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | [Next.js 16](https://nextjs.org) (App Router, Turbopack) |
| **Language** | [TypeScript](https://www.typescriptlang.org) (Strict mode) |
| **Database** | [Neon](https://neon.tech) (Serverless PostgreSQL) |
| **ORM** | [Prisma 7](https://www.prisma.io) (`@prisma/client` + `@prisma/adapter-pg`) |
| **Payments** | [Stripe SDK](https://stripe.com) |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com) |
| **Icons** | [Lucide React](https://lucide.dev) |

---

## 📁 Project Architecture & Folder Structure

```text
jazzcash-fintech-engine/
├── app/
│   ├── api/
│   │   ├── bills/route.ts          # Utility bill payment endpoint
│   │   ├── stripe/
│   │   │   ├── checkout/route.ts   # Stripe Checkout session creator
│   │   │   └── verify/route.ts     # Stripe payment verification & wallet crediting
│   │   ├── topup/route.ts          # Easyload recharge with promo vouchers
│   │   ├── transfer/route.ts       # P2P money transfer endpoint
│   │   └── wallet/route.ts         # Wallet dashboard data fetch & sync
│   ├── layout.tsx                  # Root layout & metadata
│   ├── page.tsx                    # Main clean dashboard orchestrator
│   └── globals.css                 # Tailwind CSS styles
│
├── components/                     # Modular React Components
│   ├── dashboard/
│   │   ├── Header.tsx              # Brand navigation & verified user pill
│   │   ├── WalletCard.tsx          # Balance card with privacy eye toggle
│   │   ├── ServiceTabs.tsx         # 4 quick service switcher buttons
│   │   └── Passbook.tsx            # Recent transactions passbook ledger
│   ├── forms/
│   │   ├── EasyloadForm.tsx        # Mobile recharge form & live receipt
│   │   ├── SendMoneyForm.tsx       # P2P transfer form
│   │   └── BillPaymentForm.tsx     # Utility bill form
│   └── ui/
│       └── FeedbackAlert.tsx       # Dismissible status notification banner
│
├── lib/                            # Shared Utilities & Singletons
│   ├── prisma.ts                   # Prisma client with connection pooling
│   ├── stripe.ts                   # Stripe SDK singleton
│   └── constants.ts                # Operator styles, quick chips, utility providers
│
├── types/                          # Central TypeScript Definitions
│   └── index.ts                    # Transaction, Telecom, Promotion, Wallet types
│
├── prisma/
│   ├── schema.prisma               # PostgreSQL relational schema
│   └── seed.js                     # Seed script for telecom & promotions data
├── prisma.config.ts                # Prisma 7 CLI configuration
├── package.json
└── tsconfig.json
```

---

## 🗄️ Relational Database Schema

```mermaid
erDiagram
    User ||--o| Wallet : owns
    User ||--o{ Transaction : executes
    Telecom ||--o{ Transaction : processes
    Telecom ||--o{ PromotionTelecomRule : links
    Promotion ||--o{ PromotionTelecomRule : defines

    User {
        String id PK
        String name
        String phone UK
        DateTime createdAt
    }

    Wallet {
        String id PK
        String userId FK
        Decimal balance
        String currency
        DateTime updatedAt
    }

    Telecom {
        String id PK
        String name
        String code UK
    }

    Promotion {
        String id PK
        String code UK
        String description
        Int usageLimit
        Int currentUsage
        Boolean isActive
    }

    PromotionTelecomRule {
        String id PK
        String promotionId FK
        String telecomId FK
        String discountType
        Decimal discountValue
        Decimal maxCap
    }

    Transaction {
        String id PK
        String userId FK
        String telecomId FK
        String phoneNumber
        Decimal amount
        Decimal discountAmount
        Decimal finalAmount
        String promoCode
        String status
        String idempotencyKey UK
        String stripeId
        DateTime createdAt
    }
```

---

## 🚀 Getting Started

### 1. Prerequisites
* [Node.js](https://nodejs.org) v18.18+ or v20+
* A [Neon](https://neon.tech) PostgreSQL database account
* A [Stripe](https://stripe.com) account (for test API keys)

### 2. Clone and Install Dependencies
```bash
git clone https://github.com/your-username/jazzcash-fintech-engine.git
cd jazzcash-fintech-engine
npm install
```

### 3. Setup Environment Variables
Create a `.env` file in the root directory:
```env
DATABASE_URL="postgresql://user:password@ep-your-database-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require"
STRIPE_SECRET_KEY="sk_test_your_stripe_secret_key"
```

### 4. Push Schema to Neon Database
```bash
npx prisma db push
```

### 5. Seed Initial Data (Telecoms, Promos, Test Wallet)
```bash
npm run seed
```
> Seeds Jazz, Zong, Telenor, Ufone operators, `SUNDAY5` and `EID_BONUS` promo rules, and creates default user **Israr Ullah** with **Rs. 5,000.00** wallet balance.

### 6. Run Development Server
```bash
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

---

## 🧪 Testing Features (Evaluator Guide)

| Test Case | Steps | Expected Result |
|---|---|---|
| **Easyload with Voucher** | 1. Choose **Jazz**<br>2. Select amount **Rs. 500**<br>3. Tap **SUNDAY5** voucher<br>4. Click **Pay** | Discount of Rs. 25 is subtracted; Rs. 475 deducted from wallet; transaction logged in Passbook. |
| **Send Money (P2P)** | 1. Click **Send Money** tab<br>2. Enter receiver: `03129876543`<br>3. Amount: `Rs. 1,000`<br>4. Click **Transfer** | Rs. 1,000 deducted; labeled `TRANSFER: Ahmed Raza` in statement. |
| **Bill Payment** | 1. Click **Bill Payment** tab<br>2. Select **LESCO**<br>3. Amount: `Rs. 1,500`<br>4. Click **Pay Bill** | Rs. 1,500 deducted; logged with provider name & reference in statement. |
| **Card Deposit (Stripe)** | 1. Click **+ Add Cash**<br>2. Enter amount `1000`<br>3. Use test card `4242 4242...`<br>4. Complete checkout | Redirects back with confirmation; wallet balance increments by Rs. 1,000. |
| **Insufficient Balance Guard** | 1. Enter amount `Rs. 50,000` (exceeding balance) | Instant red warning banner displays; transaction blocked by both frontend and database. |

---

## 🔒 License

MIT License. Designed and developed for demonstration of scalable fintech and branchless banking architecture in Pakistan.
