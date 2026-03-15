const config = {
    // Determine if we are running on a real device (Capacitor) or in a browser
    API_BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:8080/api',
    AI_SERVICE_URL: import.meta.env.VITE_AI_SERVICE_URL || 'http://localhost:5000/api'
};

export default config;
