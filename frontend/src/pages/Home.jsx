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
            {/* Top Hero Banner Carousel Area */}
            <div className="relative w-full h-[300px] md:h-[400px] lg:h-[500px] bg-slate-200 flex justify-between px-4 overflow-hidden group">

                {banners.length > 0 ? (
                    banners.map((banner, idx) => (
                        <div key={banner.id} className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ${idx === currentBanner ? 'opacity-100 z-0' : 'opacity-0 -z-10'}`}>
                            <img src={banner.imageUrl} alt="Promo Banner" className="w-full h-full object-cover object-top" />
                        </div>
                    ))
                ) : (
                    <div className="absolute inset-0 w-full h-full pointer-events-none bg-gradient-to-r from-[#175d69] to-[#208393]">
                        <div className="absolute inset-0 w-full h-full opacity-30" style={{ backgroundImage: "radial-gradient(circle at center, #ffd166 0%, transparent 70%)" }}></div>
                    </div>
                )}

                {/* Simulated slider arrows */}
                {banners.length > 1 && (
                    <>
                        <button onClick={prevBanner} className="absolute top-1/4 left-4 z-20 hover:border-2 border-white rounded mt-4 p-2 focus:outline-none focus:ring-2 focus:ring-orange-400 opacity-0 group-hover:opacity-100 transition-opacity">
                            <ChevronLeft className="w-10 h-10 text-white opacity-90 drop-shadow-md" />
                        </button>
                        <button onClick={nextBanner} className="absolute top-1/4 right-4 z-20 hover:border-2 border-white rounded mt-4 p-2 focus:outline-none focus:ring-2 focus:ring-orange-400 opacity-0 group-hover:opacity-100 transition-opacity">
                            <ChevronRight className="w-10 h-10 text-white opacity-90 drop-shadow-md" />
                        </button>
                    </>
                )}
                {banners.length <= 1 && (
                    <>
                        <button className="absolute top-1/4 left-4 z-20 hover:border-2 border-white rounded mt-4 p-2 opacity-50 cursor-default">
                            <ChevronLeft className="w-10 h-10 text-white" />
                        </button>
                        <button className="absolute top-1/4 right-4 z-20 hover:border-2 border-white rounded mt-4 p-2 opacity-50 cursor-default">
                            <ChevronRight className="w-10 h-10 text-white" />
                        </button>
                    </>
                )}

                <div className="absolute bottom-0 left-0 w-full h-[300px] bg-gradient-to-t from-[#e3e6e6] via-transparent to-transparent z-10 pointer-events-none"></div>
            </div>


            <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 -mt-16 md:-mt-[200px] relative z-20 pb-16">

                {dailyOffers.length > 0 && (
                    <div className="mb-8 bg-white p-4 md:p-6 shadow-sm border border-slate-200 relative z-20 group">
                        <div className="flex items-center justify-start gap-4 mb-4">
                            <h2 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">Today's Deals</h2>
                            <span className="text-sm font-semibold text-[#007185] hover:text-[#C7511F] hover:underline cursor-pointer">See all deals</span>
                        </div>

                        <button onClick={() => scrollSlider(dailyOffersRef, 'left')} className="absolute left-2 top-[50%] -translate-y-1/2 z-30 bg-white/90 shadow-md border border-slate-200 text-slate-800 p-2 rounded flex items-center justify-center hover:bg-slate-50 transition opacity-0 group-hover:opacity-100 disabled:opacity-0 active:scale-95">
                            <ChevronLeft className="w-6 h-6" />
                        </button>
                        <button onClick={() => scrollSlider(dailyOffersRef, 'right')} className="absolute right-2 top-[50%] -translate-y-1/2 z-30 bg-white/90 shadow-md border border-slate-200 text-slate-800 p-2 rounded flex items-center justify-center hover:bg-slate-50 transition opacity-0 group-hover:opacity-100 disabled:opacity-0 active:scale-95">
                            <ChevronRight className="w-6 h-6" />
                        </button>

                        <div ref={dailyOffersRef} className="flex gap-4 overflow-x-auto pb-4 snap-x hide-scrollbar scroll-smooth">
                            {dailyOffers.map(offer => (
                                <div
                                    key={offer.id}
                                    onClick={() => navigate(`/product/${offer.id}`)}
                                    className="w-48 md:w-56 shrink-0 cursor-pointer snap-start relative group/item flex flex-col"
                                >
                                    <div className="h-48 md:h-56 w-full bg-slate-50 overflow-hidden relative p-2 md:p-4 flex items-center justify-center rounded-md mb-2">
                                        <img src={offer.imageUrl || 'https://via.placeholder.com/300x200?text=No+Image'} alt={offer.name} className="max-w-full max-h-full mix-blend-multiply object-contain transition-transform duration-500 group-hover/item:scale-105" />
                                    </div>
                                    <div className="flex flex-col gap-1 px-1">
                                        {offer.offerPercentage > 0 && (
                                            <div className="flex items-center gap-2">
                                                <span className="bg-[#CC0C39] text-white text-[11px] font-bold px-2 py-1 rounded-sm shadow-sm inline-block">
                                                    {offer.offerPercentage}% off
                                                </span>
                                                <span className="text-[#CC0C39] text-[11px] font-bold">Limited time deal</span>
                                            </div>
                                        )}
                                        <div className="flex items-end gap-1 mt-1 outline-none">
                                            <span className="text-xs font-normal text-slate-900 pb-[2px]">₹</span>
                                            <span className="font-medium text-xl text-slate-900 leading-none">{Math.floor(offer.effectivePrice)}</span>
                                            {offer.offerPercentage > 0 && (
                                                <span className="text-xs font-normal text-[#565959] line-through ml-1 pb-[2px]">M.R.P: ₹{offer.price.toFixed(2)}</span>
                                            )}
                                        </div>
                                        <h3 className="text-slate-900 leading-snug line-clamp-1 text-sm mt-1">{offer.name}</h3>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Shop by Category - Amazon Grid Style */}
                {categories.length > 0 && (
                    <div className="mb-8 bg-transparent hidden md:block">
                        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {categories.map((cat, idx) => {
                                // Amazon frequently puts 4 sub-items in a category card. We'll simulate that with products.
                                const catProducts = products.filter(p => p.category?.id === cat.id).slice(0, 4);
                                return (
                                    <div key={cat.id} className="bg-white p-5 shadow-sm border border-slate-200 relative z-20 flex flex-col h-full cursor-pointer group hover:shadow-md transition-shadow" onClick={() => navigate('/category/' + cat.id)}>
                                        <h2 className="text-xl font-bold text-slate-900 tracking-tight mb-4 group-hover:text-[#C7511F] transition-colors">{cat.name}</h2>

                                        <div className="flex-1">
                                            {catProducts.length > 0 ? (
                                                <div className="grid grid-cols-2 grid-rows-2 gap-4 h-[300px]">
                                                    {catProducts.map(p => (
                                                        <div key={p.id} className="flex flex-col h-full overflow-hidden gap-1.5 group/subitem">
                                                            <div className="bg-slate-50 flex-1 relative overflow-hidden rounded-md">
                                                                <img src={p.imageUrl || 'https://via.placeholder.com/150'} alt={p.name} className="absolute inset-0 w-full h-full object-cover  group-hover/subitem:scale-[1.05] transition-transform duration-500" />
                                                            </div>
                                                            <span className="text-xs text-slate-700 line-clamp-1 hover:text-[#C7511F] truncate block px-1">{p.name}</span>
                                                        </div>
                                                    ))}
                                                    {/* Fill empty spots if less than 4 */}
                                                    {Array.from({ length: Math.max(0, 4 - catProducts.length) }).map((_, i) => (
                                                        <div key={`empty-${i}`} className="bg-slate-50 flex-1 rounded-md"></div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="h-[250px] bg-slate-50 flex items-center justify-center rounded">
                                                    <span className="text-sm text-slate-400">View Category</span>
                                                </div>
                                            )}
                                        </div>

                                        <span className="text-sm font-semibold text-[#007185] hover:text-[#C7511F] group-hover:underline mt-4 inline-block">See more</span>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                )}


                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Main Product Grid (Now full width without old sidebar) */}
                    <div className="flex-1 min-w-0">
                        {(!searchQuery && !filterCategory) ? null : (
                            <div className="flex items-center justify-between mb-6 bg-white p-4 rounded-md border border-gray-200">
                                <h2 className="text-xl font-bold text-slate-900">
                                    {filterCategory ? categories.find(c => c.id === filterCategory)?.name : (searchQuery ? `Search Results for "${searchQuery}"` : 'Top Products')}
                                </h2>
                                <span className="text-sm font-medium text-slate-500 bg-slate-100 px-3 py-1 rounded-full border border-gray-200">{displayProducts.length} Results</span>
                            </div>
                        )}

                        {isLoading ? (
                            <div className="flex gap-4 md:gap-6 overflow-hidden pb-6">
                                {[1, 2, 3, 4, 5, 6].map(n => (
                                    <div key={n} className="bg-white w-[280px] shrink-0 rounded-md p-4 shadow-sm border border-slate-200 animate-pulse h-80"></div>
                                ))}
                            </div>
                        ) : displayProducts.length > 0 ? (
                            <>
                                {(!searchQuery && !filterCategory) ? (
                                    <>
                                        <div className="hidden md:block">
                                            {categories.map(cat => {
                                                const catProducts = products.filter(p => p.category?.id === cat.id);
                                                return <CategorySlider key={cat.id} category={cat} products={catProducts} />;
                                            })}
                                        </div>
                                        <div className="md:hidden">
                                            <div className="mb-4 flex items-center justify-between px-2">
                                                <h2 className="text-xl font-bold text-slate-900 tracking-tight">Discover Products</h2>
                                            </div>
                                            <div className="grid grid-cols-1 gap-4 px-2">
                                                {products.slice(0, 10).map(product => (
                                                    <ProductCard key={product.id} product={product} />
                                                ))}
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                                        {displayProducts.map(product => (
                                            <ProductCard key={product.id} product={product} />
                                        ))}
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="bg-white rounded-md border border-slate-200 py-20 flex flex-col items-center justify-center">
                                <Package className="w-16 h-16 text-slate-300 mb-4" />
                                <h3 className="text-xl font-bold text-slate-800">No products found</h3>
                                <p className="text-slate-500 mt-2 text-center max-w-sm">We couldn't find any products matching your criteria. Try adjusting your category or search.</p>
                                <button onClick={() => { setFilterCategory(null); navigate('/'); }} className="mt-6 px-6 py-2 bg-orange-500 text-white font-medium rounded-lg hover:bg-orange-600 transition shadow-md">
                                    Clear Filters
                                </button>
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
};

export default Home;
