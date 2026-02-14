import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Input from './Input';
import Button from './Button';

const AuthModal = ({ isOpen, onClose, initialView = 'login' }) => {
    const [view, setView] = useState(initialView); // 'login' or 'register'
    const { login, register } = useAuth();

    const [formData, setFormData] = useState({
        email: '',
        password: '',
        full_name: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setView(initialView);
            setError('');
            setFormData({ email: '', password: '', full_name: '' });
        }
    }, [isOpen, initialView]);

    if (!isOpen) return null;

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            if (view === 'login') {
                await login(formData.email, formData.password);
            } else {
                await register(formData.email, formData.password, formData.full_name);
            }
            onClose(); // Close modal on success
        } catch (err) {
            setError(view === 'login' ? 'Login failed. Check credentials.' : 'Registration failed.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8 relative animate-in fade-in zoom-in duration-200">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">
                    {view === 'login' ? 'Welcome Back' : 'Create Account'}
                </h2>

                {error && (
                    <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm text-center">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    {view === 'register' && (
                        <Input
                            label="Full Name"
                            name="full_name"
                            type="text"
                            placeholder="John Doe"
                            value={formData.full_name}
                            onChange={handleChange}
                            required
                        />
                    )}
                    <Input
                        label="Email Address"
                        name="email"
                        type="email"
                        placeholder="john@example.com"
                        value={formData.email}
                        onChange={handleChange}
                        required
                    />
                    <Input
                        label="Password"
                        name="password"
                        type="password"
                        placeholder="••••••••"
                        value={formData.password}
                        onChange={handleChange}
                        required
                    />

                    <Button type="submit" isLoading={loading} className="w-full">
                        {view === 'login' ? 'Sign In' : 'Sign Up'}
                    </Button>
                </form>

                <div className="mt-6 text-center text-sm text-gray-600">
                    {view === 'login' ? (
                        <>
                            Don't have an account?{' '}
                            <button onClick={() => setView('register')} className="text-blue-600 font-semibold hover:underline">
                                Register
                            </button>
                        </>
                    ) : (
                        <>
                            Already have an account?{' '}
                            <button onClick={() => setView('login')} className="text-blue-600 font-semibold hover:underline">
                                Log in
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AuthModal;
