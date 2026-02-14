import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const ProductCard = ({ product }) => {
    const { id, name, price, description, image_url, stock_quantity, category } = product;
    const { user, openModal } = useAuth();
    const { cart, addToCart, updateQuantity, removeFromCart } = useCart();

    const cartItem = cart?.items?.find(item => item.product.id === id);
    const quantityInCart = cartItem ? cartItem.quantity : 0;
    const inStock = (stock_quantity || 0) > 0;

    const handleAddToCart = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!user) { openModal(); return; }
        try {
            await addToCart(id, 1);
        } catch (error) {
            console.error("Failed to add to cart", error);
        }
    };

    const handleUpdateQuantity = async (e, newQty) => {
        e.preventDefault();
        e.stopPropagation();
        if (newQty <= 0) {
            await removeFromCart(cartItem.id);
        } else {
            await updateQuantity(cartItem.id, newQty);
        }
    };

    return (
        <Link to={`/products/${id}`} className="group block h-full">
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden h-full flex flex-col shadow-sm hover:shadow-xl hover:border-gray-200 transition-all duration-300 hover:-translate-y-1">

                {/* Image */}
                <div className="relative bg-gradient-to-br from-gray-50 to-gray-100 p-4 flex items-center justify-center h-56 overflow-hidden">
                    <img
                        src={image_url || "https://via.placeholder.com/300"}
                        alt={name}
                        className="max-w-full max-h-full object-contain transition-transform duration-500 group-hover:scale-110"
                        onError={(e) => { e.target.onerror = null; e.target.src = "https://via.placeholder.com/300"; }}
                    />
                    {/* Category chip */}
                    {category && (
                        <span className="absolute top-3 left-3 px-2.5 py-1 rounded-lg text-[10px] font-semibold bg-white/90 text-gray-600 backdrop-blur-sm shadow-sm">
                            {category.name}
                        </span>
                    )}
                    {/* Stock indicator */}
                    {!inStock && (
                        <div className="absolute inset-0 bg-white/60 backdrop-blur-sm flex items-center justify-center">
                            <span className="bg-red-500 text-white px-4 py-1.5 rounded-full text-xs font-bold">Out of Stock</span>
                        </div>
                    )}
                </div>

                {/* Content */}
                <div className="flex-1 flex flex-col p-5">
                    {/* Name */}
                    <h3 className="text-sm font-semibold text-gray-900 line-clamp-1 group-hover:text-indigo-600 transition-colors">{name}</h3>

                    {/* Description */}
                    <p className="text-xs text-gray-400 mt-1.5 line-clamp-2 leading-relaxed">{description}</p>

                    {/* Price + Cart Controls */}
                    <div className="mt-auto pt-4 flex items-center justify-between gap-3">
                        <div>
                            <p className="text-lg font-bold text-gray-900">₹{price ? price.toLocaleString('en-IN') : '0'}</p>
                            {inStock && (
                                <p className="text-[10px] text-emerald-500 font-medium mt-0.5">{stock_quantity} left</p>
                            )}
                        </div>

                        <div className="relative z-10" onClick={e => e.preventDefault()}>
                            {quantityInCart > 0 ? (
                                <div className="flex items-center border-2 border-indigo-100 rounded-xl overflow-hidden bg-white">
                                    <button
                                        onClick={(e) => handleUpdateQuantity(e, quantityInCart - 1)}
                                        className="w-9 h-9 flex items-center justify-center text-indigo-600 hover:bg-indigo-50 transition-colors text-sm font-medium"
                                    >
                                        −
                                    </button>
                                    <span className="w-8 h-9 flex items-center justify-center text-sm font-bold text-gray-900 border-x-2 border-indigo-100">
                                        {quantityInCart}
                                    </span>
                                    <button
                                        onClick={(e) => handleUpdateQuantity(e, quantityInCart + 1)}
                                        className="w-9 h-9 flex items-center justify-center text-indigo-600 hover:bg-indigo-50 transition-colors text-sm font-medium disabled:opacity-30"
                                        disabled={quantityInCart >= (stock_quantity || 0)}
                                    >
                                        +
                                    </button>
                                </div>
                            ) : (
                                <button
                                    onClick={handleAddToCart}
                                    disabled={!inStock}
                                    className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 ${inStock
                                            ? 'bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-md hover:shadow-indigo-200 active:scale-95'
                                            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                        }`}
                                >
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                                    </svg>
                                    Add
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    );
};

export default ProductCard;
