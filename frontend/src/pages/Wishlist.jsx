import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Heart, Trash2, ShoppingCart, ArrowLeft, Star } from 'lucide-react';
import { removeFromWishlist } from '../features/wishlist/wishlistSlice';
import { addToCart } from '../features/cart/cartSlice';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const Wishlist = () => {
    const { items } = useSelector(state => state.wishlist);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleMoveToCart = (product) => {
        dispatch(addToCart({
            ...product,
            quantity: 1
        }));
        dispatch(removeFromWishlist({ id: product.id }));
    };

    const renderStars = (rating = 4) => {
        return Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} className={`w-3.5 h-3.5 ${i < Math.floor(rating) ? 'text-yellow-400 fill-yellow-400' : 'text-slate-300'}`} />
        ));
    };

    if (items.length === 0) {
        return (
            <div className="bg-white min-h-[70vh] flex flex-col items-center justify-center p-8">
                <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mb-6">
                    <Heart className="w-12 h-12 text-red-200" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Your Wishlist is empty</h2>
                <p className="text-slate-500 mb-8 max-w-sm text-center">Save items you like in your wishlist to find them easily later.</p>
                <Link to="/" className="px-8 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-bold shadow-lg transition-all active:scale-95">
                    Start Shopping
                </Link>
            </div>
        );
    }

    return (
        <div className="bg-[#f3f4f6] min-h-screen py-10">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center gap-4 mb-8">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2 hover:bg-white rounded-full transition-colors group"
                    >
                        <ArrowLeft className="w-6 h-6 text-slate-600 group-hover:text-slate-900" />
                    </button>
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">Your Wishlist</h1>
                        <p className="text-slate-500 text-sm">{items.length} {items.length === 1 ? 'Item' : 'Items'}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <AnimatePresence>
                        {items.map(product => (
                            <motion.div
                                key={product.id}
                                layout
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col group relative"
                            >
                                <button
                                    onClick={() => dispatch(removeFromWishlist({ id: product.id }))}
                                    className="absolute top-3 right-3 p-2 bg-white/80 backdrop-blur-sm rounded-full text-slate-400 hover:text-red-500 hover:bg-white shadow-sm z-10 transition-all opacity-0 group-hover:opacity-100"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>

                                <div
                                    className="h-64 bg-white p-6 flex items-center justify-center cursor-pointer"
                                    onClick={() => navigate(`/product/${product.id}`)}
                                >
                                    <img
                                        src={product.imageUrl || 'https://via.placeholder.com/300x300?text=No+Image'}
                                        alt={product.name}
                                        className="max-w-full max-h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-500"
                                    />
                                </div>

                                <div className="p-5 flex-1 flex flex-col">
                                    <h3
                                        className="text-slate-900 font-bold text-lg mb-1 line-clamp-2 hover:text-orange-600 cursor-pointer"
                                        onClick={() => navigate(`/product/${product.id}`)}
                                    >
                                        {product.name}
                                    </h3>
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className="flex">
                                            {renderStars(product.rating || (3.5 + Math.random() * 1.5))}
                                        </div>
                                        <span className="text-xs text-slate-500 font-medium">
                                            ({Math.floor(Math.random() * 1000) + 100})
                                        </span>
                                    </div>

                                    <div className="mt-auto pt-4 flex flex-col gap-4">
                                        <div className="flex items-end gap-2">
                                            <span className="text-2xl font-bold text-slate-900">₹{product.price.toFixed(2)}</span>
                                            {product.originalPrice && product.originalPrice > product.price && (
                                                <span className="text-sm text-slate-400 line-through mb-1">₹{product.originalPrice.toFixed(2)}</span>
                                            )}
                                        </div>

                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleMoveToCart(product)}
                                                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-yellow-400 hover:bg-yellow-500 text-slate-900 rounded-lg font-bold transition-all shadow-sm active:scale-95 text-sm"
                                            >
                                                <ShoppingCart className="w-4 h-4" />
                                                Add to Cart
                                            </button>
                                            <button
                                                onClick={() => dispatch(removeFromWishlist({ id: product.id }))}
                                                className="px-3 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-lg transition-colors active:scale-95"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

export default Wishlist;
