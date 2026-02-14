import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';

const CartPage = () => {
    const { cart, loading, updateQuantity, removeFromCart, clearCart, fetchCart } = useCart();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [removingId, setRemovingId] = useState(null);
    const navigate = useNavigate();

    // Address state
    const [addresses, setAddresses] = useState([]);
    const [selectedAddressId, setSelectedAddressId] = useState(null);
    const [showAddressForm, setShowAddressForm] = useState(false);
    const [addressForm, setAddressForm] = useState({
        full_name: '', phone_number: '', start_line: '',
        city: '', state: '', zip_code: '', country: 'India', is_default: false
    });
    const [addressLoading, setAddressLoading] = useState(false);

    // Coupon state
    const [couponCode, setCouponCode] = useState('');
    const [appliedCoupon, setAppliedCoupon] = useState(null);
    const [couponError, setCouponError] = useState('');
    const [couponLoading, setCouponLoading] = useState(false);

    // Fetch addresses on mount
    useEffect(() => {
        const fetchAddresses = async () => {
            try {
                const res = await api.getAddresses();
                setAddresses(res.data);
                const defaultAddr = res.data.find(a => a.is_default);
                if (defaultAddr) setSelectedAddressId(defaultAddr.id);
                else if (res.data.length > 0) setSelectedAddressId(res.data[0].id);
            } catch (err) {
                console.error("Failed to load addresses", err);
            }
        };
        fetchAddresses();
    }, []);

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

    // Address handlers
    const handleAddAddress = async (e) => {
        e.preventDefault();
        setAddressLoading(true);
        try {
            const res = await api.createAddress(addressForm);
            setAddresses(prev => [...prev, res.data]);
            setSelectedAddressId(res.data.id);
            setShowAddressForm(false);
            setAddressForm({ full_name: '', phone_number: '', start_line: '', city: '', state: '', zip_code: '', country: 'India', is_default: false });
        } catch (err) {
            alert(err.response?.data?.detail || "Failed to save address");
        } finally {
            setAddressLoading(false);
        }
    };

    // Coupon handlers
    const subtotal = (cart?.items || []).reduce((total, item) => {
        return total + (item.product?.price || 0) * (item.quantity || 0);
    }, 0);

    const handleApplyCoupon = async () => {
        if (!couponCode.trim()) return;
        setCouponLoading(true);
        setCouponError('');
        try {
            const res = await api.applyCoupon(couponCode.trim(), subtotal);
            setAppliedCoupon(res.data);
        } catch (err) {
            setCouponError(err.response?.data?.detail || "Invalid coupon code");
            setAppliedCoupon(null);
        } finally {
            setCouponLoading(false);
        }
    };

    const handleRemoveCoupon = () => {
        setAppliedCoupon(null);
        setCouponCode('');
        setCouponError('');
    };

    // Checkout
    const handleCheckout = async () => {
        setIsSubmitting(true);
        try {
            const response = await api.createOrder({
                shipping_address_id: selectedAddressId || null,
                coupon_code: appliedCoupon?.code || null,
            });
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

    const itemCount = (cart?.items || []).reduce((total, item) => total + item.quantity, 0);
    const shippingCost = selectedAddressId ? (subtotal >= 500 ? 0 : 50) : 0;
    const discountAmount = appliedCoupon?.discount_amount || 0;
    const total = subtotal - discountAmount + shippingCost;

    return (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Shopping Cart</h1>
                    <p className="text-sm text-gray-500 mt-1">{itemCount} {itemCount === 1 ? 'item' : 'items'}</p>
                </div>
                <button onClick={clearCart} className="text-sm text-gray-400 hover:text-red-500 transition-colors flex items-center gap-1.5">
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
                            <div key={item.id} className={`bg-white border border-gray-100 rounded-2xl p-5 flex gap-5 transition-all duration-300 hover:shadow-md hover:border-gray-200 ${isRemoving ? 'opacity-50 scale-[0.98]' : ''}`}>
                                <Link to={`/products/${item.product.id}`} className="flex-shrink-0">
                                    <div className="h-24 w-24 rounded-xl overflow-hidden bg-gray-50 border border-gray-100">
                                        <img src={item.product.image_url || "https://via.placeholder.com/150"} alt={item.product.name}
                                            className="h-full w-full object-cover hover:scale-110 transition-transform duration-300"
                                            onError={(e) => { e.target.onerror = null; e.target.src = "https://via.placeholder.com/150"; }} />
                                    </div>
                                </Link>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-4">
                                        <div>
                                            <Link to={`/products/${item.product.id}`} className="font-semibold text-gray-900 hover:text-indigo-600 transition-colors line-clamp-1">
                                                {item.product.name}
                                            </Link>
                                            {item.product.category && <p className="text-xs text-gray-400 mt-0.5">{item.product.category.name}</p>}
                                            <p className="text-sm text-gray-500 mt-1">₹{item.product.price?.toLocaleString()}</p>
                                        </div>
                                        <p className="font-bold text-gray-900 text-lg whitespace-nowrap">₹{((item.product.price || 0) * item.quantity).toLocaleString()}</p>
                                    </div>
                                    <div className="flex items-center justify-between mt-4">
                                        <div className="flex items-center bg-gray-50 rounded-xl border border-gray-200 overflow-hidden">
                                            <button onClick={() => handleQuantityChange(item.id, item.quantity - 1)} className="w-9 h-9 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-30" disabled={item.quantity <= 1}>
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12h-15" /></svg>
                                            </button>
                                            <span className="w-10 text-center text-sm font-semibold text-gray-900">{item.quantity}</span>
                                            <button onClick={() => handleQuantityChange(item.id, item.quantity + 1)} className="w-9 h-9 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors">
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
                                            </button>
                                        </div>
                                        <button onClick={() => handleRemove(item.id)} disabled={isRemoving} className="text-xs font-medium text-gray-400 hover:text-red-500 transition-colors flex items-center gap-1">
                                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                                            Remove
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Sidebar */}
                <div className="lg:w-[380px] space-y-4">

                    {/* Shipping Address */}
                    <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                                <svg className="w-4 h-4 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                                </svg>
                                Shipping Address
                            </h3>
                            <button onClick={() => setShowAddressForm(!showAddressForm)} className="text-xs text-indigo-600 hover:text-indigo-800 font-medium">
                                {showAddressForm ? 'Cancel' : '+ Add New'}
                            </button>
                        </div>

                        {addresses.length === 0 && !showAddressForm && (
                            <p className="text-xs text-gray-400 text-center py-3">No saved addresses. Add one to continue.</p>
                        )}

                        {/* Address Selection */}
                        {addresses.length > 0 && !showAddressForm && (
                            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                                {addresses.map(addr => (
                                    <label key={addr.id}
                                        className={`flex items-start gap-3 p-3 rounded-xl cursor-pointer border transition-all duration-200 ${selectedAddressId === addr.id
                                            ? 'border-indigo-300 bg-indigo-50/50 ring-1 ring-indigo-200'
                                            : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50'}`}
                                    >
                                        <input type="radio" name="address" checked={selectedAddressId === addr.id}
                                            onChange={() => setSelectedAddressId(addr.id)}
                                            className="mt-0.5 accent-indigo-600" />
                                        <div className="text-xs leading-relaxed">
                                            <p className="font-semibold text-gray-900">{addr.full_name}</p>
                                            <p className="text-gray-500">{addr.start_line}, {addr.city}</p>
                                            <p className="text-gray-500">{addr.state} - {addr.zip_code}</p>
                                            <p className="text-gray-400">{addr.phone_number}</p>
                                        </div>
                                    </label>
                                ))}
                            </div>
                        )}

                        {/* Add Address Form */}
                        {showAddressForm && (
                            <form onSubmit={handleAddAddress} className="space-y-2.5">
                                <div className="grid grid-cols-2 gap-2">
                                    <input type="text" placeholder="Full Name *" required value={addressForm.full_name}
                                        onChange={e => setAddressForm({ ...addressForm, full_name: e.target.value })}
                                        className="col-span-2 text-xs px-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 outline-none transition-all" />
                                    <input type="tel" placeholder="Phone *" required value={addressForm.phone_number}
                                        onChange={e => setAddressForm({ ...addressForm, phone_number: e.target.value })}
                                        className="col-span-2 text-xs px-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 outline-none transition-all" />
                                    <input type="text" placeholder="Address Line *" required value={addressForm.start_line}
                                        onChange={e => setAddressForm({ ...addressForm, start_line: e.target.value })}
                                        className="col-span-2 text-xs px-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 outline-none transition-all" />
                                    <input type="text" placeholder="City *" required value={addressForm.city}
                                        onChange={e => setAddressForm({ ...addressForm, city: e.target.value })}
                                        className="text-xs px-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 outline-none transition-all" />
                                    <input type="text" placeholder="State *" required value={addressForm.state}
                                        onChange={e => setAddressForm({ ...addressForm, state: e.target.value })}
                                        className="text-xs px-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 outline-none transition-all" />
                                    <input type="text" placeholder="ZIP Code *" required value={addressForm.zip_code}
                                        onChange={e => setAddressForm({ ...addressForm, zip_code: e.target.value })}
                                        className="text-xs px-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 outline-none transition-all" />
                                    <input type="text" placeholder="Country" value={addressForm.country}
                                        onChange={e => setAddressForm({ ...addressForm, country: e.target.value })}
                                        className="text-xs px-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 outline-none transition-all" />
                                </div>
                                <button type="submit" disabled={addressLoading}
                                    className="w-full bg-indigo-600 text-white text-xs font-semibold py-2.5 rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                                    {addressLoading ? (
                                        <><div className="animate-spin rounded-full h-3 w-3 border-2 border-white/30 border-t-white"></div> Saving...</>
                                    ) : 'Save Address'}
                                </button>
                            </form>
                        )}
                    </div>

                    {/* Coupon Code */}
                    <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                        <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2 mb-3">
                            <svg className="w-4 h-4 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" />
                            </svg>
                            Coupon Code
                        </h3>

                        {appliedCoupon ? (
                            <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2.5">
                                <div className="flex items-center gap-2">
                                    <svg className="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <div>
                                        <p className="text-xs font-bold text-emerald-800">{appliedCoupon.code}</p>
                                        <p className="text-[10px] text-emerald-600">-₹{appliedCoupon.discount_amount.toLocaleString()} off</p>
                                    </div>
                                </div>
                                <button onClick={handleRemoveCoupon} className="text-xs text-red-500 hover:text-red-700 font-medium">Remove</button>
                            </div>
                        ) : (
                            <div>
                                <div className="flex gap-2">
                                    <input type="text" placeholder="Enter coupon code"
                                        value={couponCode}
                                        onChange={e => { setCouponCode(e.target.value.toUpperCase()); setCouponError(''); }}
                                        className="flex-1 text-xs px-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 outline-none transition-all uppercase tracking-wider font-mono" />
                                    <button onClick={handleApplyCoupon} disabled={couponLoading || !couponCode.trim()}
                                        className="bg-gray-900 text-white text-xs font-semibold px-4 py-2.5 rounded-xl hover:bg-gray-800 transition-colors disabled:opacity-40 whitespace-nowrap">
                                        {couponLoading ? '...' : 'Apply'}
                                    </button>
                                </div>
                                {couponError && <p className="text-[11px] text-red-500 mt-1.5">{couponError}</p>}
                            </div>
                        )}
                    </div>

                    {/* Order Summary */}
                    <div className="bg-white border border-gray-100 rounded-2xl p-5 sticky top-24 shadow-sm">
                        <h2 className="font-bold text-gray-900 mb-4">Order Summary</h2>

                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between text-gray-600">
                                <span>Subtotal ({itemCount} items)</span>
                                <span className="font-medium text-gray-900">₹{subtotal.toLocaleString()}</span>
                            </div>

                            {discountAmount > 0 && (
                                <div className="flex justify-between text-emerald-600">
                                    <span>Discount ({appliedCoupon?.code})</span>
                                    <span className="font-medium">-₹{discountAmount.toLocaleString()}</span>
                                </div>
                            )}

                            <div className="flex justify-between text-gray-600">
                                <span>Shipping</span>
                                <span className={`font-medium ${shippingCost === 0 ? 'text-emerald-600' : 'text-gray-900'}`}>
                                    {!selectedAddressId ? '—' : shippingCost === 0 ? 'Free' : `₹${shippingCost}`}
                                </span>
                            </div>
                        </div>

                        <div className="border-t border-gray-100 mt-4 pt-4">
                            <div className="flex justify-between items-center">
                                <span className="font-bold text-gray-900">Total</span>
                                <span className="text-xl font-bold text-gray-900">₹{total.toLocaleString()}</span>
                            </div>
                            {shippingCost === 0 && selectedAddressId && (
                                <p className="text-xs text-emerald-600 mt-1 flex items-center gap-1">
                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    Free shipping applied!
                                </p>
                            )}
                        </div>

                        <button onClick={handleCheckout} disabled={isSubmitting}
                            className="w-full mt-5 bg-indigo-600 text-white py-3.5 px-6 rounded-xl font-semibold text-sm transition-all duration-200 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm shadow-indigo-200 hover:shadow-md hover:shadow-indigo-200 flex items-center justify-center gap-2">
                            {isSubmitting ? (
                                <><div className="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white"></div> Processing...</>
                            ) : (
                                <>
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                                    </svg>
                                    Proceed to Checkout
                                </>
                            )}
                        </button>

                        <Link to="/products" className="block text-center text-sm text-gray-500 hover:text-indigo-600 transition-colors mt-4">
                            ← Continue Shopping
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CartPage;
