import { User, Mail, Shield, Package, Settings, MapPin, CreditCard, Clock, Heart, ChevronLeft } from 'lucide-react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useSelector, useDispatch } from 'react-redux';
import { setUser } from '../features/user/userSlice';
import Addresses from '../components/account/Addresses';
import { useState } from 'react';

const Account = () => {
    const { user } = useSelector(state => state.user);
    const notifications = useSelector(state => state.notifications);
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();
    const activeTab = searchParams.get('tab') || 'dashboard';
    const [showSwitchConfirm, setShowSwitchConfirm] = useState(false);
    const dispatch = useDispatch();

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

    const setTab = (tab) => {
        setSearchParams({ tab });
    };

    const handleSwitchToCustomer = async () => {
        try {
            const response = await fetch('/api/auth/switch-to-customer', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: user.email })
            });
            const data = await response.json();
            if (data.success) {
                const updatedUser = { ...user, role: 'USER' };
                dispatch(setUser(updatedUser));
                localStorage.setItem('quickcart_jwt', data.token);
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
    if (!user) {
        return (
            <div className="min-h-[70vh] flex flex-col items-center justify-center p-4 bg-slate-50">
                <User className="w-16 h-16 text-slate-400 mb-4" />
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Not Signed In</h2>
                <p className="text-slate-600 mb-6 border-b border-transparent">Please log in to view your account details.</p>
                <Link to="/login" className="px-6 py-2 bg-yellow-400 hover:bg-yellow-500 rounded-lg font-medium text-slate-900 transition-colors shadow-sm">
                    Sign in to your account
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 bg-slate-50">
            <div className="mb-8 flex items-center gap-4">
                {activeTab !== 'dashboard' && (
                    <button
                        onClick={() => setTab('dashboard')}
                        className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-600"
                    >
                        <ChevronLeft size={24} />
                    </button>
                )}
                <h1 className="text-3xl font-extrabold text-slate-900">
                    {activeTab === 'dashboard' ? 'Your Account' : 'Manage Addresses'}
                </h1>
            </div>

            {activeTab === 'dashboard' ? (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        {/* Profile Summary Card */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="col-span-1 md:col-span-3 bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex flex-col md:flex-row items-center md:items-start gap-6"
                        >
                            <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shrink-0 shadow-md">
                                <span className="text-white text-3xl font-bold">
                                    {user.name ? user.name.charAt(0).toUpperCase() : user.email?.charAt(0).toUpperCase()}
                                </span>
                            </div>
                            <div className="flex-1 text-center md:text-left">
                                <h2 className="text-2xl font-bold text-slate-900 mb-2">
                                    {user.name || "Customer"}
                                </h2>
                                <div className="flex flex-col md:flex-row gap-2 md:gap-6 text-slate-500">
                                    <span className="flex items-center justify-center md:justify-start gap-2">
                                        <Mail className="w-4 h-4" /> {user.email}
                                    </span>
                                    <span className="flex items-center justify-center md:justify-start gap-2">
                                        <Shield className="w-4 h-4 text-orange-500" />
                                        <span className="font-medium text-slate-700">Role: {user.role}</span>
                                    </span>
                                </div>
                            </div>
                            <div className="shrink-0 flex flex-col gap-2">
                                {user.role !== 'ADMIN' && user.role !== 'DELIVERY_AGENT' && (
                                    <Link to="/become-seller" className="inline-flex items-center px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-900 rounded-lg transition-colors font-medium border border-slate-200">
                                        <Shield className="w-4 h-4 mr-2 text-orange-500" /> Become a Seller
                                    </Link>
                                )}
                                 {user.role === 'DELIVERY_AGENT' && (
                                    <button 
                                        onClick={() => setShowSwitchConfirm(true)}
                                        className="inline-flex items-center px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition-colors font-medium border border-blue-200"
                                    >
                                        <User className="w-4 h-4 mr-2" /> Switch to Customer Account
                                    </button>
                                )}
                            </div>
                        </motion.div>

                        {/* Dashboard Options */}

                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}>
                            <Link to="/orders" className="block p-6 bg-white rounded-2xl border border-slate-200 hover:shadow-md hover:border-blue-300 transition-all h-full group">
                                <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                    <Package className="w-6 h-6 text-blue-600" />
                                </div>
                                <h3 className="text-lg font-bold text-slate-900 mb-1">Your Orders</h3>
                                <p className="text-sm text-slate-500">Track, return, or buy things again</p>
                            </Link>
                        </motion.div>

                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }}>
                            <Link to="/wishlist" className="block p-6 bg-white rounded-2xl border border-slate-200 hover:shadow-md hover:border-red-300 transition-all h-full group">
                                <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                    <Heart className="w-6 h-6 text-red-600" />
                                </div>
                                <h3 className="text-lg font-bold text-slate-900 mb-1">Your Wishlist</h3>
                                <p className="text-sm text-slate-500">View and manage items you've saved</p>
                            </Link>
                        </motion.div>

                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4 }}>
                            <button onClick={() => setTab('addresses')} className="w-full text-left block p-6 bg-white rounded-2xl border border-slate-200 hover:shadow-md hover:border-orange-300 transition-all h-full group">
                                <div className="w-12 h-12 bg-orange-50 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                    <MapPin className="w-6 h-6 text-orange-600" />
                                </div>
                                <h3 className="text-lg font-bold text-slate-900 mb-1">Your Addresses</h3>
                                <p className="text-sm text-slate-500">Edit addresses for orders</p>
                            </button>
                        </motion.div>

                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.5 }}>
                            <Link to="/settings" className="block p-6 bg-white rounded-2xl border border-slate-200 hover:shadow-md hover:border-slate-300 transition-all h-full group">
                                <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                    <Settings className="w-6 h-6 text-slate-600" />
                                </div>
                                <h3 className="text-lg font-bold text-slate-900 mb-1">Account Settings</h3>
                                <p className="text-sm text-slate-500">Manage your profile and security</p>
                            </Link>
                        </motion.div>

                    </div>

                    <div className="bg-white rounded-2xl p-6 border border-slate-200">
                        <h3 className="text-lg font-bold text-slate-900 mb-4 border-b border-slate-100 pb-3 flex items-center gap-2">
                            <Clock className="w-5 h-5 text-slate-400" />
                            Recent Activity
                        </h3>
                            <div className="space-y-4">
                                {notifications.items.length === 0 ? (
                                    <div className="text-center py-8">
                                        <p className="text-slate-500">No recent activity to show.</p>
                                    </div>
                                ) : (
                                    notifications.items.slice(0, 5).map(n => (
                                        <div key={n.id} className="flex items-start gap-4 p-3 hover:bg-slate-50 rounded-xl transition-colors cursor-default">
                                            <div className={`w-2 h-2 rounded-full mt-2 shrink-0 ${!n.read ? 'bg-blue-500' : 'bg-slate-200'}`} />
                                            <div className="flex-1">
                                                <p className="text-sm text-slate-800 leading-snug">{n.message}</p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="text-[10px] text-slate-400 uppercase font-black tracking-widest">{n.type.replace('_', ' ')}</span>
                                                    <span className="text-slate-200 text-[10px]">|</span>
                                                    <span className="text-[10px] text-slate-400 font-bold">{formatNotificationTime(n.createdAt)}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                    </div>
                </>
            ) : (activeTab === 'addresses' && <Addresses />)}
            {/* Role Switch Confirmation Modal */}
            <AnimatePresence>
                {showSwitchConfirm && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white rounded-lg shadow-2xl p-6 w-full max-w-md border border-slate-200"
                        >
                            <h3 className="text-xl font-bold text-slate-900 mb-2">Switch to Customer Account?</h3>
                            <p className="text-sm text-slate-600 mb-6 leading-relaxed font-medium">
                                Are you sure you want to switch back to a standard customer account? This will restrict your access to the delivery management tools.
                            </p>

                            <div className="flex justify-end gap-3">
                                <button
                                    onClick={() => setShowSwitchConfirm(false)}
                                    className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-md text-sm font-medium transition-colors"
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
        </div>
    );
};

export default Account;
