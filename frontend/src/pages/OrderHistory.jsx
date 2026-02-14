import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../services/api';

const statusConfig = {
    pending: { label: 'Pending', color: 'bg-amber-50 text-amber-700 border-amber-200', dot: 'bg-amber-400' },
    confirmed: { label: 'Confirmed', color: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-400' },
    cancelled: { label: 'Cancelled', color: 'bg-red-50 text-red-700 border-red-200', dot: 'bg-red-400' },
    shipped: { label: 'Shipped', color: 'bg-blue-50 text-blue-700 border-blue-200', dot: 'bg-blue-400' },
    delivered: { label: 'Delivered', color: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-400' },
};

const getStatus = (status) => statusConfig[status?.toLowerCase()] || statusConfig.pending;

const OrderHistory = () => {
    const [expandedOrder, setExpandedOrder] = useState(null);

    const { data: orders = [], isLoading: loading, error } = useQuery({
        queryKey: ['orders'],
        queryFn: async () => {
            const res = await api.getOrders();
            return res.data;
        },
        staleTime: 2 * 60 * 1000, // 2 min cache
    });

    if (loading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <div className="animate-spin rounded-full h-10 w-10 border-[3px] border-indigo-100 border-t-indigo-600"></div>
                    <p className="text-sm text-gray-500">Loading orders...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                        </svg>
                    </div>
                    <p className="text-red-500 font-medium">{error}</p>
                </div>
            </div>
        );
    }

    if (orders.length === 0) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <div className="text-center max-w-md px-6">
                    <div className="w-20 h-20 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <svg className="h-10 w-10 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">No orders yet</h2>
                    <p className="text-gray-500 mb-8 text-sm">When you place an order, it will appear here.</p>
                    <Link to="/products"
                        className="inline-flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-xl font-medium text-sm hover:bg-indigo-700 transition-all duration-200 shadow-sm shadow-indigo-200"
                    >
                        Start Shopping
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900">My Orders</h1>
                <p className="text-sm text-gray-500 mt-1">{orders.length} {orders.length === 1 ? 'order' : 'orders'}</p>
            </div>

            <div className="space-y-4">
                {orders.map((order) => {
                    const st = getStatus(order.status);
                    const isExpanded = expandedOrder === order.id;
                    const orderDate = new Date(order.created_at).toLocaleDateString('en-IN', {
                        day: 'numeric', month: 'short', year: 'numeric'
                    });
                    const orderTime = new Date(order.created_at).toLocaleTimeString('en-IN', {
                        hour: '2-digit', minute: '2-digit'
                    });

                    return (
                        <div key={order.id} className="bg-white border border-gray-100 rounded-2xl overflow-hidden transition-all duration-200 hover:shadow-md hover:border-gray-200">
                            {/* Order Header — clickable */}
                            <button
                                onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                                className="w-full p-5 text-left"
                            >
                                <div className="flex items-center justify-between gap-4">
                                    <div className="flex items-center gap-4 min-w-0">
                                        {/* Order Icon */}
                                        <div className="w-11 h-11 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl flex items-center justify-center flex-shrink-0">
                                            <svg className="w-5 h-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                                            </svg>
                                        </div>

                                        <div className="min-w-0">
                                            <p className="font-semibold text-gray-900 text-sm">Order #{order.id}</p>
                                            <p className="text-xs text-gray-400 mt-0.5">{orderDate} at {orderTime}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4 flex-shrink-0">
                                        {/* Status Badge */}
                                        <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border ${st.color}`}>
                                            <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`}></span>
                                            {st.label}
                                        </span>
                                        {/* Total */}
                                        <span className="font-bold text-gray-900">₹{order.total_amount?.toLocaleString()}</span>
                                        {/* Chevron */}
                                        <svg className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                                        </svg>
                                    </div>
                                </div>
                            </button>

                            {/* Expanded Details */}
                            {isExpanded && (
                                <div className="border-t border-gray-50 bg-gray-50/50">
                                    {/* Items */}
                                    <div className="px-5 py-4">
                                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Items</p>
                                        <div className="space-y-3">
                                            {(order.items || []).map((item) => (
                                                <div key={item.id} className="flex items-center gap-3 bg-white rounded-xl p-3 border border-gray-100">
                                                    <div className="h-12 w-12 rounded-lg overflow-hidden bg-gray-50 flex-shrink-0 border border-gray-100">
                                                        <img
                                                            src={item.product?.image_url || "https://via.placeholder.com/80"}
                                                            alt={item.product?.name}
                                                            className="h-full w-full object-cover"
                                                            onError={(e) => { e.target.onerror = null; e.target.src = "https://via.placeholder.com/80"; }}
                                                        />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-medium text-gray-900 truncate">{item.product?.name}</p>
                                                        <p className="text-xs text-gray-400">Qty: {item.quantity} × ₹{item.price_at_purchase?.toLocaleString()}</p>
                                                    </div>
                                                    <p className="font-semibold text-sm text-gray-900">
                                                        ₹{((item.price_at_purchase || 0) * item.quantity).toLocaleString()}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Summary */}
                                    <div className="px-5 pb-5">
                                        <div className="bg-white rounded-xl p-4 border border-gray-100 space-y-2 text-sm">
                                            <div className="flex justify-between text-gray-500">
                                                <span>Subtotal</span>
                                                <span>₹{order.subtotal?.toLocaleString()}</span>
                                            </div>
                                            {order.discount_amount > 0 && (
                                                <div className="flex justify-between text-emerald-600">
                                                    <span>Discount {order.coupon_code && `(${order.coupon_code})`}</span>
                                                    <span>-₹{order.discount_amount?.toLocaleString()}</span>
                                                </div>
                                            )}
                                            <div className="flex justify-between text-gray-500">
                                                <span>Shipping</span>
                                                <span>{order.shipping_cost > 0 ? `₹${order.shipping_cost}` : 'Free'}</span>
                                            </div>
                                            <div className="flex justify-between font-bold text-gray-900 pt-2 border-t border-gray-100">
                                                <span>Total</span>
                                                <span>₹{order.total_amount?.toLocaleString()}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Shipment Tracking */}
                                    {order.shipment && (() => {
                                        const steps = [
                                            { key: 'confirmed', label: 'Confirmed' },
                                            { key: 'ready_to_ship', label: 'Ready to Ship' },
                                            { key: 'shipped', label: 'Shipped' },
                                            { key: 'delivered', label: 'Delivered' },
                                        ];
                                        const currentIdx = steps.findIndex(s => s.key === order.shipment.status);
                                        return (
                                            <div className="px-5 pb-5">
                                                <div className="bg-white rounded-xl p-4 border border-gray-100">
                                                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Shipment Tracking</p>

                                                    {/* Progress Stepper */}
                                                    <div className="flex items-center justify-between mb-4">
                                                        {steps.map((step, idx) => (
                                                            <div key={step.key} className="flex items-center flex-1 last:flex-none">
                                                                <div className="flex flex-col items-center">
                                                                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${idx <= currentIdx
                                                                        ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-200'
                                                                        : 'bg-gray-100 text-gray-400'
                                                                        }`}>
                                                                        {idx <= currentIdx ? (
                                                                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                                                            </svg>
                                                                        ) : idx + 1}
                                                                    </div>
                                                                    <p className={`text-[10px] mt-1.5 font-medium whitespace-nowrap ${idx <= currentIdx ? 'text-indigo-600' : 'text-gray-400'
                                                                        }`}>{step.label}</p>
                                                                </div>
                                                                {idx < steps.length - 1 && (
                                                                    <div className={`flex-1 h-0.5 mx-2 mt-[-16px] rounded ${idx < currentIdx ? 'bg-indigo-500' : 'bg-gray-100'
                                                                        }`}></div>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>

                                                    {/* Courier & Tracking */}
                                                    {(order.shipment.courier_name || order.shipment.tracking_id) && (
                                                        <div className="flex gap-4 pt-3 border-t border-gray-50 text-xs">
                                                            {order.shipment.courier_name && (
                                                                <div>
                                                                    <p className="text-gray-400">Courier</p>
                                                                    <p className="font-medium text-gray-900">{order.shipment.courier_name}</p>
                                                                </div>
                                                            )}
                                                            {order.shipment.tracking_id && (
                                                                <div>
                                                                    <p className="text-gray-400">Tracking ID</p>
                                                                    <p className="font-mono font-medium text-gray-900">{order.shipment.tracking_id}</p>
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })()}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default OrderHistory;
