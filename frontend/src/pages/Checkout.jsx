import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, ChevronRight, CreditCard, Banknote, ShieldCheck, AlertCircle, Trash2, X } from 'lucide-react';
import { placeOrder, clearCoupon } from '../features/order/orderSlice';
import { clearCart } from '../features/cart/cartSlice';
import { fetchAddresses, setSelectedAddress } from '../features/address/addressSlice';

const Checkout = () => {
    const { items, totalAmount } = useSelector(state => state.cart);
    const { appliedCoupon, isPlacingOrder } = useSelector(state => state.order);
    const { selectedAddress } = useSelector(state => state.address);
    const { user } = useSelector(state => state.user);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [paymentMethod, setPaymentMethod] = useState(''); // 'COD' or 'RAZORPAY'
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [showAddressSelector, setShowAddressSelector] = useState(false);
    const { items: allAddresses, status: addressStatus } = useSelector(state => state.address);

    // Logic: Marketplace fee is 10
    const MARKET_FEE = 10;
    const discountAmount = appliedCoupon ? appliedCoupon.discountAmount : 0;
    const finalTotal = (totalAmount - discountAmount) + MARKET_FEE;

    useEffect(() => {
        // Only redirect to cart if we're not in the middle of a success navigation
        const isSuccess = window.location.pathname === '/order-success';
        if (items.length === 0 && !isSuccess && !isPlacingOrder) {
            navigate('/cart');
        }
        if (addressStatus === 'idle') {
            dispatch(fetchAddresses());
        }
    }, [items, navigate, addressStatus, dispatch, isPlacingOrder]);

    const handlePlaceOrder = async (method) => {
        const orderData = {
            items: items.map(item => ({
                product: { id: item.id },
                quantity: item.quantity,
                price: item.price
            })),
            totalAmount,
            discountAmount,
            marketplaceFee: MARKET_FEE,
            finalAmount: finalTotal,
            deliveryAddress: selectedAddress,
            paymentMethod: method
        };

        const resultAction = await dispatch(placeOrder(orderData));
        if (placeOrder.fulfilled.match(resultAction)) {
            dispatch(clearCart());
            dispatch(clearCoupon());
            navigate('/order-success');
        } else {
            alert(resultAction.payload || "Failed to place order");
        }
    };

    const handleRazorpay = () => {
        const options = {
            key: "rzp_test_SOO8Ni1ctYOgwL", // Test Key from application.properties
            amount: finalTotal * 100, // in paisa
            currency: "INR",
            name: "QuickCart",
            description: "Marketplace Purchase",
            handler: function (response) {
                // Once payment is successful
                handlePlaceOrder('RAZORPAY');
            },
            prefill: {
                name: user?.name || "Customer",
                email: user?.email || "",
                contact: selectedAddress?.phoneNumber || "9999999999"
            },
            theme: {
                color: "#F59E0B",
            },
        };

        const rzp1 = new window.Razorpay(options);
        rzp1.open();
    };

    if (!selectedAddress) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <div className="text-center">
                    <AlertCircle size={48} className="text-orange-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">No Address Selected</h2>
                    <p className="text-slate-500 mb-6">Please select a delivery address in the navbar first.</p>
                    <button onClick={() => navigate('/cart')} className="px-6 py-2 bg-slate-900 text-white rounded-xl font-bold">Back to Cart</button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 py-10 px-4">
            <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">

                {/* Left: Checkout Options */}
                <div className="md:col-span-2 space-y-6">
                    <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm">
                        <h2 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-2">
                            Select Payment Method
                        </h2>

                        <div className="space-y-4">
                            {user?.role === 'ADMIN' ? (
                                <div className="p-6 bg-red-50 border border-red-200 rounded-2xl text-center">
                                    <AlertCircle className="mx-auto text-red-500 mb-2" />
                                    <p className="font-bold text-red-800">Admin/Seller Accounts Cannot Place Orders</p>
                                    <p className="text-sm text-red-600 mt-1">Please use a standard customer account to make purchases. This is to prevent order ambiguity in the system.</p>
                                    <button onClick={() => navigate('/')} className="mt-4 px-6 py-2 bg-red-600 text-white rounded-lg font-bold text-sm">Continue Shopping</button>
                                </div>
                            ) : (
                                <>
                                    {/* Cash on Delivery */}
                                    <label className={`block border-2 p-5 rounded-2xl cursor-pointer transition-all ${paymentMethod === 'COD' ? 'border-orange-500 bg-orange-50/30' : 'border-slate-100'}`}>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'COD' ? 'border-orange-500' : 'border-slate-300'}`}>
                                                    {paymentMethod === 'COD' && <div className="w-3 h-3 bg-orange-500 rounded-full" />}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-900 flex items-center gap-2">
                                                        <Banknote className="text-green-600" /> Cash on Delivery (COD)
                                                    </p>
                                                    <p className="text-xs text-slate-500 mt-1">Pay when you receive the order</p>
                                                </div>
                                            </div>
                                            <input type="radio" className="hidden" name="payment" value="COD" checked={paymentMethod === 'COD'} onChange={(e) => setPaymentMethod(e.target.value)} disabled={finalTotal >= 5000} />
                                        </div>
                                        {finalTotal >= 5000 && (
                                            <div className="mt-4 p-3 bg-red-50 border border-red-100 rounded-xl flex items-center gap-2 text-[11px] text-red-600 font-bold uppercase">
                                                <AlertCircle size={14} /> COD not available for orders above ₹5000
                                            </div>
                                        )}
                                    </label>

                                    {/* Online Payment */}
                                    <label className={`block border-2 p-5 rounded-2xl cursor-pointer transition-all ${paymentMethod === 'RAZORPAY' ? 'border-orange-500 bg-orange-50/30' : 'border-slate-100'}`}>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'RAZORPAY' ? 'border-orange-500' : 'border-slate-300'}`}>
                                                    {paymentMethod === 'RAZORPAY' && <div className="w-3 h-3 bg-orange-500 rounded-full" />}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-900 flex items-center gap-2">
                                                        <CreditCard className="text-blue-600" /> Online Payment (Razorpay)
                                                    </p>
                                                    <p className="text-xs text-slate-500 mt-1">UPI, Credit/Debit Cards, Net Banking</p>
                                                </div>
                                            </div>
                                            <input type="radio" className="hidden" name="payment" value="RAZORPAY" checked={paymentMethod === 'RAZORPAY'} onChange={(e) => setPaymentMethod(e.target.value)} />
                                        </div>
                                    </label>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Delivery Details */}
                    <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-slate-900 uppercase tracking-widest text-xs opacity-50">Deliver to</h3>
                            <button
                                onClick={() => setShowAddressSelector(true)}
                                className="text-xs font-bold text-orange-600 hover:underline"
                            >
                                Change Address
                            </button>
                        </div>
                        <div className="flex items-start gap-4">
                            <div className="bg-slate-100 p-2 rounded-lg">
                                <ShieldCheck className="text-green-600" />
                            </div>
                            <div>
                                <p className="font-bold text-slate-900">{selectedAddress.fullName}</p>
                                <p className="text-sm text-slate-500 line-clamp-2">
                                    {selectedAddress.streetAddress}, {selectedAddress.city}, {selectedAddress.state} - {selectedAddress.zipCode}
                                </p>
                                <p className="text-sm text-slate-500 mt-1">Phone: {selectedAddress.phoneNumber}</p>
                            </div>
                        </div>
                    </div>

                    {/* Address Selector Modal */}
                    <AnimatePresence>
                        {showAddressSelector && (
                            <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                                <motion.div
                                    initial={{ y: 50, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    exit={{ y: 50, opacity: 0 }}
                                    className="bg-white rounded-3xl p-8 max-w-md w-full max-h-[80vh] overflow-y-auto"
                                >
                                    <div className="flex justify-between items-center mb-6">
                                        <h3 className="text-xl font-black text-slate-900">Select Delivery Address</h3>
                                        <button onClick={() => setShowAddressSelector(false)} className="p-2 hover:bg-slate-100 rounded-full">
                                            <X size={20} className="text-slate-400" />
                                        </button>
                                    </div>

                                    <div className="space-y-4">
                                        {allAddresses.map(addr => (
                                            <div
                                                key={addr.id}
                                                onClick={() => {
                                                    dispatch(setSelectedAddress(addr));
                                                    setShowAddressSelector(false);
                                                }}
                                                className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${selectedAddress.id === addr.id ? 'border-orange-500 bg-orange-50/30' : 'border-slate-100 hover:border-slate-200'}`}
                                            >
                                                <p className="font-bold text-slate-900">{addr.fullName}</p>
                                                <p className="text-sm text-slate-500">{addr.streetAddress}</p>
                                                <p className="text-sm text-slate-500">{addr.city}, {addr.state} {addr.zipCode}</p>
                                            </div>
                                        ))}

                                        <button
                                            onClick={() => navigate('/account?tab=addresses')}
                                            className="w-full py-3 border-2 border-dashed border-slate-200 rounded-2xl text-slate-500 font-bold hover:border-orange-300 hover:text-orange-600 transition-all"
                                        >
                                            + Add New Address
                                        </button>
                                    </div>
                                </motion.div>
                            </div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Right: Order Summary */}
                <div className="space-y-6">
                    <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm sticky top-24">
                        <h3 className="font-bold text-slate-900 mb-4 pb-4 border-b border-slate-100">Order Summary</h3>

                        <div className="space-y-3 mb-6">
                            <div className="flex justify-between text-slate-500 text-sm">
                                <span>Items Subtotal:</span>
                                <span>₹{(totalAmount || 0).toFixed(2)}</span>
                            </div>
                            {appliedCoupon && (
                                <div className="flex justify-between text-green-600 text-sm font-bold">
                                    <span>Discount:</span>
                                    <span>-₹{(discountAmount || 0).toFixed(2)}</span>
                                </div>
                            )}
                            <div className="flex justify-between text-slate-500 text-sm">
                                <span>Shipping:</span>
                                <span className="text-green-600 font-bold uppercase text-[10px]">Free</span>
                            </div>
                            <div className="flex justify-between text-slate-500 text-sm">
                                <span>Marketplace Fee:</span>
                                <span>₹{MARKET_FEE}.00</span>
                            </div>
                            <div className="flex justify-between text-xl font-black text-slate-900 pt-3 border-t border-slate-100 mt-3">
                                <span>Grand Total:</span>
                                <span>₹{(finalTotal || 0).toFixed(2)}</span>
                            </div>
                        </div>

                        <button
                            disabled={!paymentMethod || isPlacingOrder}
                            onClick={() => {
                                if (paymentMethod === 'COD') setShowConfirmModal(true);
                                else handleRazorpay();
                            }}
                            className="w-full py-3.5 bg-orange-500 text-white rounded-2xl font-black shadow-lg hover:bg-orange-600 transition disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-widest text-xs"
                        >
                            {isPlacingOrder ? 'Processing...' : `Place Order (₹${(finalTotal || 0).toFixed(0)})`}
                        </button>

                        <div className="mt-4 flex items-center justify-center gap-2 text-[10px] text-slate-400 font-bold uppercase">
                            <Shield size={14} className="text-green-600" /> Secure Checkout
                        </div>
                    </div>
                </div>
            </div>

            {/* COD Confirmation Modal */}
            <AnimatePresence>
                {showConfirmModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white rounded-3xl p-8 max-w-sm w-full text-center"
                        >
                            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <AlertCircle size={32} className="text-orange-500" />
                            </div>
                            <h3 className="text-xl font-black text-slate-900 mb-2">Confirm COD Order</h3>
                            <p className="text-slate-500 mb-6 text-sm">
                                Are you ready to place your order with <b>Cash on Delivery</b>? A marketplace fee of ₹10 will be applied.
                            </p>

                            <div className="flex flex-col gap-3">
                                <button
                                    onClick={() => {
                                        setShowConfirmModal(false);
                                        handlePlaceOrder('COD');
                                    }}
                                    className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800"
                                >
                                    Confirm Order
                                </button>
                                <button
                                    onClick={() => setShowConfirmModal(false)}
                                    className="w-full py-3 text-slate-500 font-bold hover:bg-slate-50 rounded-xl"
                                >
                                    Cancel
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Checkout;
