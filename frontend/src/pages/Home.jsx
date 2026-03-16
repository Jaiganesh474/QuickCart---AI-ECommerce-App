import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ChevronRight, ChevronLeft, Award, Truck, ShieldCheck, Tag, ShoppingCart, Star, List, Package } from 'lucide-react';
import { ProductCard, CategorySlider } from '../components/sliders/CategorySlider';

const Home = () => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [dailyOffers, setDailyOffers] = useState([]);
    const [banners, setBanners] = useState([]);
    const [currentBanner, setCurrentBanner] = useState(0);

    // For simple filter
    const [filterCategory, setFilterCategory] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const navigate = useNavigate();
    const location = useLocation();

    // Refs for sliders
    const dailyOffersRef = useRef(null);
    const topProductsRef = useRef(null);

    const scrollSlider = (ref, direction) => {
        if (ref.current) {
            const scrollAmount = direction === 'left' ? -300 : 300;
            ref.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
    };

    // Setup search reading from url
    const queryParams = new URLSearchParams(location.search);
    const searchQuery = queryParams.get('search');
    const categoryQuery = queryParams.get('category');
    const minPriceQuery = queryParams.get('minPrice');
    const maxPriceQuery = queryParams.get('maxPrice');

    useEffect(() => {
        const fetchHomeData = async () => {
            setIsLoading(true);
            try {
                // Fetch categories
                const catRes = await fetch('/api/categories');
                const catData = await catRes.json();
                setCategories(catData);

                // Fetch products
                const prodRes = await fetch('/api/products');
                const prodData = await prodRes.json();

                // Fetch daily offers (or just filter locally if we want)
                const offerRes = await fetch('/api/products/daily-offers');
                const offerData = await offerRes.json();
                setDailyOffers(offerData);

                // Fetch banners
                const bannerRes = await fetch('/api/banners');
                const bannerData = await bannerRes.json();
                setBanners(bannerData);

                let filtered = prodData;

                // Handle string search query
                if (searchQuery) {
                    filtered = filtered.filter(p =>
                        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()))
                    );
                }

                // Handle category sidebar query
                if (categoryQuery) {
                    filtered = filtered.filter(p => p.category?.id?.toString() === categoryQuery);
                }

                // Handle price filter query
                if (minPriceQuery !== null && maxPriceQuery !== null) {
                    filtered = filtered.filter(p => {
                        const effectivePrice = p.offerPercentage ? p.price - (p.price * (p.offerPercentage / 100)) : p.price;
                        return effectivePrice >= Number(minPriceQuery) && effectivePrice <= Number(maxPriceQuery);
                    });
                }

                setProducts(filtered);

            } catch (err) {
                console.error("Error fetching home data:", err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchHomeData();
    }, [searchQuery, categoryQuery, minPriceQuery, maxPriceQuery]);

    useEffect(() => {
        if (banners.length <= 1) return;
        const interval = setInterval(() => {
            setCurrentBanner(prev => (prev + 1) % banners.length);
        }, 5000);
        return () => clearInterval(interval);
    }, [banners]);

    const nextBanner = () => setCurrentBanner(prev => (prev + 1) % banners.length);
    const prevBanner = () => setCurrentBanner(prev => (prev - 1 + banners.length) % banners.length);

    // Derived states
    const displayProducts = filterCategory
        ? products.filter(p => p.category?.id === filterCategory)
        : products;

    return (
        <div className="bg-[#e3e6e6] min-h-screen">
            {/* Banner Area */}
            <div className="relative w-full h-[220px] md:h-[400px] lg:h-[450px] bg-slate-200 overflow-hidden group">
                {banners.length > 0 ? (
                    banners.map((banner, idx) => (
                        <div key={banner.id} className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ${idx === currentBanner ? 'opacity-100 z-0' : 'opacity-0 -z-10'}`}>
                            <img src={banner.imageUrl} alt="Promo Banner" className="w-full h-full object-cover object-top" />
                        </div>
                    ))
                ) : (
                    <div className="absolute inset-0 w-full h-full pointer-events-none bg-gradient-to-r from-slate-700 to-slate-900"></div>
                )}

                {banners.length > 1 && (
                    <>
                        <button onClick={prevBanner} className="absolute top-[40%] left-2 z-20 bg-white/30 backdrop-blur-sm p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                            <ChevronLeft className="w-6 h-6 text-white" />
                        </button>
                        <button onClick={nextBanner} className="absolute top-[40%] right-2 z-20 bg-white/30 backdrop-blur-sm p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                            <ChevronRight className="w-6 h-6 text-white" />
                        </button>
                    </>
                )}
                <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-[#e3e6e6] to-transparent z-10 pointer-events-none"></div>
            </div>

            <div className="max-w-[1500px] mx-auto px-2 md:px-8 relative z-20 -mt-32 md:-mt-52 pb-16">
                
                {/* Category Quick Links - Amazon Style Icon Row */}
                <div className="bg-white p-4 mb-8 shadow-xl border border-slate-100 rounded-xl md:rounded-2xl overflow-x-auto hide-scrollbar whitespace-nowrap">
                    <div className="flex items-start gap-8 md:gap-14 px-4 py-1">
                        {categories.map((cat) => (
                            <button 
                                key={cat.id} 
                                onClick={() => navigate(`/category/${cat.id}`)}
                                className="flex flex-col items-center gap-1 group shrink-0"
                            >
                                <div className="w-14 h-14 md:w-16 md:h-16 rounded-xl bg-slate-50 flex items-center justify-center border border-slate-100 group-hover:border-orange-400 group-hover:bg-orange-50 transition-all shadow-sm overflow-hidden">
                                     <img 
                                        src={cat.imageUrl || `https://api.dicebear.com/7.x/shapes/svg?seed=${cat.name}`} 
                                        alt={cat.name} 
                                        className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
                                    />
                                </div>
                                <span className="text-[11px] md:text-sm font-bold text-slate-700 group-hover:text-orange-600 transition-colors">{cat.name}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Today's Deals Slider */}
                {dailyOffers.length > 0 && !searchQuery && !filterCategory && (
                    <div className="mb-8 bg-white p-4 md:p-6 shadow-xl border border-slate-100 rounded-xl md:rounded-2xl relative z-20 group">
                        <div className="flex items-center justify-start gap-4 mb-4">
                            <h2 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">Today's Deals</h2>
                            <span className="text-sm font-semibold text-[#007185] hover:text-[#C7511F] hover:underline cursor-pointer">See all deals</span>
                        </div>

                        <button onClick={() => scrollSlider(dailyOffersRef, 'left')} className="absolute left-3 top-[55%] -translate-y-1/2 z-30 bg-white/95 shadow-lg border border-slate-100 text-slate-800 p-2.5 rounded-full flex items-center justify-center hover:bg-slate-50 transition opacity-0 group-hover:opacity-100 disabled:opacity-0 active:scale-95">
                            <ChevronLeft className="w-6 h-6" />
                        </button>
                        <button onClick={() => scrollSlider(dailyOffersRef, 'right')} className="absolute right-3 top-[55%] -translate-y-1/2 z-30 bg-white/95 shadow-lg border border-slate-100 text-slate-800 p-2.5 rounded-full flex items-center justify-center hover:bg-slate-50 transition opacity-0 group-hover:opacity-100 disabled:opacity-0 active:scale-95">
                            <ChevronRight className="w-6 h-6" />
                        </button>

                        <div ref={dailyOffersRef} className="flex gap-4 overflow-x-auto pb-4 snap-x hide-scrollbar scroll-smooth">
                            {dailyOffers.map(offer => (
                                <div
                                    key={offer.id}
                                    onClick={() => navigate(`/product/${offer.id}`)}
                                    className="w-44 md:w-56 shrink-0 cursor-pointer snap-start relative group/item flex flex-col"
                                >
                                    <div className="h-44 md:h-56 w-full bg-slate-50 overflow-hidden relative p-4 flex items-center justify-center rounded-lg mb-3 border border-slate-50">
                                        <img src={offer.imageUrl || 'https://via.placeholder.com/300x200?text=No+Image'} alt={offer.name} className="max-w-full max-h-full mix-blend-multiply object-contain transition-transform duration-500 group-hover/item:scale-105" />
                                    </div>
                                    <div className="flex flex-col gap-1 px-1">
                                        {offer.offerPercentage > 0 && (
                                            <div className="flex items-center gap-2">
                                                <span className="bg-[#CC0C39] text-white text-[10px] font-black px-1.5 py-0.5 rounded shadow-sm">
                                                    {offer.offerPercentage}% off
                                                </span>
                                                <span className="text-[#CC0C39] text-[10px] font-bold">Deal</span>
                                            </div>
                                        )}
                                        <div className="flex items-baseline gap-1 mt-0.5">
                                            <span className="text-[10px] font-bold text-slate-900">₹</span>
                                            <span className="font-bold text-lg text-slate-900 leading-none">{Math.floor(offer.effectivePrice)}</span>
                                            {offer.offerPercentage > 0 && (
                                                <span className="text-[10px] font-normal text-[#565959] line-through ml-1">₹{offer.price.toFixed(0)}</span>
                                            )}
                                        </div>
                                        <h3 className="text-slate-800 leading-tight line-clamp-1 text-xs md:text-sm mt-0.5">{offer.name}</h3>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* All products by category - Sliders */}
                {!searchQuery && !filterCategory && categories.length > 0 && (
                    <div className="space-y-8">
                        {categories.map(cat => {
                             const catProducts = products.filter(p => p.category?.id === cat.id);
                             if (catProducts.length === 0) return null;
                             return <CategorySlider key={cat.id} category={cat} products={catProducts} />;
                        })}
                    </div>
                )}

                {/* Filtered Results / Search Results */}
                {(searchQuery || filterCategory) && (
                    <div className="bg-white p-6 shadow-sm border border-slate-200">
                        <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-100">
                            <div>
                                <h1 className="text-2xl font-black text-slate-900">
                                    {filterCategory ? categories.find(c => c.id === filterCategory)?.name : `Results for "${searchQuery}"`}
                                </h1>
                                <p className="text-sm text-slate-500 mt-1">{displayProducts.length} items found</p>
                            </div>
                            <button onClick={() => { setFilterCategory(null); navigate('/'); }} className="text-sm font-bold text-blue-600 hover:text-orange-600">Clear all</button>
                        </div>

                        {displayProducts.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                                {displayProducts.map(product => (
                                    <ProductCard key={product.id} product={product} />
                                ))}
                            </div>
                        ) : (
                            <div className="py-20 flex flex-col items-center justify-center">
                                <Package className="w-16 h-16 text-slate-200 mb-4" />
                                <h3 className="text-xl font-bold text-slate-400">No matching products</h3>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Home;
