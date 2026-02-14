import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../services/api';
import Button from '../components/Button';

const CheckoutPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [paymentLoading, setPaymentLoading] = useState(false);
    const [error, setError] = useState(null);

    // Order ID should be passed via state from CartPage
    const orderId = location.state?.orderId;

    useEffect(() => {
        if (!orderId) {
            navigate('/cart');
            return;
        }

        const fetchOrder = async () => {
            try {
                const response = await api.getOrder(orderId);
                setOrder(response.data);
            } catch (err) {
                console.error("Failed to fetch order", err);
                setError("Failed to load order details.");
            } finally {
                setLoading(false);
            }
        };

        fetchOrder();
    }, [orderId, navigate]);

    const handlePayment = async () => {
        setPaymentLoading(true);
        setError(null);
        try {
            // 1. Initiate Payment
            const response = await api.createPaymentOrder(orderId);
            const { razorpay_order_id, amount, currency, key_id } = response.data;

            // Check if Mock Mode (key starts with mock_)
            const isMock = key_id && key_id.startsWith("mock_");

            if (isMock) {
                // Mimic Razorpay flow for Mock
                const confirm = window.confirm(`[MOCK MODE]\n\nPay ₹${amount} for Order #${order.id}?\n\nClick OK to simulate Success, Cancel to Simulate Failure.`);

                if (confirm) {
                    await api.verifyPayment({
                        razorpay_order_id: razorpay_order_id,
                        razorpay_payment_id: "pay_mock_" + Math.random().toString(36).substring(7),
                        razorpay_signature: "mock_signature"
                    });
                    navigate(`/payment/status?order_id=${orderId}&status=success`);
                } else {
                    // Simulating user closing popup
                    setPaymentLoading(false);
                }
            } else {
                // Real Razorpay Flow
                const options = {
                    key: key_id,
                    amount: amount * 100, // paise
                    currency: currency,
                    name: "E-Commerce App",
                    description: `Order #${order.id}`,
                    order_id: razorpay_order_id,
                    handler: async function (response) {
                        try {
                            await api.verifyPayment({
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_signature: response.razorpay_signature
                            });
                            navigate(`/payment/status?order_id=${orderId}&status=success`);
                        } catch (err) {
                            console.error("Verification failed", err);
                            navigate(`/payment/status?order_id=${orderId}&status=failed`);
                        }
                    },
                    prefill: {
                        name: order.user?.full_name,
                        email: order.user?.email,
                    },
                    theme: {
                        color: "#4F46E5"
                    }
                };

                const rzp1 = new window.Razorpay(options);
                rzp1.on('payment.failed', function (response) {
                    console.error("Payment Failed", response.error);
                    alert(`Payment Failed: ${response.error.description}`);
                    setPaymentLoading(false);
                });
                rzp1.open();
                // We rely on handler or on('payment.failed') to stop loading, 
                // but if user closes modal, we might be stuck. 
                // Razorpay doesn't have a reliable "modal closed" event in standard integration without custom UI.
                // For now, we leave loading true until handler fires or user refreshes.
            }

        } catch (err) {
            console.error("Payment initiation failed", err);
            setError("Failed to start payment. Please try again.");
            setPaymentLoading(false);
        }
    };

    if (loading) return <div className="p-8 text-center">Loading Order...</div>;
    if (error) return <div className="p-8 text-center text-red-500">{error}</div>;
    if (!order) return null;

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8 text-gray-800">Checkout</h1>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 max-w-2xl mx-auto">
                <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
                <div className="space-y-4">
                    <div className="flex justify-between border-b pb-2">
                        <span className="text-gray-600">Order ID</span>
                        <span className="font-medium">#{order.id}</span>
                    </div>
                    <div className="flex justify-between border-b pb-2">
                        <span className="text-gray-600">Items</span>
                        <span className="font-medium">{order.items?.length || 0}</span>
                    </div>
                    <div className="flex justify-between border-b pb-2">
                        <span className="text-gray-600">Subtotal</span>
                        <span className="font-medium">${order.subtotal}</span>
                    </div>
                    {/* Add Shipping/Tax if available */}

                    <div className="flex justify-between pt-2">
                        <span className="text-lg font-bold text-gray-900">Total</span>
                        <span className="text-lg font-bold text-indigo-600">${order.total_amount}</span>
                    </div>
                </div>

                <div className="mt-8">
                    <Button
                        onClick={handlePayment}
                        isLoading={paymentLoading}
                        className="w-full py-3 text-lg"
                    >
                        {paymentLoading ? "Processing..." : `Pay $${order.total_amount}`}
                    </Button>
                    <p className="text-center text-xs text-gray-500 mt-4">
                        Secure payment processing.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default CheckoutPage;
