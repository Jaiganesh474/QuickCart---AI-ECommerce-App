import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, Truck, CheckCircle, Clock, MapPin, Search, ChevronRight, Hash, ShieldCheck, User, Phone, Menu, X } from 'lucide-react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

const DeliveryDashboard = () => {
    const { user } = useSelector(state => state.user);
    const navigate = useNavigate();
    
    const [activeTab, setActiveTab] = useState('AVAILABLE'); // AVAILABLE, ACTIVE, COMPLETED
    const [orders, setOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [otpInputs, setOtpInputs] = useState({});
    const [error, setError] = useState(null);
    const [hasActiveOrder, setHasActiveOrder] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        if (!user || user.role !== 'DELIVERY_AGENT') {
            navigate('/');
            return;
        }
        fetchOrders();
    }, [activeTab, user]);

    const fetchOrders = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem('quickcart_jwt');
            const endpoint = activeTab === 'AVAILABLE' ? '/api/delivery/available' : '/api/delivery/my-orders';
            
            const [res, activeRes] = await Promise.all([
                fetch(endpoint, { headers: { 'Authorization': `Bearer ${token}` } }),
                fetch('/api/delivery/my-orders', { headers: { 'Authorization': `Bearer ${token}` } })
            ]);

            if (!res.ok || !activeRes.ok) {
                throw new Error("Failed to fetch orders from server");
            }

            const [data, allMyOrders] = await Promise.all([res.json(), activeRes.json()]);
            
            // Safeguard: Ensure data is an array
            const ordersArray = Array.isArray(data) ? data : [];
            const myOrdersArray = Array.isArray(allMyOrders) ? allMyOrders : [];

            setHasActiveOrder(myOrdersArray.some(o => o.status === 'OUT_FOR_DELIVERY'));

            if (activeTab === 'ACTIVE') {
                setOrders(ordersArray.filter(o => o.status === 'OUT_FOR_DELIVERY'));
            } else if (activeTab === 'COMPLETED') {
                setOrders(ordersArray.filter(o => o.status === 'DELIVERED'));
            } else {
                setOrders(ordersArray);
            }
        } catch (err) {
            console.error("Fetch delivery orders error:", err);
            setError("Failed to load orders. Please try again.");
            setOrders([]); // Reset to empty array on error
        } finally {
            setIsLoading(false);
        }
    };

    const handlePickOrder = async (orderId) => {
        try {
            const res = await fetch(`/api/delivery/pick/${orderId}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('quickcart_jwt')}`
                }
            });
            if (res.ok) {
                setActiveTab('ACTIVE');
            } else {
                const errorData = await res.json();
                alert(errorData.message || "Failed to pick order. It might already be taken.");
            }
        } catch (err) {
            console.error("Pick error:", err);
        }
    };

    const handleDeliverOrder = async (orderId) => {
        const otp = otpInputs[orderId];
        if (!otp || otp.length !== 6) {
            alert("Please enter a valid 6-digit OTP");
            return;
        }

        try {
            const res = await fetch(`/api/delivery/deliver/${orderId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('quickcart_jwt')}`
                },
                body: JSON.stringify({ otp })
            });

            if (res.ok) {
                setActiveTab('COMPLETED');
                const newOtpInputs = { ...otpInputs };
                delete newOtpInputs[orderId];
                setOtpInputs(newOtpInputs);
            } else {
                const errorData = await res.json();
                alert(errorData.message || "Invalid OTP. Please verify with the customer.");
            }
        } catch (err) {
            console.error("Deliver error:", err);
        }
    };

    const handleOtpChange = (orderId, val) => {
        setOtpInputs(prev => ({ ...prev, [orderId]: val.replace(/\D/g, '').slice(0,6) }));
    };

    return (
        <div className="bg-[#f0f2f5] min-h-screen">
            {/* Mobile Header */}
            <div className="md:hidden bg-white border-b border-slate-200 p-4 sticky top-0 z-50 flex justify-between items-center shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
                        <Truck className="w-6 h-6 text-orange-600" />
                    </div>
                    <div>
                        <h1 className="text-lg font-black text-slate-900 tracking-tight leading-none">Delivery Hub</h1>
                        <p className="text-[10px] text-green-600 font-bold uppercase tracking-widest mt-1">Online</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={() => navigate('/account')} className="p-2 text-slate-400 hover:text-slate-600">
                        <User size={20} />
                    </button>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 py-6 md:py-10">
                {/* Header Card - Hidden on mobile, shown on md+ */}
                <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-8 overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-orange-50 rounded-full -mr-16 -mt-16 opacity-50" />
                    <div className="flex items-center gap-4 relative z-10">
                        <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center text-orange-600">
                            <Truck className="w-8 h-8" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Delivery Hub</h1>
                            <p className="text-slate-500 font-medium font-display">Hello, {user?.name.split(' ')[0]} • Active Agent</p>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex bg-white p-1.5 rounded-xl shadow-sm border border-slate-200 mb-8 overflow-x-auto hide-scrollbar">
                    {[
                        { id: 'AVAILABLE', label: 'Available', icon: Search },
                        { id: 'ACTIVE', label: 'In Progress', icon: Clock },
                        { id: 'COMPLETED', label: 'Delivered', icon: CheckCircle }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-bold text-sm transition-all ${activeTab === tab.id ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20' : 'text-slate-500 hover:bg-slate-50'}`}
                        >
                            <tab.icon size={18} />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Active Order Alert */}
                {hasActiveOrder && activeTab === 'AVAILABLE' && (
                    <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        className="bg-blue-600 text-white p-4 rounded-xl mb-6 flex items-center gap-3 shadow-lg shadow-blue-500/20"
                    >
                        <Clock className="animate-pulse" />
                        <p className="font-bold text-sm">You have an active delivery! Complete it before picking a new one.</p>
                        <button 
                            onClick={() => setActiveTab('ACTIVE')}
                            className="ml-auto bg-white/20 hover:bg-white/30 px-3 py-1 rounded-lg text-xs font-black transition-colors"
                        >
                            VIEW ACTIVE
                        </button>
                    </motion.div>
                )}

                {/* Orders List */}
                <div className="space-y-4">
                    {isLoading ? (
                        [1,2,3].map(i => (
                            <div key={i} className="bg-white h-48 rounded-2xl border border-slate-200 animate-pulse" />
                        ))
                    ) : orders.length === 0 ? (
                        <div className="bg-white rounded-2xl border border-slate-200 p-20 text-center shadow-sm">
                            <Package className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                            <h3 className="text-xl font-bold text-slate-900 mb-1">No orders here</h3>
                            <p className="text-slate-500">Check other tabs or wait for new assignments.</p>
                        </div>
                    ) : (
                        orders.map(order => (
                            <motion.div
                                layout
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                key={order.id}
                                className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden transform transition-all hover:shadow-md"
                            >
                                <div className="p-6">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-xs font-black text-slate-400 uppercase tracking-widest">{order.orderId}</span>
                                                 <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                                                     order.status === 'OUT_FOR_DELIVERY' ? 'bg-blue-100 text-blue-700' :
                                                     order.status === 'DELIVERED' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700'
                                                 }`}>
                                                     {order.status.replace('_', ' ')}
                                                 </span>
                                                 {order.updatedAt && (
                                                     <span className="text-[10px] text-orange-600 font-bold ml-auto flex items-center gap-1">
                                                         <Clock size={10} /> {new Date(order.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                     </span>
                                                 )}
                                             </div>
                                            <h3 className="text-lg font-bold text-slate-900 line-clamp-1">{order.items[0]?.product.name || 'Bulk Order'}</h3>
                                            {order.items.length > 1 && <p className="text-xs text-slate-400 font-medium">+ {order.items.length - 1} more items</p>}
                                        </div>
                                        <div className="text-right">
                                            <p className="text-lg font-black text-slate-900 tracking-tight">₹{order.finalAmount.toFixed(2)}</p>
                                            <p className="text-xs text-slate-500 font-bold uppercase">{order.paymentMethod}</p>
                                        </div>
                                    </div>

                                    <div className="space-y-3 mb-6">
                                        <div className="flex items-start gap-3 bg-slate-50 p-3 rounded-xl">
                                            <MapPin className="text-orange-500 shrink-0 mt-0.5" size={18} />
                                            <div>
                                                <p className="text-sm font-bold text-slate-900">{order.deliveryAddress?.fullName}</p>
                                                <p className="text-xs text-slate-500 leading-relaxed font-medium">
                                                    {order.deliveryAddress?.streetAddress}, {order.deliveryAddress?.city}, {order.deliveryAddress?.zipCode}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-4 bg-slate-50 p-3 rounded-xl">
                                            <div className="flex gap-3 flex-1">
                                                <User className="text-blue-500 shrink-0 mt-0.5" size={18} />
                                                <div>
                                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none mb-1">Customer Details</p>
                                                    <p className="text-sm font-bold text-slate-900 leading-tight">{order.user?.name || 'Customer'}</p>
                                                    <p className="text-xs text-slate-500 font-medium">{order.user?.email}</p>
                                                </div>
                                            </div>
                                            {order.user?.mobileNumber && activeTab === 'ACTIVE' && (
                                                <a 
                                                    href={`tel:${order.user.mobileNumber}`}
                                                    className="flex flex-col items-center justify-center px-4 border-l border-slate-200 group active:scale-90 transition-transform"
                                                >
                                                    <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center text-green-600 group-hover:bg-green-600 group-hover:text-white transition-colors mb-1">
                                                        <Phone size={14} />
                                                    </div>
                                                    <span className="text-[10px] font-black text-green-600 uppercase">Call Now</span>
                                                    <p className="text-xs font-bold text-slate-400 mt-0.5">
                                                        {`*******${order.user.mobileNumber.slice(-3)}`}
                                                    </p>
                                                </a>
                                            )}
                                        </div>
                                    </div>

                                    {/* Action Area */}
                                    {activeTab === 'AVAILABLE' && (
                                        <button
                                            onClick={() => handlePickOrder(order.id)}
                                            disabled={hasActiveOrder}
                                            className={`w-full py-4 text-white font-black rounded-xl transition shadow-lg active:scale-95 flex items-center justify-center gap-2 ${hasActiveOrder ? 'bg-slate-300 cursor-not-allowed grayscale' : 'bg-orange-500 hover:bg-orange-600 shadow-orange-500/20'}`}
                                        >
                                            <Truck size={20} /> {hasActiveOrder ? 'ACTIVE DELIVERY IN PROGRESS' : 'PICK THIS ORDER'}
                                        </button>
                                    )}

                                    {activeTab === 'ACTIVE' && (
                                        <div className="space-y-4 pt-4 border-t border-slate-100">
                                            <div className="relative">
                                                <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-orange-500" size={20} />
                                                <input
                                                    type="text"
                                                    placeholder="Enter verification OTP to confirm delivery"
                                                    value={otpInputs[order.id] || ''}
                                                    onChange={(e) => handleOtpChange(order.id, e.target.value)}
                                                    className="w-full pl-12 pr-4 py-4 bg-orange-50/50 border-2 border-orange-100 rounded-xl text-slate-900 outline-none focus:border-orange-500 transition-all font-black tracking-[0.5em] text-center text-xl placeholder:tracking-normal placeholder:font-bold placeholder:text-sm"
                                                    maxLength={6}
                                                />
                                            </div>
                                            <button
                                                onClick={() => handleDeliverOrder(order.id)}
                                                className="w-full py-4 bg-green-600 text-white font-black rounded-xl hover:bg-green-700 transition shadow-lg shadow-green-500/20 active:scale-95 flex items-center justify-center gap-2"
                                            >
                                                <CheckCircle size={20} /> COMPLETE DELIVERY
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default DeliveryDashboard;
