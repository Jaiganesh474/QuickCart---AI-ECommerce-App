# Setup and Deployment Instructions

## Prerequisites
- Java 17+
- Node.js 18+
- Python 3.9+
- MySQL 8.0+

## 1. Database Setup
1. Open MySQL and create database:
   ```sql
   CREATE DATABASE quickcart_db;
   ```
2. The Spring Boot backend will auto-generate the tables using Hibernate.

## 2. Spring Boot Backend
1. Go to `backend/`
2. Update `src/main/resources/application.properties` with your MySQL credentials, Razorpay Keys, and JWT Secret.
3. Run the application:
   ```bash
   mvnw spring-boot:run
   ```

## 3. Python AI Service
1. Go to `ai_service/`
2. Create virtual environment and install dependencies:
   ```bash
   python -m venv venv
   source venv/bin/activate  # (Windows: venv\Scripts\activate)
   pip install -r requirements.txt
   ```
3. Create a `.env` file and add your Google Gemini API Key:
   ```
   GEMINI_API_KEY=your_google_gemini_api_key_here
   ```
4. Run Flask app:
   ```bash
   python app.py
   ```

## 4. React Frontend
1. Go to `frontend/`
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run dev server:
   ```bash
   npm run dev
   ```

## Deployment Considerations
- **Backend:** Package JAR (`mvn package`) and deploy on AWS EC2 or Elastic Beanstalk.
- **Frontend:** Build static files (`npm run build`) and host on Vercel or AWS S3.
- **AI Service:** Deploy Flask app using Gunicorn on Render or Heroku.
- **Database:** Use AWS RDS for MySQL in production.
