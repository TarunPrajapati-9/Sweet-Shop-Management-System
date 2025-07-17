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

##  Quick Start

### Prerequisites

- Node.js (v18 or higher)
- Bun (recommended) or npm/yarn
- PostgreSQL database
- Git
  
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
