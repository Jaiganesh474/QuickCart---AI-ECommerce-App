# QuickCart AI ECommerce App

## Overview
QuickCart is an AI-powered Full-Stack E-Commerce platform featuring Google Gemini AI for smart product recommendations and chatbot assistance, along with live order tracking and role-based access for Users, Admins, and Delivery Agents.

## Tech Stack
- **Frontend:** ReactJS, Vite, TailwindCSS (glassmorphism aesthetics)
- **Backend:** Java Spring Boot, MySQL, Spring Security (JWT)
- **AI Service:** Python, Flask, Google Generative AI (Gemini)
- **Payment Gateway:** Razorpay

## Project Architecture
- `frontend/` - React SPA with role-based routing
- `backend/` - Spring Boot REST APIs handling business logic
- `ai_service/` - Flask service bridging Gemini AI and backend
- `docs/` - Comprehensive documentation (DB schema, APIs, Setup)

## Key Features
- **AI Chatbot:** Integrated QuickCart AI using Gemini API
- **AI Recommendations:** Product suggestions based on browsing history
- **Live Order Tracking:** End-to-end package tracking
- **Invoice Generation:** Downloadable PDF invoices
- **Role Dashboards:**
  - *Customer:* Browse, Cart, Checkout, Chatbot, Tracking
  - *Admin:* Product, Orders, Users, Packages management
  - *Delivery Agent:* Assigned orders, live tracking updates

## Next Steps
Check the `docs/` folder for Database Schema, API endpoints, and Setup Instructions.
