import { Link } from 'react-router-dom';
import Button from '../components/Button';

const OrderConfirmation = () => {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-lg text-center">
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100">
                    <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                </div>
                <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
                    Order Placed!
                </h2>
                <p className="mt-2 text-sm text-gray-600">
                    Thank you for your purchase. Your order has been received and is being processed.
                </p>
                <div className="mt-8">
                    <Link to="/products">
                        <Button className="w-full">
                            Continue Shopping
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default OrderConfirmation;
