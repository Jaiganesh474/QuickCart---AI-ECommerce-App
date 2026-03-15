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
    // Get the base URL and remove trailing slash or /api if it exists to avoid duplication
    let API_BASE = (import.meta.env.VITE_API_URL || '').replace(/\/api\/?$/, '').replace(/\/+$/, '');
    
    if (typeof resource === 'string' && resource.startsWith('/api') && API_BASE) {
        // Prepend the base URL but ensure it's absolute
        if (!resource.startsWith('http')) {
            resource = `${API_BASE}${resource}`;
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
