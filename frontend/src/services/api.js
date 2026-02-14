import axios from 'axios';

// Create axios instance
const api = axios.create({
    baseURL: 'http://127.0.0.1:8000/api/v1',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add auth token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor to handle errors (optional)
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            // Optional: Redirect to login or clear token if 401
            // localStorage.removeItem('token');
            // window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export const apiMethods = {
    // Products
    getProducts: (params) => api.get('/products/', { params }),
    getProduct: (id) => api.get(`/products/${id}`),
    getCategories: () => api.get('/products/categories'),

    // Cart
    getCart: () => api.get('/cart/'),
    addToCart: (product_id, quantity) => api.post('/cart/items', { product_id, quantity }),
    updateCartItem: (item_id, quantity) => api.put(`/cart/items/${item_id}?quantity=${quantity}`),
    removeFromCart: (item_id) => api.delete(`/cart/items/${item_id}`),
    clearCart: () => api.delete('/cart/'),

    // Orders
    createOrder: (data = {}) => api.post('/orders/checkout', data),
    getOrders: () => api.get('/orders/'),
    getOrder: (id) => api.get(`/orders/${id}`),

    // Payments
    createPaymentOrder: (orderId) => api.post(`/payments/order/${orderId}`),
    verifyPayment: (data) => api.post('/payments/verify', data),
};

export default { ...api, ...apiMethods };
