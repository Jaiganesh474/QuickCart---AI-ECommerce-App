import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { Provider } from 'react-redux'
import { store } from './app/store'

// Global API interceptor for Mobile/Production support
const originalFetch = window.fetch;
window.fetch = function () {
    let [resource, config] = arguments;
    
    // Primary source: import.meta.env (injected at build time)
    // Secondary source: hardcoded fallback for mobile ease (Render.com URL)
    let API_BASE = import.meta.env.VITE_API_URL || 'https://quickcart-backend-8x2e.onrender.com';
    
    // Clean up API_BASE to avoid duplication
    API_BASE = API_BASE.replace(/\/api\/?$/, '').replace(/\/+$/, '');
    
    if (typeof resource === 'string' && (resource.startsWith('/api') || resource.startsWith('api/')) && API_BASE) {
        // Prepend the base URL but ensure it's absolute
        if (!resource.startsWith('http')) {
            const path = resource.startsWith('/') ? resource : `/${resource}`;
            resource = `${API_BASE}${path}`;
        }
    }
    
    return originalFetch(resource, config);
};

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <Provider store={store}>
            <App />
        </Provider>
    </React.StrictMode>,
)
