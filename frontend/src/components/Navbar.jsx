import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Mic, ShoppingCart, Bell, User, Settings, LogOut, Package, Shield, Menu, X, TrendingUp, Tags, ChevronRight, Heart, MapPin, Sparkles, History, Truck, UserCircle, ChevronDown, BadgeHelp } from 'lucide-react';
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
    const desktopDropdownRef = useRef(null);
    const mobileDropdownRef = useRef(null);
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
            if (desktopDropdownRef.current && !desktopDropdownRef.current.contains(event.target) &&
                mobileDropdownRef.current && !mobileDropdownRef.current.contains(event.target)) {
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

    const renderCommonDesktopActions = () => (
        <>
            {/* Notifications */}
            <div className="relative" ref={notificationRef}>
                <button 
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="text-white hover:text-orange-400 transition relative p-1"
                >
                    <Bell className="w-6 h-6 text-white" />
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
                            className="absolute right-0 mt-4 w-80 bg-white rounded-lg shadow-2xl py-2 z-50 border border-slate-200 overflow-hidden text-slate-900"
                        >
                            <div className="px-4 py-3 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                                <h3 className="font-bold">Notifications</h3>
                                <span className="text-xs text-slate-500">{notifications.items.length} total</span>
                            </div>
                            <div className="max-h-96 overflow-y-auto">
                                {notifications.items.length === 0 ? (
                                    <div className="p-8 text-center text-slate-400">
                                        <Bell className="w-8 h-8 mx-auto mb-2 opacity-20" />
                                        <p className="text-sm">No notifications yet</p>
                                    </div>
                                ) : (
                                    notifications.items.map(n => (
                                        <div 
                                            key={n.id} 
                                            onClick={() => {
                                                if (!n.read) dispatch(markAsRead(n.id));
                                                navigate(user.role === 'ADMIN' ? '/admin?tab=orders' : '/orders');
                                                setShowNotifications(false);
                                            }}
                                            className={`px-4 py-3 border-b border-slate-50 hover:bg-slate-50 cursor-pointer transition-colors ${!n.read ? 'bg-blue-50/50' : ''}`}
                                        >
                                            <p className="text-sm text-slate-800 leading-snug">{n.message}</p>
                                            <p className="text-[10px] text-slate-400 mt-1 uppercase font-bold tracking-wider">{n.type.replace('_', ' ')}</p>
                                        </div>
                                    ))
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Cart */}
            <Link to="/cart" className="flex items-center text-white hover:text-orange-400 transition relative p-1 group">
                <ShoppingCart className="w-6 h-6" />
                <span className="absolute top-0 right-0 w-4 h-4 bg-orange-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">{cartTotalQuantity}</span>
                <span className="font-bold ml-2 text-sm group-hover:text-orange-400">Cart</span>
            </Link>

            {/* User Profile */}
            <div className="relative" ref={desktopDropdownRef}>
                {user ? (
                    <button
                        onClick={() => setDropdownOpen(!dropdownOpen)}
                        className="flex items-center gap-1 text-white hover:text-orange-400 transition"
                    >
                        <User className="w-6 h-6" />
                        <div className="hidden md:flex flex-col items-start translate-y-0.5">
                            <span className="text-xs text-slate-300 leading-tight truncate max-w-[100px]">Hello, {user.name ? user.name.split(' ')[0] : 'User'}</span>
                            <span className="font-bold text-sm flex items-center leading-tight">
                                Account
                                <ChevronDown className="w-4 h-4 ml-0.5" />
                            </span>
                        </div>
                    </button>
                ) : (
                    <Link to="/login" className="flex items-center text-white hover:text-orange-400 transition gap-2">
                        <User className="w-6 h-6" />
                        <div className="hidden md:flex flex-col items-start">
                            <span className="text-xs text-slate-300 leading-tight">Hello, Sign in</span>
                            <span className="font-bold text-sm leading-tight">Account</span>
                        </div>
                    </Link>
                )}

                <AnimatePresence>
                    {dropdownOpen && (
                        <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            className="absolute right-0 md:right-0 mt-4 w-56 bg-white rounded-lg shadow-2xl py-2 z-50 border border-slate-200 overflow-hidden text-slate-800"
                        >
                            <div className="px-4 py-3 border-b border-slate-100 bg-slate-50">
                                <p className="text-sm font-bold truncate">{user?.email}</p>
                            </div>
                            <div className="py-1">
                                <Link to="/orders" onClick={() => setDropdownOpen(false)} className="flex items-center px-4 py-2.5 text-sm hover:bg-slate-50 transition-colors">
                                    <Package className="w-4 h-4 mr-3 text-slate-400" /> Your Orders
                                </Link>
                                <Link to="/account" onClick={() => setDropdownOpen(false)} className="flex items-center px-4 py-2.5 text-sm hover:bg-slate-50 transition-colors">
                                    <UserCircle className="w-4 h-4 mr-3 text-slate-400" /> Your Profile
                                </Link>
                                <Link to="/wishlist" onClick={() => setDropdownOpen(false)} className="flex items-center px-4 py-2.5 text-sm hover:bg-slate-50 transition-colors">
                                    <Heart className="w-4 h-4 mr-3 text-slate-400" /> Your Wishlist
                                </Link>
                                <Link to="/settings" onClick={() => setDropdownOpen(false)} className="flex items-center px-4 py-2.5 text-sm hover:bg-slate-50 transition-colors">
                                    <Settings className="w-4 h-4 mr-3 text-slate-400" /> Settings
                                </Link>

                                {user?.role === 'USER' && (
                                    <>
                                        <Link to="/become-seller" onClick={() => setDropdownOpen(false)} className="flex items-center px-4 py-2.5 text-sm font-bold text-orange-600 hover:bg-orange-50 transition-colors">
                                            <Truck className="w-4 h-4 mr-3" /> Become a Seller
                                        </Link>
                                        <Link to="/become-agent" onClick={() => setDropdownOpen(false)} className="flex items-center px-4 py-2.5 text-sm font-bold text-blue-600 hover:bg-blue-50 transition-colors border-b border-slate-50">
                                            <BadgeHelp className="w-4 h-4 mr-3" /> Become an Agent
                                        </Link>
                                    </>
                                )}

                                {user?.role === 'DELIVERY_AGENT' && (
                                    <Link to="/delivery" onClick={() => setDropdownOpen(false)} className="flex items-center px-4 py-2.5 text-sm font-bold text-green-600 hover:bg-green-50 transition-colors border-b border-slate-50">
                                        <Truck className="w-4 h-4 mr-3" /> Delivery Hub
                                    </Link>
                                )}

                                {user?.role === 'ADMIN' && (
                                    <Link to="/admin" onClick={() => setDropdownOpen(false)} className="flex items-center px-4 py-2.5 text-sm text-blue-600 font-bold hover:bg-blue-50 transition-colors border-b border-slate-50">
                                        <Shield className="w-4 h-4 mr-3" /> Admin Panel
                                    </Link>
                                )}

                                <button
                                    onClick={() => { setShowLogoutConfirm(true); setDropdownOpen(false); }}
                                    className="flex w-full items-center px-4 py-2.5 text-sm text-red-600 font-bold hover:bg-red-50 transition-colors text-left"
                                >
                                    <LogOut className="w-4 h-4 mr-3" /> Sign Out
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </>
    );

    return (
        <nav className="bg-slate-800 border-b border-slate-900 sticky top-0 z-50 safe-area-top mobile-header-spacing shadow-sm">
            <div className="max-w-[1500px] mx-auto px-2 sm:px-6 lg:px-8">
                {/* Desktop Layout */}
                <div className="hidden md:flex justify-between items-center min-h-[64px] py-0">
                    <div className="flex items-center shrink-0">
                        <button onClick={() => setIsSidebarOpen(true)} className="p-1.5 mr-3 text-white hover:bg-slate-800 rounded-lg transition-colors group flex flex-col items-center">
                            <Menu className="w-6 h-6 group-hover:text-orange-400" />
                            <span className="text-[12px] font-extrabold uppercase mt-0.5">All</span>
                        </button>
                        <Link to="/" className="flex items-center ml-2">
                            <img src="/logocroppedquick-bg.png" alt="Logo" className="h-12 w-auto object-contain transition-transform hover:scale-105" />
                        </Link>
                        <button onClick={() => user ? setShowLocationModal(true) : navigate('/login')} className="ml-6 flex flex-col items-start px-2 py-1 border border-transparent hover:border-white transition-all text-white group">
                            <span className="text-[13px] text-slate-300 ml-5 leading-tight">Deliver to</span>
                            <div className="flex items-center">
                                <MapPin className="w-5 h-5 mr-1 text-slate-100" />
                                <span className="text-base font-bold truncate max-w-[150px]">{selectedAddress?.city || 'Select Location'}</span>
                            </div>
                        </button>
                    </div>

                    <div className="flex-1 max-w-2xl px-4 relative" ref={searchRef}>
                        <form onSubmit={handleSearch} className="flex">
                            <div className={`flex w-full rounded-md overflow-hidden bg-white ${showSearchDropdown ? 'ring-2 ring-orange-500 shadow-lg' : ''}`}>
                                <input
                                    type="text"
                                    placeholder="Search QuickCart.in"
                                    className="w-full px-4 text-sm py-2 text-slate-900 focus:outline-none"
                                    value={searchQuery}
                                    onFocus={() => setShowSearchDropdown(true)}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                                <button type="submit" className="px-5 bg-orange-400 hover:bg-orange-500 transition-colors text-slate-900">
                                    <Search className="w-5 h-5 font-bold" />
                                </button>
                            </div>
                        </form>
                    </div>

                    <div className="flex items-center space-x-6 shrink-0">
                        {renderCommonDesktopActions()}
                    </div>
                </div>

                {/* Mobile Layout */}
                <div className="md:hidden flex flex-col pt-1">
                    <div className="flex justify-between items-center min-h-[50px] relative">
                        <button onClick={() => setIsSidebarOpen(true)} className="p-2 text-white flex flex-col items-center">
                            <Menu className="w-6 h-6" />
                            <span className="text-[10px] font-extrabold uppercase mt-0.5">All</span>
                        </button>

                        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                            <Link to="/">
                                <img src="/logocroppedquick-bg.png" alt="Logo" className="h-10 w-auto object-contain" />
                            </Link>
                        </div>

                        <div className="flex items-center space-x-1">
                            <button onClick={() => setShowNotifications(!showNotifications)} className="p-2 text-white relative">
                                <Bell className="w-6 h-6" />
                                {notifications.items.filter(n => !n.read).length > 0 && (
                                    <span className="absolute top-2 right-2 w-3.5 h-3.5 bg-red-500 text-[9px] text-white font-bold rounded-full flex items-center justify-center">
                                        {notifications.items.filter(n => !n.read).length}
                                    </span>
                                )}
                            </button>
                            <Link to="/cart" className="p-2 text-white relative">
                                <ShoppingCart className="w-6 h-6" />
                                <span className="absolute top-2 right-2 w-3.5 h-3.5 bg-orange-500 text-[9px] text-white font-bold rounded-full flex items-center justify-center">
                                    {cartTotalQuantity}
                                </span>
                            </Link>

                            <div className="relative" ref={mobileDropdownRef}>
                                <button onClick={() => user ? setDropdownOpen(!dropdownOpen) : navigate('/login')} className="p-2 text-white">
                                    <User className="w-6 h-6" />
                                </button>
                                
                                {dropdownOpen && (
                                    <div className="md:hidden">
                                        <AnimatePresence>
                                            <motion.div
                                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                                className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-2xl py-2 z-[200] border border-slate-200 overflow-hidden text-slate-800"
                                            >
                                                <div className="px-4 py-3 border-b border-slate-100 bg-slate-50">
                                                    <p className="text-sm font-bold truncate">{user?.email}</p>
                                                </div>
                                                <div className="py-1">
                                                    <Link to="/orders" onClick={() => setDropdownOpen(false)} className="flex items-center px-4 py-2.5 text-sm hover:bg-slate-50 transition-colors">
                                                        <Package className="w-4 h-4 mr-3 text-slate-400" /> Your Orders
                                                    </Link>
                                                    <Link to="/account" onClick={() => setDropdownOpen(false)} className="flex items-center px-4 py-2.5 text-sm hover:bg-slate-50 transition-colors">
                                                        <UserCircle className="w-4 h-4 mr-3 text-slate-400" /> Your Profile
                                                    </Link>
                                                    <Link to="/wishlist" onClick={() => setDropdownOpen(false)} className="flex items-center px-4 py-2.5 text-sm hover:bg-slate-50 transition-colors">
                                                        <Heart className="w-4 h-4 mr-3 text-slate-400" /> Your Wishlist
                                                    </Link>
                                                    <Link to="/settings" onClick={() => setDropdownOpen(false)} className="flex items-center px-4 py-2.5 text-sm hover:bg-slate-50 transition-colors">
                                                        <Settings className="w-4 h-4 mr-3 text-slate-400" /> Settings
                                                    </Link>

                                                    {user?.role === 'USER' && (
                                                        <>
                                                            <Link to="/become-seller" onClick={() => setDropdownOpen(false)} className="flex items-center px-4 py-2.5 text-sm font-bold text-orange-600 hover:bg-orange-50 transition-colors">
                                                                <Truck className="w-4 h-4 mr-3" /> Become a Seller
                                                            </Link>
                                                            <Link to="/become-agent" onClick={() => setDropdownOpen(false)} className="flex items-center px-4 py-2.5 text-sm font-bold text-blue-600 hover:bg-blue-50 transition-colors border-b border-slate-50">
                                                                <BadgeHelp className="w-4 h-4 mr-3" /> Become an Agent
                                                            </Link>
                                                        </>
                                                    )}

                                                    {user?.role === 'DELIVERY_AGENT' && (
                                                        <Link to="/delivery" onClick={() => setDropdownOpen(false)} className="flex items-center px-4 py-2.5 text-sm font-bold text-green-600 hover:bg-green-50 transition-colors border-b border-slate-50">
                                                            <Truck className="w-4 h-4 mr-3" /> Delivery Hub
                                                        </Link>
                                                    )}

                                                    {user?.role === 'ADMIN' && (
                                                        <Link to="/admin" onClick={() => setDropdownOpen(false)} className="flex items-center px-4 py-2.5 text-sm text-blue-600 font-bold hover:bg-blue-50 transition-colors border-b border-slate-50">
                                                            <Shield className="w-4 h-4 mr-3" /> Admin Panel
                                                        </Link>
                                                    )}

                                                    <button
                                                        onClick={() => { setShowLogoutConfirm(true); setDropdownOpen(false); }}
                                                        className="flex w-full items-center px-4 py-2.5 text-sm text-red-600 font-bold hover:bg-red-50 transition-colors text-left"
                                                    >
                                                        <LogOut className="w-4 h-4 mr-3" /> Sign Out
                                                    </button>
                                                </div>
                                            </motion.div>
                                        </AnimatePresence>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="pb-3 px-1 mt-1" ref={searchRef}>
                        <form onSubmit={handleSearch} className="flex">
                            <div className={`flex w-full rounded-lg overflow-hidden bg-white shadow-sm ring-1 ring-slate-200 ${showSearchDropdown ? 'ring-1 ring-orange-500' : ''}`}>
                                <div className="pl-3 flex items-center text-slate-400"><Search className="w-4 h-4" /></div>
                                <input
                                    type="text"
                                    placeholder="Search QuickCart.in"
                                    className="w-full px-2 text-[15px] py-1.5 text-slate-900 focus:outline-none"
                                    value={searchQuery}
                                    onFocus={() => setShowSearchDropdown(true)}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                                <button type="button" onClick={handleVoiceSearch} className="px-3 text-slate-500 border-l border-slate-50">
                                    <Mic className={`w-5 h-5 ${isListening ? 'text-red-500' : ''}`} />
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                {/* Common Search Dropdown overlay */}
                <AnimatePresence>
                    {showSearchDropdown && (
                        <motion.div
                            initial={{ opacity: 0, y: -5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -5 }}
                            className="absolute top-auto left-4 right-4 bg-white rounded-xl shadow-2xl border border-slate-200 z-[100] max-h-[80vh] overflow-y-auto mt-1"
                        >
                            <div className="p-4">
                                {searchHistory.length > 0 ? (
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Recent Searches</p>
                                        {searchHistory.map((term, i) => (
                                            <div key={i} className="flex items-center justify-between py-2 hover:bg-slate-50 cursor-pointer" onClick={() => { setSearchQuery(term); navigate(`/search?q=${term}`); setShowSearchDropdown(false); }}>
                                                <div className="flex items-center gap-3 text-slate-600"><History size={16} /> <span className="text-sm font-bold">{term}</span></div>
                                                <X size={14} className="text-slate-300 hover:text-red-500" onClick={(e) => { e.stopPropagation(); removeSearchHistory(term); }} />
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="py-10 text-center text-slate-300">
                                        <Search className="w-10 h-10 mx-auto mb-2 opacity-10" />
                                        <p className="text-sm font-bold">Try searching for "iPhone" or "Electronics"</p>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Global Modals */}
            <AnimatePresence>
                {showLogoutConfirm && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                        <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="bg-white rounded-2xl p-6 w-full max-w-xs shadow-2xl">
                            <h3 className="text-lg font-bold mb-2">Sign Out?</h3>
                            <p className="text-sm text-slate-500 mb-6">Are you sure you want to sign out of your account?</p>
                            <div className="flex gap-3">
                                <button onClick={() => setShowLogoutConfirm(false)} className="flex-1 py-2 font-bold text-slate-600 hover:bg-slate-50 rounded-lg">Cancel</button>
                                <button onClick={() => handleLogout()} className="flex-1 py-2 font-bold bg-red-600 text-white rounded-lg shadow-lg shadow-red-500/30">Sign Out</button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {isSidebarOpen && (
                    <>
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsSidebarOpen(false)} className="fixed inset-0 bg-black/60 z-[150]" />
                        <motion.div initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }} transition={{ bounce: 0 }} className="fixed top-0 left-0 h-full w-[320px] bg-white z-[200] shadow-2xl overflow-y-auto">
                            <div className="bg-slate-900 text-white p-6 flex justify-between items-center sidebar-header sticky top-0">
                                <div className="flex items-center gap-3">
                                    <User className="w-6 h-6" />
                                    <span className="font-bold">Hello, {user?.name || 'Sign in'}</span>
                                </div>
                                <button onClick={() => setIsSidebarOpen(false)}><X className="w-6 h-6" /></button>
                            </div>
                             <div className="p-4 space-y-6">
                                <div className="border-b pb-4">
                                    <h4 className="font-black text-[11px] text-slate-400 uppercase tracking-widest mb-3">Highlights</h4>
                                    <button onClick={() => { navigate('/search?q=trending'); setIsSidebarOpen(false); }} className="w-full text-left py-2.5 px-3 rounded-lg text-sm font-bold text-slate-700 hover:bg-orange-50 hover:text-orange-500 transition-all flex items-center gap-3">
                                        <TrendingUp className="w-5 h-5 text-orange-500" /> Trending Deals
                                    </button>
                                    <button onClick={() => { navigate('/search?q=best%20sellers'); setIsSidebarOpen(false); }} className="w-full text-left py-2.5 px-3 rounded-lg text-sm font-bold text-slate-700 hover:bg-orange-50 hover:text-orange-500 transition-all flex items-center gap-3">
                                        <Sparkles className="w-5 h-5 text-orange-500" /> Bestsellers
                                    </button>
                                </div>
                                <div className="border-b pb-4">
                                    <h4 className="font-black text-[11px] text-slate-400 uppercase tracking-widest mb-3">Shop By Category</h4>
                                    {categories.map(cat => (
                                        <button key={cat.id} onClick={() => { navigate(`/category/${cat.id}`); setIsSidebarOpen(false); }} className="w-full text-left py-2 text-sm font-bold text-slate-700 hover:text-orange-500 flex justify-between">
                                            {cat.name} <ChevronRight size={16} />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {showLocationModal && <LocationModal isOpen={showLocationModal} onClose={() => setShowLocationModal(false)} user={user} />}
        </nav>
    );
};

export default Navbar;
