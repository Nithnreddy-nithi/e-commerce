
## ✨ Features

### 🔐 Authentication & Users
- JWT-based authentication (login / register)
- Secure password hashing with bcrypt
- Protected routes for cart, orders, and payments
- Auth modal for seamless login prompts

### 🛒 Shopping Cart
- Real-time cart with item count badge in navbar
- Add, update quantity, and remove items
- Server-side persistent cart (synced to database)
- Free shipping badge for orders ≥ ₹500
- Professional UI with animated interactions

### 📦 Order Management
- One-click checkout from cart
- Automatic stock validation and deduction
- Coupon/discount code support
- **Order History** page with expandable order cards
- Color-coded status badges (Pending, Confirmed, Shipped, Delivered, Cancelled)
- Order item details with product images and price breakdown

### 💳 Payment Integration
- **Razorpay** integration (real + mock mode)
- Auto-detects placeholder keys → falls back to mock payments
- Mock mode shows a confirm dialog for simulated payments
- Payment verification and order confirmation flow
- Success/failure status page with redirection

### 🏷️ Product Catalog
- Product listing with images and categories
- Product detail pages
- Category-based organization
- Stock quantity tracking

### 📍 Address Management
- CRUD operations for shipping addresses
- Address selection during checkout

### 🚚 Shipping & Offers
- Shipping cost calculation
- Shipment tracking (tracking number + status)
- Special offers and coupon management

---

## 🛠️ Tech Stack

### Backend
| Technology | Purpose |
|---|---|
| **FastAPI** | Async Python web framework |
| **SQLAlchemy 2.0** | Async ORM with `AsyncSession` |
| **PostgreSQL** | Primary database |
| **asyncpg** | Async PostgreSQL driver |
| **Alembic** | Database migrations |
| **python-jose** | JWT token handling |
| **passlib + bcrypt** | Password hashing |
| **Pydantic v2** | Schema validation |
| **Razorpay SDK** | Payment processing |

