import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Mic, ShoppingCart, Bell, User, Settings, LogOut, Package, Shield, Menu, X, TrendingUp, Tags, ChevronRight, Heart, MapPin, Sparkles, History, Truck, UserCircle } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchAddresses } from '../features/address/addressSlice';
import { logout, setUser } from '../features/user/userSlice';
import { fetchNotifications, markAsRead } from '../features/notification/notificationSlice';
import LocationModal from './modals/LocationModal';

const Navbar = () => {
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
    const [showSwitchConfirm, setShowSwitchConfirm] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [isListening, setIsListening] = useState(false);
    const dropdownRef = useRef(null);
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const { user } = useSelector(state => state.user);
    const cartTotalQuantity = useSelector(state => state.cart.totalQuantity);
    const { selectedAddress } = useSelector(state => state.address);
    const notifications = useSelector(state => state.notifications);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [showLocationModal, setShowLocationModal] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const [showSearchDropdown, setShowSearchDropdown] = useState(false);
    const [recentlyViewed, setRecentlyViewed] = useState([]);
    const [searchHistory, setSearchHistory] = useState([]);
    const [mlRecommendations, setMlRecommendations] = useState([]);
    const notificationRef = useRef(null);
    const searchRef = useRef(null);
    const [categories, setCategories] = useState([]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);

        // Fetch categories for sidebar
        fetch('/api/categories').then(res => res.json()).then(data => {
            if (Array.isArray(data)) setCategories(data);
        }).catch(err => console.error(err));

        if (user) {
            dispatch(fetchAddresses());
            dispatch(fetchNotifications());
        }

        const handleNotifClickOutside = (event) => {
            if (notificationRef.current && !notificationRef.current.contains(event.target)) {
                setShowNotifications(false);
            }
        };
        document.addEventListener("mousedown", handleNotifClickOutside);

        const handleSearchClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setShowSearchDropdown(false);
            }
        };
        document.addEventListener("mousedown", handleSearchClickOutside);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            document.removeEventListener("mousedown", handleNotifClickOutside);
            document.removeEventListener("mousedown", handleSearchClickOutside);
        };
    }, [user, dispatch]);

    useEffect(() => {
        if (showSearchDropdown) {
            const viewed = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
            const searches = JSON.parse(localStorage.getItem('searchHistory') || '[]');
            setRecentlyViewed(viewed);
            setSearchHistory(searches);

            if (viewed.length > 0 || searches.length > 0) {
                fetch('/api/recommend', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        history: viewed.map(v => v.name),
                        searches: searches
                    })
                })
                .then(res => res.json())
                .then(data => {
                    if (data.status === 'success') {
                        setMlRecommendations(data.recommendations);
                    }
                })
                .catch(err => console.error("ML Service error:", err));
            }
        }
    }, [showSearchDropdown]);

    const applyPriceFilter = (min, max) => {
        navigate(`/search?q=&minPrice=${min}&maxPrice=${max}`);
        setIsSidebarOpen(false);
    };

    const handleVoiceSearch = () => {
        if (!('webkitSpeechRecognition' in window)) {
            alert("Speech recognition not supported in your browser.");
            return;
        }
        const recognition = new window.webkitSpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        recognition.onstart = () => setIsListening(true);
        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            setSearchQuery(transcript);
        };
        recognition.onerror = () => setIsListening(false);
        recognition.onend = () => {
            setIsListening(false);
        };
        recognition.start();
    };

    const formatNotificationTime = (timestamp) => {
        if (!timestamp) return '';
        const date = new Date(timestamp);
        const now = new Date();
        const diffInDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
        
        if (diffInDays < 1 && date.getDate() === now.getDate()) {
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
        } else {
            return date.toLocaleDateString([], { day: 'numeric', month: 'short' });
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            // Save to history
            const history = JSON.parse(localStorage.getItem('searchHistory') || '[]');
            const updated = [searchQuery.trim(), ...history.filter(s => s !== searchQuery.trim())].slice(0, 10);
            localStorage.setItem('searchHistory', JSON.stringify(updated));
            
            navigate('/search?q=' + encodeURIComponent(searchQuery));
            setShowSearchDropdown(false);
        }
    };

    const removeSearchHistory = (term) => {
        const updated = searchHistory.filter(s => s !== term);
        setSearchHistory(updated);
        localStorage.setItem('searchHistory', JSON.stringify(updated));
    };

    const handleLogout = () => {
        dispatch(logout());
        navigate('/login');
    };

    const handleSwitchToCustomer = async () => {
        if (user.role === 'ADMIN') {
            alert("Administrators cannot switch to customer accounts for security reasons.");
            return;
        }

        try {
            const response = await fetch('/api/auth/switch-to-customer', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: user.email })
            });
            const data = await response.json();
            if (response.ok) {
                const updatedUser = { ...user, role: 'USER' };
                dispatch(setUser(updatedUser));
                localStorage.setItem('quickcart_jwt', data.token);
                setDropdownOpen(false);
                setShowSwitchConfirm(false);
                navigate('/');
            } else {
                alert(data.message || "Failed to switch account role");
            }
        } catch (error) {
            console.error("Error switching role:", error);
            alert("An error occurred while switching account role");
        }
    };

    return (
        <nav className="bg-slate-800 md:bg-slate-800 border-b border-slate-800 md:border-slate-800 sticky top-0 z-50 safe-area-top mobile-header-spacing shadow-sm">
            <div className="max-w-[1500px] mx-auto px-2 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center min-h-[64px] h-auto py-2 sm:py-0">
                    {/* Left & Logo */}
                    <div className="flex items-center shrink-0">
                        <button onClick={() => setIsSidebarOpen(true)} className="p-1.5 mr-2 sm:mr-3 text-slate-800 md:text-white hover:bg-slate-100 md:hover:bg-slate-800 rounded-lg transition-colors group flex flex-col items-center">
                            <Menu className="w-6 h-6 group-hover:text-orange-400" />
                            <span className="text-[10px] md:text-[12px] font-extrabold uppercase mt-0.5">All</span>
                        </button>
                        <Link to="/" className="flex items-center ml-0 sm:ml-2">
                            <img
                                src="/logocroppedquick.png"
                                alt="QuickCart Logo"
                                className="h-6 sm:h-10 w-auto object-contain transition-transform hover:scale-105"
                            />
                        </Link>

                        {/* Deliver to Section */}
                        <button
                            onClick={() => user ? setShowLocationModal(true) : navigate('/login')}
                            className="hidden md:flex flex-col items-start ml-4 px-2 py-1 border border-transparent hover:border-white rounded-sm transition-all text-white group"
                        >
                            <span className="text-[13px] text-slate-300 ml-5 leading-tight">Deliver to</span>
                            <div className="flex items-center">
                                <MapPin className="w-5 h-5 mr-1 text-slate-100" />
                                <span className="text-base font-bold truncate max-w-[150px]">
                                    {selectedAddress ? `${selectedAddress.city} ${selectedAddress.zipCode}` : 'Select Location'}
                                </span>
                            </div>
                        </button>
                    </div>

                    <div className="flex-1 max-w-3xl px-0.5 sm:px-4 relative" ref={searchRef}>
                        <form onSubmit={handleSearch} className="flex">
                            <div className={`flex w-full rounded-md overflow-hidden bg-white ${showSearchDropdown ? 'ring-1 ring-orange-500 shadow-lg' : ''}`}>
                                <input
                                    type="text"
                                    placeholder="Search..."
                                    className="w-full px-1.5 sm:px-4 text-[11px] sm:text-sm py-1 sm:py-2 text-slate-900 focus:outline-none"
                                    value={searchQuery}
                                    onFocus={() => setShowSearchDropdown(true)}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                                    {searchQuery && (
                                        <button
                                            type="button"
                                            onClick={() => setSearchQuery('')}
                                            className="px-1 text-slate-400 hover:text-slate-600 bg-white"
                                        >
                                            <X className="w-3.5 h-3.5" />
                                        </button>
                                    )}
                                    <button
                                        type="button"
                                        onClick={handleVoiceSearch}
                                        className="px-1.5 sm:px-3 text-slate-500 hover:text-blue-500 bg-white border-l border-slate-100"
                                    >
                                        <Mic className={`w-3.5 h-3.5 sm:w-5 sm:h-5 ${isListening ? 'text-red-500 animate-pulse' : ''}`} />
                                    </button>
                                <button type="submit" className="px-1.5 sm:px-4 bg-orange-400 hover:bg-orange-500 transition-colors text-slate-900">
                                    <Search className="w-4 h-4 sm:w-5 sm:h-5 font-bold" />
                                </button>
                            </div>
                        </form>

                        {/* Search Dropdown */}
                        <AnimatePresence>
                            {showSearchDropdown && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                                    transition={{ duration: 0.15 }}
                                    className="absolute top-12 left-4 right-4 bg-white rounded-b-xl shadow-2xl border border-slate-200 z-[100] max-h-[85vh] overflow-y-auto"
                                >
                                    {/* Keep Shopping For */}
                                    {recentlyViewed.length > 0 && (
                                        <div className="px-4 py-5 border-b border-slate-100">
                                            <h4 className="text-[14px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center justify-between">
                                                <span>Keep Shopping For</span>
                                                <Link 
                                                    to="/account" 
                                                    onClick={() => setShowSearchDropdown(false)}
                                                    className="text-[10px] text-blue-600 normal-case font-bold hover:underline"
                                                >
                                                    View History
                                                </Link>
                                            </h4>
                                            <div className="flex gap-3 overflow-x-auto pb-2 hide-scrollbar">
                                                {recentlyViewed.map(item => (
                                                    <div 
                                                        key={item.id} 
                                                        onClick={() => { navigate(`/product/${item.id}`); setShowSearchDropdown(false); }}
                                                        className="flex-shrink-0 w-32 group cursor-pointer"
                                                    >
                                                        <div className="w-full aspect-square bg-slate-50 rounded-xl p-3 border border-slate-100 group-hover:border-orange-200 group-hover:bg-white transition-all shadow-sm">
                                                            <img src={item.imageUrl} alt={item.name} className="w-full h-full object-contain mix-blend-multiply" />
                                                        </div>
                                                        <p className="text-[11px] font-bold text-slate-900 mt-2 line-clamp-1 group-hover:text-orange-500">{item.name}</p>
                                                        <p className="text-[10px] text-slate-500 font-medium">Recently viewed</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Relatable Recommendations (ML Part) */}
                                    {mlRecommendations.length > 0 && (
                                        <div className="px-4 py-5 bg-slate-50/50">
                                            <h4 className="text-[12px] font-black text-slate-900 border-l-4 border-orange-500 pl-3 uppercase tracking-widest mb-4">Relatable suggestions</h4>
                                            <div className="flex flex-wrap gap-2">
                                                {mlRecommendations.map((rec, idx) => (
                                                    <button
                                                        key={idx}
                                                        onClick={() => { setSearchQuery(rec); navigate('/search?q=' + encodeURIComponent(rec)); setShowSearchDropdown(false); }}
                                                        className="px-4 py-2 bg-white border border-slate-200 rounded-full text-[12px] font-bold text-slate-700 hover:border-orange-500 hover:text-orange-600 transition shadow-sm flex items-center gap-2"
                                                    >
                                                        <Sparkles className="w-3 h-3 text-orange-400" /> {rec}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Recent Search History */}
                                    {searchHistory.length > 0 && (
                                        <div className="px-1 py-4">
                                            {searchHistory.map((term, idx) => (
                                                <div 
                                                    key={idx}
                                                    className="px-4 py-2 flex items-center justify-between hover:bg-slate-50 group cursor-pointer"
                                                >
                                                    <div 
                                                        className="flex items-center gap-4 flex-1"
                                                        onClick={() => { setSearchQuery(term); navigate('/search?q=' + encodeURIComponent(term)); setShowSearchDropdown(false); }}
                                                    >
                                                        <History className="w-4 h-4 text-slate-400 group-hover:text-blue-500" />
                                                        <span className="text-sm font-bold text-slate-700 group-hover:text-slate-900">{term}</span>
                                                    </div>
                                                    <button 
                                                        onClick={(e) => { e.stopPropagation(); removeSearchHistory(term); }}
                                                        className="p-2 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition"
                                                    >
                                                        <X size={14} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {!recentlyViewed.length && !searchHistory.length && (
                                        <div className="p-10 text-center">
                                            <Search className="w-10 h-10 text-slate-100 mx-auto mb-4" />
                                            <p className="text-slate-400 font-bold text-sm">Discover your next favorite thing</p>
                                        </div>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Right actions */}
                    <div className="flex items-center space-x-2 sm:space-x-6 shrink-0">
                        {/* Notifications */}
                        <div className="relative" ref={notificationRef}>
                            <button 
                                onClick={() => setShowNotifications(!showNotifications)}
                                className="text-white hover:text-orange-400 transition relative p-1"
                            >
                                <Bell className="w-6 h-6 text-slate-800 md:text-white" />
                                {notifications.items.filter(n => !n.read).length > 0 && (
                                    <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                                        {notifications.items.filter(n => !n.read).length}
                                    </span>
                                )}
                            </button>

                            <AnimatePresence>
                                {showNotifications && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 10 }}
                                        className="absolute right-0 mt-4 w-80 bg-white rounded-xl shadow-2xl py-2 z-50 border border-slate-200 overflow-hidden"
                                    >
                                        <div className="px-4 py-3 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                                            <h3 className="font-bold text-slate-900">Notifications</h3>
                                            <span className="text-xs text-slate-500">{notifications.items.length} total</span>
                                        </div>
                                        <div className="max-h-96 overflow-y-auto">
                                            {notifications.items.length === 0 ? (
                                                <div className="p-8 text-center">
                                                    <Bell className="w-8 h-8 text-slate-200 mx-auto mb-2" />
                                                    <p className="text-sm text-slate-500">No notifications yet</p>
                                                </div>
                                            ) : (
                                                notifications.items.map(n => (
                                                    <div 
                                                        key={n.id} 
                                                        onClick={() => {
                                                            if (!n.read) dispatch(markAsRead(n.id));
                                                            if (user.role === 'ADMIN') {
                                                                let url = '/admin?tab=orders';
                                                                if (n.type === 'CANCEL_REQUEST') url += '&filter=REQUESTS';
                                                                navigate(url);
                                                            } else {
                                                                navigate('/orders');
                                                            }
                                                            setShowNotifications(false);
                                                        }}
                                                        className={`px-4 py-3 border-b border-slate-50 hover:bg-slate-50 cursor-pointer transition-colors ${!n.read ? 'bg-blue-50/50' : ''}`}
                                                    >
                                                        <div className="flex gap-3">
                                                            <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${!n.read ? 'bg-blue-500' : 'bg-transparent'}`} />
                                                             <div>
                                                                <p className="text-sm text-slate-800 leading-snug">{n.message}</p>
                                                                <div className="flex items-center gap-2 mt-1">
                                                                    <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">{n.type.replace('_', ' ')}</p>
                                                                    <span className="text-slate-300">|</span>
                                                                    <p className="text-[10px] text-slate-400 font-bold">{formatNotificationTime(n.createdAt)}</p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Cart - Hidden on mobile, moved to BottomNavbar */}
                        <Link to="/cart" className="hidden md:flex items-center text-white hover:text-orange-400 transition relative p-1 group">
                            <ShoppingCart className="w-6 h-6" />
                            <span className="absolute top-0 right-0 w-4 h-4 bg-orange-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">{cartTotalQuantity}</span>
                            <span className="font-bold ml-2 text-sm group-hover:text-orange-400">Cart</span>
                        </Link>

                        {/* User Profile */}
                        <div className="relative" ref={dropdownRef}>
                            {user ? (
                                <button
                                    onClick={() => setDropdownOpen(!dropdownOpen)}
                                    className="flex items-center gap-1 text-white hover:text-orange-400 transition"
                                >
                                    <User className="w-6 h-6 text-slate-800 md:text-white md:hidden" />
                                    <div className="hidden md:flex flex-col items-start translate-y-0.5">
                                        <span className="text-xs text-slate-300 leading-tight">Hello, {user.name ? user.name.split(' ')[0] : 'User'}</span>
                                        <span className="font-bold text-sm flex items-center leading-tight">
                                            Account & Lists
                                            <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </span>
                                    </div>
                                </button>
                            ) : (
                                <Link to="/login" className="flex items-center text-white hover:text-orange-400 transition">
                                    <User className="w-6 h-6 text-slate-800 md:text-white md:hidden" />
                                    <div className="hidden md:flex flex-col items-start">
                                        <span className="text-xs text-slate-300">Hello, sign in</span>
                                        <span className="font-bold text-sm">Account & Lists</span>
                                    </div>
                                </Link>
                            )}
                            <AnimatePresence>
                                {dropdownOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                        transition={{ duration: 0.2 }}
                                        className="absolute right-0 mt-4 w-56 bg-white dark:bg-slate-800 rounded-md shadow-xl py-1 z-50 border border-slate-200 dark:border-slate-700"
                                    >
                                        <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700">
                                            <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{user.email}</p>
                                        </div>
                                        {/* Dropdown items... same as before */}
                                        <Link to="/orders" className="flex items-center px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700" onClick={() => setDropdownOpen(false)}>
                                            <Package className="w-4 h-4 mr-2" />
                                            Your Orders
                                        </Link>
                                        <Link to="/account" className="flex items-center px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700" onClick={() => setDropdownOpen(false)}>
                                            <User className="w-4 h-4 mr-2" />
                                            Your Account
                                        </Link>
                                        <Link to="/wishlist" className="flex items-center px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700" onClick={() => setDropdownOpen(false)}>
                                            <Heart className="w-4 h-4 mr-2" />
                                            Your Wishlist
                                        </Link>
                                        {user && user.role === 'ADMIN' && (
                                            <Link to="/admin" className="flex items-center px-4 py-2 text-sm text-orange-600 hover:bg-orange-50 dark:hover:bg-slate-700" onClick={() => setDropdownOpen(false)}>
                                                <Shield className="w-4 h-4 mr-2" />
                                                Admin Dashboard
                                            </Link>
                                        )}
                                        {user && user.role === 'DELIVERY_AGENT' && (
                                            <Link to="/delivery" className="flex items-center px-4 py-2 text-sm text-green-600 hover:bg-green-50 dark:hover:bg-slate-700" onClick={() => setDropdownOpen(false)}>
                                                <Truck className="w-4 h-4 mr-2" />
                                                Delivery Hub
                                            </Link>
                                        )}
                                        {user && user.role === 'USER' && (
                                            <>
                                                <Link to="/become-seller" className="flex items-center px-4 py-2 text-sm text-orange-600 hover:bg-orange-50 dark:hover:bg-slate-700" onClick={() => setDropdownOpen(false)}>
                                                    <Shield className="w-4 h-4 mr-2" />
                                                    Become Seller
                                                </Link>
                                                <Link to="/become-agent" className="flex items-center px-4 py-2 text-sm text-green-600 hover:bg-green-50 dark:hover:bg-slate-700" onClick={() => setDropdownOpen(false)}>
                                                    <Truck className="w-4 h-4 mr-2" />
                                                    Become Quicker Agent
                                                </Link>
                                            </>
                                        )}
                                        <Link to="/settings" className="flex items-center px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700" onClick={() => setDropdownOpen(false)}>
                                            <Settings className="w-4 h-4 mr-2" />
                                            Settings
                                        </Link>
                                         {user && user.role === 'DELIVERY_AGENT' && (
                                            <button
                                                onClick={() => {
                                                    setDropdownOpen(false);
                                                    setShowSwitchConfirm(true);
                                                }}
                                                className="flex w-full items-center px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                                            >
                                                <UserCircle className="w-4 h-4 mr-2" />
                                                Switch to Customer
                                            </button>
                                        )}
                                        <button
                                            onClick={() => {
                                                setDropdownOpen(false);
                                                setShowLogoutConfirm(true);
                                            }}
                                            className="flex w-full items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-slate-700"
                                        >
                                            <LogOut className="w-4 h-4 mr-2" />
                                            Logout
                                        </button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </div>

            {/* Logout Confirmation Modal */}
            <AnimatePresence>
                {showLogoutConfirm && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-sm border border-slate-200"
                        >
                            <h3 className="text-xl font-bold text-slate-900 mb-2">Confirm Logout</h3>
                            <p className="text-slate-600 mb-6">Are you sure you want to sign out of your account?</p>

                            <div className="flex space-x-3">
                                <button
                                    onClick={() => setShowLogoutConfirm(false)}
                                    className="flex-1 py-2 px-4 bg-slate-100 hover:bg-slate-200 text-slate-900 rounded-lg font-medium transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => {
                                        setShowLogoutConfirm(false);
                                        handleLogout();
                                    }}
                                    className="flex-1 py-2 px-4 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors shadow-md shadow-red-500/20"
                                >
                                    Log Out
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Role Switch Confirmation Modal */}
            <AnimatePresence>
                {showSwitchConfirm && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white rounded-lg shadow-2xl p-6 w-full max-w-md border border-slate-200 dark:border-slate-700"
                        >
                            <h3 className="text-xl font-bold text-slate-900 mb-2">Switch to Customer Account?</h3>
                            <p className="text-sm text-slate-600 dark:text-slate-900 mb-6 leading-relaxed">
                                Are you sure you want to switch back to a standard customer account? This will restrict your access to the delivery agent features.
                            </p>

                            <div className="flex justify-end gap-3">
                                <button
                                    onClick={() => setShowSwitchConfirm(false)}
                                    className="px-4 py-2 bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 text-slate-700 dark:text-white border border-slate-300 dark:border-slate-600 rounded-md text-sm font-medium transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSwitchToCustomer}
                                    className="px-4 py-2 bg-[#f0c14b] hover:bg-[#f4d078] text-[#111] border border-[#a88734] rounded-md text-sm font-medium shadow-sm transition-colors"
                                >
                                    Confirm Switch
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Sidebar Overlay */}
            <AnimatePresence>
                {isSidebarOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsSidebarOpen(false)}
                            className="fixed inset-0 bg-black/60 z-[90] backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ x: '-100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '-100%' }}
                            transition={{ type: "spring", bounce: 0, duration: 0.4 }}
                            className="fixed top-0 left-0 h-[100dvh] w-[300px] sm:w-[350px] bg-white z-[100] shadow-2xl overflow-y-auto"
                        >
                            <div className="bg-slate-900 text-white p-6 flex justify-between items-center sticky top-0 z-10 shadow-md sidebar-header">
                                <div className="flex items-center gap-3">
                                    <User className="w-8 h-8 p-1.5 bg-white/10 rounded-full" />
                                    <span className="font-bold text-lg">Hello, {user ? (user.name ? user.name.split(' ')[0] : 'User') : 'Sign in'}</span>
                                </div>
                                <button onClick={() => setIsSidebarOpen(false)} className="p-1.5 hover:bg-white/10 rounded-full transition-colors">
                                    <X className="w-6 h-6 text-white" />
                                </button>
                            </div>

                            <div className="py-2">
                                {/* Trending section */}
                                <div className="px-6 py-4 border-b border-slate-100">
                                    <h3 className="text-lg font-bold text-slate-800 mb-3 flex items-center gap-2">
                                        <TrendingUp className="w-5 h-5 text-orange-500" />
                                        Trending Deals
                                    </h3>
                                    <div className="space-y-2">
                                        <button onClick={() => { navigate('/'); setIsSidebarOpen(false); }} className="w-full text-left text-slate-600 hover:text-orange-600 py-1.5 font-medium transition-colors">Best Sellers</button>
                                        <button onClick={() => { navigate('/'); setIsSidebarOpen(false); }} className="w-full text-left text-slate-600 hover:text-orange-600 py-1.5 font-medium transition-colors">New Releases</button>
                                        <button onClick={() => { navigate('/'); setIsSidebarOpen(false); }} className="w-full text-left text-slate-600 hover:text-orange-600 py-1.5 font-medium transition-colors">Movers and Shakers</button>
                                    </div>
                                </div>

                                {/* Wishlist / Lists section */}
                                <div className="px-6 py-4 border-b border-slate-100">
                                    <h3 className="text-lg font-bold text-slate-800 mb-3 flex items-center gap-2">
                                        <Heart className="w-5 h-5 text-red-500" />
                                        Your Lists
                                    </h3>
                                    <div className="space-y-2">
                                        <button onClick={() => { navigate('/wishlist'); setIsSidebarOpen(false); }} className="w-full text-left text-slate-600 hover:text-orange-600 py-1.5 font-medium transition-colors">Your Wishlist</button>
                                    </div>
                                </div>

                                {/* Shop By Category */}
                                <div className="px-6 py-4 border-b border-slate-100">
                                    <h3 className="text-lg font-bold text-slate-800 mb-3 flex items-center gap-2">
                                        <Tags className="w-5 h-5 text-blue-500" />
                                        Shop By Category
                                    </h3>
                                    <div className="space-y-1">
                                        {categories.length > 0 ? categories.map(cat => (
                                            <button key={cat.id} onClick={() => { navigate(`/category/${cat.id}`); setIsSidebarOpen(false); }} className="w-full flex justify-between items-center text-slate-600 hover:text-orange-600 hover:bg-orange-50 p-2 -ml-2 rounded-lg transition-colors group">
                                                <span className="font-medium">{cat.name}</span>
                                                <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-orange-500" />
                                            </button>
                                        )) : (
                                            <p className="text-sm text-slate-400 p-2">Loading categories...</p>
                                        )}
                                    </div>
                                </div>

                                {/* Price Filter */}
                                <div className="px-6 py-4 pb-20">
                                    <h3 className="text-lg font-bold text-slate-800 mb-3 flex items-center gap-2">
                                        Filter by Price
                                    </h3>
                                    <div className="space-y-2">
                                        <button onClick={() => applyPriceFilter(0, 500)} className="w-full text-left text-slate-600 hover:text-orange-600 py-1.5 font-medium transition-colors">Under ₹500</button>
                                        <button onClick={() => applyPriceFilter(500, 1000)} className="w-full text-left text-slate-600 hover:text-orange-600 py-1.5 font-medium transition-colors">₹500 - ₹1000</button>
                                        <button onClick={() => applyPriceFilter(1000, 5000)} className="w-full text-left text-slate-600 hover:text-orange-600 py-1.5 font-medium transition-colors">₹1000 - ₹5000</button>
                                        <button onClick={() => applyPriceFilter(5000, 999999)} className="w-full text-left text-slate-600 hover:text-orange-600 py-1.5 font-medium transition-colors">Over ₹5000</button>
                                    </div>
                                    <div className="mt-4 flex items-center gap-2">
                                        <input type="number" id="minPrice" placeholder="Min ₹" className="w-full p-2 border border-slate-300 rounded-lg text-sm text-slate-900 outline-none focus:border-orange-500 font-medium" />
                                        <span className="text-slate-400">-</span>
                                        <input type="number" id="maxPrice" placeholder="Max ₹" className="w-full p-2 border border-slate-300 rounded-lg text-sm text-slate-900 outline-none focus:border-orange-500 font-medium" />
                                    </div>
                                    <button onClick={() => {
                                        const min = document.getElementById('minPrice').value;
                                        const max = document.getElementById('maxPrice').value;
                                        applyPriceFilter(min || 0, max || 999999);
                                    }} className="w-full mt-4 bg-orange-500 text-white py-2.5 rounded-lg font-bold hover:bg-orange-600 shadow-md shadow-orange-500/20 transition-all active:scale-95">
                                        Apply Filter
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {showLocationModal && (
                    <LocationModal
                        isOpen={showLocationModal}
                        onClose={() => setShowLocationModal(false)}
                        user={user}
                    />
                )}
            </AnimatePresence>
        </nav>
    );
};

export default Navbar;
