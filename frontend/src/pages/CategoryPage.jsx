import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Filter, Tag } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { ProductCard } from '../components/sliders/CategorySlider';

const CategoryPage = () => {
    const { id: categoryId } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [categoryName, setCategoryName] = useState('Category');
    const [isLoading, setIsLoading] = useState(true);

    const [minPrice, setMinPrice] = useState('');
    const [maxPrice, setMaxPrice] = useState('');

    useEffect(() => {
        const fetchCategoryData = async () => {
            setIsLoading(true);
            try {
                // Fetch categories to get the name
                const catRes = await fetch('/api/categories');
                const catData = await catRes.json();
                const matchedCategory = catData.find(c => c.id.toString() === categoryId);
                if (matchedCategory) {
                    setCategoryName(matchedCategory.name);
                }

                // Fetch products
                const prodRes = await fetch('/api/products');
                const prodData = await prodRes.json();

                const catProducts = prodData.filter(p => p.category?.id?.toString() === categoryId);
                setProducts(catProducts);
                setFilteredProducts(catProducts);
            } catch (err) {
                console.error("Error fetching category data:", err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchCategoryData();
    }, [categoryId]);

    const applyFilters = () => {
        let temp = products;
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
        setFilteredProducts(temp);
    };



    return (
        <div className="bg-[#eaeded] min-h-screen pt-4 pb-16">
            <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row gap-6">

                {/* Left Sidebar - Filters */}
                <div className="w-full md:w-64 shrink-0 bg-white p-5 rounded border border-gray-200 shadow-sm h-fit sticky top-20">
                    <div className="flex items-center gap-2 mb-4 border-b pb-2">
                        <Filter className="w-5 h-5 text-slate-700" />
                        <h2 className="text-lg font-bold text-slate-900">Filters</h2>
                    </div>

                    <div className="mb-6">
                        <h3 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                            <Tag className="w-4 h-4 text-orange-500" />
                            Price Range
                        </h3>
                        <div className="flex items-center gap-2 mb-3">
                            <input
                                type="number"
                                value={minPrice}
                                onChange={e => setMinPrice(e.target.value)}
                                placeholder="Min ₹"
                                className="w-full p-2 border border-slate-300 rounded text-sm outline-none focus:border-orange-500"
                            />
                            <span className="text-slate-500">-</span>
                            <input
                                type="number"
                                value={maxPrice}
                                onChange={e => setMaxPrice(e.target.value)}
                                placeholder="Max ₹"
                                className="w-full p-2 border border-slate-300 rounded text-sm outline-none focus:border-orange-500"
                            />
                        </div>
                        <button
                            onClick={applyFilters}
                            className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-medium py-2 rounded transition-colors text-sm shadow-sm border border-slate-300"
                        >
                            Apply Filter
                        </button>
                    </div>

                    {/* Quick Filters */}
                    <div>
                        <h3 className="font-semibold text-slate-800 mb-2">Refine By</h3>
                        <div className="space-y-2 text-sm text-slate-600">
                            <label className="flex items-center gap-2 cursor-pointer hover:text-orange-600">
                                <input type="checkbox" className="rounded border-slate-300 text-orange-500 focus:ring-orange-500" />
                                <span>Amazon Prime</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer hover:text-orange-600">
                                <input type="checkbox" className="rounded border-slate-300 text-orange-500 focus:ring-orange-500" />
                                <span>Pay On Delivery</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer hover:text-orange-600">
                                <input type="checkbox" className="rounded border-slate-300 text-orange-500 focus:ring-orange-500" />
                                <span>Top Brands</span>
                            </label>
                        </div>
                    </div>
                </div>

                {/* Right Area - Product Grid */}
                <div className="flex-1">
                    <div className="bg-white p-4 rounded border border-gray-200 shadow-sm mb-4 flex items-center justify-between">
                        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{categoryName}</h1>
                        <span className="text-sm font-medium text-slate-500 bg-slate-100 px-3 py-1 rounded-full border border-gray-200">
                            {filteredProducts.length} Results
                        </span>
                    </div>

                    {isLoading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                            {[1, 2, 3, 4, 5, 6, 7, 8].map(n => (
                                <div key={n} className="bg-white rounded p-4 shadow-sm border border-slate-200 animate-pulse h-80"></div>
                            ))}
                        </div>
                    ) : filteredProducts.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                            {filteredProducts.map((product) => (
                                <ProductCard key={product.id} product={product} />
                            ))}
                        </div>
                    ) : (
                        <div className="bg-white p-12 text-center rounded border border-gray-200">
                            <span className="text-5xl mb-4 block">🔍</span>
                            <h3 className="text-xl font-bold text-slate-800 mb-2">No products found</h3>
                            <p className="text-slate-500">Try adjusting your filters or check back later.</p>
                            <button
                                onClick={() => { setMinPrice(''); setMaxPrice(''); setFilteredProducts(products); }}
                                className="mt-6 px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 font-medium"
                            >
                                Clear Filters
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CategoryPage;
