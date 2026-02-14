import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const ProductDetails = () => {
    const { id } = useParams();
    const { user, openModal } = useAuth();
    const { cart, addToCart, updateQuantity, removeFromCart } = useCart();
    const [addedAnim, setAddedAnim] = useState(false);

    const { data: product, isLoading: loading, error } = useQuery({
        queryKey: ['product', id],
        queryFn: async () => {
            const res = await api.get(`/products/${id}`);
            return res.data;
        },
        staleTime: 5 * 60 * 1000,
    });

    const cartItem = cart?.items?.find(item => item.product.id === Number(id));
    const quantityInCart = cartItem ? cartItem.quantity : 0;

    const handleAddToCart = async () => {
        if (!user) { openModal(); return; }
        try {
            await addToCart(Number(id), 1);
            setAddedAnim(true);
            setTimeout(() => setAddedAnim(false), 1500);
        } catch (err) {
            console.error("Failed to add to cart", err);
        }
    };

    const handleUpdateQuantity = async (newQty) => {
        if (newQty <= 0) {
            await removeFromCart(cartItem.id);
        } else {
            await updateQuantity(cartItem.id, newQty);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-[3px] border-indigo-100 border-t-indigo-600 mx-auto"></div>
                    <p className="mt-4 text-sm text-gray-400">Loading product...</p>
                </div>
            </div>
        );
    }

    if (error || !product) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center max-w-md">
                    <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <svg className="w-10 h-10 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                        </svg>
                    </div>
                    <h2 className="text-xl font-bold text-gray-900">Product Not Found</h2>
                    <p className="mt-2 text-sm text-gray-500">The product you're looking for doesn't exist or has been removed.</p>
                    <Link to="/products" className="mt-6 inline-flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-indigo-700 transition-all">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                        </svg>
                        Back to Products
                    </Link>
                </div>
            </div>
        );
    }

    const inStock = (product.stock_quantity || 0) > 0;

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

                {/* Breadcrumb */}
                <nav className="flex items-center gap-2 text-sm mb-8">
                    <Link to="/products" className="text-gray-400 hover:text-indigo-600 transition-colors">Products</Link>
                    <svg className="w-4 h-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                    </svg>
                    {product.category && (
                        <>
                            <span className="text-gray-400">{product.category.name}</span>
                            <svg className="w-4 h-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                            </svg>
                        </>
                    )}
                    <span className="text-gray-700 font-medium truncate max-w-xs">{product.name}</span>
                </nav>

                {/* Product Layout */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="grid grid-cols-1 lg:grid-cols-2">

                        {/* Image Section */}
                        <div className="relative bg-gradient-to-br from-gray-50 to-gray-100 p-6 sm:p-10 flex items-center justify-center min-h-[400px] lg:min-h-[550px]">
                            <img
                                src={product.image_url || "https://via.placeholder.com/600"}
                                alt={product.name}
                                className="max-w-full max-h-[480px] object-contain rounded-xl drop-shadow-lg transition-transform duration-500 hover:scale-105"
                                onError={(e) => { e.target.onerror = null; e.target.src = "https://via.placeholder.com/600"; }}
                            />
                            {/* Stock badge */}
                            <div className={`absolute top-6 right-6 px-3 py-1.5 rounded-full text-xs font-semibold ${inStock ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-600 border border-red-200'}`}>
                                {inStock ? `${product.stock_quantity} in stock` : 'Out of Stock'}
                            </div>
                            {/* Category badge */}
                            {product.category && (
                                <div className="absolute top-6 left-6 px-3 py-1.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-600 border border-indigo-200">
                                    {product.category.name}
                                </div>
                            )}
                        </div>

                        {/* Details Section */}
                        <div className="p-8 sm:p-10 lg:p-12 flex flex-col">

                            {/* Product Name */}
                            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight">{product.name}</h1>

                            {/* Price */}
                            <div className="mt-4 flex items-baseline gap-3">
                                <span className="text-3xl sm:text-4xl font-bold text-indigo-600">₹{product.price ? product.price.toLocaleString('en-IN', { minimumFractionDigits: 2 }) : '0.00'}</span>
                            </div>

                            {/* Divider */}
                            <div className="mt-6 border-t border-gray-100"></div>

                            {/* Description */}
                            <div className="mt-6">
                                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Description</h3>
                                <p className="text-gray-600 leading-relaxed text-sm sm:text-base">{product.description}</p>
                            </div>

                            {/* Features / Quick Info */}
                            <div className="mt-6 grid grid-cols-2 gap-3">
                                <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-3">
                                    <div className="w-9 h-9 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                        <svg className="w-5 h-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-400">Shipping</p>
                                        <p className="text-xs font-semibold text-gray-700">Free over ₹500</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-3">
                                    <div className="w-9 h-9 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                        <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-400">Guarantee</p>
                                        <p className="text-xs font-semibold text-gray-700">Secure checkout</p>
                                    </div>
                                </div>
                            </div>

                            {/* Add to Cart / Quantity */}
                            <div className="mt-auto pt-8">
                                {quantityInCart > 0 ? (
                                    <div className="flex items-center gap-4">
                                        <div className="flex items-center border-2 border-indigo-100 rounded-xl overflow-hidden bg-white">
                                            <button
                                                onClick={() => handleUpdateQuantity(quantityInCart - 1)}
                                                className="w-12 h-12 flex items-center justify-center text-indigo-600 hover:bg-indigo-50 transition-colors text-lg font-medium"
                                            >
                                                −
                                            </button>
                                            <span className="w-14 h-12 flex items-center justify-center text-base font-bold text-gray-900 border-x-2 border-indigo-100">
                                                {quantityInCart}
                                            </span>
                                            <button
                                                onClick={() => handleUpdateQuantity(quantityInCart + 1)}
                                                className="w-12 h-12 flex items-center justify-center text-indigo-600 hover:bg-indigo-50 transition-colors text-lg font-medium disabled:opacity-30"
                                                disabled={quantityInCart >= (product.stock_quantity || 0)}
                                            >
                                                +
                                            </button>
                                        </div>
                                        <div className="flex-1 flex items-center gap-2 bg-emerald-50 text-emerald-700 rounded-xl px-5 py-3">
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                            </svg>
                                            <span className="font-semibold text-sm">In your cart</span>
                                        </div>
                                    </div>
                                ) : (
                                    <button
                                        onClick={handleAddToCart}
                                        disabled={!inStock}
                                        className={`w-full py-4 rounded-xl font-semibold text-base transition-all duration-300 flex items-center justify-center gap-3 ${addedAnim
                                                ? 'bg-emerald-500 text-white scale-[0.98]'
                                                : inStock
                                                    ? 'bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-200 active:scale-[0.98]'
                                                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                            }`}
                                    >
                                        {addedAnim ? (
                                            <>
                                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                                </svg>
                                                Added!
                                            </>
                                        ) : inStock ? (
                                            <>
                                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-5.98.286h.358a3 3 0 005.622-.286zm0 0H17.25m0 0a3 3 0 105.98.286h-.358a3 3 0 00-5.622-.286zm0 0H7.5m0 0l-.698-2.622a1.125 1.125 0 00-1.087-.836H2.25" />
                                                </svg>
                                                Add to Cart
                                            </>
                                        ) : (
                                            'Out of Stock'
                                        )}
                                    </button>
                                )}

                                {/* Continue Shopping */}
                                <Link to="/products" className="mt-4 flex items-center justify-center gap-2 text-sm text-gray-400 hover:text-indigo-600 transition-colors py-2">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                                    </svg>
                                    Continue Shopping
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetails;
