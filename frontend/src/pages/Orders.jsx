import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Search, Package, ChevronRight, Download, Truck, MessageCircle, Star, Calendar, Filter, ExternalLink, ShieldCheck } from 'lucide-react';
import { fetchOrders } from '../features/order/orderSlice';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const OrdersPage = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { items: orders, status } = useSelector(state => state.order);
    const [searchTerm, setSearchTerm] = useState('');
    const [timeFilter, setTimeFilter] = useState('all');

    useEffect(() => {
        dispatch(fetchOrders());
    }, [dispatch]);

    const handleDownloadInvoice = (order) => {
        const doc = new jsPDF();

        // Header
        doc.setFontSize(22);
        doc.setTextColor(35, 47, 62); // Amazon Navy
        doc.text("QuickCart Invoice", 105, 20, { align: "center" });

        doc.setDrawColor(200, 200, 200);
        doc.line(15, 25, 195, 25);

        doc.setFontSize(10);
        doc.setTextColor(80, 80, 80);
        doc.text(`Order ID: ${order.orderId}`, 15, 35);
        doc.text(`Order Date: ${new Date(order.orderDate).toLocaleDateString()}`, 15, 40);
        doc.text(`Invoice Issued: ${new Date().toLocaleDateString()}`, 15, 45);

        // Merchant Details
        doc.setFontSize(11);
        doc.setTextColor(0, 0, 0);
        doc.setFont("helvetica", "bold");
        doc.text("Sold By:", 15, 60);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.text("QuickCart Solutions Pvt Ltd", 15, 65);
        doc.text("GSTIN: 22AAAAA0000A1Z5", 15, 70);
        doc.text("123 Tech Park, Taramani", 15, 75);
        doc.text("Chennai, Tamil Nadu, 600113", 15, 80);

        // Billing Details
        doc.setFontSize(11);
        doc.setFont("helvetica", "bold");
        doc.text("Billed To:", 120, 60);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.text(order.deliveryAddress?.fullName || "Customer", 120, 65);
        doc.text(order.deliveryAddress?.streetAddress || "Address Not Provided", 120, 70);
        doc.text(`${order.deliveryAddress?.city}, ${order.deliveryAddress?.state || "India"} - ${order.deliveryAddress?.zipCode || ""}`, 120, 75);
        doc.text(`Phone: ${order.deliveryAddress?.phoneNumber || "N/A"}`, 120, 80);

        // Table
        const tableColumn = ["Item Description", "Qty", "Price", "Total"];
        const tableRows = [];

        order.items.forEach(item => {
            const itemData = [
                item.product?.name || "Product",
                item.quantity,
                `INR ${item.price.toFixed(2)}`,
                `INR ${(item.price * item.quantity).toFixed(2)}`
            ];
            tableRows.push(itemData);
        });

        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: 95,
            theme: 'striped',
            headStyles: { fillColor: [35, 47, 62], textColor: [255, 255, 255], fontStyle: 'bold' },
            bodyStyles: { fontSize: 9 },
            columnStyles: {
                0: { cellWidth: 100 },
                1: { halign: 'center' },
                2: { halign: 'right' },
                3: { halign: 'right' }
            }
        });

        // Summary
        const finalY = doc.lastAutoTable.finalY + 15;
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        
        const summaryX = 140;
        doc.text(`Subtotal:`, summaryX, finalY);
        doc.text(`INR ${order.totalAmount.toFixed(2)}`, 195, finalY, { align: 'right' });

        doc.text(`Marketplace Fee:`, summaryX, finalY + 7);
        doc.text(`INR ${order.marketplaceFee?.toFixed(2) || '10.00'}`, 195, finalY + 7, { align: 'right' });

        if (order.discountAmount > 0) {
            doc.setTextColor(34, 197, 94);
            doc.text(`Discount:`, summaryX, finalY + 14);
            doc.text(`-INR ${order.discountAmount.toFixed(2)}`, 195, finalY + 14, { align: 'right' });
            doc.setTextColor(0, 0, 0);
        }

        const totalY = order.discountAmount > 0 ? finalY + 25 : finalY + 18;
        doc.setDrawColor(200, 200, 200);
        doc.line(summaryX, totalY - 5, 195, totalY - 5);
        
        doc.setFontSize(13);
        doc.setFont("helvetica", "bold");
        doc.text(`Total Amount:`, summaryX, totalY);
        doc.text(`INR ${order.finalAmount.toFixed(2)}`, 195, totalY, { align: 'right' });

        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(150, 150, 150);
        doc.text("Thank you for shopping on QuickCart!", 105, totalY + 25, { align: "center" });

        doc.save(`QuickCart_Invoice_${order.orderId}.pdf`);
    };

    const filteredOrders = orders.filter(order => {
        const matchesSearch = order.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.items.some(item => item.product.name.toLowerCase().includes(searchTerm.toLowerCase()));

        if (timeFilter === 'all') return matchesSearch;

        const orderDate = new Date(order.orderDate);
        const now = new Date();
        if (timeFilter === '3months') {
            const threeMonthsAgo = new Date(now.setMonth(now.getMonth() - 3));
            return matchesSearch && orderDate >= threeMonthsAgo;
        }
        if (timeFilter === '2024') return matchesSearch && orderDate.getFullYear() === 2024;
        if (timeFilter === '2023') return matchesSearch && orderDate.getFullYear() === 2023;

        return matchesSearch;
    });

    const getStatusColor = (status) => {
        switch (status) {
            case 'DELIVERED': return 'text-green-600 bg-green-50';
            case 'CANCELLED': return 'text-red-600 bg-red-50';
            case 'SHIPPED': return 'text-blue-600 bg-blue-50';
            default: return 'text-orange-600 bg-orange-50';
        }
    };

    return (
        <div className="bg-slate-50 min-h-screen py-10">
            <div className="max-w-5xl mx-auto px-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">Your Orders</h1>
                        <p className="text-slate-500 mt-1">Manage and track your recent purchases</p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                            <input
                                type="text"
                                placeholder="Search all orders"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 pr-4 py-2 bg-white text-slate-900 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-none w-full sm:w-64 shadow-sm"
                            />
                        </div>
                        <select
                            value={timeFilter}
                            onChange={(e) => setTimeFilter(e.target.value)}
                            className="px-4 py-2 bg-white border border-slate-200 text-slate-900 rounded-lg text-sm outline-none shadow-sm cursor-pointer"
                        >
                            <option value="all">All Orders</option>
                            <option value="3months">Last 3 months</option>
                            <option value="2024">2024</option>
                            <option value="2023">2023</option>
                        </select>
                    </div>
                </div>

                {status === 'loading' ? (
                    <div className="flex justify-center items-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
                    </div>
                ) : filteredOrders.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-slate-100">
                        <Package className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-slate-900">No orders found</h3>
                        <p className="text-slate-500 mb-8">Looks like you haven't placed any orders yet.</p>
                        <button onClick={() => navigate('/')} className="px-8 py-3 bg-orange-500 text-white font-bold rounded-lg hover:bg-orange-600 transition shadow-lg shadow-orange-500/30">
                            Continue Shopping
                        </button>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {filteredOrders.map((order) => (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                key={order.id}
                                className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden"
                            >
                                {/* Order Header */}
                                <div className="bg-slate-50/50 px-4 md:px-6 py-4 flex flex-wrap items-center justify-between gap-4 border-b border-slate-100">
                                    <div className="grid grid-cols-2 md:flex md:gap-8 gap-x-8 gap-y-4 text-[11px] md:text-[12px] text-slate-500 font-bold uppercase tracking-wider w-full md:w-auto">
                                        <div>
                                            <p className="mb-0.5">Order Placed</p>
                                            <p className="text-slate-900">{new Date(order.orderDate).toLocaleDateString()}</p>
                                        </div>
                                        {order.updatedAt && new Date(order.updatedAt).getTime() !== new Date(order.orderDate).getTime() && (
                                            <div>
                                                <p className="mb-0.5 text-orange-600">Last Update</p>
                                                <p className="text-orange-700 font-black">
                                                    {new Date(order.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    <span className="ml-1 font-medium">{new Date(order.updatedAt).toLocaleDateString()}</span>
                                                </p>
                                            </div>
                                        )}
                                        <div>
                                            <p className="mb-0.5">Total</p>
                                            <p className="text-slate-900">₹{order.finalAmount.toFixed(2)}</p>
                                        </div>
                                        <div>
                                            <p className="mb-0.5">Ship To</p>
                                            <p className="text-blue-600 hover:underline cursor-pointer">{order.deliveryAddress?.fullName || 'User'}</p>
                                        </div>
                                    </div>
                                    <div className="text-[12px] font-bold text-right">
                                        <p className="text-slate-500 uppercase tracking-wider mb-0.5">Order # {order.orderId}</p>
                                        <div className="flex items-center gap-4 text-blue-600">
                                            <button onClick={() => navigate(`/orders/${order.id}`)} className="hover:underline">View Order Details</button>
                                            <span className="w-px h-3 bg-slate-300"></span>
                                            <button 
                                                onClick={() => handleDownloadInvoice(order)}
                                                className="flex items-center gap-1 hover:underline"
                                            >
                                                Invoice <Download size={14} />
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Order Content */}
                                <div className="p-6">
                                    <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                                        <div className="flex items-center gap-3">
                                            <span className={`px-3 py-1 rounded-full text-[12px] font-bold ${getStatusColor(order.status)}`}>
                                                {order.status}
                                            </span>
                                            <p className="text-sm font-bold text-slate-800">
                                                {(() => {
                                                    const today = new Date();
                                                    const expected = new Date(order.expectedDeliveryDate);
                                                    const isToday = expected.toDateString() === today.toDateString();
                                                    const tomorrow = new Date(today);
                                                    tomorrow.setDate(today.getDate() + 1);
                                                    const isTomorrow = expected.toDateString() === tomorrow.toDateString();

                                                    if (order.status === 'DELIVERED') return 'Delivered on ' + expected.toLocaleDateString('en-US', { day: 'numeric', month: 'long' });
                                                    if (isToday) return 'Arriving TODAY';
                                                    if (isTomorrow) return 'Arriving Tomorrow';
                                                    return 'Expected delivery by ' + expected.toLocaleDateString('en-US', { day: 'numeric', month: 'long' });
                                                })()}
                                            </p>
                                        </div>

                                        {order.status === 'OUT_FOR_DELIVERY' && order.deliveryOtp && (
                                            <div className="flex items-center gap-2 bg-orange-100 px-3 py-1.5 rounded-lg border border-orange-200">
                                                <ShieldCheck size={16} className="text-orange-600" />
                                                <span className="text-xs font-black text-orange-700 uppercase tracking-widest">Delivery OTP: </span>
                                                <span className="text-sm font-black text-orange-800 tracking-widest">{order.deliveryOtp}</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="space-y-6">
                                        {order.items.map((item) => (
                                            <div key={item.id} className="flex flex-col md:flex-row gap-6">
                                                <div className="w-24 h-24 bg-slate-50 rounded-xl flex items-center justify-center p-2 border border-slate-100 shrink-0">
                                                    <img src={item.product?.imageUrl?.startsWith('/') ? `http://localhost:5173${item.product.imageUrl}` : item.product?.imageUrl || 'https://via.placeholder.com/48'} alt={item.product?.name} className="max-w-full max-h-full object-contain" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="text-sm font-bold text-slate-900 line-clamp-2 hover:text-orange-600 cursor-pointer transition">
                                                        {item.product?.name || "Product"}
                                                    </h4>
                                                    <p className="text-xs text-slate-500 mt-1 whitespace-nowrap">Quantity: {item.quantity}</p>

                                                    <div className="flex flex-wrap gap-2 mt-4">
                                                        <button
                                                            onClick={() => navigate(`/product/${item.product?.id}`)}
                                                            className="px-4 py-1.5 bg-[#FFD814] hover:bg-[#F7CA00] border border-[#FCD200] text-slate-900 text-[12px] font-bold rounded-full transition shadow-sm"
                                                        >
                                                            Buy it again
                                                        </button>
                                                        <button onClick={() => navigate(`/orders/${order.id}`)} className="px-4 py-1.5 border border-slate-200 hover:bg-slate-50 text-slate-700 text-[12px] font-bold rounded-full transition">
                                                            Track package
                                                        </button>
                                                    </div>
                                                </div>

                                                {/* Action Buttons */}
                                                <div className="hidden md:flex flex-col gap-2 w-48 shrink-0">
                                                    <button onClick={() => navigate(`/orders/${order.id}`)} className="w-full py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-[12px] font-bold rounded-lg transition shadow-sm flex items-center justify-center gap-2">
                                                        <Truck size={14} className="text-orange-500" /> Track Package
                                                    </button>
                                                    <button className="w-full py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-[12px] font-bold rounded-lg transition shadow-sm flex items-center justify-center gap-2">
                                                        <MessageCircle size={14} className="text-blue-500" /> Get product support
                                                    </button>
                                                    <button
                                                        onClick={() => navigate(`/product/${item.product?.id}#reviews`)}
                                                        className="w-full py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-[12px] font-bold rounded-lg transition shadow-sm flex items-center justify-center gap-2"
                                                    >
                                                        <Star size={14} className="text-yellow-500" /> Write product review
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default OrdersPage;
