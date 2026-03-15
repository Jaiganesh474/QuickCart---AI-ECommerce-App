const config = {
    // Determine if we are running on a real device (Capacitor) or in a browser
    API_BASE_URL: import.meta.env.VITE_API_URL || 'https://quickcart-backend-8x2e.onrender.com/api',
    AI_SERVICE_URL: import.meta.env.VITE_AI_SERVICE_URL || 'https://quickcart-ai-ecommerce-app.onrender.com/api'
};

export default config;
