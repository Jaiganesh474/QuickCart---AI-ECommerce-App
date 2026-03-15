/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['"Segoe UI"', 'Roboto', 'Helvetica', 'Arial', 'sans-serif'],
            },
            colors: {
                primary: {
                    DEFAULT: '#3b82f6', // blue-500
                    hover: '#2563eb',   // blue-600
                },
                secondary: {
                    DEFAULT: '#64748b', // slate-500
                    hover: '#475569',   // slate-600
                },
                background: '#0f172a', // slate-900 (dark mode)
                surface: '#1e293b',   // slate-800
            }
        },
    },
    darkMode: 'class', // Enable dark mode by default via class strategy
    plugins: [
        require('tailwindcss-animate')
    ],
}
