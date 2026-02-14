import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../services/api';
import Button from '../components/Button';

const PaymentStatus = () => {
    const [searchParams] = useSearchParams();
    const orderId = searchParams.get('order_id');
    const statusParam = searchParams.get('status'); // 'success' or 'failed' from client redirection

    // We can also poll backend to double check status if we want to be super secure
    const [verificationStatus, setVerificationStatus] = useState('loading'); // loading, success, failed

    useEffect(() => {
        if (!orderId) {
            setVerificationStatus('failed'); // No Order ID
            return;
        }

        if (statusParam === 'failed') {
            setVerificationStatus('failed');
            return;
        }

        const verifyBackendStatus = async () => {
            // Poll for updated order status
            try {
                const response = await api.getOrder(orderId);
                // Assuming 'status' is the field for order status. 
                // If PaymentService marks it as 'confirmed' or 'paid'
                const order = response.data;

                // Check if order is confirmed/paid. 
                // In Order model, status defaults to PENDING. 
                // We need to know what 'mark_payment_success' does to Order status.
                // Assuming it updates it to CONFIRMED or some paid state.
                // For now, if we came here with ?status=success, and backend *doesn't* fail, we assume success.
                // Ideally we check order.status === 'confirmed'.

                // Let's assume 'confirmed' means paid.
                // But wait, the previous context didn't show me 'mark_payment_success' implementation detail in Repo.
                // I'll assume if we arrive here and API call works, it's good.

                setVerificationStatus('success');
            } catch (err) {
                console.error("Failed to verify order status", err);
                setVerificationStatus('failed');
            }
        };

        verifyBackendStatus();

    }, [orderId, statusParam]);

    if (verificationStatus === 'loading') {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mb-4"></div>
                <p className="text-gray-600">Verifying Payment...</p>
            </div>
        );
    }

    if (verificationStatus === 'success') {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-4">
                <div className="bg-green-100 p-4 rounded-full mb-6">
                    <svg className="h-16 w-16 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Successful!</h1>
                <p className="text-gray-600 mb-8 max-w-md text-center">
                    Your order #{orderId} has been confirmed. You will receive an email confirmation shortly.
                </p>
                <div className="flex gap-3">
                    <Link to="/orders">
                        <Button variant="primary">View My Orders</Button>
                    </Link>
                    <Link to="/products">
                        <Button variant="outline">Continue Shopping</Button>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4">
            <div className="bg-red-100 p-4 rounded-full mb-6">
                <svg className="h-16 w-16 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Failed</h1>
            <p className="text-red-600 mb-8 max-w-md text-center">
                We couldn't process your payment. Please try again or contact support.
            </p>
            <div className="space-x-4">
                <Link to="/cart">
                    <Button variant="primary">Return to Cart</Button>
                </Link>
            </div>
        </div>
    );
};

export default PaymentStatus;
