# 🛒 E-Commerce Backend API

A robust, production-ready e-commerce backend built with **FastAPI**, **SQLAlchemy (Async)**, and **MSSQL**. This project demonstrates a scalable architecture with modular phases for Foundation, Ordering, Payments, and Logistics.

---

## 🚀 Tech Stack
- **Framework**: FastAPI
- **Database**: MSSQL (via `aioodbc` & `SQLAlchemy`)
- **Migrations**: Alembic
- **Authentication**: JWT & OAuth2
- **Payments**: Razorpay
- **Logistics**: Custom Shipping & Address Module

---

## 🛠️ Getting Started

### 1. Prerequisites
- Python 3.10+
- SQL Server (MSSQL)
- Razorpay Test Account

### 2. Installation
```bash
# Clone the repository
git clone <repo-url>
cd ecomrce

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

### 3. Configuration
Create a `.env` file in the root directory:
```ini
DATABASE_URL="mssql+aioodbc://user:password@server/db_name?driver=ODBC+Driver+17+for+SQL+Server"
SECRET_KEY="your_secret_key"
ALGORITHM="HS256"
ACCESS_TOKEN_EXPIRE_MINUTES=30
RAZORPAY_KEY_ID="your_razorpay_key_id"
RAZORPAY_KEY_SECRET="your_razorpay_secret"
```

### 4. Run the Server
```bash
uvicorn app.main:app --reload
```
Visit **[http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)** for the interactive Swagger UI.

---

## 📚 Project Phases

### 🏗️ Phase-1: Foundation & Basics
**Goal**: Build a solid backend foundation with Authentication and Product Catalog.

#### ✅ Features
- **Infrastructure**: Async Database, Dependency Injection, Modular Routers.
- **Authentication**: Secure JWT Login/Register, Password Hashing.
- **Catalog**: Product & Category management.

#### 🧪 Testing
1. **Register**: `POST /api/v1/auth/register`
2. **Login**: `POST /api/v1/auth/login` (Get Token)
3. **Products**: `GET /api/v1/products/products`

---

### 🛒 Phase-2: Ordering System
**Goal**: Enable users to add items to a cart and place orders.

#### ✅ Features
- **Shopping Cart**: Add/Remove items, view totals.
- **Order Processing**: Convert Cart to Order, Stock Deduction.
- **History**: View past orders.

#### 🧪 Testing
1. **Add to Cart**: `POST /api/v1/cart/items`
2. **Checkout**: `POST /api/v1/orders/checkout` (Creates PENDING order)
3. **View Orders**: `GET /api/v1/orders`

---

### 💳 Phase-3: Payments & Checkout
**Goal**: Securely accept payments via Razorpay.

#### ✅ Features
- **Integration**: Razorpay Order generation & Signature Verification.
- **Lifecycle**: `PENDING` → `CONFIRMED` upon success.
- **Security**: Server-side validation of payments.

#### 🧪 Testing
1. **Create Payment**: `POST /api/v1/payments/order/{order_id}`
2. **Verify Signature**: `POST /api/v1/payments/verify`
   ```json
   {
     "razorpay_payment_id": "pay_test_123",
     "razorpay_order_id": "order_rcptid_11",
     "razorpay_signature": "<hmac_sha256_hash>"
   }
   ```
   *(Outcome: Order Status -> CONFIRMED)*

---

### 🚚 Phase-4: Shipping & Offers
**Goal**: Logistics management and Promotional capability.

#### ✅ Features
- **Shipping**: Address Book, Shipping Cost Calculation, Shipment Tracking (Admin).
- **Offers**: Coupon Engine (Percent/Flat discount), Validation logic.
- **Enhanced Checkout**: Auto-apply shipping cost & discounts.

#### 🧪 Testing
1. **Address**: `POST /api/v1/address/`
2. **Coupon (Admin)**: `POST /api/v1/offers/` (`{"code": "SAVE10", ...}`)
3. **Smart Checkout**:
   ```bash
   POST /api/v1/orders/checkout
   {
       "shipping_address_id": 1,
       "coupon_code": "SAVE10"
   }
   ```
   *(Outcome: Total = Subtotal - 10% + Shipping)*
c
---

## 🧪 Verification Scripts
Run the automated verification scripts to test full flows:
```bash
python verify_phase4.py
```