import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, ShoppingBag, ListOrdered, ArrowRight } from 'lucide-react';

const OrderConfirmation = () => {
    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 py-20">
            <div className="bg-white max-w-lg w-full rounded-[2rem] shadow-xl p-8 md:p-12 text-center border border-slate-100">
                <div className="flex justify-center mb-6">
                    <div className="w-24 h-24 rounded-full bg-green-50 flex items-center justify-center">
                        <CheckCircle className="w-12 h-12 text-green-500" />
                    </div>
                </div>

                <h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-4 tracking-tight">
                    Order Confirmed!
                </h1>

                <p className="text-slate-500 mb-8 max-w-sm mx-auto leading-relaxed">
                    Thank you for your purchase. We've received your order and will send you a confirmation email shortly with the order details and tracking information.
                </p>

                <div className="space-y-4">
                    <Link to="/orders" className="w-full group relative flex items-center justify-center gap-3 px-8 py-4 bg-slate-900 text-white rounded-2xl overflow-hidden transition-all hover:bg-slate-800">
                        <ListOrdered size={20} />
                        <span className="font-bold">See My Orders</span>
                        <ArrowRight size={18} className="absolute right-6 opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                    </Link>

                    <Link to="/" className="w-full flex items-center justify-center gap-3 px-8 py-4 bg-orange-50 text-orange-600 rounded-2xl hover:bg-orange-100 transition-colors font-bold group">
                        <ShoppingBag size={20} className="group-hover:-translate-y-1 transition-transform" />
                        Continue Shopping
                    </Link>
                </div>

                <div className="mt-8 pt-6 border-t border-slate-100 text-sm text-slate-400">
                    Need help? <Link to="/contact" className="text-orange-500 font-bold hover:underline">Contact Support</Link>
                </div>
            </div>
        </div>
    );
};

export default OrderConfirmation;
