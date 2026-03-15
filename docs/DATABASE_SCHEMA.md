# Database Schema

## Entity-Relationship

### Users
- id (BIGINT, PK)
- email (VARCHAR, Unique)
- password (VARCHAR)
- role (ENUM: USER, ADMIN, DELIVERY)
- created_at (TIMESTAMP)

### Products
- id (BIGINT, PK)
- name (VARCHAR)
- description (TEXT)
- price (DECIMAL)
- stock_quantity (INT)
- image_url (VARCHAR)
- category_id (BIGINT, FK)
- created_at (TIMESTAMP)

### Categories
- id (BIGINT, PK)
- name (VARCHAR)

### Orders
- id (BIGINT, PK)
- user_id (BIGINT, FK)
- total_amount (DECIMAL)
- status (ENUM: PLACED, CONFIRMED, PROCESSING, PACKED, SHIPPED, OUT_FOR_DELIVERY, DELIVERED)
- razorpay_order_id (VARCHAR)
- created_at (TIMESTAMP)

### Order Items
- id (BIGINT, PK)
- order_id (BIGINT, FK)
- product_id (BIGINT, FK)
- quantity (INT)
- price (DECIMAL)

### Packages & Order Tracking
- id (BIGINT, PK)
- order_id (BIGINT, FK)
- delivery_agent_id (BIGINT, FK)
- current_location (VARCHAR)
- estimated_delivery (TIMESTAMP)
- status (VARCHAR)

### Invoices
- id (BIGINT, PK)
- order_id (BIGINT, FK)
- invoice_url (VARCHAR)
- generated_at (TIMESTAMP)

### Reviews
- id (BIGINT, PK)
- product_id (BIGINT, FK)
- user_id (BIGINT, FK)
- rating (INT)
- comment (TEXT)