### Frontend
| Technology | Purpose |
|---|---|
| **React 19** | UI library |
| **Vite 7** | Build tool & dev server |
| **Tailwind CSS 4** | Utility-first CSS framework |
| **React Router 7** | Client-side routing |
| **Axios** | HTTP client for API calls |
| **Context API** | State management (Auth + Cart) |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     Frontend (React)                    │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌───────────┐  │
│  │  Pages   │ │Components│ │ Context  │ │ Services  │  │
│  │(9 pages) │ │(6 comps) │ │(Auth+Cart│ │ (API.js)  │  │
│  └──────────┘ └──────────┘ └──────────┘ └───────────┘  │
│                        │ Axios                          │
└────────────────────────┼────────────────────────────────┘
                         ▼
┌─────────────────────────────────────────────────────────┐
│                Backend (FastAPI)                         │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌───────────┐  │
│  │ API      │→│ Services │→│  Repos   │→│  Models   │  │
│  │Endpoints │ │(Business)│ │(Data Acc)│ │ (SQLAlch) │  │
│  └──────────┘ └──────────┘ └──────────┘ └───────────┘  │
│                                              │          │
└──────────────────────────────────────────────┼──────────┘
                                               ▼
                                    ┌──────────────────┐
                                    │   PostgreSQL DB   │
                                    └──────────────────┘
```

**Pattern:** Clean layered architecture with separation of concerns:
- **API Layer** → Route handlers, request validation, auth guards
- **Service Layer** → Business logic, checkout orchestration, payment flow
- **Repository Layer** → Database queries, async session management
- **Model Layer** → SQLAlchemy ORM models

---

## 🚀 Getting Started

### Prerequisites
- **Python 3.11+**
- **Node.js 18+**
- **PostgreSQL 14+**

### 1. Clone & Setup Backend

```bash
# Clone the repository
git clone <your-repo-url>
cd ecomrce

# Create and activate virtual environment
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # macOS/Linux

# Install dependencies
pip install -r requirements.txt
```

### 2. Configure Environment

Create a `.env` file in the project root:

```env
# Database
DATABASE_URL="postgresql+asyncpg://postgres:YOUR_PASSWORD@localhost:5432/ecommerce"

# JWT
SECRET_KEY="your-secret-key-min-32-chars"
ALGORITHM="HS256"
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Razorpay (use mock_ prefix for development)
RAZORPAY_KEY_ID="mock_test_key"
RAZORPAY_KEY_SECRET="mock_test_secret"

# CORS
BACKEND_CORS_ORIGINS=["http://localhost:5173", "http://localhost:3000"]
```

> **💡 Tip:** Use `mock_` prefix for Razorpay keys during development. The app auto-detects this and uses a simulated payment dialog.

### 3. Setup Database

```bash
# Create the PostgreSQL database
createdb ecommerce

# Run migrations
alembic upgrade head

# (Optional) Seed with sample products
python seed_products.py
```

### 4. Start Backend Server

```bash
uvicorn app.main:app --reload
```

The API will be available at `http://127.0.0.1:8000`  
Interactive docs at `http://127.0.0.1:8000/docs`

### 5. Setup & Start Frontend

```bash
cd frontend
npm install
npm run dev
```

The app will be available at `http://localhost:5173`

---

## 📡 API Reference

All endpoints are prefixed with `/api/v1`

### 🔐 Authentication
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `POST` | `/auth/register` | Register new user | ❌ |
| `POST` | `/auth/login` | Login (returns JWT) | ❌ |

### 👤 Users
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/users/me` | Get current user profile | ✅ |

### 🛍️ Products
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/products/` | List all products | ❌ |
| `GET` | `/products/{id}` | Get product details | ❌ |
| `POST` | `/products/` | Create product (admin) | ✅ |
| `PUT` | `/products/{id}` | Update product (admin) | ✅ |
| `DELETE` | `/products/{id}` | Delete product (admin) | ✅ |

### 🛒 Cart
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/cart/` | Get user's cart | ✅ |
| `POST` | `/cart/items` | Add item to cart | ✅ |
| `PUT` | `/cart/items/{id}` | Update item quantity | ✅ |
| `DELETE` | `/cart/items/{id}` | Remove item from cart | ✅ |
| `DELETE` | `/cart/clear` | Clear entire cart | ✅ |

### 📦 Orders
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `POST` | `/orders/checkout` | Create order from cart | ✅ |
| `GET` | `/orders/` | List user's orders | ✅ |
| `GET` | `/orders/{id}` | Get order details | ✅ |

### 💳 Payments
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `POST` | `/payments/order/{id}` | Initiate payment | ✅ |
| `POST` | `/payments/verify` | Verify payment signature | ✅ |

### 📍 Addresses
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/address/` | List user addresses | ✅ |
| `POST` | `/address/` | Create address | ✅ |
| `PUT` | `/address/{id}` | Update address | ✅ |
| `DELETE` | `/address/{id}` | Delete address | ✅ |

### 🏷️ Offers & Shipping
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/offers/` | List active offers | ❌ |
| `POST` | `/shipping/calculate` | Calculate shipping cost | ✅ |

---

## 🖥️ Frontend Pages

| Page | Route | Description |
|------|-------|-------------|
| **Product List** | `/products` | Browse all products with categories |
| **Product Details** | `/products/:id` | Individual product view |
| **Login** | `/login` | User login form |
| **Register** | `/register` | New user registration |
| **Shopping Cart** | `/cart` | Cart with quantity controls & checkout |
| **Checkout** | `/checkout` | Order summary & payment initiation |
| **Payment Status** | `/payment/status` | Success/failure confirmation |
| **Order History** | `/orders` | All past orders with expandable details |
| **Order Confirmation** | `/order-confirmation` | Post-checkout confirmation |

---

## 🗄️ Database Models

```mermaid
erDiagram
    User ||--o{ Order : places
    User ||--o| Cart : has
    User ||--o{ Address : has
    Cart ||--o{ CartItem : contains
    CartItem }o--|| Product : references
    Product }o--|| Category : belongs_to
    Order ||--o{ OrderItem : contains
    OrderItem }o--|| Product : references
    Order ||--o| Payment : has
    Order ||--o| Shipment : has
    Order }o--o| Address : ships_to
    Order }o--o| Coupon : applies
