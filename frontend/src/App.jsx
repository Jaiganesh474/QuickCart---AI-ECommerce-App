import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { setUser, logout } from './features/user/userSlice';

// Components
import Navbar from './components/Navbar';
import BottomNavbar from './components/BottomNavbar';
import ChatbotButton from './components/ChatbotButton';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import BecomeSeller from './pages/BecomeSeller';
import AdminDashboard from './pages/AdminDashboard';
import Account from './pages/Account';
import ProductDisplay from './pages/ProductDisplay';
import Cart from './pages/Cart';
import CategoryPage from './pages/CategoryPage';
import Wishlist from './pages/Wishlist';
import Orders from './pages/Orders';
import Checkout from './pages/Checkout';
import OrderDetails from './pages/OrderDetails';
import OrderConfirmation from './pages/OrderConfirmation';
import Settings from './pages/Settings';
import SearchPage from './pages/SearchPage';
import DeliveryDashboard from './pages/DeliveryDashboard';
import BecomeAgent from './pages/BecomeAgent';
import Categories from './pages/Categories';

const App = () => {
    const dispatch = useDispatch();
    const { user, loading } = useSelector(state => state.user);

    useEffect(() => {
        const token = localStorage.getItem('quickcart_jwt');
        if (token) {
            try {
                const base64Url = token.split('.')[1];
                const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function (c) {
                    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
                }).join(''));
                const decoded = JSON.parse(jsonPayload);

                if (decoded.exp * 1000 > Date.now()) {
                    dispatch(setUser({ email: decoded.sub, role: decoded.role, name: decoded.name, mobileNumber: decoded.mobileNumber, token }));
                } else {
                    dispatch(logout());
                }
            } catch (error) {
                console.error("Invalid token:", error);
                dispatch(logout());
            }
        } else {
            dispatch(setUser(null));
        }
    }, [dispatch]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white p-6">
                <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="max-w-[300px] w-full flex flex-col items-center"
                >
                    <img 
                        src="/splash_screen.png" 
                        alt="QuickCart Loading" 
                        className="w-full h-auto object-contain"
                    />
                    <div className="mt-8 flex space-x-2">
                        <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                        <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                    </div>
                </motion.div>
            </div>
        );
    }

    return (
        <Router>
            <ScrollToTop />
            <div className="min-h-screen flex flex-col w-full bg-slate-50 relative font-sans">
                <Navbar />

                <main className="flex-1 w-full relative z-0 pb-16 md:pb-0">
                    <Routes>
                        {/* Public Routes */}
                        <Route path="/" element={<Home />} />
                        <Route path="/product/:id" element={<ProductDisplay />} />
                        <Route path="/category/:id" element={<CategoryPage />} />
                        <Route path="/categories" element={<Categories />} />
                        <Route path="/cart" element={<Cart />} />
                        <Route path="/wishlist" element={<Wishlist />} />

                        {/* Auth Routes */}
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/forgot-password" element={<ForgotPassword />} />

                        {/* Seller/Admin Routes */}
                        <Route path="/become-seller" element={<BecomeSeller />} />
                        <Route path="/become-agent" element={<BecomeAgent />} />
                        <Route path="/account" element={<Account />} />
                        <Route path="/orders" element={<Orders />} />
                        <Route path="/checkout" element={<Checkout />} />
                        <Route path="/orders/:id" element={<OrderDetails />} />
                        <Route path="/order-success" element={<OrderConfirmation />} />
                        <Route path="/settings" element={<Settings />} />
                        <Route path="/search" element={<SearchPage />} />
                        <Route
                            path="/admin"
                            element={user?.role === 'ADMIN' ? <AdminDashboard /> : <Navigate to="/become-seller" />}
                        />
                        <Route
                            path="/delivery"
                            element={user?.role === 'DELIVERY_AGENT' ? <DeliveryDashboard /> : <Navigate to="/" />}
                        />

                        {/* Fallback */}
                        <Route path="*" element={<Navigate to="/" />} />
                    </Routes>
                </main>

                <Footer />
                <BottomNavbar />
                <ChatbotButton />
            </div>
        </Router>
    );
};

export default App;
