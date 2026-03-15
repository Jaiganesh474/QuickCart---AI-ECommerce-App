import React, { useEffect, useState } from 'react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useParams, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { fetchOrders } from '../features/order/orderSlice';
import { ChevronRight, Package, Printer, MapPin, CreditCard, ShoppingBag, ShieldCheck, HelpCircle, MessageSquare, Star, Search, Banknote, Truck } from 'lucide-react';
import { motion } from 'framer-motion';

const OrderDetails = () => {
    const { id } = useParams();
    const dispatch = useDispatch();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);

    const { items: orders, status } = useSelector(state => state.order);

    const handleDownloadInvoice = () => {
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

    const handleCancelOrder = async () => {
        if (!window.confirm("Are you sure you want to cancel this order? It will be sent for admin approval.")) return;
        try {
            const token = localStorage.getItem('quickcart_jwt');
            const res = await fetch(`/api/orders/${order.id}/cancel-request`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                alert("Cancellation requested successfully!");
                dispatch(fetchOrders());
            } else {
                const errorData = await res.json().catch(() => ({}));
                alert(errorData.message || "Failed to request cancellation.");
            }
        } catch (e) {
            console.error(e);
            alert("Error: " + e.message);
        }
    };


    useEffect(() => {
        if (status === 'idle') {
            dispatch(fetchOrders());
        }
    }, [status, dispatch]);

    useEffect(() => {
        if (orders.length > 0) {
            const foundOrder = orders.find(o => o.id.toString() === id);
            if (foundOrder) {
                setOrder(foundOrder);
            }
        }
    }, [id, orders]);

    useEffect(() => {
        if (status === 'succeeded' || status === 'failed') {
            setLoading(false);
        }
    }, [status]);

    if (loading) return <div className="min-h-screen flex items-center justify-center text-slate-900">Loading...</div>;
    if (!order) return <div className="min-h-screen flex items-center justify-center text-slate-900">Order not found.</div>;

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
    };

    return (
        <div className="min-h-screen bg-white py-10 px-4 md:px-10">
            <div className="max-w-5xl mx-auto">

                {/* Breadcrumbs */}
                <nav className="flex items-center gap-1 text-sm text-[#007185] mb-6">
                    <Link to="/account" className="hover:underline">Your Account</Link>
                    <ChevronRight size={14} className="text-slate-400" />
                    <Link to="/orders" className="hover:underline">Your Orders</Link>
                    <ChevronRight size={14} className="text-slate-400" />
                    <span className="text-[#C7511F]">Order Details</span>
                </nav>

                <h1 className="text-3xl font-medium text-slate-900 mb-2">Order Details</h1>

                <div className="flex flex-wrap items-center justify-between gap-4 text-sm text-slate-600 mb-6 pb-4 border-b border-slate-200">
                    <div className="flex gap-4">
                        <span>Ordered on {formatDate(order.orderDate)}</span>
                        <span className="text-slate-300">|</span>
                        <span>Order number <span className="font-bold text-slate-900">{order.orderId}</span></span>
                    </div>
                    <div className="flex items-center gap-2 text-[#007185] font-bold group cursor-pointer" onClick={handleDownloadInvoice}>
                        <Printer size={16} />
                        <span className="group-hover:underline">Download Invoice</span>
                        <ChevronRight size={14} />
                    </div>
                </div>

                {/* Summary Section */}
                <div className="grid grid-cols-1 md:grid-cols-3 border border-slate-200 rounded-xl overflow-hidden mb-8">
                    {/* Shipping Address */}
                    <div className="p-5 border-r border-slate-200">
                        <h3 className="font-bold text-slate-900 mb-2">Ship to</h3>
                        <div className="relative group">
                            <p className="text-sm text-[#007185] font-bold mb-1 hover:text-[#C7511F] hover:underline cursor-pointer transition-colors inline-block">
                                {order.deliveryAddress?.receiverName || order.user?.name || "Customer"}
                            </p>
                            <div className="absolute left-0 top-full mt-1 hidden group-hover:block bg-white border border-slate-200 shadow-2xl p-4 rounded-xl z-[100] w-72 pointer-events-none transform transition-all duration-200">
                                <div className="text-slate-900 font-bold mb-2 border-b border-slate-100 pb-2 flex items-center gap-2">
                                    <MapPin size={14} className="text-[#007185]" /> Shipping Address
                                </div>
                                <div className="text-slate-700 font-medium leading-relaxed text-xs space-y-1">
                                    <p className="font-black text-slate-900">{order.deliveryAddress?.receiverName || order.user?.name}</p>
                                    <p>{order.deliveryAddress?.houseNo} {order.deliveryAddress?.streetName}</p>
                                    <p>{order.deliveryAddress?.areaName}</p>
                                    <p>{order.deliveryAddress?.city}, {order.deliveryAddress?.state || 'TAMIL NADU'}</p>
                                    <p className="font-bold">{order.deliveryAddress?.pincode}</p>
                                    <p className="text-[#007185] pt-1">Phone: +91 9XXXXXXXXX</p>
                                </div>
                            </div>
                        </div>
                        <div className="text-sm text-slate-600 leading-relaxed mt-1">
                            {order.deliveryAddress?.houseNo && <span>{order.deliveryAddress.houseNo}<br /></span>}
                            {order.deliveryAddress?.streetName && <span>{order.deliveryAddress.streetName}{order.deliveryAddress.areaName ? `, ${order.deliveryAddress.areaName}` : ''}<br /></span>}
                            <span>{order.deliveryAddress?.city}{order.deliveryAddress?.state ? `, ${order.deliveryAddress.state}` : ''} {order.deliveryAddress?.pincode}</span><br />
                            India
                        </div>
                    </div>

                    {/* Payment Method */}
                    <div className="p-5 border-r border-slate-200">
                        <h3 className="font-bold text-slate-900 mb-2">Payment method</h3>
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                            {order.paymentMethod === 'COD' ? <Banknote size={16} /> : <CreditCard size={16} />}
                            <span>{order.paymentMethod === 'COD' ? 'Cash on Delivery (COD)' : 'BHIM UPI / Online'}</span>
                        </div>
                    </div>

                    {/* Order Summary */}
                    <div className="p-5 bg-slate-50/50">
                        <h3 className="font-bold text-slate-900 mb-2">Order Summary</h3>
                        <div className="space-y-1 text-sm text-slate-600">
                            <div className="flex justify-between">
                                <span>Item(s) Subtotal:</span>
                                <span>₹{order.totalAmount.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Shipping:</span>
                                <span>₹0.00</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Marketplace Fee:</span>
                                <span>₹{order.marketplaceFee?.toFixed(2) || '10.00'}</span>
                            </div>
                            {order.discountAmount > 0 && (
                                <div className="flex justify-between text-green-600 font-bold">
                                    <span>Discount:</span>
                                    <span>-₹{order.discountAmount.toFixed(2)}</span>
                                </div>
                            )}
                            <div className="flex justify-between font-black text-slate-900 pt-1 text-base">
                                <span>Grand Total:</span>
                                <span>₹{order.finalAmount.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Product Section */}
                <div className="border border-slate-200 rounded-xl p-6">
                    <div className="mb-6">
                        <h3 className="text-xl font-bold text-slate-900">
                            {(() => {
                                const today = new Date();
                                const expected = new Date(order.expectedDeliveryDate);
                                const isToday = expected.toDateString() === today.toDateString();
                                const tomorrow = new Date(today);
                                tomorrow.setDate(today.getDate() + 1);
                                const isTomorrow = expected.toDateString() === tomorrow.toDateString();

                                if (order.status === 'DELIVERED') return 'Delivered ' + formatDate(order.expectedDeliveryDate);
                                if (isToday || order.status === 'OUT_FOR_DELIVERY') return 'Arriving TODAY';
                                if (isTomorrow) return 'Arriving Tomorrow';
                                return 'Arriving ' + formatDate(order.expectedDeliveryDate);
                            })()}
                        </h3>
                        <div className="text-sm text-green-700 font-bold mt-1 flex items-center gap-2">
                            <ShieldCheck size={16} /> Standard Delivery
                        </div>
                    </div>

                    {/* Order Tracking Bar */}
                    <div className="mb-10 px-2 mt-8">
                        <div className="flex justify-between items-end mb-6">
                            <h4 className="font-bold text-slate-900">Track package</h4>
                            {order.status === 'OUT_FOR_DELIVERY' && order.deliveryOtp && (
                                <div className="bg-orange-50 border-2 border-dashed border-orange-200 p-4 rounded-xl text-center">
                                    <p className="text-[10px] font-black text-orange-600 uppercase tracking-widest mb-1">Delivery Verification OTP</p>
                                    <p className="text-3xl font-black text-orange-700 tracking-[0.3em]">{order.deliveryOtp}</p>
                                    <p className="text-[10px] text-orange-500 mt-1 font-bold">Share this with your delivery agent</p>
                                </div>
                            )}
                        </div>
                        {order.status === 'CANCELLED' || order.status === 'CANCEL_REQUESTED' ? (
                            <div className="w-full p-4 bg-red-50 text-red-700 font-bold border border-red-200 rounded-xl">
                                {order.status === 'CANCEL_REQUESTED' ? 'Your cancellation request is pending approval.' : 'This order has been cancelled.'}
                            </div>
                        ) : (
                            <>
                                <div className="relative flex items-center justify-between w-full max-w-2xl px-8 mx-auto mb-10">
                                    {/* Interconnecting Lines */}
                                    <div className="absolute left-12 top-4 w-[calc(100%-6rem)] h-[4px] bg-[#D5D9D9] z-0 rounded-full"></div>
                                    <div className="absolute left-12 top-4 h-[4px] bg-[#007185] z-0 rounded-full transition-all duration-1000"
                                        style={{ width: `${(['PENDING', 'CONFIRMED', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED'].indexOf(order.status) / 4) * 100}%` }}>
                                    </div>

                                    {['PENDING', 'CONFIRMED', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED'].map((step, idx) => {
                                        const statuses = ['PENDING', 'CONFIRMED', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED'];
                                        const currentIdx = statuses.indexOf(order.status);
                                        const isCompleted = idx <= currentIdx;
                                        const isCurrent = idx === currentIdx;

                                        return (
                                            <div key={step} className="relative z-10 flex flex-col items-center">
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center border-4 border-white transition-all duration-500 shadow-sm mb-3 ${
                                                    isCompleted ? 'bg-[#007185]' : 'bg-[#D5D9D9]'
                                                } ${isCurrent ? 'ring-4 ring-green-100' : ''}`}>
                                                    {isCompleted && <div className="w-2 h-2 bg-white rounded-full"></div>}
                                                </div>
                                                <div className="h-0 flex items-center justify-center whitespace-nowrap">
                                                    <span className={`text-[10px] font-black tracking-tight uppercase text-center ${isCompleted ? 'text-slate-900' : 'text-slate-400'}`}>
                                                        {step === 'PENDING' ? 'Ordered' : 
                                                         step === 'CONFIRMED' ? 'Confirmed' : 
                                                         step === 'SHIPPED' ? 'Shipped' : 
                                                         step === 'OUT_FOR_DELIVERY' ? 'Out for delivery' : 
                                                         'Delivered'}
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                {order.deliveryAgent && (
                                    <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100 mb-6">
                                        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center border border-slate-200">
                                            <Truck className="text-orange-500" size={24} />
                                        </div>
                                        <div>
                                            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Delivery Partner</p>
                                            <p className="font-bold text-slate-900">{order.deliveryAgent.name}</p>
                                            <p className="text-xs text-slate-500 font-medium">Out for delivery • Contact: {order.deliveryAgent.email}</p>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                        {/* Items List */}
                        <div className="lg:col-span-3 space-y-8">
                            {order.items.map((item, idx) => (
                                <div key={idx} className="flex gap-4">
                                    <div className="w-24 h-24 shrink-0 bg-slate-100 rounded-lg overflow-hidden flex items-center justify-center p-2 border border-slate-100">
                                        <img src={item.product?.imageUrl} alt={item.product?.name} className="w-full h-full object-contain mix-blend-multiply" />
                                    </div>
                                    <div className="flex-1">
                                        <Link to={`/product/${item.product?.id}`} className="text-[#007185] hover:text-[#C7511F] hover:underline font-bold text-sm line-clamp-2 mb-1">
                                            {item.product?.name}
                                        </Link>
                                        <p className="text-xs text-slate-500 mb-1">Sold by: QuickCart</p>
                                        <p className="font-bold text-slate-900">₹{item.price.toFixed(2)}</p>
                                        <p className="text-xs text-slate-500 mt-1 mb-3">Quantity: {item.quantity}</p>
                                        <div className="flex items-center gap-4">
                                            <Link to={`/product/${item.product?.id}`} className="px-3 py-1 border border-slate-300 rounded-full text-xs font-medium bg-slate-900 text-white transition hover:bg-slate-800">
                                                View your item
                                            </Link>
                                            <Link to={`/product/${item.product?.id}`} className="px-3 py-1 border border-slate-300 rounded-full text-xs font-medium text-slate-900 bg-white transition hover:bg-slate-50 shadow-sm">
                                                Write a product review
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Actions Sidebar */}
                        <div className="space-y-4">
                            <Link to="/contact" className="block">
                                <button className="w-full py-2 bg-[#FFD814] hover:bg-[#F7CA00] rounded-full text-slate-900 text-sm font-medium shadow-sm border border-[#FCD200]">
                                    Get product support
                                </button>
                            </Link>
                            <Link to="/contact" className="block">
                                <button className="w-full py-2 bg-white border border-slate-300 text-slate-900 rounded-full text-sm font-medium hover:bg-slate-50">
                                    Leave seller feedback
                                </button>
                            </Link>
                            <button onClick={handleCancelOrder} disabled={['SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED', 'CANCEL_REQUESTED'].includes(order.status)} className="w-full py-2 bg-white border-2 border-slate-300 text-slate-900 rounded-full text-sm font-bold hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all disabled:opacity-0 disabled:pointer-events-none mt-2">
                                Cancel Order
                            </button>
                        </div>
                    </div>
                </div>

                <div className="mt-8 text-center text-sm text-[#007185] flex items-center justify-center gap-6">
                    <span className="hover:underline cursor-pointer">Conditions of Use</span>
                    <span className="hover:underline cursor-pointer">Privacy Notice</span>
                    <span className="hover:underline cursor-pointer">Interest-Based Ads</span>
                </div>
            </div>
        </div>
    );
};

export default OrderDetails;
