import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronRight, Grid, Sparkles } from 'lucide-react';

const Categories = () => {
    const [categories, setCategories] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetch('/api/categories')
            .then(res => res.json())
            .then(data => {
                setCategories(data);
                setIsLoading(false);
            })
            .catch(err => {
                console.error(err);
                setIsLoading(false);
            });
    }, []);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-orange-500"></div>
            </div>
        );
    }

    return (
        <div className="bg-slate-50 min-h-screen pb-20">
            {/* Header */}
            <div className="bg-white px-6 py-8 border-b border-slate-100 mb-6">
                <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                    <Grid className="text-orange-500" /> All Categories
                </h1>
                <p className="text-slate-500 font-medium mt-1">Explore our curated collections</p>
            </div>

            <div className="px-4">
                <div className="grid grid-cols-1 gap-4">
                    {categories.map((cat, idx) => (
                        <motion.div
                            key={cat.id}
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            onClick={() => navigate(`/category/${cat.id}`)}
                            className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 flex items-center justify-between group active:scale-[0.98] transition-all cursor-pointer"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 bg-slate-50 rounded-xl flex items-center justify-center overflow-hidden border border-slate-100">
                                    {cat.imageUrl ? (
                                        <img src={cat.imageUrl} alt={cat.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <Grid className="text-slate-300" size={24} />
                                    )}
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-slate-900 leading-none group-hover:text-orange-500 transition-colors">{cat.name}</h2>
                                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1.5 flex items-center gap-1">
                                        Explore Collection <ChevronRight size={12} />
                                    </p>
                                </div>
                            </div>
                            <div className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 group-hover:bg-orange-50 group-hover:text-orange-500 transition-all">
                                <ChevronRight size={20} />
                            </div>
                        </motion.div>
                    ))}
                </div>

                {categories.length === 0 && (
                    <div className="text-center py-20">
                        <Grid className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-slate-900">No categories found</h3>
                        <p className="text-slate-500">Check back later for new updates.</p>
                    </div>
                )}
            </div>
            
            {/* Quick Suggestion Card */}
            <div className="px-4 mt-8">
                <div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-3xl p-6 text-white shadow-xl shadow-indigo-200 relative overflow-hidden">
                    <div className="relative z-10">
                        <h3 className="text-xl font-black mb-1 flex items-center gap-2">
                             <Sparkles size={20} className="text-yellow-400" /> AI Suggestions
                        </h3>
                        <p className="text-indigo-100 text-sm font-medium leading-relaxed mb-4">
                            Not sure what to buy? Let our Gemini AI help you find the perfect match.
                        </p>
                        <button className="bg-white text-indigo-600 px-6 py-2.5 rounded-xl font-black text-sm shadow-lg active:scale-95 transition-transform">
                            Try AI Assistant
                        </button>
                    </div>
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl pointer-events-none" />
                </div>
            </div>
        </div>
    );
};

export default Categories;
