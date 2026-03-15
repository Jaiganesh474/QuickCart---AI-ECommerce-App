import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Filter, Tag, Search, Sparkles, Star, ChevronDown, Package } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ProductCard } from '../components/sliders/CategorySlider';

const SearchPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const queryParams = new URLSearchParams(location.search);
    const searchQuery = queryParams.get('q') || '';
    const initialMinPrice = queryParams.get('minPrice') || '';
    const initialMaxPrice = queryParams.get('maxPrice') || '';

    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [recommendations, setRecommendations] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [categories, setCategories] = useState([]);

    const [minPrice, setMinPrice] = useState(initialMinPrice);
    const [maxPrice, setMaxPrice] = useState(initialMaxPrice);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [sortBy, setSortBy] = useState('relevance');

    useEffect(() => {
        const fetchSearchData = async () => {
            setIsLoading(true);
            try {
                // Fetch categories
                const catRes = await fetch('/api/categories');
                const catData = await catRes.json();
                setCategories(catData);

                // Fetch products
                const prodRes = await fetch('/api/products');
                const prodData = await prodRes.json();

                // Filter products based on search query
                const results = prodData.filter(p => 
                    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
                    (p.category && p.category.name.toLowerCase().includes(searchQuery.toLowerCase()))
                );

                setProducts(results);
                setFilteredProducts(results);

                // Fetch AI recommendations for relatable products
                if (searchQuery) {
                const AI_URL = import.meta.env.VITE_AI_SERVICE_URL || 'https://quickcart-ai-ecommerce-app.onrender.com/api';
                const aiRes = await fetch(`${AI_URL.replace(/\/+$/, '')}/recommend`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            searches: [searchQuery],
                            history: []
                        })
                    })
                    .then(res => res.json())
                    .then(data => {
                        if (data.status === 'success' && data.recommendations.length > 0) {
                            // Find products that match the recommended categories/terms
                            const recTerms = data.recommendations;
                            const recProducts = prodData.filter(p => 
                                !results.some(r => r.id === p.id) && // Don't include already found results
                                (recTerms.some(term => p.name.toLowerCase().includes(term.toLowerCase())) ||
                                 recTerms.some(term => p.category?.name.toLowerCase().includes(term.toLowerCase())))
                            ).slice(0, 8);
                            setRecommendations(recProducts);
                        }
                    })
                    .catch(e => console.error("Rec error:", e));
                }

            } catch (err) {
                console.error("Search fetch error:", err);
            } finally {
                setIsLoading(false);
            }
        };

        if (searchQuery) {
            fetchSearchData();
        } else {
            navigate('/');
        }
    }, [searchQuery, navigate]);

    useEffect(() => {
        let temp = [...products];

        // Sync URL (but avoid infinite loops)
        const params = new URLSearchParams();
        params.set('q', searchQuery);
        if (minPrice) params.set('minPrice', minPrice);
        if (maxPrice) params.set('maxPrice', maxPrice);
        if (selectedCategory !== 'all') params.set('category', selectedCategory);
        if (sortBy !== 'relevance') params.set('sort', sortBy);
        
        const newSearch = '?' + params.toString();
        if (location.search !== newSearch) {
            navigate('/search' + newSearch, { replace: true });
        }

        // Category Filter
        if (selectedCategory !== 'all') {
            temp = temp.filter(p => p.category?.id.toString() === selectedCategory);
        }

        // Price Filter
        if (minPrice !== '') {
            temp = temp.filter(p => {
                const effectivePrice = p.offerPercentage ? p.price - (p.price * (p.offerPercentage / 100)) : p.price;
                return effectivePrice >= Number(minPrice);
            });
        }
        if (maxPrice !== '') {
            temp = temp.filter(p => {
                const effectivePrice = p.offerPercentage ? p.price - (p.price * (p.offerPercentage / 100)) : p.price;
                return effectivePrice <= Number(maxPrice);
            });
        }

        // Sorting
        if (sortBy === 'priceLowHigh') {
            temp.sort((a, b) => {
                const priceA = a.offerPercentage ? a.price * (1 - a.offerPercentage / 100) : a.price;
                const priceB = b.offerPercentage ? b.price * (1 - b.offerPercentage / 100) : b.price;
                return priceA - priceB;
            });
        } else if (sortBy === 'priceHighLow') {
            temp.sort((a, b) => {
                const priceA = a.offerPercentage ? a.price * (1 - a.offerPercentage / 100) : a.price;
                const priceB = b.offerPercentage ? b.price * (1 - b.offerPercentage / 100) : b.price;
                return priceB - priceA;
            });
        }

        setFilteredProducts(temp);
    }, [minPrice, maxPrice, selectedCategory, sortBy, products]);

    return (
        <div className="bg-[#f0f2f2] min-h-screen pb-20">
            {/* Search Header */}
            <div className="bg-white border-b border-slate-200 py-4 mb-6 shadow-sm sticky top-16 z-30">
                <div className="max-w-[1500px] mx-auto px-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                        <span className="text-slate-500 text-sm">Showing results for</span>
                        <h1 className="text-xl font-bold text-slate-900">"{searchQuery}"</h1>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center bg-slate-100 rounded-lg px-3 py-1.5 border border-slate-200">
                            <span className="text-xs font-bold text-slate-500 mr-2">Sort by:</span>
                            <select 
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="bg-transparent text-sm font-bold text-slate-700 outline-none cursor-pointer"
                            >
                                <option value="relevance">Relevance</option>
                                <option value="priceLowHigh">Price: Low to High</option>
                                <option value="priceHighLow">Price: High to Low</option>
                                <option value="rating">Avg. Customer Review</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-[1500px] mx-auto px-4 flex flex-col lg:flex-row gap-8">
                {/* Left Sidebar - Filters */}
                <div className="w-full lg:w-72 shrink-0 space-y-6">
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                        <div className="flex items-center justify-between mb-4 border-b pb-4">
                            <h2 className="text-lg font-black text-slate-900 flex items-center gap-2 tracking-tight">
                                <Filter size={18} className="text-orange-500" /> FILTERS
                            </h2>
                            <button 
                                onClick={() => { setMinPrice(''); setMaxPrice(''); setSelectedCategory('all'); }}
                                className="text-xs font-bold text-blue-600 hover:text-orange-600 hover:underline"
                            >
                                Clear All
                            </button>
                        </div>

                        {/* Category Filter */}
                        <div className="mb-6">
                            <h3 className="font-bold text-slate-900 text-sm mb-4 uppercase tracking-widest">Departments</h3>
                            <div className="space-y-2">
                                <button 
                                    onClick={() => setSelectedCategory('all')}
                                    className={`block text-sm w-full text-left py-1 transition-colors ${selectedCategory === 'all' ? 'text-orange-600 font-bold' : 'text-slate-600 hover:text-orange-500'}`}
                                >
                                    All Departments
                                </button>
                                {categories.map(cat => (
                                    <button 
                                        key={cat.id}
                                        onClick={() => setSelectedCategory(cat.id.toString())}
                                        className={`block text-sm w-full text-left py-1 transition-colors ${selectedCategory === cat.id.toString() ? 'text-orange-600 font-bold pl-2 border-l-2 border-orange-500' : 'text-slate-600 hover:text-orange-500 hover:pl-2'}`}
                                    >
                                        {cat.name}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Price Filter */}
                        <div>
                            <h3 className="font-bold text-slate-900 text-sm mb-4 uppercase tracking-widest flex items-center gap-2">
                                <Tag size={14} className="text-slate-400" /> Price Range
                            </h3>
                            <div className="grid grid-cols-2 gap-2 mb-4">
                                <div className="relative">
                                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 text-xs text-bold">₹</span>
                                    <input 
                                        type="number" 
                                        placeholder="Min" 
                                        value={minPrice}
                                        onChange={e => setMinPrice(e.target.value)}
                                        className="w-full pl-6 pr-2 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all"
                                    />
                                </div>
                                <div className="relative">
                                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 text-xs text-bold">₹</span>
                                    <input 
                                        type="number" 
                                        placeholder="Max" 
                                        value={maxPrice}
                                        onChange={e => setMaxPrice(e.target.value)}
                                        className="w-full pl-6 pr-2 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                {[
                                    { label: 'Under ₹500', min: 0, max: 500 },
                                    { label: '₹500 - ₹2,000', min: 500, max: 2000 },
                                    { label: '₹2,000 - ₹5,000', min: 2000, max: 5000 },
                                    { label: 'Over ₹5,000', min: 5000, max: 999999 }
                                ].map((range, i) => (
                                    <button 
                                        key={i}
                                        onClick={() => { setMinPrice(range.min); setMaxPrice(range.max); }}
                                        className="block text-sm text-slate-600 hover:text-orange-500 hover:underline"
                                    >
                                        {range.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Area - Results Grid */}
                <div className="flex-1">
                    {/* Main Results */}
                    <div className="mb-10">
                        {isLoading ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                {[1, 2, 3, 4, 5, 6, 7, 8].map(n => (
                                    <div key={n} className="bg-white rounded-xl p-4 shadow-sm border border-slate-200 animate-pulse h-80"></div>
                                ))}
                            </div>
                        ) : filteredProducts.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                {filteredProducts.map((product) => (
                                    <ProductCard key={product.id} product={product} />
                                ))}
                            </div>
                        ) : (
                            <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center shadow-sm">
                                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <Search className="w-10 h-10 text-slate-200" />
                                </div>
                                <h2 className="text-2xl font-bold text-slate-900 mb-2">No results for "{searchQuery}"</h2>
                                <p className="text-slate-500 max-w-sm mx-auto mb-8">Try checking your spelling or use more general terms. We've listed some relatable items you might like below.</p>
                                <button 
                                    onClick={() => navigate('/')}
                                    className="px-8 py-3 bg-orange-500 text-white font-bold rounded-full hover:bg-orange-600 transition shadow-lg shadow-orange-500/20 active:scale-95"
                                >
                                    Continue Shopping
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Relatable Products (AI Powered) */}
                    <AnimatePresence>
                        {recommendations.length > 0 && (
                            <motion.div 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mt-12 pt-12 border-t border-slate-300"
                            >
                                <div className="flex items-center gap-3 mb-8">
                                    <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
                                        <Sparkles className="text-orange-500 w-6 h-6" />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Relatable Products</h2>
                                        <p className="text-sm text-slate-500 font-medium">Picked by QuickCart AI based on your search</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                    {recommendations.map((product) => (
                                        <ProductCard key={product.id} product={product} className="border-orange-100 bg-orange-50/20" />
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

export default SearchPage;
