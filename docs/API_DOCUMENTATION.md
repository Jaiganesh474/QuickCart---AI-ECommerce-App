# REST API Documentation

## Auth Controller
- `POST /api/auth/register` - Create new user
- `POST /api/auth/login` - Authenticate and get JWT

## Product Controller
- `GET /api/products` - List all products
- `GET /api/products/{id}` - Get product details
- `POST /api/admin/products` - Admin: Add product
- `PUT /api/admin/products/{id}` - Admin: Update product
- `DELETE /api/admin/products/{id}` - Admin: Delete product

## Order Controller
- `POST /api/orders/create` - Initialize Razorpay order
- `POST /api/orders/verify` - Verify payment and place order
- `GET /api/orders/user` - Get user order history
- `GET /api/orders/{id}/tracking` - Get live tracking status

## Delivery Controller
- `GET /api/delivery/assigned` - Get agent assigned orders
- `PUT /api/delivery/update-status` - Update package location & status

## AI Controller (Spring Boot connects to Flask)
- `POST /api/ai/chatbot` - Ask QuickCart AI
- `POST /api/ai/recommendations` - Get product recommendations
