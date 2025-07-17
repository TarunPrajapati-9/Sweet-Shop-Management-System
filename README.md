#  Sweet Shop Management System

<div align="center">

![Sweet Shop](https://img.shields.io/badge/Sweet%20Shop-Management%20System-orange?style=for-the-badge&logo=react)
![Next.js](https://img.shields.io/badge/Next.js-15.4.1-black?style=for-the-badge&logo=next.js)
![Express](https://img.shields.io/badge/Express-5.1.0-green?style=for-the-badge&logo=express)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-blue?style=for-the-badge&logo=postgresql)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)

*A comprehensive digital solution for managing sweet shop operations with modern web technologies*

</div>

##  Table of Contents

- [ Features](#-features)
- [ Architecture](#-architecture)
- [ Quick Start](#-quick-start)
- [ Technology Stack](#-technology-stack)
- [ Client Application](#-client-application)
- [ Server Application](#-server-application)
- [ Database Schema](#-database-schema)
- [ API Endpoints](#-api-endpoints)
- [ Contributing](#-contributing)

##  Features

###  Customer Features
- **Digital Kiosk Interface** - Browse and order sweets seamlessly
- **Smart Filtering** - Filter by categories, price range, and availability
- **Real-time Cart Management** - Add, remove, and modify orders instantly
- **Order Tracking** - Track order status with unique tokens
- **Responsive Design** - Works perfectly on all devices

###  Owner Features
- **Complete Inventory Management** - Add, update, delete, and restock sweets
- **Order Management Dashboard** - View and update order statuses
- **Statistical Overview** - Track sales, inventory, and revenue
- **Secure Authentication** - Password-protected owner panel
- **Real-time Updates** - Live inventory and order updates

###  Sweet Categories
-  **Milk Based** (Rasgulla, Gulab Jamun)
-  **Nut Based** (Kaju Katli, Badam Barfi)
-  **Vegetable Based** (Gajar Halwa, Lauki Halwa)
-  **Flour Based** (Ladoo, Jalebi)
-  **Fried** (Imarti, Balushahi)
-  **Dry Fruit Based** (Dry Fruit Roll)
-  **Chocolate Based** (Choco Barfi)
-  **Fruit Based** (Pineapple Halwa)
-  **Coconut Based** (Nariyal Ladoo)
-  **Fusion** (Cheesecake Barfi)

##  Architecture

`mermaid
graph TB
    A[Next.js Client] --> B[Express.js API Server]
    B --> C[PostgreSQL Database]
    B --> D[Prisma ORM]
    A --> E[TanStack Query]
    A --> F[Tailwind CSS + shadcn/ui]
    B --> G[CORS Middleware]
    C --> H[Database Migrations]
`

##  Quick Start

### Prerequisites

- Node.js (v18 or higher)
- Bun (recommended) or npm/yarn
- PostgreSQL database
- Git

### 1. Clone the Repository

`ash
git clone https://github.com/TarunPrajapati-9/Sweet-Shop-Management-System.git
cd Sweet-Shop-Management-System
`

### 2. Setup Server

`ash
# Navigate to server directory
cd server

# Install dependencies
bun install
# or
npm install

# Setup environment variables
cp .env.example .env
# Edit .env with your database credentials

# Generate Prisma client and run migrations
bun run generate
npx prisma migrate dev

# Start server in development
bun run dev
# or
npm run dev
`

The server will be running at http://localhost:3001

### 3. Setup Client

`ash
# Navigate to client directory (from root)
cd client

# Install dependencies
bun install
# or
npm install

# Setup environment variables
cp .env.local.example .env.local
# Add your backend URL: NEXT_PUBLIC_BACKEND_URL=http://localhost:3001

# Start client in development
bun run dev
# or
npm run dev
`

The client will be running at http://localhost:3000

### 4. Access the Application

- **Customer Kiosk**: [http://localhost:3000](http://localhost:3000)
- **Owner Dashboard**: [http://localhost:3000/owner](http://localhost:3000/owner)
- **Orders Management**: [http://localhost:3000/orders](http://localhost:3000/orders)

##  Technology Stack

### Frontend (Client)
| Technology | Version | Purpose |
|------------|---------|---------|
| **Next.js** | 15.4.1 | React framework with SSR/SSG |
| **React** | 19.1.0 | UI library |
| **TypeScript** | 5.0+ | Type safety |
| **Tailwind CSS** | 4.1.11 | Utility-first CSS |
| **shadcn/ui** | Latest | Component library |
| **TanStack Query** | 5.83.0 | Data fetching and caching |
| **Axios** | 1.10.0 | HTTP client |
| **Lucide React** | 0.525.0 | Icon library |

### Backend (Server)
| Technology | Version | Purpose |
|------------|---------|---------|
| **Express.js** | 5.1.0 | Web framework |
| **TypeScript** | 5.8.3 | Type safety |
| **Prisma** | 6.12.0 | Database ORM |
| **PostgreSQL** | Latest | Primary database |
| **CORS** | 2.8.5 | Cross-origin requests |
| **Nodemon** | 3.1.10 | Development server |

##  Client Application

###  Running the Client

`bash
cd client

# Development
bun run dev          # Start development server
bun run build        # Build for production
bun run start        # Start production server
bun run lint         # Run ESLint

# Using npm
npm run dev
npm run build
npm run start
npm run lint
`

###  Client Structure

`
client/
 src/
    app/                 # Next.js App Router
       page.tsx        # Customer kiosk (main page)
       owner/          # Owner dashboard
          page.tsx
       orders/         # Order management
           page.tsx
    components/         # Reusable components
       ui/            # shadcn/ui components
       Cart.tsx       # Shopping cart
       SweetCard.tsx  # Sweet display card
       SweetForm.tsx  # Sweet creation/edit form
       ...
    hooks/             # Custom React hooks
       useSweetKiosk.ts      # Kiosk functionality
       useSweetManagement.ts # Admin sweet management
       useOwnerAuth.ts       # Authentication
       useFilters.ts         # Filtering logic
    lib/               # Utility libraries
       dataGetter.ts  # API GET requests
       dataPoster.ts  # API POST requests
       dataPutter.ts  # API PUT requests
       dataDeleter.ts # API DELETE requests
    types/             # TypeScript type definitions
    constants/         # App constants
 public/               # Static assets
`

##  Server Application

###  Running the Server

`ash
cd server

# Development
bun run dev          # Start with nodemon (hot reload)
bun run build        # Compile TypeScript
bun run start        # Start production server
bun run generate     # Generate Prisma client

# Using npm
npm run dev
npm run build
npm run start
npm run generate
`

###  Server Structure

`
server/
 src/
    controllers/        # Request handlers
       sweet.controller.ts    # Sweet CRUD operations
       order.controller.ts    # Order management
    routes/            # API route definitions
       sweet.route.ts         # Sweet endpoints
       order.route.ts         # Order endpoints
    types/             # TypeScript types
    utils/             # Utility functions
    config/            # Configuration files
    data/              # Sample data
    app.ts             # Express app setup
    server.ts          # Server entry point
 prisma/
    schema.prisma      # Database schema
 tests/                 # Test files
 dist/                  # Compiled JavaScript
`

##  Database Schema

###  Entity Relationship Diagram

`mermaid
erDiagram
    Sweet ||--o{ OrderItem : "has"
    Order ||--o{ OrderItem : "contains"
    
    Sweet {
        int id PK
        string name UK
        SweetCategory category
        float price
        float quantity
        datetime createdAt
        datetime updatedAt
    }
    
    Order {
        string id PK
        string token UK
        OrderStatus status
        float total
        datetime createdAt
        datetime updatedAt
    }
    
    OrderItem {
        int id PK
        string name
        float price
        float quantity
        string orderId FK
        int sweetId FK
        datetime createdAt
        datetime updatedAt
    }
`

###  Enums

**SweetCategory**
`	ypescript
enum SweetCategory {
  MilkBased, NutBased, VegetableBased, FlourBased, Fried,
  DryFruitBased, ChocolateBased, FruitBased, CoconutBased, Fusion
}
`

**OrderStatus**
`	ypescript
enum OrderStatus {
  Pending, Completed
}
`

##  API Endpoints

###  Sweet Management

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | /sweets | Get all sweets (with search/filter) |  |
| GET | /sweets/:id | Get sweet by ID |  |
| GET | /sweets/check-stock | Check stock status |  |
| POST | /sweets | Create new sweet |  |
| PUT | /sweets/:id | Update sweet |  |
| PUT | /sweets/:id/restock | Restock sweet |  |
| DELETE | /sweets/:id | Delete sweet |  |

###  Order Management

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | /orders | Get all orders |  |
| GET | /orders/:id | Get order by ID |  |
| GET | /orders/token/:token | Get order by token |  |
| POST | /orders | Create new order |  |
| PUT | /orders/:id/status | Update order status |  |
| DELETE | /orders/:id | Delete order |  |

###  Example API Requests

**Create Sweet**
`ash
POST /sweets
Content-Type: application/json

{
  "name": "Gulab Jamun",
  "category": "MilkBased",
  "price": 45.50,
  "quantity": 100
}
`

**Create Order**
`ash
POST /orders
Content-Type: application/json

{
  "items": [
    {
      "sweetId": 1,
      "name": "Gulab Jamun",
      "price": 45.50,
      "quantity": 2
    }
  ],
  "total": 91.00
}
`

**Search Sweets**
`ash
GET /sweets?search=gulab&category=MilkBased&minPrice=40&maxPrice=50
`

##  Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (git checkout -b feature/AmazingFeature)
3. Commit your changes (git commit -m 'Add some AmazingFeature')
4. Push to the branch (git push origin feature/AmazingFeature)
5. Open a Pull Request

---

<div align="center">

**Made with  for sweet shop owners and customers**

[ Star this repo](https://github.com/TarunPrajapati-9/Sweet-Shop-Management-System)  [ Report Bug](https://github.com/TarunPrajapati-9/Sweet-Shop-Management-System/issues)  [ Request Feature](https://github.com/TarunPrajapati-9/Sweet-Shop-Management-System/issues)

</div>
