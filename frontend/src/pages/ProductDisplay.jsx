import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, Truck, CornerDownLeft, Star, ShoppingCart, Lock, Plus, Minus, CreditCard, ChevronDown, UserCircle, ShieldAlert, ShoppingBag } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '../features/cart/cartSlice';
import { addReview, initializeReviewsIfEmpty } from '../features/reviews/reviewsSlice';
import { addToWishlist, removeFromWishlist } from '../features/wishlist/wishlistSlice';
import { Heart } from 'lucide-react';

const ProductDisplay = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { product: items, status, user, role } = useSelector(state => ({
        product: state.cart.items,
        status: state.cart.status,
        user: state.user.user,
        role: state.user.user?.role
    }));
    const [productData, setProductData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);
    const dispatch = useDispatch();
    const wishlistItems = useSelector(state => state.wishlist.items);
    const isInWishlist = wishlistItems.some(item => item.id === productData?.id);

    // UI mock states
    const [activeImage, setActiveImage] = useState(0);
    const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });

    const handleMouseMove = (e) => {
        const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
        const x = ((e.pageX - left) / width) * 100;
        const y = ((e.pageY - top) / height) * 100;
        setZoomPos({ x, y });
    };

    const handleFetchProduct = async () => {
        setIsLoading(true);
        try {
            const res = await fetch(`/api/products/${id}`);
            const data = await res.json();
            if (res.ok) {
                setProductData(data);
            } else {
                setProductData(null);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        handleFetchProduct();
        dispatch(initializeReviewsIfEmpty({ productId: id }));
    }, [id, dispatch]);

    useEffect(() => {
        // Track recently viewed
        if (productData) {
            const recentlyViewed = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
            const newItem = {
                id: productData.id,
                name: productData.name,
                imageUrl: productData.imageUrl,
                category: productData.category?.name
            };
            
            // Remove if already exists and add to front
            const filtered = recentlyViewed.filter(item => item.id !== newItem.id);
            const updated = [newItem, ...filtered].slice(0, 10);
            localStorage.setItem('recentlyViewed', JSON.stringify(updated));
        }
    }, [productData]);

    const reviews = useSelector(state => state.reviews.productReviews[id] || []);
    const totalRatings = reviews.length;
    const averageRating = totalRatings > 0
        ? (reviews.reduce((acc, r) => acc + r.rating, 0) / totalRatings).toFixed(1)
        : 0;

    const [reviewForm, setReviewForm] = useState({ rating: 5, user: '', comment: '' });

    const handleReviewSubmit = (e) => {
        e.preventDefault();
        if (!reviewForm.comment.trim()) return;
        dispatch(addReview({
            productId: id,
            ...reviewForm
        }));
        setReviewForm({ rating: 5, user: '', comment: '' });
    };

    const handleQuantityChange = (type) => {
        if (type === 'inc' && productData && quantity < productData.stock) {
            setQuantity(prev => prev + 1);
        } else if (type === 'dec' && quantity > 1) {
            setQuantity(prev => prev - 1);
        }
    };

    const handleAddToCart = () => {
        if (!productData) return;
        dispatch(addToCart({
            id: productData.id,
            name: productData.name,
            price: productData.effectivePrice,
            originalPrice: productData.price,
            offerPercentage: productData.offerPercentage,
            isDailyOffer: productData.isDailyOffer,
            imageUrl: productData.imageUrl,
            quantity: quantity,
            stock: productData.stock
        }));
    };

    const handleBuyNow = () => {
        if (!user) {
            navigate('/login?redirect=' + encodeURIComponent(window.location.pathname));
            return;
        }
        handleAddToCart();
        navigate('/checkout');
    };

    const handleToggleWishlist = () => {
        if (!productData) return;
        if (isInWishlist) {
            dispatch(removeFromWishlist({ id: productData.id }));
        } else {
            dispatch(addToWishlist({
                id: productData.id,
                name: productData.name,
                price: productData.effectivePrice,
                imageUrl: productData.imageUrl,
            }));
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-[80vh] flex items-center justify-center bg-slate-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
            </div>
        );
    }

    if (!productData) {
        return (
            <div className="min-h-[80vh] flex flex-col items-center justify-center bg-slate-50">
                <Package className="w-16 h-16 text-slate-300 mb-4" />
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Product Not Found</h2>
                <button onClick={() => navigate('/')} className="mt-4 px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition">Return Home</button>
            </div>
        );
    }

    const images = productData.imageUrl ? [productData.imageUrl, productData.imageUrl, productData.imageUrl] : ['https://via.placeholder.com/600x600?text=No+Image', 'https://via.placeholder.com/600x600?text=Alt+Image+1', 'https://via.placeholder.com/600x600?text=Alt+Image+2'];

    return (
        <div className="bg-white min-h-screen pb-12">
            <div className="bg-slate-50 border-b border-slate-200 py-2">
                <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8">
                    <p className="text-xs text-slate-500">
                        Home <span className="mx-1">{'>'}</span> {productData.category?.name || 'Category'} <span className="mx-1">{'>'}</span> <span className="text-slate-900 font-medium">{productData.name}</span>
                    </p>
                </div>
            </div>

            <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-12">

                    {/* Image Gallery (Left) */}
                    <div className="lg:col-span-5 flex flex-col-reverse md:flex-row gap-4">
                        <div className="flex flex-row md:flex-col gap-2 md:w-20 overflow-x-auto hide-scrollbar shrink-0">
                            {images.map((img, idx) => (
                                <button
                                    key={idx}
                                    onMouseEnter={() => setActiveImage(idx)}
                                    className={`w-16 h-16 md:w-16 md:h-16 rounded-xl border-2 transition-all overflow-hidden shrink-0 ${activeImage === idx ? 'border-orange-500 shadow-md ring-2 ring-orange-200' : 'border-slate-200 hover:border-slate-300'}`}
                                >
                                    <img src={img} alt={`Thumb ${idx}`} className="w-full h-full object-contain mix-blend-multiply bg-slate-50" />
                                </button>
                            ))}
                        </div>
                        <div
                            className="flex-1 bg-slate-50 rounded-2xl border border-slate-100 p-8 flex items-center justify-center relative overflow-hidden group min-h-[400px]"
                            onMouseMove={handleMouseMove}
                            onMouseLeave={() => setZoomPos({ x: 50, y: 50 })}
                        >
                            {productData.offerPercentage > 0 && (
                                <div className="absolute top-4 left-4 bg-red-600 text-white font-bold px-3 py-1 rounded-full z-10 shadow-lg text-sm">
                                    {productData.offerPercentage}% OFF
                                </div>
                            )}
                            <motion.img
                                key={activeImage}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.3 }}
                                src={images[activeImage]}
                                alt={productData.name}
                                style={{ transformOrigin: `${zoomPos.x}% ${zoomPos.y}%` }}
                                className="w-full h-full object-contain mix-blend-multiply group-hover:scale-[2] transition-transform duration-200 cursor-crosshair"
                            />
                        </div>
                    </div>

                    {/* Product Details (Middle) */}
                    <div className="lg:col-span-4 flex flex-col pt-2">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">{productData.category?.name}</span>
                            {productData.subCategory && <span className="text-xs text-slate-500">| {productData.subCategory.name}</span>}
                        </div>
                        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 leading-tight mb-2 tracking-tight">
                            {productData.name}
                        </h1>

                        <div className="flex items-center gap-4 mb-4 pb-4 border-b border-slate-200">
                            <div className="flex text-yellow-500">
                                {Array.from({ length: 5 }).map((_, i) => (
                                    <Star key={i} className={`w-4 h-4 ${i < Math.round(averageRating) ? 'fill-current' : 'text-slate-300'}`} />
                                ))}
                                <span className="text-slate-900 font-bold ml-2 text-sm">{averageRating > 0 ? averageRating : 'No ratings yet'}</span>
                            </div>
                            <span className="text-sm font-medium text-blue-600 hover:text-orange-600 cursor-pointer">{totalRatings} ratings</span>
                            <span className="text-slate-300">|</span>
                            <span className="text-sm text-slate-600 font-medium">10K+ bought in past month</span>
                        </div>

                        <div className="mb-6">
                            <div className="flex items-end gap-3 mb-1">
                                <span className="text-3xl text-red-600 font-light">-{(productData.offerPercentage || 0)}%</span>
                                <div className="flex items-start">
                                    <span className="text-sm font-bold text-slate-900 mt-1">₹</span>
                                    <span className="text-4xl font-black text-slate-900 leading-none">{Math.floor(productData.effectivePrice)}</span>
                                    <span className="text-sm font-bold text-slate-900 mt-1">.{(productData.effectivePrice % 1).toFixed(2).substring(2)}</span>
                                </div>
                            </div>
                            {productData.offerPercentage > 0 && (
                                <p className="text-sm text-slate-600 font-medium">MRP price: <span className="line-through">₹{Number(productData.price).toFixed(2)}</span></p>
                            )}
                            <p className="text-sm text-slate-900 mt-3 font-medium flex items-center gap-2">
                                <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-xs">Returns</span>
                                FREE Returns
                            </p>
                            <p className="text-sm text-slate-600 mt-1">All prices include tax.</p>
                        </div>

                        <div className="mb-6">
                            <h3 className="font-bold text-slate-900 mb-2">About this item</h3>
                            <div className="text-slate-700 text-sm space-y-2 whitespace-pre-line leading-relaxed border border-slate-100 p-4 bg-slate-50 rounded-xl relative">
                                <span className="absolute top-0 right-0 p-4 text-slate-200">
                                    <Package className="w-16 h-16 opacity-50" />
                                </span>
                                <div className="relative z-10">{productData.description}</div>
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-2 py-4 border-y border-slate-200 mt-4">
                            <div className="flex flex-col items-center justify-center p-3 text-center bg-slate-50 rounded-lg">
                                <Shield className="w-6 h-6 text-green-600 mb-1" />
                                <span className="text-[10px] font-bold text-slate-700 leading-tight">1 Year<br />Warranty</span>
                            </div>
                            <div className="flex flex-col items-center justify-center p-3 text-center bg-slate-50 rounded-lg">
                                <Truck className="w-6 h-6 text-blue-600 mb-1" />
                                <span className="text-[10px] font-bold text-slate-700 leading-tight">QuickCart<br />Delivered</span>
                            </div>
                            <div className="flex flex-col items-center justify-center p-3 text-center bg-slate-50 rounded-lg">
                                <CornerDownLeft className="w-6 h-6 text-orange-600 mb-1" />
                                <span className="text-[10px] font-bold text-slate-700 leading-tight">10 Days<br />Replacement</span>
                            </div>
                        </div>
                    </div>

                    {/* Checkout Card (Right) */}
                    <div className="lg:col-span-3">
                        <div className="bg-white border-2 border-slate-200 rounded-2xl shadow-xl p-6 sticky top-24">
                            <span className="text-xl font-bold text-slate-900 block mb-3">₹{productData.effectivePrice.toFixed(2)}</span>

                            <p className="text-sm font-medium text-slate-900 mb-1">
                                FREE delivery <span className="font-bold">Wednesday, Nov 12</span>. Order within 11 hrs 30 mins
                            </p>
                            <p className="text-sm text-slate-600 flex items-center mb-6">
                                <MapPin className="w-4 h-4 text-slate-400 mr-1" />
                                <span className="text-blue-600 hover:text-orange-500 hover:underline cursor-pointer">Deliver to Select Location</span>
                            </p>

                            <h3 className="text-xl font-extrabold text-green-700 mb-4">{productData.stock > 0 ? 'In Stock' : 'Out of Stock'}</h3>

                            <div className="mb-5">
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Quantity:</label>
                                <div className="flex items-center w-min border border-slate-300 rounded-lg overflow-hidden shadow-sm bg-white">
                                    <button
                                        onClick={() => handleQuantityChange('dec')}
                                        disabled={quantity <= 1}
                                        className="w-10 h-10 flex items-center justify-center bg-slate-50 hover:bg-slate-200 disabled:opacity-50 transition"
                                    >
                                        <Minus className="w-4 h-4 text-slate-600" />
                                    </button>
                                    <span className="w-12 h-10 flex items-center justify-center font-bold text-slate-900 bg-white border-x border-slate-200">
                                        {quantity}
                                    </span>
                                    <button
                                        onClick={() => handleQuantityChange('inc')}
                                        disabled={quantity >= productData.stock}
                                        className="w-10 h-10 flex items-center justify-center bg-slate-50 hover:bg-slate-200 disabled:opacity-50 transition"
                                    >
                                        <Plus className="w-4 h-4 text-slate-600" />
                                    </button>
                                </div>
                                <p className="text-[10px] text-slate-400 mt-2">Max limit: {productData.stock} per user</p>
                            </div>

                            <div className="space-y-4">
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
                                                <span className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">Access Restricted</span>
                                            </div>
                                            <h4 className="text-sm font-bold text-slate-900 mb-2 font-poppins">Feature Locked for {role === 'ADMIN' ? 'Sellers' : 'Agents'}</h4>
                                            <p className="text-xs text-slate-600 leading-relaxed font-medium">
                                                To maintain marketplace integrity, <span className="text-slate-900 font-bold">{role === 'ADMIN' ? 'Sellers' : 'Delivery Agents'}</span> are restricted from placing orders. 
                                                Please switch to a <span className="text-orange-500 font-bold">Standard Customer</span> account to shop.
                                            </p>
                                        </div>
                                    </motion.div>
                                ) : (
                                    <>
                                        <button onClick={handleAddToCart} className="w-full py-3.5 px-4 bg-yellow-400 hover:bg-yellow-500 rounded-full text-slate-900 font-bold shadow-sm transition-transform active:scale-95 flex items-center justify-center">
                                            <ShoppingCart className="w-5 h-5 mr-2" />
                                            Add to Cart
                                        </button>
                                        <button onClick={handleBuyNow} className="w-full py-3.5 px-4 bg-orange-500 hover:bg-orange-600 rounded-full text-white font-bold shadow-md shadow-orange-500/30 transition-transform active:scale-95 flex items-center justify-center">
                                            <CreditCard className="w-5 h-5 mr-2" />
                                            Buy Now
                                        </button>
                                    </>
                                )}
                                <button onClick={handleToggleWishlist} className={`w-full py-3.5 px-4 rounded-full font-bold shadow-sm transition-transform active:scale-95 flex items-center justify-center border-2 ${isInWishlist ? 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'}`}>
                                    <Heart className={`w-5 h-5 mr-2 ${isInWishlist ? 'fill-current' : ''}`} />
                                    {isInWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}
                                </button>
                            </div>

                            <div className="mt-6 space-y-3 text-xs text-slate-600 border-t border-slate-200 pt-5">
                                <div className="flex items-center justify-between">
                                    <span>Ships from</span>
                                    <span className="font-medium text-slate-900">QuickCart</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span>Sold by</span>
                                    <span className="font-medium text-slate-900">QuickCart Global</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span>Returns</span>
                                    <span className="font-medium text-blue-600">Eligible for Return</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span>Payment</span>
                                    <span className="font-medium text-blue-600 flex items-center"><Lock className="w-3 h-3 mr-1 text-green-600" /> Secure transaction</span>
                                </div>
                            </div>

                            <div className="mt-4 pt-4 border-t border-slate-200">
                                <div className="flex items-start gap-2">
                                    <input type="checkbox" id="gift" className="mt-1 flex-shrink-0 cursor-pointer accent-orange-500" />
                                    <label htmlFor="gift" className="text-sm text-slate-700 cursor-pointer">
                                        Add a gift receipt for easy returns
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>

                {/* Customer Reviews Section */}
                <div className="mt-12 bg-white border border-slate-200 rounded-2xl p-6 lg:p-10 shadow-sm">
                    <h2 className="text-2xl font-bold text-slate-900 mb-8 border-b border-slate-200 pb-4">Customer Reviews</h2>

                    <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
                        {/* Rating Summary (Left) */}
                        <div className="md:col-span-4 lg:col-span-3">
                            <h3 className="font-bold text-xl text-slate-900 mb-2">Customer rating</h3>
                            <div className="flex items-center text-yellow-500 mb-2">
                                {Array.from({ length: 5 }).map((_, i) => (
                                    <Star key={i} className={`w-5 h-5 ${i < Math.round(averageRating) ? 'fill-current' : 'text-slate-300'}`} />
                                ))}
                                <span className="text-slate-900 font-bold ml-3 text-lg">{averageRating} out of 5</span>
                            </div>
                            <p className="text-slate-500 text-sm mb-6">{totalRatings} global ratings</p>

                            {/* Write a Review Button to Trigger Focus */}
                            <div className="bg-slate-50 p-5 rounded-xl border border-slate-200">
                                <h3 className="font-bold text-slate-900 mb-1">Review this product</h3>
                                <p className="text-sm text-slate-600 mb-4">Share your thoughts with other customers</p>
                                <button onClick={() => document.getElementById('review-form').scrollIntoView({ behavior: 'smooth' })} className="w-full py-2 bg-white border border-slate-300 hover:bg-slate-50 rounded-xl font-medium shadow-sm transition-colors text-slate-800">
                                    Write a product review
                                </button>
                            </div>
                        </div>

                        {/* Review List & Form (Right) */}
                        <div className="md:col-span-8 lg:col-span-9">
                            <h3 className="font-bold text-lg text-slate-900 mb-4">Top reviews</h3>

                            {reviews.length === 0 ? (
                                <p className="text-slate-500 mb-8">No reviews yet. Be the first to review this product!</p>
                            ) : (
                                <div className="space-y-6 mb-10">
                                    {reviews.map((req) => (
                                        <div key={req.id} className="border-b border-slate-100 pb-6">
                                            <div className="flex items-center gap-2 mb-2">
                                                <UserCircle className="w-8 h-8 text-slate-300" />
                                                <span className="font-bold text-slate-800">{req.user}</span>
                                            </div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <div className="flex text-yellow-500">
                                                    {Array.from({ length: 5 }).map((_, i) => (
                                                        <Star key={i} className={`w-3.5 h-3.5 ${i < req.rating ? 'fill-current' : 'text-slate-300'}`} />
                                                    ))}
                                                </div>
                                                <span className="text-sm font-bold text-slate-900">Verified Purchase</span>
                                            </div>
                                            <p className="text-xs text-slate-500 mb-3">Reviewed on {req.date}</p>
                                            <p className="text-slate-800 text-sm leading-relaxed">{req.comment}</p>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Add Review Form */}
                            <div id="review-form" className="bg-slate-50 p-6 rounded-2xl border border-slate-200 mt-8 scroll-mt-24">
                                <h3 className="text-lg font-bold text-slate-900 mb-4 border-b border-slate-200 pb-2">Add Your Review</h3>
                                <form onSubmit={handleReviewSubmit} className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-semibold text-slate-700 mb-1">Your Name (Optional)</label>
                                            <input
                                                type="text"
                                                value={reviewForm.user}
                                                onChange={e => setReviewForm({ ...reviewForm, user: e.target.value })}
                                                placeholder="Your Name"
                                                className="w-full px-4 py-2 bg-white border border-slate-300 text-slate-800 rounded-lg outline-none focus:border-orange-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-slate-700 mb-1">Rating</label>
                                            <div className="relative">
                                                <select
                                                    value={reviewForm.rating}
                                                    onChange={e => setReviewForm({ ...reviewForm, rating: Number(e.target.value) })}
                                                    className="w-full px-4 py-2 bg-white border border-slate-300 text-slate-900 rounded-lg outline-none focus:border-orange-500 appearance-none font-medium"
                                                >
                                                    <option value={5}>5 Stars - Excellent</option>
                                                    <option value={4}>4 Stars - Good</option>
                                                    <option value={3}>3 Stars - Average</option>
                                                    <option value={2}>2 Stars - Poor</option>
                                                    <option value={1}>1 Star - Terrible</option>
                                                </select>
                                                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-1">Review</label>
                                        <textarea
                                            required
                                            value={reviewForm.comment}
                                            onChange={e => setReviewForm({ ...reviewForm, comment: e.target.value })}
                                            rows="4"
                                            placeholder="What did you like or dislike? What did you use this product for?"
                                            className="w-full px-4 py-2 bg-white border border-slate-300 text-slate-900 rounded-lg outline-none focus:border-orange-500 text-sm whitespace-pre-line"
                                        ></textarea>
                                    </div>

                                    <div className="flex justify-end pt-2">
                                        <button type="submit" className="px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl shadow-sm transition-transform active:scale-95">
                                            Submit Review
                                        </button>
                                    </div>
                                </form>
                            </div>

                        </div>
                    </div>
                </div>
            </div>
            {/* Fixed Bottom Action Bar for Mobile */}
            <div className="md:hidden fixed bottom-[64px] left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-slate-100 p-4 z-[90] flex items-center gap-3 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] safe-area-bottom">
                <div className="flex-1">
                    <button 
                        onClick={handleAddToCart}
                        disabled={productData.stock === 0}
                        className="w-full py-4 px-4 bg-slate-900 overflow-hidden text-white rounded-2xl font-black text-[13px] shadow-xl active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        <ShoppingCart size={16} /> Add to Cart
                    </button>
                </div>
                <button 
                    onClick={handleBuyNow}
                    disabled={productData.stock === 0}
                    className="flex-1 py-4 px-4 bg-orange-500 hover:bg-orange-600 text-white rounded-2xl font-black text-[13px] shadow-xl shadow-orange-100 active:scale-95 transition-all disabled:opacity-50 text-center"
                >
                    Buy Now
                </button>
            </div>
        </div>
    );
};

export default ProductDisplay;

const MapPin = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
);
const Package = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="16.5" y1="9.4" x2="7.5" y2="4.21"></line><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
)
