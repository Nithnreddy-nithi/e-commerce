import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import Button from './Button';

const ProductCard = ({ product }) => {
    // Check backend product schema for correct fields. Assuming: id, name, price, description, images
    const { id, name, price, description, image_url, stock_quantity } = product;
    const { user, openModal } = useAuth();
    const { cart, addToCart, updateQuantity, removeFromCart } = useCart();

    const cartItem = cart?.items?.find(item => item.product.id === id);
    const quantityInCart = cartItem ? cartItem.quantity : 0;

    // Debugging logs
    // console.log(`Product: ${name}, ID: ${id}, Stock: ${stock_quantity}, InCart: ${quantityInCart}`);

    const handleAddToCart = async (e) => {
        e.preventDefault();
        if (!user) {
            openModal();
            return;
        }
        try {
            await addToCart(id, 1);
        } catch (error) {
            console.error("Failed to add to cart", error);
            alert("Failed to add to cart");
        }
    };

    const handleUpdateQuantity = async (e, newQty) => {
        e.preventDefault();
        if (newQty <= 0) {
            await removeFromCart(cartItem.id);
        } else {
            await updateQuantity(cartItem.id, newQty);
        }
    };

    return (
        <div className="group relative bg-white border border-gray-200 rounded-lg flex flex-col overflow-hidden shadow-sm hover:shadow-md transition-shadow h-full">
            <div className="aspect-w-3 aspect-h-4 bg-gray-200 group-hover:opacity-75 sm:aspect-none sm:h-56 relative">
                <img
                    src={image_url || "https://via.placeholder.com/300"}
                    alt={name}
                    className="w-full h-full object-center object-cover sm:w-full sm:h-full"
                    onError={(e) => { e.target.onerror = null; e.target.src = "https://via.placeholder.com/300"; }}
                />
            </div>
            <div className="flex-1 p-4 space-y-2 flex flex-col">
                <h3 className="text-sm font-medium text-gray-900">
                    <Link to={`/products/${id}`}>
                        <span aria-hidden="true" className="absolute inset-0" />
                        {name}
                    </Link>
                </h3>
                <p className="text-sm text-gray-500 line-clamp-2">{description}</p>
                <div className="flex-1 flex flex-col justify-end mt-4">
                    <div className="flex items-center justify-between">
                        <p className="text-lg font-bold text-gray-900">
                            ${price ? price.toFixed(2) : '0.00'}
                        </p>
                        <div className="relative z-20"> {/* Increased z-index for safety */}
                            {quantityInCart > 0 ? (
                                <div className="flex items-center border border-indigo-600 rounded-md bg-white" onClick={(e) => e.preventDefault()}>
                                    <button
                                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleUpdateQuantity(e, quantityInCart - 1); }}
                                        className="px-2 py-1 text-indigo-600 hover:bg-indigo-50"
                                    >
                                        -
                                    </button>
                                    <span className="px-2 py-1 text-sm font-medium text-indigo-900">{quantityInCart}</span>
                                    <button
                                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleUpdateQuantity(e, quantityInCart + 1); }}
                                        className="px-2 py-1 text-indigo-600 hover:bg-indigo-50"
                                        disabled={quantityInCart >= (stock_quantity || 0)} // Default to 0 if undefined, but usually should be > 0.
                                    >
                                        +
                                    </button>
                                </div>
                            ) : (
                                <Button
                                    size="sm"
                                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleAddToCart(e); }}
                                    disabled={(stock_quantity || 0) <= 0}
                                >
                                    {(stock_quantity || 0) > 0 ? 'Add to Cart' : 'Out of Stock'}
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductCard;
