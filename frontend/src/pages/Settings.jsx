import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { 
    Shield, 
    Key, 
    UserX, 
    ChevronRight, 
    User, 
    Mail, 
    Smartphone, 
    Lock,
    AlertTriangle,
    CheckCircle2,
    ArrowLeft
} from 'lucide-react';
import { logout, updateUserProfile } from '../features/user/userSlice';

const Settings = () => {
    const { user } = useSelector(state => state.user);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [activeSection, setActiveSection] = useState('menu'); // 'menu', 'password', 'deactivate', 'profile'
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
    const [profileData, setProfileData] = useState({ 
        name: user?.name || '',
        mobileNumber: user?.mobileNumber || ''
    });

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const token = localStorage.getItem('quickcart_jwt');
            const res = await fetch('/api/users/profile', {
                method: 'PUT',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(profileData)
            });
            const data = await res.json();
            if (res.ok) {
                dispatch(updateUserProfile(profileData));
                setMessage({ type: 'success', text: data.message });
                setTimeout(() => setActiveSection('menu'), 1500);
            } else {
                setMessage({ type: 'error', text: data.message || "Failed to update profile" });
            }
        } catch (e) {
            setMessage({ type: 'error', text: "Connection error: Could not reach server" });
        } finally {
            setIsLoading(false);
        }
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setMessage({ type: 'error', text: "Passwords do not match" });
            return;
        }
        setIsLoading(true);
        try {
            const token = localStorage.getItem('quickcart_jwt');
            const res = await fetch('/api/users/change-password', {
                method: 'PUT',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    currentPassword: passwordData.currentPassword,
                    newPassword: passwordData.newPassword
                })
            });
            const data = await res.json();
            if (res.ok) {
                setMessage({ type: 'success', text: data.message });
                setActiveSection('menu');
                setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
            } else {
                setMessage({ type: 'error', text: data.message });
            }
        } catch (e) {
            setMessage({ type: 'error', text: "Failed to change password" });
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeactivate = async () => {
        if (!window.confirm("Are you sure you want to deactivate your account? This action cannot be undone easily.")) return;
        setIsLoading(true);
        try {
            const token = localStorage.getItem('quickcart_jwt');
            const res = await fetch('/api/users/deactivate', {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                dispatch(logout());
                navigate('/login');
            } else {
                const data = await res.json();
                setMessage({ type: 'error', text: data.message });
            }
        } catch (e) {
            setMessage({ type: 'error', text: "Failed to deactivate account" });
        } finally {
            setIsLoading(false);
        }
    };

    if (!user) {
        return (
            <div className="min-h-[70vh] flex flex-col items-center justify-center p-4">
                <Shield className="w-16 h-16 text-slate-300 mb-4" />
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Login Required</h2>
                <p className="text-slate-500 mb-6">You must be logged in to access security settings.</p>
                <Link to="/login" className="px-8 py-3 bg-orange-500 text-white rounded-full font-bold shadow-lg shadow-orange-500/30">Sign In</Link>
            </div>
        );
    }

    return (
        <div className="bg-slate-50 min-h-screen pt-4 pb-12">
            <div className="max-w-4xl mx-auto px-4 sm:px-6">
                
                {/* Breadcrumbs - Amazon Style */}
                <div className="flex items-center gap-2 text-sm text-slate-500 mb-6 px-1">
                    <Link to="/account" className="hover:text-orange-600 hover:underline">Your Account</Link>
                    <ChevronRight size={14} />
                    <span className="text-orange-700 font-medium">Settings</span>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    
                    {/* Header */}
                    <div className="p-6 sm:p-8 border-b border-slate-200">
                        <div className="flex items-center gap-4">
                            {activeSection !== 'menu' && (
                                <button 
                                    onClick={() => { setActiveSection('menu'); setMessage({ type: '', text: '' }); }}
                                    className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                                >
                                    <ArrowLeft size={20} className="text-slate-600" />
                                </button>
                            )}
                            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
                                {activeSection === 'menu' && 'Login & Security'}
                                {activeSection === 'profile' && 'Edit Profile'}
                                {activeSection === 'password' && 'Change Password'}
                                {activeSection === 'deactivate' && 'Delete Account'}
                            </h1>
                        </div>
                    </div>

                    <AnimatePresence mode="wait">
                        {message.text && (
                            <motion.div 
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                className={`px-8 py-4 ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'} border-b border-slate-100 flex items-center gap-3 font-medium`}
                            >
                                {message.type === 'success' ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
                                {message.text}
                            </motion.div>
                        )}

                        {activeSection === 'menu' && (
                            <motion.div
                                key="menu"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                className="divide-y divide-slate-100"
                            >
                                {/* Name Section */}
                                <div className="p-6 sm:p-8 flex items-center justify-between group hover:bg-slate-50/50 transition-colors">
                                    <div className="flex-1">
                                        <h3 className="font-bold text-slate-900">Name:</h3>
                                        <p className="text-slate-600 font-medium">{user.name || 'Not set'}</p>
                                    </div>
                                    <button 
                                        onClick={() => setActiveSection('profile')}
                                        className="px-6 py-2 bg-white border border-slate-300 rounded-lg text-sm font-bold text-slate-700 hover:bg-slate-50 shadow-sm"
                                    >
                                        Edit
                                    </button>
                                </div>

                                {/* Mobile Section */}
                                <div className="p-6 sm:p-8 flex items-center justify-between group hover:bg-slate-50/50 transition-colors">
                                    <div className="flex-1">
                                        <h3 className="font-bold text-slate-900">Mobile Number:</h3>
                                        <p className="text-slate-600 font-medium">{user.mobileNumber ? user.mobileNumber : 'Add a 10-digit mobile number'}</p>
                                    </div>
                                    <button 
                                        onClick={() => setActiveSection('profile')}
                                        className="px-6 py-2 bg-white border border-slate-300 rounded-lg text-sm font-bold text-slate-700 hover:bg-slate-50 shadow-sm"
                                    >
                                        {user.mobileNumber ? 'Edit' : 'Add'}
                                    </button>
                                </div>

                                {/* Email Section */}
                                <div className="p-6 sm:p-8 flex items-center justify-between opacity-80">
                                    <div className="flex-1">
                                        <h3 className="font-bold text-slate-900">Email:</h3>
                                        <p className="text-slate-600">{user.email}</p>
                                    </div>
                                    <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded">Primary</span>
                                </div>

                                {/* Password Section */}
                                <div className="p-6 sm:p-8 flex items-center justify-between group hover:bg-slate-50/50 transition-colors">
                                    <div className="flex-1">
                                        <h3 className="font-bold text-slate-900">Password:</h3>
                                        <p className="text-slate-600">********</p>
                                    </div>
                                    <button 
                                        onClick={() => setActiveSection('password')}
                                        className="px-6 py-2 bg-white border border-slate-300 rounded-lg text-sm font-bold text-slate-700 hover:bg-slate-50 shadow-sm"
                                    >
                                        Edit
                                    </button>
                                </div>

                                {/* Delete Section */}
                                <div className="p-6 sm:p-8 flex items-center justify-between group hover:bg-red-50/30 transition-colors">
                                    <div className="flex-1">
                                        <h3 className="font-bold text-red-600">Account Deletion:</h3>
                                        <p className="text-slate-500 text-sm">Permanently remove your account and all data</p>
                                    </div>
                                    <button 
                                        onClick={() => setActiveSection('deactivate')}
                                        className="px-6 py-2 bg-red-50 border border-red-200 rounded-lg text-sm font-bold text-red-600 hover:bg-red-100 transition-colors"
                                    >
                                        Delete My Account
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {activeSection === 'profile' && (
                            <motion.div
                                key="profile"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="p-8 max-w-md"
                            >
                                <form onSubmit={handleProfileUpdate} className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-900 mb-2">Full Name</label>
                                        <input 
                                            type="text" 
                                            required
                                            className="w-full px-4 py-3 border border-slate-300 rounded-lg outline-none text-slate-900 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition-all font-medium"
                                            value={profileData.name}
                                            onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-900 mb-2">Mobile Number (10 digits)</label>
                                        <div className="relative">
                                            <input 
                                                type="tel" 
                                                pattern="[0-9]{10}"
                                                placeholder="Enter 10-digit number"
                                                className="w-full px-4 py-3 border border-slate-300 rounded-lg outline-none text-slate-900 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition-all font-medium"
                                                value={profileData.mobileNumber}
                                                onChange={(e) => setProfileData({ ...profileData, mobileNumber: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                                            />
                                        </div>
                                        <p className="mt-2 text-xs text-slate-500">Used for SMS OTPs and delivery status updates.</p>
                                    </div>
                                    <button 
                                        type="submit"
                                        disabled={isLoading}
                                        className="w-full py-3 bg-yellow-400 hover:bg-yellow-500 rounded-full font-bold text-slate-900 shadow-md transition-all active:scale-95 disabled:opacity-50"
                                    >
                                        {isLoading ? 'Saving...' : 'Save Changes'}
                                    </button>
                                </form>
                            </motion.div>
                        )}

                        {activeSection === 'password' && (
                            <motion.div
                                key="password"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="p-8 max-w-md"
                            >
                                <form onSubmit={handlePasswordChange} className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-900 mb-2">Current Password</label>
                                        <input 
                                            type="password" 
                                            required
                                            className="w-full px-4 py-2 border border-slate-300 text-slate-900 rounded-lg outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition-all"
                                            value={passwordData.currentPassword}
                                            onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-900 mb-2">New Password</label>
                                        <input 
                                            type="password" 
                                            required
                                            className="w-full px-4 py-2 border border-slate-300 text-slate-900 rounded-lg outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition-all"
                                            value={passwordData.newPassword}
                                            onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-900 mb-2">Confirm New Password</label>
                                        <input 
                                            type="password" 
                                            required
                                            className="w-full px-4 py-2 border border-slate-300 text-slate-900 rounded-lg outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition-all"
                                            value={passwordData.confirmPassword}
                                            onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                        />
                                    </div>
                                    <button 
                                        type="submit"
                                        disabled={isLoading}
                                        className="w-full py-3 bg-yellow-400 hover:bg-yellow-500 rounded-full font-bold text-slate-900 shadow-md transition-all active:scale-95 disabled:opacity-50"
                                    >
                                        {isLoading ? 'Updating Password...' : 'Save Changes'}
                                    </button>
                                </form>
                            </motion.div>
                        )}

                        {activeSection === 'deactivate' && (
                            <motion.div
                                key="deactivate"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="p-8 max-w-lg"
                            >
                                <div className="bg-red-50 border border-red-100 rounded-2xl p-6 mb-8 text-center text-red-800">
                                    <AlertTriangle size={48} className="mx-auto mb-4 text-red-500" />
                                    <h3 className="text-xl font-black mb-2 uppercase tracking-tight">Warning: Deleting Account</h3>
                                    <p className="text-sm font-medium leading-relaxed">
                                        You are about to PERMANENTLY DELETE your account. This will remove your order history, wishlist, and saved addresses. THIS ACTION CANNOT BE UNDONE.
                                    </p>
                                </div>
                                <button 
                                    onClick={handleDeactivate}
                                    disabled={isLoading}
                                    className="w-full py-3 bg-red-600 hover:bg-red-700 rounded-full font-bold text-white shadow-lg shadow-red-500/20 transition-all active:scale-95 disabled:opacity-50"
                                >
                                    {isLoading ? 'Processing...' : 'Confirm Account Deletion'}
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>

                </div>

                {/* Bottom section links */}
                <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 flex items-center gap-4 group cursor-pointer hover:border-blue-300 transition-colors" onClick={() => navigate('/orders')}>
                        <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all">
                            <Smartphone size={20} />
                        </div>
                        <div>
                            <h4 className="font-bold text-slate-900">Ordering Trends</h4>
                            <p className="text-xs text-slate-500">View your buying patterns</p>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 flex items-center gap-4 group cursor-pointer hover:border-green-300 transition-colors" onClick={() => navigate('/account?tab=addresses')}>
                        <div className="w-10 h-10 bg-green-50 rounded-full flex items-center justify-center text-green-600 group-hover:bg-green-600 group-hover:text-white transition-all">
                            <Lock size={20} />
                        </div>
                        <div>
                            <h4 className="font-bold text-slate-900">Secure Addresses</h4>
                            <p className="text-xs text-slate-500">Manage your shipping vaults</p>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Settings;
