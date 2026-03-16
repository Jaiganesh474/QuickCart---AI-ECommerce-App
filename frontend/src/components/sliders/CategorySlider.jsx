import React, { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { addToCart, removeFromCart, updateQuantity } from '../../features/cart/cartSlice';
import { ChevronRight, ChevronLeft, Star, Plus, Minus, Trash2 } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { initializeReviewsIfEmpty } from '../../features/reviews/reviewsSlice';

const ProductCard = ({ product, className = "" }) => {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const cartItems = useSelector(state => state.cart.items);
    const cartItem = cartItems.find(item => item.id === product.id);
    const quantityInCart = cartItem ? cartItem.quantity : 0;

    const effectivePrice = product.offerPercentage ? product.price - (product.price * (product.offerPercentage / 100)) : product.price;

    useEffect(() => {
        dispatch(initializeReviewsIfEmpty({ productId: product.id }));
    }, [product.id, dispatch]);

    const reviews = useSelector(state => state.reviews.productReviews[product.id] || []);
    const totalRatings = reviews.length;
    const averageRating = totalRatings > 0
        ? (reviews.reduce((acc, r) => acc + r.rating, 0) / totalRatings).toFixed(1)
        : 0;

    const handleAddToCart = (e) => {
        e.stopPropagation();
        dispatch(addToCart({
            id: product.id,
            name: product.name,
            price: effectivePrice,
            originalPrice: product.price,
            offerPercentage: product.offerPercentage,
            isDailyOffer: product.isDailyOffer,
            imageUrl: product.imageUrl,
            quantity: 1,
            stock: product.stock
        }));
    };

    const handleUpdateQuantity = (e, newQty) => {
        e.stopPropagation();
        if (newQty === 0) {
            dispatch(removeFromCart(product.id));
        } else {
            dispatch(updateQuantity({ id: product.id, quantity: newQty }));
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
            onClick={() => navigate(`/product/${product.id}`)}
            className={`bg-white group/card cursor-pointer flex flex-col transition-all duration-300 border border-slate-100 rounded-xl shadow-sm hover:shadow-xl p-3 h-full ${className}`}
        >
            <div className="h-48 md:h-56 relative bg-white flex items-center justify-center p-2 mb-2 rounded-lg overflow-hidden">
                <img
                    src={product.imageUrl || 'https://images.unsplash.com/photo-1560393464-5c69a73c5770?w=300'}
                    alt={product.name}
                    className="max-w-full max-h-full object-contain group-hover/card:scale-110 transition-transform duration-700 mix-blend-multiply"
                />
            </div>
            <div className="px-1 flex-1 flex flex-col bg-white text-left">
                <h3 className="text-slate-900 leading-snug line-clamp-2 mb-1 group-hover/card:text-orange-600 transition-colors font-bold text-[13px] md:text-sm">{product.name}</h3>
                
                <div className="flex items-center gap-1.5 mb-2">
                    <div className="flex text-amber-500">
                        <Star className="w-3.5 h-3.5 fill-current" />
                    </div>
                    <span className="text-[11px] font-black text-slate-900">{averageRating}</span>
                    <span className="text-slate-300 text-[10px]">|</span>
                    <span className="text-[11px] text-slate-400 font-bold">{totalRatings}</span>
                </div>

                <div className="mt-auto pt-2">
                    <div className="flex items-center justify-between gap-2">
                        <div className="flex flex-col">
                            {product.offerPercentage > 0 && (
                                <span className="text-[#CC0C39] text-[10px] font-black">-{product.offerPercentage}%</span>
                            )}
                            <div className="flex items-end gap-0.5">
                                <span className="text-[10px] font-bold text-slate-900 pb-0.5">₹</span>
                                <span className="font-black text-lg text-slate-900 leading-none">{Math.floor(effectivePrice)}</span>
                            </div>
                        </div>
                        
                        <div className="shrink-0">
                            {quantityInCart > 0 ? (
                                <div className="flex items-center bg-orange-50 rounded-full p-1 border border-orange-100">
                                    <button onClick={(e) => handleUpdateQuantity(e, quantityInCart - 1)} className="w-6 h-6 flex items-center justify-center text-orange-600">
                                        {quantityInCart === 1 ? <Trash2 size={12} /> : <Minus size={12} />}
                                    </button>
                                    <span className="px-2 text-xs font-black text-orange-600">{quantityInCart}</span>
                                    <button onClick={(e) => handleUpdateQuantity(e, quantityInCart + 1)} className="w-6 h-6 flex items-center justify-center text-orange-600">
                                        <Plus size={12} />
                                    </button>
                                </div>
                            ) : (
                                <button
                                    onClick={handleAddToCart}
                                    className="w-8 h-8 bg-orange-500 hover:bg-orange-600 text-white rounded-lg flex items-center justify-center shadow-lg shadow-orange-100 transition-all active:scale-95"
                                >
                                    <Plus size={18} />
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

const CategorySlider = ({ category, products }) => {
    const sliderRef = useRef(null);
    const navigate = useNavigate();

    const scrollSlider = (direction) => {
        if (sliderRef.current) {
            const scrollAmount = direction === 'left' ? -300 : 300;
            sliderRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
    };

    if (products.length === 0) return null;

    return (
        <div className="mb-10 w-full overflow-hidden">
            <div className="flex items-center justify-between mb-4 px-2">
                <div className="flex items-end gap-4">
                    <h2 className="text-xl font-bold text-slate-900 tracking-tight">{category.name}</h2>
                    <span className="text-sm font-semibold text-[#007185] hover:text-[#C7511F] hover:underline cursor-pointer" onClick={() => navigate('/category/' + category.id)}>See more</span>
                </div>
            </div>

            <div className="relative group/slider w-full px-2">
                <button onClick={() => scrollSlider('left')} className="absolute left-1 top-[45%] -translate-y-1/2 z-30 bg-white/95 shadow-lg border border-slate-100 text-slate-800 p-2.5 rounded-full flex items-center justify-center hover:bg-slate-50 transition opacity-0 group-hover/slider:opacity-100 disabled:opacity-0 active:scale-90">
                    <ChevronLeft className="w-5 h-5" />
                </button>
                <button onClick={() => scrollSlider('right')} className="absolute right-1 top-[45%] -translate-y-1/2 z-30 bg-white/95 shadow-lg border border-slate-100 text-slate-800 p-2.5 rounded-full flex items-center justify-center hover:bg-slate-50 transition opacity-0 group-hover/slider:opacity-100 disabled:opacity-0 active:scale-90">
                    <ChevronRight className="w-5 h-5" />
                </button>
                <div ref={sliderRef} className="flex gap-4 md:gap-6 overflow-x-auto pb-6 pt-2 snap-x hide-scrollbar scroll-smooth w-full">
                    {products.map(product => <ProductCard key={product.id} product={product} className="w-[260px] md:w-[280px] shrink-0 hover:text-[#C7511F] snap-start" />)}
                </div>
            </div>
        </div>
    );
};

export { ProductCard, CategorySlider };
