import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { ShoppingCart, Trash2, CheckCircle, Shield, Plus, Minus } from 'lucide-react';
import { removeFromCart, updateQuantity, clearCart } from '../features/cart/cartSlice';
import { validateCoupon, clearCoupon, placeOrder } from '../features/order/orderSlice';
import { Link, useNavigate } from 'react-router-dom';
import { Ticket, X, ShieldAlert, ShoppingBag, Lock } from 'lucide-react';
import { motion } from 'framer-motion';

const Cart = () => {
    const { items, totalQuantity, totalAmount, user } = useSelector(state => ({
        ...state.cart,
        user: state.user.user
    }));
    const role = user?.role;
    const { appliedCoupon, couponError } = useSelector(state => state.order);
    const { selectedAddress } = useSelector(state => state.address);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [couponCode, setCouponCode] = useState('');
    const [isPlacingOrder, setIsPlacingOrder] = useState(false);

    const discountAmount = appliedCoupon?.discountAmount || 0;
    const finalAmount = (totalAmount || 0) - discountAmount;

    const handleApplyCoupon = (e) => {
        e.preventDefault();
        dispatch(validateCoupon({ code: couponCode, amount: totalAmount }));
    };

    const handlePlaceOrder = async () => {
        if (!selectedAddress) {
            alert('Please select a delivery address in the navbar first!');
            return;
        }

        setIsPlacingOrder(true);
        const orderData = {
            items: items.map(item => ({
                product: { id: item.id },
                quantity: item.quantity,
                price: item.price
            })),
            totalAmount,
            discountAmount,
            finalAmount,
            deliveryAddress: selectedAddress
        };

        const resultAction = await dispatch(placeOrder(orderData));
        if (placeOrder.fulfilled.match(resultAction)) {
            dispatch(clearCart());
            dispatch(clearCoupon());
            navigate('/orders');
        } else {
            alert('Failed to place order: ' + resultAction.payload);
        }
        setIsPlacingOrder(false);
    };

    if (items.length === 0) {
        return (
            <div className="bg-white min-h-[60vh] flex flex-col items-center justify-center p-8">
                <ShoppingCart className="w-24 h-24 text-slate-200 mb-6" />
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Your QuickCart is empty</h2>
                <p className="text-slate-500 mb-8 max-w-sm text-center">Looks like you haven't added anything to your cart yet. Discover something new today!</p>
                <Link to="/" className="px-8 py-3 bg-yellow-400 hover:bg-yellow-500 rounded-full text-slate-900 font-bold shadow-sm transition">
                    Start Shopping
                </Link>
            </div>
        );
    }

    return (
        <div className="bg-[#e3e6e6] min-h-screen py-8">
            <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col lg:flex-row gap-6">

                    {/* Cart Items List */}
                    <div className="lg:col-span-8 flex-1 bg-white p-6 rounded-md shadow-sm">
                        <div className="flex justify-between items-end border-b border-slate-200 pb-4 mb-4">
                            <h1 className="text-3xl font-normal text-slate-900">Shopping Cart</h1>
                            <span className="text-sm font-medium text-slate-500">Price</span>
                        </div>

                        <div className="space-y-6">
                            {items.map(item => (
                                <div key={item.id} className="flex flex-col sm:flex-row gap-6 py-4 border-b border-slate-100 last:border-0 relative">
                                    <div className="w-40 h-40 shrink-0 bg-white p-2 flex items-center justify-center cursor-pointer" onClick={() => navigate(`/product/${item.id}`)}>
                                        <img src={item.imageUrl} alt={item.name} className="max-w-full max-h-full object-contain mix-blend-multiply" />
                                    </div>
                                    <div className="flex-1 flex flex-col pt-2">
                                        <div className="flex justify-between items-start gap-4">
                                            <div className="flex-1">
                                                <h3 className="font-medium text-lg text-slate-900 line-clamp-2 hover:text-orange-600 hover:underline cursor-pointer mb-1" onClick={() => navigate(`/product/${item.id}`)}>
                                                    {item.name}
                                                </h3>
                                                {item.isDailyOffer && (
                                                    <span className="text-[13px] font-bold text-[#CC0C39] block mb-0.5">Limited time deal</span>
                                                )}
                                                <div className="flex flex-wrap items-center gap-2 mt-1">
                                                    {item.offerPercentage > 0 && (
                                                        <span className="bg-[#CC0C39] text-white text-[14px] font-medium px-1.5 py-0.5 rounded-sm">
                                                            -{item.offerPercentage}%
                                                        </span>
                                                    )}
                                                    <div className="flex items-start outline-none">
                                                        <span className="text-[10px] font-medium text-slate-900 mt-[3px]">₹</span>
                                                        <span className="text-2xl font-bold text-slate-900 leading-none">{Math.floor(item.price)}</span>
                                                        <span className="text-[10px] font-medium text-slate-900 mt-[3px]">{(item.price % 1).toFixed(2).substring(2)}</span>
                                                    </div>
                                                    {item.offerPercentage > 0 && (
                                                        <div className="text-[12px] text-slate-600 flex items-center gap-1 ml-1 self-end mb-[2px]">
                                                            <span>M.R.P.:</span>
                                                            <span className="line-through">₹{item.originalPrice.toFixed(2)}</span>
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="mt-3 space-y-1.5">
                                                    <p className="text-[13px] text-slate-800 font-medium">Up to 5% back with QuickCart</p>
                                                    <p className="text-[13px] text-slate-800">Pay with <span className="font-medium text-[#007185] hover:underline cursor-pointer">ICICI card</span> <span className="text-[#007185] hover:underline cursor-pointer">Terms</span></p>
                                                </div>
                                            </div>
                                        </div>
                                        <p className="text-sm text-green-700 font-medium mt-1">In Stock</p>
                                        <p className="text-[12px] text-slate-500 mt-0.5">Eligible for FREE Shipping</p>

                                        <div className="mt-auto pt-4 flex items-center gap-4">
                                            {/* Quantity Pill Shape */}
                                            <div className="flex items-center border-2 border-yellow-400 rounded-full bg-white shadow-sm overflow-hidden h-9 px-1">
                                                <button onClick={() => {
                                                    if (item.quantity === 1) {
                                                        dispatch(removeFromCart(item.id));
                                                    } else {
                                                        dispatch(updateQuantity({ id: item.id, quantity: item.quantity - 1 }));
                                                    }
                                                }} className="w-8 h-full flex items-center justify-center text-slate-900 transition hover:bg-slate-50">
                                                    {item.quantity === 1 ? <Trash2 className="w-4 h-4 text-slate-600" /> : <Minus className="w-3.5 h-3.5" />}
                                                </button>
                                                <span className="w-8 h-full flex items-center justify-center text-slate-900 font-bold bg-white text-sm">
                                                    {item.quantity}
                                                </span>
                                                <button onClick={() => dispatch(updateQuantity({ id: item.id, quantity: item.quantity + 1 }))} disabled={item.stock ? item.quantity >= item.stock : false} className="w-8 h-full flex items-center justify-center text-slate-900 transition disabled:opacity-30 hover:bg-slate-50">
                                                    <Plus className="w-4 h-4" />
                                                </button>
                                            </div>

                                            <button onClick={() => dispatch(removeFromCart(item.id))} className="text-sm font-medium text-[#007185] hover:text-[#C7511F] hover:underline transition">
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-8 text-right font-medium text-lg text-slate-900 border-t border-slate-200 pt-4 flex flex-col items-end gap-2">
                            <div>Subtotal ({totalQuantity} items): <span className="font-bold">₹{(totalAmount || 0).toFixed(2)}</span></div>
                            {appliedCoupon && (
                                <div className="text-green-600 text-sm font-bold flex items-center gap-2">
                                    <Ticket size={16} /> Coupon ({appliedCoupon.code}) Applied: -₹{(discountAmount || 0).toFixed(2)}
                                </div>
                            )}
                            <div className="text-xl font-black mt-2">Final Amount: ₹{(finalAmount || 0).toFixed(2)}</div>
                        </div>
                    </div>

                    {/* Checkout Card */}
                    <div className="lg:w-80 shrink-0">
                        <div className="bg-white p-6 rounded-md shadow-sm mb-4">
                            {totalAmount > 500 && (
                                <div className="flex items-start gap-2 mb-4 bg-green-50 p-3 rounded border border-green-200">
                                    <CheckCircle className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                                    <p className="text-xs text-green-800 leading-tight">
                                        <span className="font-bold text-green-900 block mb-0.5">Your order is eligible for FREE Delivery.</span>
                                        Select this option at checkout. Details
                                    </p>
                                </div>
                            )}

                            <h3 className="text-lg text-slate-900 mb-2">
                                Subtotal ({totalQuantity} items): <span className="font-bold">₹{(totalAmount || 0).toFixed(2)}</span>
                            </h3>

                            {appliedCoupon && (
                                <div className="text-sm text-green-600 font-bold mb-4 flex justify-between">
                                    <span>Discount:</span>
                                    <span>-₹{(discountAmount || 0).toFixed(2)}</span>
                                </div>
                            )}

                            <div className="text-xl font-bold text-slate-900 mb-4 flex justify-between border-t border-slate-100 pt-2">
                                <span>Total:</span>
                                <span>₹{(finalAmount || 0).toFixed(2)}</span>
                            </div>

                            <div className="mb-6 space-y-3">

                                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                                    <input
                                        value={couponCode}
                                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                                        placeholder="Coupon code"
                                        className="flex-1 px-3 py-1.5 border border-slate-200 rounded-lg text-slate-900 text-sm outline-none focus:ring-1 focus:ring-orange-500"
                                    />
                                    <button type="submit" className="px-4 py-1.5 bg-slate-900 text-white text-xs font-bold rounded-lg hover:bg-slate-800">
                                        Apply
                                    </button>
                                </form>
                                {couponError && <p className="text-[10px] text-red-500 font-medium ml-1">{couponError}</p>}
                                {appliedCoupon && (
                                    <div className="flex items-center justify-between bg-green-50 text-green-700 px-3 py-1.5 rounded-lg text-[11px] font-bold">
                                        <span className="flex items-center gap-1"><Ticket size={12} /> {appliedCoupon.code}</span>
                                        <button onClick={() => dispatch(clearCoupon())} className="hover:text-red-500"><X size={12} /></button>
                                    </div>
                                )}
                            </div>

                            {role === 'DELIVERY_AGENT' || role === 'ADMIN' ? (
                                <motion.div 
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="relative overflow-hidden p-5 rounded-2xl bg-gradient-to-br from-slate-50 to-white border-2 border-slate-100 shadow-xl shadow-slate-200/50"
                                >
                                    <div className="absolute -top-4 -right-4 p-8 opacity-[0.03] rotate-12">
                                        <ShoppingBag className="w-24 h-24 text-slate-900" />
                                    </div>
                                    <div className="relative z-10">
                                        <div className="flex items-center gap-2.5 mb-3">
                                            <div className="p-2 bg-orange-100 rounded-xl shadow-inner">
                                                <Lock className="w-4 h-4 text-orange-600" />
                                            </div>
                                            <span className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500 text-left">Access Restricted</span>
                                        </div>
                                        <h4 className="text-sm font-bold text-slate-900 mb-2 text-left">Feature Locked for {role === 'ADMIN' ? 'Sellers' : 'Agents'}</h4>
                                        <p className="text-[11px] text-slate-600 leading-relaxed font-medium text-left">
                                            To maintain marketplace integrity, <span className="text-slate-900 font-bold">{role === 'ADMIN' ? 'Sellers' : 'Delivery Agents'}</span> are restricted from placing orders. 
                                            Please switch to a <span className="text-orange-500 font-bold">Standard Customer</span> account to shop.
                                        </p>
                                    </div>
                                </motion.div>
                            ) : (
                                <button
                                    onClick={() => navigate('/checkout')}
                                    className="w-full py-2.5 bg-[#FFD814] hover:bg-[#F7CA00] border border-[#FCD200] rounded-full text-sm text-slate-900 font-bold shadow-sm transition"
                                >
                                    Proceed to Buy
                                </button>
                            )}

                            <div className="flex items-center justify-center gap-2 mt-4 pt-4 border-t border-slate-100 text-xs text-slate-500">
                                <Shield className="w-4 h-4 text-green-600" />
                                Safe and secure transactions
                            </div>
                        </div>

                    </div>

                </div>
            </div>
        </div>
    );
};

export default Cart;
