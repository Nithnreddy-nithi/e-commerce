import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';

const CartPage = () => {
    const { cart, loading, updateQuantity, removeFromCart, clearCart, fetchCart } = useCart();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [removingId, setRemovingId] = useState(null);
    const navigate = useNavigate();

    if (loading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <div className="animate-spin rounded-full h-10 w-10 border-[3px] border-indigo-100 border-t-indigo-600"></div>
                    <p className="text-sm text-gray-500">Loading your cart...</p>
                </div>
            </div>
        );
    }

    if (!cart || cart.items.length === 0) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <div className="text-center max-w-md px-6">
                    <div className="w-20 h-20 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <svg className="h-10 w-10 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
                    <p className="text-gray-500 mb-8 text-sm leading-relaxed">
                        Looks like you haven't added anything yet. Browse our products and find something you love!
                    </p>
                    <Link to="/products"
                        className="inline-flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-xl font-medium text-sm hover:bg-indigo-700 transition-all duration-200 shadow-sm shadow-indigo-200 hover:shadow-md hover:shadow-indigo-200"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                        </svg>
                        Browse Products
                    </Link>
                </div>
            </div>
        );
    }

    const handleQuantityChange = async (itemId, newQty) => {
        if (newQty < 1) return;
        await updateQuantity(itemId, newQty);
    };

    const handleRemove = async (itemId) => {
        setRemovingId(itemId);
        await removeFromCart(itemId);
        setRemovingId(null);
    };

    const handleCheckout = async () => {
        setIsSubmitting(true);
        try {
            const response = await api.createOrder({});
            const orderId = response.data.id;
            await fetchCart();
            navigate('/checkout', { state: { orderId } });
        } catch (error) {
            console.error("Checkout failed", error);
            const msg = error.response?.data?.detail || "Failed to place order. Please try again.";
            alert(`Checkout Failed: ${msg}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    const subtotal = (cart?.items || []).reduce((total, item) => {
        return total + (item.product?.price || 0) * (item.quantity || 0);
    }, 0);

    const itemCount = (cart?.items || []).reduce((total, item) => total + item.quantity, 0);

    return (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Shopping Cart</h1>
                    <p className="text-sm text-gray-500 mt-1">{itemCount} {itemCount === 1 ? 'item' : 'items'}</p>
                </div>
                <button
                    onClick={clearCart}
                    className="text-sm text-gray-400 hover:text-red-500 transition-colors flex items-center gap-1.5"
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                    </svg>
                    Clear All
                </button>
            </div>

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Cart Items */}
                <div className="flex-1 space-y-3">
                    {cart.items.map((item) => {
                        if (!item || !item.product) return null;
                        const isRemoving = removingId === item.id;
                        return (
                            <div
                                key={item.id}
                                className={`bg-white border border-gray-100 rounded-2xl p-5 flex gap-5 transition-all duration-300 hover:shadow-md hover:border-gray-200 ${isRemoving ? 'opacity-50 scale-[0.98]' : ''}`}
                            >
                                {/* Product Image */}
                                <Link to={`/products/${item.product.id}`} className="flex-shrink-0">
                                    <div className="h-24 w-24 rounded-xl overflow-hidden bg-gray-50 border border-gray-100">
                                        <img
                                            src={item.product.image_url || "https://via.placeholder.com/150"}
                                            alt={item.product.name}
                                            className="h-full w-full object-cover hover:scale-110 transition-transform duration-300"
                                            onError={(e) => { e.target.onerror = null; e.target.src = "https://via.placeholder.com/150"; }}
                                        />
                                    </div>
                                </Link>

                                {/* Product Details */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-4">
                                        <div>
                                            <Link to={`/products/${item.product.id}`}
                                                className="font-semibold text-gray-900 hover:text-indigo-600 transition-colors line-clamp-1"
                                            >
                                                {item.product.name}
                                            </Link>
                                            {item.product.category && (
                                                <p className="text-xs text-gray-400 mt-0.5">{item.product.category.name}</p>
                                            )}
                                            <p className="text-sm text-gray-500 mt-1">₹{item.product.price?.toLocaleString()}</p>
                                        </div>
                                        <p className="font-bold text-gray-900 text-lg whitespace-nowrap">
                                            ₹{((item.product.price || 0) * item.quantity).toLocaleString()}
                                        </p>
                                    </div>

                                    <div className="flex items-center justify-between mt-4">
                                        {/* Quantity Controls */}
                                        <div className="flex items-center bg-gray-50 rounded-xl border border-gray-200 overflow-hidden">
                                            <button
                                                onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                                                className="w-9 h-9 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-30"
                                                disabled={item.quantity <= 1}
                                            >
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12h-15" />
                                                </svg>
                                            </button>
                                            <span className="w-10 text-center text-sm font-semibold text-gray-900">{item.quantity}</span>
                                            <button
                                                onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                                                className="w-9 h-9 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors"
                                            >
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                                                </svg>
                                            </button>
                                        </div>

                                        {/* Remove Button */}
                                        <button
                                            onClick={() => handleRemove(item.id)}
                                            disabled={isRemoving}
                                            className="text-xs font-medium text-gray-400 hover:text-red-500 transition-colors flex items-center gap-1"
                                        >
                                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                            Remove
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Order Summary Sidebar */}
                <div className="lg:w-[360px]">
                    <div className="bg-white border border-gray-100 rounded-2xl p-6 sticky top-24 shadow-sm">
                        <h2 className="font-bold text-gray-900 mb-5">Order Summary</h2>

                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between text-gray-600">
                                <span>Subtotal ({itemCount} items)</span>
                                <span className="font-medium text-gray-900">₹{subtotal.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-gray-600">
                                <span>Shipping</span>
                                <span className="font-medium text-emerald-600">
                                    {subtotal >= 500 ? 'Free' : '₹50'}
                                </span>
                            </div>
                        </div>

                        <div className="border-t border-gray-100 mt-5 pt-5">
                            <div className="flex justify-between items-center">
                                <span className="font-bold text-gray-900">Total</span>
                                <span className="text-xl font-bold text-gray-900">
                                    ₹{(subtotal + (subtotal >= 500 ? 0 : 50)).toLocaleString()}
                                </span>
                            </div>
                            {subtotal >= 500 && (
                                <p className="text-xs text-emerald-600 mt-1 flex items-center gap-1">
                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    You qualify for free shipping!
                                </p>
                            )}
                        </div>

                        <button
                            onClick={handleCheckout}
                            disabled={isSubmitting}
                            className="w-full mt-6 bg-indigo-600 text-white py-3.5 px-6 rounded-xl font-semibold text-sm transition-all duration-200 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm shadow-indigo-200 hover:shadow-md hover:shadow-indigo-200 flex items-center justify-center gap-2"
                        >
                            {isSubmitting ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white"></div>
                                    Processing...
                                </>
                            ) : (
                                <>
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                                    </svg>
                                    Proceed to Checkout
                                </>
                            )}
                        </button>

                        <Link to="/products"
                            className="block text-center text-sm text-gray-500 hover:text-indigo-600 transition-colors mt-4"
                        >
                            ← Continue Shopping
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CartPage;
