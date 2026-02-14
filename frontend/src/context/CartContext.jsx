import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
    const { user } = useAuth();
    const [cart, setCart] = useState(null);
    const [loading, setLoading] = useState(false);

    // Fetch cart when user logs in
    useEffect(() => {
        if (user) {
            fetchCart();
        } else {
            setCart(null);
        }
    }, [user]);

    const fetchCart = async () => {
        try {
            setLoading(true);
            console.log("CartContext: Fetching cart...");
            const response = await api.getCart();
            console.log("CartContext: Cart fetched:", response.data);
            setCart(response.data);
        } catch (error) {
            console.error("CartContext: Failed to fetch cart", error);
            if (error.response && error.response.status === 404) {
                // 404 means no cart yet? Or endpoint not found?
                // Usually getCart returns empty cart if not found in db service.
                setCart(null);
            }
        } finally {
            setLoading(false);
        }
    };

    const addToCart = async (productId, quantity = 1) => {
        if (!user) {
            return Promise.reject("User not logged in");
        }
        try {
            const response = await api.addToCart(productId, quantity);
            setCart(response.data);
            return response.data;
        } catch (error) {
            throw error;
        }
    };

    const updateQuantity = async (itemId, quantity) => {
        try {
            const response = await api.updateCartItem(itemId, quantity);
            setCart(response.data);
        } catch (error) {
            console.error("Failed to update quantity", error);
            throw error;
        }
    };

    const removeFromCart = async (itemId) => {
        try {
            await api.removeFromCart(itemId);
            // Optimistic update or refetch. Refetch is safer for totals.
            fetchCart();
        } catch (error) {
            console.error("Failed to remove item", error);
        }
    };

    const clearCart = async () => {
        try {
            await api.clearCart();
            setCart(null);
        } catch (error) {
            console.error("Failed to clear cart", error);
        }
    }

    const value = {
        cart,
        loading,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        fetchCart
    };

    return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
