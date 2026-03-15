import React, { useState, useEffect, useRef } from 'react';
import { Package, PlusCircle, List, BarChart2, Truck, Trash2, FolderPlus, UploadCloud, CheckCircle, ImageIcon, Ticket, Calendar, DollarSign, Percent, IndianRupee, TrendingUp, Users, ShoppingBag, ArrowUpRight, ArrowDownRight, Menu, X } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import { motion } from 'framer-motion';
import { useSearchParams } from 'react-router-dom';

const AdminDashboard = () => {
    const [searchParams] = useSearchParams();
    const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'banners');

    // Data states
    const [categories, setCategories] = useState([]);
    const [subCategories, setSubCategories] = useState([]);
    const [products, setProducts] = useState([]);
    const [banners, setBanners] = useState([]);
    const [coupons, setCoupons] = useState([]);
    const [orders, setOrders] = useState([]);
    const [orderFilter, setOrderFilter] = useState(searchParams.get('filter') || 'ACTIVE'); // ACTIVE, COMPLETED, CANCELLED
    const [analyticsData, setAnalyticsData] = useState(null);
    const [analyticsRange, setAnalyticsRange] = useState('weekly'); // weekly, monthly, yearly
    const [agentStats, setAgentStats] = useState([]);
    const [agentRanges, setAgentRanges] = useState({}); // {agentId: 'weekly'}
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        const tab = searchParams.get('tab');
        const filter = searchParams.get('filter');
        if (tab) setActiveTab(tab);
        if (filter) setOrderFilter(filter);
    }, [searchParams]);

    // Form states
    const [couponCode, setCouponCode] = useState('');
    const [couponDiscount, setCouponDiscount] = useState('');
    const [couponMinAmount, setCouponMinAmount] = useState('0');
    const [couponExpiry, setCouponExpiry] = useState('');
    const [catName, setCatName] = useState('');
    const [catDesc, setCatDesc] = useState('');

    const [subCatName, setSubCatName] = useState('');
    const [subCatDesc, setSubCatDesc] = useState('');
    const [subCatCatId, setSubCatCatId] = useState('');

    const [prodName, setProdName] = useState('');
    const [prodDesc, setProdDesc] = useState('');
    const [prodPrice, setProdPrice] = useState('');
    const [prodOffer, setProdOffer] = useState('');
    const [prodStock, setProdStock] = useState('');
    const [prodIsDaily, setProdIsDaily] = useState(false);
    const [prodCatId, setProdCatId] = useState('');
    const [prodSubCatId, setProdSubCatId] = useState('');
    const [prodBrand, setProdBrand] = useState('');

    const [editingCatId, setEditingCatId] = useState(null);
    const [editingSubCatId, setEditingSubCatId] = useState(null);
    const [editingProdId, setEditingProdId] = useState(null);

    const [imageFile, setImageFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const fileInputRef = useRef(null);
    const bannerFileInputRef = useRef(null);
    const [bannerFile, setBannerFile] = useState(null);
    const [bannerPreview, setBannerPreview] = useState(null);

    const [statusMsg, setStatusMsg] = useState({ text: '', type: '' });
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        fetchCategories();
        fetchProducts();
        fetchBanners();
        fetchCoupons();
        fetchOrders();
        if (activeTab === 'analytics') fetchAnalytics();
        if (activeTab === 'delivery') fetchAgentAnalytics();
    }, [activeTab]);

    const fetchAgentAnalytics = async () => {
        setIsLoading(true);
        try {
            const token = localStorage.getItem('quickcart_jwt');
            const res = await fetch('/api/admin/analytics/delivery-agents', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (res.ok) {
                setAgentStats(data);
            }
        } catch (e) {
            console.error("Failed to fetch agent analytics");
        } finally {
            setIsLoading(false);
        }
    };

    const fetchAnalytics = async () => {
        setIsLoading(true);
        try {
            const token = localStorage.getItem('quickcart_jwt');
            const res = await fetch('/api/admin/analytics/orders', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (res.ok) {
                setAnalyticsData(data);
            }
        } catch (e) {
            console.error("Failed to fetch analytics");
        } finally {
            setIsLoading(false);
        }
    };

    const fetchOrders = async () => {
        try {
            const token = localStorage.getItem('quickcart_jwt');
            const res = await fetch('/api/admin/orders', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (res.ok && Array.isArray(data)) {
                setOrders(data);
            } else {
                setOrders([]);
            }
        } catch (e) {
            console.error("Failed to fetch orders");
            setOrders([]);
        }
    };

    const fetchCoupons = async () => {
        try {
            const token = localStorage.getItem('quickcart_jwt');
            const res = await fetch('/api/coupons', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            setCoupons(data || []);
        } catch (e) {
            console.error("Failed to fetch coupons");
        }
    };

    const fetchBanners = async () => {
        try {
            const res = await fetch('/api/banners/all');
            const data = await res.json();
            setBanners(data);
        } catch (e) {
            console.error("Failed to fetch banners");
        }
    };

    useEffect(() => {
        if (prodCatId || subCatCatId) {
            const id = activeTab === 'add_product' ? prodCatId : subCatCatId;
            if (id) {
                fetchSubCategories(id);
            }
        }
    }, [prodCatId, subCatCatId, activeTab]);

    const fetchCategories = async () => {
        try {
            const res = await fetch('/api/categories');
            const data = await res.json();
            setCategories(data);
        } catch (e) {
            console.error("Failed to fetch categories");
        }
    };

    const fetchSubCategories = async (catId) => {
        try {
            const res = await fetch(`/api/subcategories/category/${catId}`);
            const data = await res.json();
            setSubCategories(data);
        } catch (e) {
            console.error("Failed to fetch subcategories");
        }
    };

    const fetchProducts = async () => {
        try {
            const res = await fetch('/api/products');
            const data = await res.json();
            setProducts(data);
        } catch (e) {
            console.error("Failed to fetch products");
        }
    };

    const handleAddCategory = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setStatusMsg({ text: '', type: '' });
        try {
            const endpoint = editingCatId ? `/api/categories/${editingCatId}` : '/api/categories';
            const method = editingCatId ? 'PUT' : 'POST';
            const token = localStorage.getItem('quickcart_jwt');
            const res = await fetch(endpoint, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ name: catName, description: catDesc })
            });
            const data = await res.json();
            if (data.success) {
                setStatusMsg({ text: `Category ${editingCatId ? 'updated' : 'added'} successfully!`, type: 'success' });
                setCatName(''); setCatDesc(''); setEditingCatId(null);
                fetchCategories();
            } else {
                setStatusMsg({ text: data.message || 'Error saving category', type: 'error' });
            }
        } catch (e) {
            setStatusMsg({ text: 'Network Error', type: 'error' });
        }
        setIsLoading(false);
    };

    const handleEditCategory = (cat) => {
        setEditingCatId(cat.id);
        setCatName(cat.name);
        setCatDesc(cat.description || '');
        window.scrollTo(0, 0);
    };

    const handleDeleteCategory = async (id) => {
        if (!window.confirm("Are you sure? This will fail if there are linked subcategories or products.")) return;
        setIsLoading(true);
        try {
            const token = localStorage.getItem('quickcart_jwt');
            const res = await fetch(`/api/categories/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                setStatusMsg({ text: 'Category deleted successfully!', type: 'success' });
                fetchCategories();
            } else {
                setStatusMsg({ text: data.message || 'Error deleting category', type: 'error' });
            }
        } catch (e) {
            setStatusMsg({ text: 'Network Error', type: 'error' });
        }
        setIsLoading(false);
    };

    const handleAddSubCategory = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setStatusMsg({ text: '', type: '' });
        try {
            const endpoint = editingSubCatId ? `/api/subcategories/${editingSubCatId}` : '/api/subcategories';
            const method = editingSubCatId ? 'PUT' : 'POST';
            const token = localStorage.getItem('quickcart_jwt');
            const res = await fetch(endpoint, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ name: subCatName, description: subCatDesc, categoryId: subCatCatId })
            });
            const data = await res.json();
            if (data.success) {
                setStatusMsg({ text: `Subcategory ${editingSubCatId ? 'updated' : 'added'} successfully!`, type: 'success' });
                setSubCatName(''); setSubCatDesc(''); setSubCatCatId(''); setEditingSubCatId(null);
                fetchSubCategories(prodCatId || ''); // Refresh
                setSubCategories([]); // Trigger refetch basically
            } else {
                setStatusMsg({ text: data.message || 'Error saving subcategory', type: 'error' });
            }
        } catch (e) {
            setStatusMsg({ text: 'Network Error', type: 'error' });
        }
        setIsLoading(false);
    };

    const handleEditSubCategory = (subCat) => {
        setEditingSubCatId(subCat.id);
        setSubCatName(subCat.name);
        setSubCatDesc(subCat.description || '');
        setSubCatCatId(subCat.category?.id || '');
        window.scrollTo(0, 0);
    };

    const handleDeleteSubCategory = async (id) => {
        if (!window.confirm("Are you sure you want to delete this subcategory?")) return;
        setIsLoading(true);
        try {
            const token = localStorage.getItem('quickcart_jwt');
            const res = await fetch(`/api/subcategories/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                setStatusMsg({ text: 'Subcategory deleted successfully!', type: 'success' });
                if (prodCatId || subCatCatId) {
                    fetchSubCategories(prodCatId || subCatCatId);
                } else {
                    setSubCategories([]);
                }
            } else {
                setStatusMsg({ text: data.message || 'Error deleting subcategory', type: 'error' });
            }
        } catch (e) {
            setStatusMsg({ text: 'Network Error', type: 'error' });
        }
        setIsLoading(false);
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            setPreview(URL.createObjectURL(file));
        }
    };

    const handleAddProduct = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setStatusMsg({ text: '', type: '' });

        const formData = new FormData();
        formData.append('name', prodName);
        formData.append('description', prodDesc);
        formData.append('price', prodPrice);
        formData.append('offerPercentage', prodOffer || 0);
        formData.append('stock', prodStock);
        formData.append('isDailyOffer', prodIsDaily);
        if (prodCatId) formData.append('categoryId', prodCatId);
        if (prodSubCatId) formData.append('subCategoryId', prodSubCatId);
        if (prodBrand) formData.append('brand', prodBrand);
        if (imageFile) formData.append('image', imageFile);

        try {
            const endpoint = editingProdId ? `/api/products/${editingProdId}` : '/api/products';
            const method = editingProdId ? 'PUT' : 'POST';
            const token = localStorage.getItem('quickcart_jwt');
            const res = await fetch(endpoint, {
                method,
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });
            const data = await res.json();
            if (data.success) {
                setStatusMsg({ text: `Product ${editingProdId ? 'updated' : 'added'} successfully!`, type: 'success' });
                setProdName(''); setProdDesc(''); setProdPrice(''); setProdOffer(''); setProdStock(''); setProdIsDaily(false);
                setProdBrand('');
                setImageFile(null); setPreview(null); setEditingProdId(null);
                fetchProducts();
            } else {
                setStatusMsg({ text: data.message || 'Error saving product', type: 'error' });
            }
        } catch (e) {
            setStatusMsg({ text: 'Network Error', type: 'error' });
        }
        setIsLoading(false);
    };

    const handleEditProduct = (prod) => {
        setActiveTab('add_product');
        setEditingProdId(prod.id);
        setProdName(prod.name);
        setProdDesc(prod.description || '');
        setProdPrice(prod.price);
        setProdOffer(prod.offerPercentage || '');
        setProdStock(prod.stock);
        setProdIsDaily(prod.isDailyOffer || false);
        setProdCatId(prod.category?.id || '');
        setProdSubCatId(prod.subCategory?.id || '');
        setProdBrand(prod.brand || '');
        setPreview(prod.imageUrl || null);
        setImageFile(null);
        window.scrollTo(0, 0);
    };

    const handleMarketSync = async () => {
        if (!window.confirm("This will use AI to fetch and update products with top brands from the market. Proceed?")) return;
        setIsLoading(true);
        setStatusMsg({ text: 'Syncing with live market data... this may take a moment', type: 'success' });
        try {
            const token = localStorage.getItem('quickcart_jwt');
            const res = await fetch('/api/admin/sync/market', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                setStatusMsg({ text: data.message, type: 'success' });
                fetchProducts();
            } else {
                setStatusMsg({ text: data.message || 'Error syncing products', type: 'error' });
            }
        } catch (e) {
            setStatusMsg({ text: 'Network Error', type: 'error' });
        }
        setIsLoading(false);
    };

    const handleDeleteProduct = async (id) => {
        if (!window.confirm("Are you sure you want to delete this product?")) return;
        setIsLoading(true);
        try {
            const token = localStorage.getItem('quickcart_jwt');
            const res = await fetch(`/api/products/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                fetchProducts();
            } else {
                alert("Error deleting product");
            }
        } catch (e) {
            alert("Network Error");
        }
        setIsLoading(false);
    };

    const handleBannerChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setBannerFile(file);
            setBannerPreview(URL.createObjectURL(file));
        }
    };

    const handleAddBanner = async (e) => {
        e.preventDefault();
        if (!bannerFile) return;
        setIsLoading(true);
        setStatusMsg({ text: '', type: '' });

        const formData = new FormData();
        formData.append('image', bannerFile);

        try {
            const token = localStorage.getItem('quickcart_jwt');
            const res = await fetch('/api/banners', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData
            });
            const data = await res.json();
            if (data.success) {
                setStatusMsg({ text: 'Banner added successfully!', type: 'success' });
                setBannerFile(null); setBannerPreview(null);
                fetchBanners();
            } else {
                setStatusMsg({ text: data.message || 'Error adding banner', type: 'error' });
            }
        } catch (e) {
            setStatusMsg({ text: 'Network Error', type: 'error' });
        }
        setIsLoading(false);
    };

    const handleDeleteBanner = async (id) => {
        if (!window.confirm("Are you sure you want to delete this banner?")) return;
        setIsLoading(true);
        try {
            const token = localStorage.getItem('quickcart_jwt');
            const res = await fetch(`/api/banners/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                fetchBanners();
            } else {
                alert("Error deleting banner");
            }
        } catch (e) {
            alert("Network Error");
        }
        setIsLoading(false);
    };

    const handleAddCoupon = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        if (!couponCode || !couponDiscount) {
            setStatusMsg({ text: 'Please fill in all required fields.', type: 'error' });
            setIsLoading(false);
            return;
        }

        try {
            const token = localStorage.getItem('quickcart_jwt');
            const response = await fetch('/api/coupons', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    code: couponCode.trim().toUpperCase(),
                    discountAmount: parseFloat(couponDiscount) || 0,
                    minOrderAmount: parseFloat(couponMinAmount) || 0,
                    expiryDate: couponExpiry ? new Date(couponExpiry).toISOString() : null,
                    active: true
                })
            });
            if (response.ok) {
                setStatusMsg({ text: 'Coupon created successfully!', type: 'success' });
                setCouponCode('');
                setCouponDiscount('');
                setCouponMinAmount('0');
                setCouponExpiry('');
                fetchCoupons();
            } else {
                setStatusMsg({ text: 'Error creating coupon', type: 'error' });
            }
        } catch (e) {
            setStatusMsg({ text: 'Network connection error', type: 'error' });
        }
        setIsLoading(false);
    };

    const handleDeleteCoupon = async (id) => {
        if (!window.confirm("Are you sure you want to delete this coupon?")) return;
        setIsLoading(true);
        try {
            const token = localStorage.getItem('quickcart_jwt');
            const res = await fetch(`/api/coupons/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                setStatusMsg({ text: 'Coupon deleted successfully!', type: 'success' });
                fetchCoupons();
            }
        } catch (e) {
            alert("Network Error");
        }
        setIsLoading(false);
    };

    const handleUpdateOrderStatus = async (orderId, newStatus) => {
        setIsLoading(true);
        try {
            const token = localStorage.getItem('quickcart_jwt');
            const res = await fetch(`/api/admin/orders/${orderId}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status: newStatus })
            });
            if (res.ok) {
                setStatusMsg({ text: 'Order status updated successfully!', type: 'success' });
                fetchOrders();
            } else {
                setStatusMsg({ text: 'Error updating order status', type: 'error' });
            }
        } catch (e) {
            setStatusMsg({ text: 'Network Error', type: 'error' });
        }
        setIsLoading(false);
    };

    const SidebarItem = ({ id, label, icon: Icon, badge }) => (
            <button
            onClick={() => { setActiveTab(id); setStatusMsg({ text: '', type: '' }); setIsMobileMenuOpen(false); }}
            className={`w-full flex items-center px-4 py-3 rounded-xl mb-1 transition-all duration-200 ${activeTab === id ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 font-bold'}`}
        >
            <div className="relative">
                <Icon className="w-5 h-5 mr-3 shrink-0" />
                {badge && (
                    <span className="absolute -top-1 -right-0.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
                )}
            </div>
            <span className="text-xs font-black uppercase tracking-widest">{label}</span>
        </button>
    );

    return (
        <div className="bg-slate-50 min-h-screen flex flex-col md:flex-row">
            {/* Mobile Header */}
            <div className="md:hidden bg-slate-900 border-b border-slate-800 p-3 sticky top-0 z-50 flex justify-between items-center shadow-lg">
                <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center shadow-md">
                        <Package className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <span className="font-black text-sm text-white uppercase tracking-wider">QuickCart</span>
                        <span className="block text-[10px] text-orange-400 font-bold uppercase -mt-1 tracking-[0.2em]">Admin Panel</span>
                    </div>
                </div>
                <button 
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
                    className="p-2 bg-slate-800 text-white rounded-lg transition-all active:scale-95 border border-slate-700"
                >
                    {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
                </button>
            </div>

            {/* Sidebar */}
            <div className={`
                ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
                fixed md:static inset-y-0 left-0 z-[60] w-[280px] md:w-64 bg-white border-r border-slate-200 p-4 transform transition-transform duration-300 ease-out md:min-h-screen overflow-y-auto shadow-2xl md:shadow-none
            `}>
                <div className="hidden md:flex items-center space-x-2 px-2 mb-8 mt-2">
                    <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center">
                        <Package className="w-4 h-4 text-white" />
                    </div>
                    <span className="font-bold text-lg text-slate-900 tracking-tight">Admin Panel</span>
                </div>

                <div className="space-y-1 mt-10 md:mt-0">
                    <SidebarItem id="banners" label="Manage Banners" icon={ImageIcon} />
                    <SidebarItem id="add_product" label="Add Product" icon={PlusCircle} />
                    <SidebarItem id="add_category" label="Add Category" icon={FolderPlus} />
                    <SidebarItem id="add_subcategory" label="Add Subcategory" icon={List} />
                    <SidebarItem id="manage_products" label="Delete/Manage Products" icon={Trash2} />
                    <div className="my-4 border-t border-slate-200"></div>
                    <SidebarItem id="orders" label="Orders" icon={Package} badge={orders.some(o => o.status === 'CANCEL_REQUESTED')} />
                    <SidebarItem id="coupons" label="Manage Coupons" icon={Ticket} />
                    <SidebarItem id="analytics" label="Orders Analytics" icon={BarChart2} />
                    <SidebarItem id="delivery" label="Delivery Agents" icon={Truck} />
                </div>
            </div>

            {/* Backdrop for mobile */}
            {isMobileMenuOpen && (
                <div 
                    className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-30 md:hidden animate-in fade-in duration-300" 
                    onClick={() => setIsMobileMenuOpen(false)}
                ></div>
            )}

            {/* Main Content */}
            <div className="flex-1 p-3 md:p-8 overflow-y-auto">
                <div className="max-w-4xl mx-auto space-y-4">

                    {statusMsg.text && (
                        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className={`p-4 rounded-lg mb-6 text-sm font-medium ${statusMsg.type === 'success' ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-red-100 text-red-800 border border-red-200'}`}>
                            {statusMsg.text}
                        </motion.div>
                    )}

                    {activeTab === 'banners' && (
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 md:p-8">
                            <h2 className="text-lg md:text-2xl font-black text-slate-800 mb-4 md:mb-6 block border-b pb-3 uppercase tracking-tight">Manage Banners</h2>

                            <form onSubmit={handleAddBanner} className="space-y-4 mb-8 border border-slate-100 rounded-xl p-4 md:p-6 bg-slate-50 relative">
                                <h3 className="text-sm md:text-lg font-bold text-slate-800">Add New Banner</h3>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Upload Banner Image (Cloudinary)</label>
                                    <div
                                        onClick={() => bannerFileInputRef.current?.click()}
                                        className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-xl cursor-pointer transition-colors ${bannerPreview ? 'border-orange-400 bg-orange-50' : 'border-slate-300 hover:border-orange-500 bg-white hover:bg-slate-50'}`}
                                    >
                                        <div className="space-y-2 text-center">
                                            {!bannerPreview ? (
                                                <>
                                                    <UploadCloud className="mx-auto h-12 w-12 text-slate-400" />
                                                    <div className="text-sm text-slate-600 font-medium">
                                                        <span className="text-orange-600 hover:text-orange-500">Upload a file</span> or drag and drop
                                                    </div>
                                                    <p className="text-xs text-slate-500">Wide aspect ratio recommended. PNG, JPG up to 10MB</p>
                                                </>
                                            ) : (
                                                <div className="relative inline-block w-full">
                                                    <img src={bannerPreview} alt="Preview" className="w-full h-auto max-h-[300px] object-cover rounded-lg shadow-sm" />
                                                    {isLoading && (
                                                        <div className="absolute inset-0 bg-white/70 flex items-center justify-center rounded-lg backdrop-blur-sm">
                                                            <div className="animate-spin rounded-full h-10 w-10 border-4 border-orange-200 border-t-orange-600"></div>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <input type="file" ref={bannerFileInputRef} onChange={handleBannerChange} accept="image/*" className="hidden" />
                                </div>
                                <div className="flex justify-end relative z-10">
                                    <button type="submit" disabled={isLoading || !bannerFile} className="px-6 py-2.5 bg-gradient-to-r from-orange-400 to-orange-500 text-white font-bold rounded-lg hover:from-orange-500 hover:to-orange-600 shadow-md transition-all disabled:opacity-50 flex items-center">
                                        {isLoading ? 'Uploading...' : 'Publish Banner'}
                                    </button>
                                </div>
                            </form>

                            <h3 className="text-lg font-bold text-slate-800 mb-4 border-b pb-2">Active Banners</h3>
                            {banners.length === 0 ? (
                                <p className="text-slate-500 text-center py-8">No banners found. Start by adding some!</p>
                            ) : (
                                <div className="grid grid-cols-1 gap-6">
                                    {banners.map(b => (
                                        <div key={b.id} className="relative group rounded-xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                                            <img src={b.imageUrl} alt="Banner" className="w-full h-48 md:h-64 object-cover object-center" />
                                            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button onClick={(e) => { e.preventDefault(); handleDeleteBanner(b.id); }} disabled={isLoading} className="p-2 bg-white/90 text-red-600 hover:bg-red-50 hover:text-red-700 rounded-lg shadow-sm backdrop-blur-sm transition-colors cursor-pointer relative z-20">
                                                    <Trash2 className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'add_category' && (
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8">
                            <h2 className="text-2xl font-bold text-slate-800 mb-6">Create New Category</h2>
                            <form onSubmit={handleAddCategory} className="space-y-5">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1">Category Name</label>
                                    <input required value={catName} onChange={e => setCatName(e.target.value)} type="text" className="w-full px-4 py-2 border border-slate-300 text-slate-900 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-shadow outline-none" placeholder="e.g. Electronics" />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1">Description</label>
                                    <textarea value={catDesc} onChange={e => setCatDesc(e.target.value)} rows="3" className="w-full px-4 py-2 text-slate-900 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-shadow outline-none" placeholder="Category details..."></textarea>
                                </div>
                                <button type="submit" disabled={isLoading} className="px-6 py-2.5 bg-slate-900 text-white font-medium rounded-lg hover:bg-slate-800 transition shadow-md disabled:opacity-50">
                                    {isLoading ? 'Saving...' : (editingCatId ? 'Update Category' : 'Save Category')}
                                </button>
                                {editingCatId && (
                                    <button type="button" onClick={() => { setEditingCatId(null); setCatName(''); setCatDesc(''); }} className="ml-4 px-6 py-2.5 bg-slate-200 text-slate-700 font-medium rounded-lg hover:bg-slate-300 transition shadow-md">
                                        Cancel Edit
                                    </button>
                                )}
                            </form>

                            <div className="mt-8">
                                <h3 className="text-lg font-bold text-slate-800 mb-4 border-b pb-2">Existing Categories</h3>
                                <div className="space-y-3">
                                    {categories.map(c => (
                                        <div key={c.id} className="flex justify-between items-center p-4 bg-slate-50 border border-slate-200 rounded-lg shrink-0">
                                            <div>
                                                <h4 className="font-bold text-slate-800">{c.name}</h4>
                                                <p className="text-sm text-slate-500">{c.description}</p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button onClick={() => handleEditCategory(c)} className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 font-bold text-sm transition-colors">Edit</button>
                                                <button onClick={() => handleDeleteCategory(c.id)} className="p-2 text-red-500 hover:bg-red-50 hover:text-red-700 rounded-lg transition-colors">
                                                    <Trash2 className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'add_subcategory' && (
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8">
                            <h2 className="text-2xl font-bold text-slate-800 mb-6">Create New Subcategory</h2>
                            <form onSubmit={handleAddSubCategory} className="space-y-5">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1">Parent Category</label>
                                    <select required value={subCatCatId} onChange={e => setSubCatCatId(e.target.value)} className="w-full px-4 py-2 border border-slate-900 text-slate-900 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none">
                                        <option value="">Select Category</option>
                                        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1">Subcategory Name</label>
                                    <input required value={subCatName} onChange={e => setSubCatName(e.target.value)} type="text" className="w-full px-4 py-2 border border-slate-900 text-slate-900 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none" placeholder="e.g. Smartphones" />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1">Description</label>
                                    <textarea value={subCatDesc} onChange={e => setSubCatDesc(e.target.value)} rows="3" className="w-full px-4 py-2 text-slate-900 bg-white border border-slate-900 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"></textarea>
                                </div>
                                <button type="submit" disabled={isLoading} className="px-6 py-2.5 bg-slate-900 text-white font-medium rounded-lg hover:bg-slate-800 transition shadow-md disabled:opacity-50">
                                    {isLoading ? 'Saving...' : (editingSubCatId ? 'Update Subcategory' : 'Save Subcategory')}
                                </button>
                                {editingSubCatId && (
                                    <button type="button" onClick={() => { setEditingSubCatId(null); setSubCatName(''); setSubCatDesc(''); setSubCatCatId(''); }} className="ml-4 px-6 py-2.5 bg-slate-200 text-slate-700 font-medium rounded-lg hover:bg-slate-300 transition shadow-md">
                                        Cancel Edit
                                    </button>
                                )}
                            </form>

                            <div className="mt-8">
                                <h3 className="text-lg font-bold text-slate-800 mb-4 border-b pb-2">Select Parent Category to View Subcategories</h3>
                                <select onChange={e => fetchSubCategories(e.target.value)} className="w-full px-4 py-2 border border-slate-900 text-slate-900 rounded-lg outline-none mb-4">
                                    <option value="">Select Category</option>
                                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                                <div className="space-y-3">
                                    {subCategories.map(s => (
                                        <div key={s.id} className="flex justify-between items-center p-4 bg-slate-50 border border-slate-200 rounded-lg shrink-0">
                                            <div>
                                                <h4 className="font-bold text-slate-800">{s.name}</h4>
                                                <p className="text-sm text-slate-500">{s.description}</p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button onClick={() => handleEditSubCategory(s)} className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 font-bold text-sm transition-colors">Edit</button>
                                                <button onClick={() => handleDeleteSubCategory(s.id)} className="p-2 text-red-500 hover:bg-red-50 hover:text-red-700 rounded-lg transition-colors">
                                                    <Trash2 className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'add_product' && (
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8">
                            <h2 className="text-2xl font-bold text-slate-800 mb-6 block border-b pb-4">Create New Product</h2>
                            <form onSubmit={handleAddProduct} className="space-y-6">

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-1">Product Name</label>
                                        <input required value={prodName} onChange={e => setProdName(e.target.value)} type="text" className="w-full px-4 py-2 border border-slate-300 text-slate-900 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none" placeholder="Premium Wireless Headphones" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-1">Stock Quantity</label>
                                        <input required value={prodStock} onChange={e => setProdStock(e.target.value)} type="number" className="w-full px-4 py-2 border border-slate-300 text-slate-900 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none" placeholder="100" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1">Brand Name / Market Source</label>
                                    <input value={prodBrand} onChange={e => setProdBrand(e.target.value)} type="text" className="w-full px-4 py-2 border border-slate-300 text-slate-900 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none" placeholder="e.g. Apple, Nike, Sony" />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-1">Price (₹)</label>
                                        <input required value={prodPrice} onChange={e => setProdPrice(e.target.value)} type="number" step="0.01" className="w-full px-4 py-2 border border-slate-300 text-slate-900 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none" placeholder="299.99" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-1">Offer Percentage (%)</label>
                                        <input value={prodOffer} onChange={e => setProdOffer(e.target.value)} type="number" step="0.1" className="w-full px-4 py-2 border border-slate-300 text-slate-900 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none" placeholder="15" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-1">Category</label>
                                        <select required value={prodCatId} onChange={e => setProdCatId(e.target.value)} className="w-full px-4 py-2 border border-slate-300 text-slate-900 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none">
                                            <option value="">Select Category</option>
                                            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-1">Subcategory</label>
                                        <select value={prodSubCatId} onChange={e => setProdSubCatId(e.target.value)} className="w-full px-4 py-2 border border-slate-300 text-slate-900 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none">
                                            <option value="">Select Subcategory (Optional)</option>
                                            {subCategories.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1">Description</label>
                                    <textarea required value={prodDesc} onChange={e => setProdDesc(e.target.value)} rows="4" className="w-full px-4 py-2 text-slate-900 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none" placeholder="Detailed product description..."></textarea>
                                </div>

                                <div className="flex items-center">
                                    <input id="isDaily" type="checkbox" checked={prodIsDaily} onChange={e => setProdIsDaily(e.target.checked)} className="h-5 w-5 text-orange-600 focus:ring-orange-500 border-gray-300 rounded cursor-pointer" />
                                    <label htmlFor="isDaily" className="ml-2 block text-sm font-semibold text-slate-700 cursor-pointer">Mark as Daily Offer</label>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Product Image (Cloudinary)</label>
                                    <div
                                        onClick={() => fileInputRef.current?.click()}
                                        className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-xl cursor-pointer transition-colors ${preview ? 'border-orange-400 bg-orange-50' : 'border-slate-300 hover:border-orange-500 bg-slate-50 hover:bg-slate-100'}`}
                                    >
                                        <div className="space-y-2 text-center">
                                            {!preview ? (
                                                <>
                                                    <UploadCloud className="mx-auto h-12 w-12 text-slate-400" />
                                                    <div className="text-sm text-slate-600 font-medium">
                                                        <span className="text-orange-600 hover:text-orange-500">Upload a file</span> or drag and drop
                                                    </div>
                                                    <p className="text-xs text-slate-500">PNG, JPG up to 10MB</p>
                                                </>
                                            ) : (
                                                <div className="relative inline-block">
                                                    <img src={preview} alt="Preview" className="max-h-56 rounded-lg shadow-sm" />
                                                    {isLoading && (
                                                        <div className="absolute inset-0 bg-white/70 flex items-center justify-center rounded-lg backdrop-blur-sm">
                                                            <div className="animate-spin rounded-full h-10 w-10 border-4 border-orange-200 border-t-orange-600"></div>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <input type="file" ref={fileInputRef} onChange={handleImageChange} accept="image/*" className="hidden" />
                                </div>

                                <div className="pt-4 flex justify-end">
                                    {editingProdId && (
                                        <button type="button" onClick={() => { setEditingProdId(null); setProdName(''); setProdDesc(''); setProdPrice(''); setProdOffer(''); setProdStock(''); setProdCatId(''); setProdSubCatId(''); setPreview(null); }} className="mr-4 px-8 py-3 bg-slate-200 text-slate-700 font-bold rounded-lg hover:bg-slate-300 shadow-sm transition-all flex items-center">
                                            Cancel
                                        </button>
                                    )}
                                    <button type="submit" disabled={isLoading} className="px-8 py-3 bg-gradient-to-r from-orange-400 to-orange-500 text-white font-bold rounded-lg hover:from-orange-500 hover:to-orange-600 shadow-lg shadow-orange-500/30 transition-all disabled:opacity-50 flex items-center">
                                        {isLoading ? 'Uploading & Saving...' : (editingProdId ? 'Update Product' : 'Publish Product')}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {activeTab === 'manage_products' && (
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-bold text-slate-800 font-display">Manage Products</h2>
                                <button
                                    onClick={handleMarketSync}
                                    disabled={isLoading}
                                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold rounded-lg hover:shadow-lg transition-all disabled:opacity-50"
                                >
                                    <BarChart2 className="w-4 h-4" />
                                    Sync with Market
                                </button>
                            </div>
                            {products.length === 0 ? (
                                <p className="text-slate-500 text-center py-8">No products found. Start by adding some!</p>
                            ) : (
                                <div className="space-y-4">
                                    {products.map(p => (
                                        <div key={p.id} className="flex items-center justify-between p-4 border border-slate-100 bg-slate-50 rounded-xl hover:shadow-md transition-all">
                                            <div className="flex items-center space-x-4">
                                                {p.imageUrl ? (
                                                    <img src={p.imageUrl} alt={p.name} className="w-16 h-16 object-cover rounded-xl shadow-sm bg-white" />
                                                ) : (
                                                    <div className="w-16 h-16 bg-slate-200 rounded-xl flex items-center justify-center">
                                                        <Package className="w-8 h-8 text-slate-400" />
                                                    </div>
                                                )}
                                                <div>
                                                    <h3 className="font-bold text-slate-900 line-clamp-1">{p.name}</h3>
                                                    <p className="text-sm font-bold text-orange-600">₹{p.price} <span className="text-slate-500 font-normal ml-2">Stock: {p.stock}</span></p>
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <button onClick={() => handleEditProduct(p)} disabled={isLoading} className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 font-bold text-sm transition-colors">
                                                    Edit
                                                </button>
                                                <button onClick={() => handleDeleteProduct(p.id)} disabled={isLoading} className="p-2 text-red-500 hover:bg-red-50 hover:text-red-700 rounded-lg transition-colors">
                                                    <Trash2 className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'coupons' && (
                        <div className="space-y-6">
                            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8">
                                <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                                    <Ticket className="text-orange-500" /> Create Discount Coupon
                                </h2>
                                <form onSubmit={handleAddCoupon} className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-semibold text-slate-700 mb-1">Coupon Code</label>
                                            <div className="relative">
                                                <Ticket className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                                <input required value={couponCode} onChange={e => setCouponCode(e.target.value.toUpperCase())} type="text" className="w-full pl-10 pr-4 py-2 border border-slate-300 text-slate-900 rounded-lg outline-none focus:ring-2 focus:ring-orange-500" placeholder="SAVE20" />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-slate-700 mb-1">Discount Amount (₹)</label>
                                            <div className="relative">
                                                <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                                <input required value={couponDiscount} onChange={e => setCouponDiscount(e.target.value)} type="number" step="1" className="w-full pl-10 pr-4 py-2 border border-slate-300 text-slate-900 rounded-lg outline-none focus:ring-2 focus:ring-orange-500" placeholder="100" />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-semibold text-slate-700 mb-1">Min Order Amount (₹)</label>
                                            <div className="relative">
                                                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                                <input value={couponMinAmount} onChange={e => setCouponMinAmount(e.target.value)} type="number" className="w-full pl-10 pr-4 py-2 border border-slate-300 text-slate-900 rounded-lg outline-none focus:ring-2 focus:ring-orange-500" placeholder="500" />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-slate-700 mb-1">Expiry Date</label>
                                            <div className="relative">
                                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                                <input value={couponExpiry} onChange={e => setCouponExpiry(e.target.value)} type="date" className="w-full pl-10 pr-4 py-2 border border-slate-300 text-slate-900 rounded-lg outline-none focus:ring-2 focus:ring-orange-500" />
                                            </div>
                                        </div>
                                    </div>
                                    <button type="submit" disabled={isLoading} className="w-full py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition shadow-lg disabled:opacity-50">
                                        {isLoading ? 'Creating...' : 'Create Coupon'}
                                    </button>
                                </form>
                            </div>

                            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8">
                                <h2 className="text-xl font-bold text-slate-900 mb-6">Active Coupons</h2>
                                {coupons.length === 0 ? (
                                    <p className="text-slate-500 text-center py-4">No active coupons found.</p>
                                ) : (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {coupons.map(c => (
                                            <div key={c.id} className="p-4 border border-orange-100 bg-orange-50/30 rounded-xl relative group">
                                                <div className="flex justify-between items-start mb-2">
                                                    <span className="px-3 py-1 bg-white border border-orange-200 text-orange-600 font-bold rounded-lg text-sm">
                                                        {c.code}
                                                    </span>
                                                    <button onClick={() => handleDeleteCoupon(c.id)} className="text-slate-400 hover:text-red-500 transition">
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                                <p className="text-2xl font-black text-slate-900">₹{c.discountAmount} OFF</p>
                                                <p className="text-xs text-slate-500 mt-1">Min. order: ₹{c.minOrderAmount}</p>
                                                {c.expiryDate && (
                                                    <p className="text-[10px] text-slate-400 mt-2 font-bold uppercase tracking-wider">
                                                        Expires: {new Date(c.expiryDate).toLocaleDateString()}
                                                    </p>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === 'orders' && (
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8">
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                                <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                                    <Package className="text-orange-500" /> Manage Orders
                                </h2>
                                <div className="flex bg-slate-100 p-1 rounded-xl w-full md:w-auto overflow-x-auto">
                                    {['ACTIVE', 'REQUESTS', 'COMPLETED', 'CANCELLED'].map((f) => {
                                        const reqCount = orders.filter(o => o.status === 'CANCEL_REQUESTED').length;
                                        return (
                                            <button 
                                                key={f}
                                                onClick={() => setOrderFilter(f)}
                                                className={`px-4 py-2 text-sm font-bold rounded-lg transition-all whitespace-nowrap flex items-center gap-2 ${orderFilter === f ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                                            >
                                                {f === 'ACTIVE' ? 'Live Orders' : f === 'REQUESTS' ? 'Cancellation Requests' : f === 'COMPLETED' ? 'Delivered' : 'Returns/Cancelled'}
                                                {f === 'REQUESTS' && reqCount > 0 && (
                                                    <span className="bg-orange-500 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center animate-pulse shadow-sm shadow-orange-500/30">
                                                        {reqCount}
                                                    </span>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                            
                            {(() => {
                                const filteredOrders = orders.filter(o => {
                                    if (orderFilter === 'REQUESTS') return o.status === 'CANCEL_REQUESTED';
                                    if (orderFilter === 'COMPLETED') return o.status === 'DELIVERED';
                                    if (orderFilter === 'CANCELLED') return o.status === 'CANCELLED';
                                    return o.status !== 'DELIVERED' && o.status !== 'CANCELLED';
                                });

                                if (filteredOrders.length === 0) {
                                    return (
                                        <div className="py-20 text-center">
                                            <Package className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                                            <p className="text-slate-500 font-medium text-lg">No {orderFilter.toLowerCase()} orders found.</p>
                                        </div>
                                    );
                                }

                                return (
                                    <div className="overflow-x-auto -mx-4 md:mx-0">
                                        <div className="inline-block min-w-full align-middle p-4 md:p-0">
                                            <table className="min-w-full text-left border-collapse border border-slate-100 rounded-xl overflow-hidden shadow-sm">
                                                <thead>
                                                    <tr className="bg-slate-50 border-y border-slate-200">
                                                        <th className="py-3 px-4 font-bold text-xs text-slate-700 uppercase tracking-widest">Order ID</th>
                                                        <th className="py-3 px-4 font-bold text-xs text-slate-700 uppercase tracking-widest hidden sm:table-cell">Customer</th>
                                                        <th className="py-3 px-4 font-bold text-xs text-slate-700 uppercase tracking-widest">Date</th>
                                                        <th className="py-3 px-4 font-bold text-xs text-slate-700 uppercase tracking-widest">Total</th>
                                                        <th className="py-3 px-4 font-bold text-xs text-slate-700 uppercase tracking-widest">Status</th>
                                                        <th className="py-3 px-4 font-bold text-xs text-slate-700 uppercase tracking-widest text-right">Action</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {filteredOrders.map(order => (
                                                        <React.Fragment key={order.id}>
                                                            <tr className="border-b border-slate-100 bg-white hover:bg-slate-50 transition-colors">
                                                                <td className="py-4 px-4 text-xs font-black text-slate-900">{order.orderId}</td>
                                                                <td className="py-4 px-4 text-xs text-slate-600 font-bold hidden sm:table-cell">{order.user?.name}</td>
                                                                <td className="py-4 px-4 text-xs text-slate-600 font-bold">
                                                                    <div>{new Date(order.orderDate).toLocaleDateString([], { month: 'short', day: 'numeric' })}</div>
                                                                </td>
                                                                <td className="py-4 px-4 text-xs font-black text-slate-900 whitespace-nowrap">₹{order.finalAmount?.toFixed(0)}</td>
                                                                <td className="py-4 px-4">
                                                                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-black tracking-widest uppercase ${
                                                                        order.status === 'DELIVERED' ? 'bg-green-100 text-green-700' :
                                                                        order.status === 'CANCELLED' ? 'bg-red-100 text-red-700' : 
                                                                        order.status === 'CANCEL_REQUESTED' ? 'bg-orange-100 text-orange-700 animate-pulse' :
                                                                            'bg-slate-100 text-slate-700'
                                                                        }`}>
                                                                        {order.status?.replace(/_/g, ' ')}
                                                                    </span>
                                                                </td>
                                                                <td className="py-4 px-4 text-right">
                                                                    <select
                                                                        value={order.status}
                                                                        onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                                                                        disabled={isLoading}
                                                                        className="text-[10px] font-black border border-slate-300 rounded-lg px-2 text-slate-900 py-1 outline-none focus:ring-2 focus:ring-orange-500 bg-white shadow-sm disabled:bg-slate-50"
                                                                    >
                                                                        {['PENDING', 'CONFIRMED', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCEL_REQUESTED', 'CANCELLED'].map((s) => {
                                                                            const statusOrder = ['PENDING', 'CONFIRMED', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED'];
                                                                            const currentIdx = statusOrder.indexOf(order.status);
                                                                            const targetIdx = statusOrder.indexOf(s);
                                                                            
                                                                            let isDisabled = false;
                                                                            if (order.status === 'CANCEL_REQUESTED') {
                                                                                if (s !== 'CANCEL_REQUESTED' && s !== 'CANCELLED' && s !== 'CONFIRMED') isDisabled = true;
                                                                            } else {
                                                                                if (currentIdx !== -1 && targetIdx !== -1 && targetIdx <= currentIdx) isDisabled = true;
                                                                                if (s === 'CANCEL_REQUESTED') isDisabled = true;
                                                                                if (s === 'CANCELLED' && (order.status === 'SHIPPED' || order.status === 'OUT_FOR_DELIVERY' || order.status === 'DELIVERED')) isDisabled = true;
                                                                            }
                                                                            
                                                                            return <option key={s} value={s} disabled={isDisabled}>{s.replace(/_/g, ' ')}</option>;
                                                                        })}
                                                                    </select>
                                                                </td>
                                                            </tr>
                                                            <tr className="border-b-4 border-slate-100 bg-slate-50/50">
                                                                <td colSpan="6" className="py-4 px-2 sm:px-4">
                                                                    <div className="relative flex items-center justify-between w-full max-w-xl mx-auto my-4 px-2">
                                                                        {/* Interconnecting Lines */}
                                                                        <div className="absolute left-4 sm:left-6 top-3 w-[calc(100%-2rem)] sm:w-[calc(100%-3rem)] h-[3px] bg-[#D5D9D9] z-0 rounded-full"></div>
                                                                        <div className="absolute left-4 sm:left-6 top-3 h-[3px] bg-[#007185] z-0 transition-all duration-1000 rounded-full"
                                                                            style={{
                                                                                width: (order.status === 'CANCELLED' || order.status === 'CANCEL_REQUESTED') ? '0%' :
                                                                                    `${(['PENDING', 'CONFIRMED', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED'].indexOf(order.status) / 4) * 100}%`
                                                                            }}>
                                                                        </div>

                                                                        {['PENDING', 'CONFIRMED', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED'].map((step, idx) => {
                                                                            const statuses = ['PENDING', 'CONFIRMED', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED'];
                                                                            const currentIdx = statuses.indexOf(order.status);
                                                                            const isCompleted = idx <= currentIdx;
                                                                            const isCurrent = idx === currentIdx;
                                                                            const isCancelled = order.status === 'CANCELLED' || order.status === 'CANCEL_REQUESTED';

                                                                            return (
                                                                                <div key={step} className="relative z-10 flex flex-col items-center">
                                                                                    <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full border-[3px] sm:border-4 border-white flex items-center justify-center shadow-sm transition-all duration-500 ${
                                                                                        isCompleted && !isCancelled ? 'bg-[#007185] text-white' : 'bg-[#D5D9D9] text-transparent'
                                                                                    } ${isCurrent && !isCancelled ? 'ring-2 sm:ring-4 ring-green-100' : ''}`}>
                                                                                        {isCompleted && !isCancelled && <CheckCircle size={idx === currentIdx ? 14 : 12} />}
                                                                                    </div>
                                                                                    <span className={`text-[8px] sm:text-[9px] mt-1.5 font-black tracking-tight uppercase ${isCompleted && !isCancelled ? 'text-slate-900' : 'text-slate-400'}`}>
                                                                                        {step === 'PENDING' ? 'Ordered' : step === 'CONFIRMED' ? 'Confirmed' : step === 'OUT_FOR_DELIVERY' ? 'Out' : step === 'SHIPPED' ? 'Shipped' : 'Delivered'}
                                                                                    </span>
                                                                                </div>
                                                                            );
                                                                        })}
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        </React.Fragment>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                );
                            })()}
                        </div>
                    )}

                    {activeTab === 'analytics' && (
                        <div className="space-y-8 animate-in fade-in duration-500">
                            {/* Summary Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {[
                                    { label: 'Weekly Average', val: analyticsData?.dailyAvgWeekly, icon: <Calendar className="text-blue-600" />, trend: '+12%', color: 'bg-blue-50', sub: 'Last 7 days' },
                                    { label: 'Monthly Average', val: analyticsData?.dailyAvgMonthly, icon: <ShoppingBag className="text-orange-600" />, trend: '+5%', color: 'bg-orange-50', sub: 'Last 30 days' },
                                    { label: 'Yearly (Monthly Avg)', val: analyticsData?.monthlyAvgYearly, icon: <TrendingUp className="text-green-600" />, trend: '+18%', color: 'bg-green-50', sub: 'Last 12 months' }
                                ].map((stat, i) => (
                                    <div key={i} className={`${stat.color} rounded-3xl p-6 border border-white shadow-sm hover:shadow-md transition-all`}>
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="p-3 bg-white rounded-2xl shadow-sm">
                                                {stat.icon}
                                            </div>
                                            <span className="flex items-center text-xs font-bold text-green-600 bg-green-100 px-2 py-1 rounded-full">
                                                <ArrowUpRight size={12} className="mr-0.5" /> {stat.trend}
                                            </span>
                                        </div>
                                        <div>
                                            <h4 className="text-slate-500 text-sm font-medium">{stat.label}</h4>
                                            <div className="text-3xl font-black text-slate-900 mt-1">{stat.val || 0} <span className="text-sm font-bold text-slate-400">Orders</span></div>
                                            <p className="text-[10px] text-slate-400 mt-2 uppercase font-black tracking-widest">{stat.sub}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Charts Section */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                {/* Trend Chart */}
                                <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
                                    <div className="flex justify-between items-center mb-8">
                                        <div>
                                            <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">Order Trend</h3>
                                            <p className="text-xs text-slate-500">Sales volume performance</p>
                                        </div>
                                        <div className="flex bg-slate-100 p-1 rounded-xl">
                                            {['weekly', 'monthly', 'yearly'].map(range => (
                                                <button
                                                    key={range}
                                                    onClick={() => setAnalyticsRange(range)}
                                                    className={`px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${
                                                        analyticsRange === range ? 'bg-white text-orange-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                                                    }`}
                                                >
                                                    {range}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="h-[300px] w-full">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <AreaChart data={analyticsData?.[`${analyticsRange}Trend`] || []}>
                                                <defs>
                                                    <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor="#f97316" stopOpacity={0.1}/>
                                                        <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                                                    </linearGradient>
                                                </defs>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                                <XAxis 
                                                    dataKey="label" 
                                                    axisLine={false} 
                                                    tickLine={false} 
                                                    tick={{ fontSize: 10, fontWeight: 700, fill: '#64748b' }}
                                                    dy={10}
                                                />
                                                <YAxis 
                                                    axisLine={false} 
                                                    tickLine={false} 
                                                    tick={{ fontSize: 10, fontWeight: 700, fill: '#64748b' }}
                                                />
                                                <Tooltip 
                                                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', padding: '12px' }}
                                                />
                                                <Area 
                                                    type="monotone" 
                                                    dataKey="orders" 
                                                    stroke="#f97316" 
                                                    strokeWidth={3}
                                                    fillOpacity={1} 
                                                    fill="url(#colorOrders)" 
                                                    animationDuration={1500}
                                                />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>

                                {/* Summary Bar Chart */}
                                <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
                                    <div className="mb-8">
                                        <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">Total Comparisons</h3>
                                        <p className="text-xs text-slate-500">Total orders by period</p>
                                    </div>

                                    <div className="h-[300px] w-full">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={[
                                                { name: 'Weekly', total: analyticsData?.weeklyTotal },
                                                { name: 'Monthly', total: analyticsData?.monthlyTotal },
                                                { name: 'Yearly', total: analyticsData?.yearlyTotal }
                                            ]}>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                                <XAxis 
                                                    dataKey="name" 
                                                    axisLine={false} 
                                                    tickLine={false} 
                                                    tick={{ fontSize: 10, fontWeight: 700, fill: '#64748b' }}
                                                    dy={10}
                                                />
                                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#64748b' }} />
                                                <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                                                <Bar dataKey="total" radius={[8, 8, 0, 0]} animationDuration={1000}>
                                                    {
                                                        [0, 1, 2].map((entry, index) => (
                                                            <Cell key={`cell-${index}`} fill={['#3b82f6', '#f97316', '#10b981'][index]} />
                                                        ))
                                                    }
                                                </Bar>
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'delivery' && (
                        <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
                            <div className="flex justify-between items-center mb-6">
                                <div>
                                    <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Delivery Performance</h2>
                                    <p className="text-slate-500 text-sm">Real-time statistics for registered agents</p>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={fetchAgentAnalytics} className="p-2 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors">
                                        <TrendingUp size={20} className="text-slate-600" />
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-6">
                                {agentStats.length === 0 ? (
                                    <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
                                        <Users className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                                        <p className="text-slate-500 font-medium">No delivery agents found.</p>
                                    </div>
                                ) : (
                                    agentStats.map((agent, idx) => (
                                        <motion.div 
                                            key={agent.agentId}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: idx * 0.1 }}
                                            className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm hover:shadow-md transition-all group"
                                        >
                                            <div className="flex flex-col lg:flex-row gap-8 items-start lg:items-center">
                                                {/* Agent Header */}
                                                <div className="flex items-center gap-4 w-full lg:w-1/4">
                                                    <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center shrink-0">
                                                        <Users className="text-orange-600 w-8 h-8" />
                                                    </div>
                                                    <div className="overflow-hidden">
                                                        <h3 className="text-lg font-black text-slate-900 truncate">{agent.agentName}</h3>
                                                        <p className="text-xs text-slate-500 truncate">{agent.email}</p>
                                                        <span className="mt-2 inline-block px-2 py-0.5 bg-green-50 text-green-600 text-[10px] font-black uppercase tracking-widest rounded-full border border-green-100 italic">
                                                            Active
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Stats Grid */}
                                                <div className="flex flex-col gap-6 w-full lg:w-3/4">
                                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col justify-center">
                                                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Total</p>
                                                            <p className="text-xl font-black text-slate-900">{agent.totalCompleted}</p>
                                                            <p className="text-[10px] text-slate-500">Delivered</p>
                                                        </div>
                                                        <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100/50 flex flex-col justify-center">
                                                            <p className="text-[10px] font-black uppercase tracking-widest text-blue-400 mb-1">Avg/Day</p>
                                                            <p className="text-xl font-black text-blue-600">{agent.avgPerDay}</p>
                                                            <p className="text-[10px] text-blue-500">Last 24h</p>
                                                        </div>
                                                        <div className="p-4 bg-orange-50/50 rounded-2xl border border-orange-100/50 flex flex-col justify-center">
                                                            <p className="text-[10px] font-black uppercase tracking-widest text-orange-400 mb-1">Weekly Avg</p>
                                                            <p className="text-xl font-black text-orange-600">{agent.avgPerWeek}</p>
                                                            <p className="text-[10px] text-orange-500">Daily Average</p>
                                                        </div>
                                                        <div className="p-4 bg-purple-50/50 rounded-2xl border border-purple-100/50 flex flex-col justify-center">
                                                            <p className="text-[10px] font-black uppercase tracking-widest text-purple-400 mb-1">Monthly Avg</p>
                                                            <p className="text-xl font-black text-purple-600">{agent.avgPerMonth}</p>
                                                            <p className="text-[10px] text-purple-500">Daily Average</p>
                                                        </div>
                                                    </div>

                                                    {/* Agent Specific Chart */}
                                                    <div className="mt-2 bg-slate-50/50 rounded-2xl p-6 border border-slate-100">
                                                        <div className="flex justify-between items-center mb-4">
                                                            <h4 className="text-xs font-black text-slate-600 uppercase tracking-widest">Delivery Trend</h4>
                                                            <div className="flex bg-white/50 p-1 rounded-lg border border-slate-200">
                                                                {['weekly', 'monthly', 'yearly'].map(range => (
                                                                    <button
                                                                        key={range}
                                                                        onClick={() => setAgentRanges(prev => ({...prev, [agent.agentId]: range}))}
                                                                        className={`px-3 py-1 text-[9px] font-black uppercase tracking-tight rounded-md transition-all ${
                                                                            (agentRanges[agent.agentId] || 'weekly') === range 
                                                                                ? 'bg-white text-orange-600 shadow-sm' 
                                                                                : 'text-slate-500'
                                                                        }`}
                                                                    >
                                                                        {range}
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        </div>
                                                        <div className="h-32 w-full">
                                                            <ResponsiveContainer width="100%" height="100%">
                                                                <AreaChart data={agent[`${agentRanges[agent.agentId] || 'weekly'}Trend`] || []}>
                                                                    <defs>
                                                                        <linearGradient id={`grad-${agent.agentId}`} x1="0" y1="0" x2="0" y2="1">
                                                                            <stop offset="5%" stopColor="#f97316" stopOpacity={0.1}/>
                                                                            <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                                                                        </linearGradient>
                                                                    </defs>
                                                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                                                    <XAxis dataKey="label" hide />
                                                                    <YAxis hide />
                                                                    <Tooltip contentStyle={{ fontSize: '10px', borderRadius: '8px' }} />
                                                                    <Area 
                                                                        type="monotone" 
                                                                        dataKey="orders" 
                                                                        stroke="#f97316" 
                                                                        fill={`url(#grad-${agent.agentId})`}
                                                                        strokeWidth={2}
                                                                        animationDuration={1000}
                                                                    />
                                                                </AreaChart>
                                                            </ResponsiveContainer>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}


                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
