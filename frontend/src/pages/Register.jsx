import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Input from '../components/Input';
import Button from '../components/Button';

const Register = () => {
    const [formData, setFormData] = useState({
        username: '', // Assuming 'username' is used for name/username generally, but backend UserCreate usually has email/password/name?
        // Let's check 'app/schemas/user.py' later if robust, but generally 'full_name' or 'name' and 'email'
        // I will use 'email', 'password', 'full_name' for now based on standard.
        // Wait, backend 'Login' uses form_data.username as email.
        // Register likely needs UserCreate schema fields.
        email: '',
        password: '',
        full_name: '',
    });

    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.id]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);

        const result = await register({
            email: formData.email,
            password: formData.password,
            full_name: formData.full_name,
            // Depending on schema, might need 'username' too or email is username.
            // I'll assume email is enough or check later.
        });

        if (result.success) {
            navigate('/login');
        } else {
            setError(result.message);
        }
        setIsSubmitting(false);
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                    Create a new account
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600">
                    Or{' '}
                    <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
                        sign in to existing account
                    </Link>
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <Input
                            id="full_name"
                            label="Full Name"
                            value={formData.full_name}
                            onChange={handleChange}
                            required
                        />

                        <Input
                            id="email"
                            label="Email address"
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />

                        <Input
                            id="password"
                            label="Password"
                            type="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />

                        {error && (
                            <div className="rounded-md bg-red-50 p-4">
                                <div className="flex">
                                    <div className="ml-3">
                                        <h3 className="text-sm font-medium text-red-800">{error}</h3>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div>
                            <Button type="submit" isLoading={isSubmitting}>
                                Register
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Register;