```

| Model | Key Fields |
|-------|-----------|
| **User** | `id`, `email`, `full_name`, `hashed_password`, `is_active`, `is_superuser` |
| **Product** | `id`, `name`, `description`, `price`, `stock_quantity`, `image_url`, `category_id` |
| **Category** | `id`, `name`, `description` |
| **Cart** | `id`, `user_id` → CartItem (`product_id`, `quantity`) |
| **Order** | `id`, `user_id`, `total_amount`, `subtotal`, `status`, `coupon_code` |
| **OrderItem** | `id`, `order_id`, `product_id`, `quantity`, `price_at_purchase` |
| **Payment** | `id`, `order_id`, `amount`, `razorpay_order_id`, `payment_id`, `status` |
| **Address** | `id`, `user_id`, `street`, `city`, `state`, `zip_code`, `country` |
| **Shipment** | `id`, `order_id`, `tracking_number`, `status`, `carrier` |
| **Coupon** | `id`, `code`, `discount_percent`, `max_discount`, `valid_from`, `valid_until` |

---

## 💳 Payment Integration

The app supports two payment modes:

### Mock Mode (Development)
When `RAZORPAY_KEY_ID` starts with `mock_` or contains placeholder text, the app automatically enters mock mode:
- Backend generates a mock `razorpay_order_id`
- Frontend shows a **confirm dialog** to simulate payment
- Click **OK** to simulate success → redirects to success page
- Click **Cancel** to simulate failure

### Real Razorpay (Production)
Replace the `.env` keys with actual Razorpay test/live keys from [dashboard.razorpay.com](https://dashboard.razorpay.com):
- Opens the official Razorpay checkout popup
- Handles real payment verification with signature checks
- Automatically updates order status on success

---

## 📁 Project Structure

```
ecomrce/
├── app/
│   ├── api/
│   │   ├── deps.py                  # Auth dependencies (JWT validation)
│   │   └── v1/endpoints/
│   │       ├── auth.py              # Login & Register
│   │       ├── users.py             # User profile
│   │       ├── products.py          # Product CRUD
│   │       ├── cart.py              # Cart operations
│   │       ├── orders.py            # Checkout & order listing
│   │       ├── payments.py          # Payment initiation & verification
│   │       ├── address.py           # Address CRUD
│   │       ├── shipping.py          # Shipping calculation
│   │       └── offers.py            # Coupon & offers
│   ├── core/
│   │   ├── config.py                # Settings from .env
│   │   ├── database.py              # Async SQLAlchemy engine & session
│   │   └── security.py              # Password hashing & JWT creation
│   ├── models/                      # SQLAlchemy ORM models
│   │   ├── user.py, product.py, cart.py, order.py
│   │   ├── payment.py, address.py, coupon.py, shipment.py
│   ├── repositories/                # Data access layer
│   │   ├── user_repo.py, product_repo.py, cart_repo.py
│   │   ├── order_repo.py, payment_repo.py
│   ├── schemas/                     # Pydantic request/response schemas
│   │   ├── user.py, product.py, cart.py, order.py
│   │   ├── payment.py, shipment.py
│   ├── services/                    # Business logic layer
│   │   ├── order_service.py         # Checkout orchestration
│   │   ├── payment_service.py       # Razorpay / mock payment handling
│   │   └── shipping_service.py      # Shipping calculations
│   └── main.py                      # FastAPI app entry point
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx           # Navigation with cart badge
│   │   │   ├── Button.jsx           # Reusable button component
│   │   │   ├── PrivateRoute.jsx     # Auth-protected route wrapper
│   │   │   └── AuthModal.jsx        # Login prompt modal
│   │   ├── context/
│   │   │   ├── AuthContext.jsx      # Authentication state
│   │   │   └── CartContext.jsx      # Cart state management
│   │   ├── pages/
│   │   │   ├── ProductList.jsx      # Product catalog
│   │   │   ├── ProductDetails.jsx   # Single product view
│   │   │   ├── Cart.jsx             # Shopping cart
│   │   │   ├── CheckoutPage.jsx     # Payment initiation
│   │   │   ├── PaymentStatus.jsx    # Payment result
│   │   │   ├── OrderHistory.jsx     # Order history
│   │   │   ├── Login.jsx            # Login page
│   │   │   └── Register.jsx         # Registration page
│   │   ├── services/
│   │   │   └── api.js               # Axios API client
│   │   ├── App.jsx                  # Routes & layout
│   │   └── main.jsx                 # React entry point
│   └── package.json
│
├── alembic/                         # Database migrations
├── uploads/                         # Uploaded product images
├── requirements.txt                 # Python dependencies
├── .env                             # Environment config (git-ignored)
├── .gitignore
└── README.md
```

---



---

## 📝 Development Notes

- **Async Everything**: All database operations use SQLAlchemy's `AsyncSession` with `asyncpg` driver
- **Eager Loading**: Relationships use `selectinload` / `joinedload` to prevent `MissingGreenlet` errors in async context
- **Unit of Work**: Database operations use `flush()` + single `commit()` at the end of each request for transactional safety
- **Auto-reload**: Backend uses `uvicorn --reload` for hot-reloading during development
- **Mock Payments**: Auto-detected from key prefix — no code changes needed to switch between mock and real payments

---

## 📄 License

This project is for educational and portfolio purposes.

---

<p align="center">
  Built with ❤️ using FastAPI + React
</p>