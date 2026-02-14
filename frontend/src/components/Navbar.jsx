import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const Navbar = () => {
    const { user, logout } = useAuth();
    const { cart } = useCart();
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);
    const [location, setLocation] = useState({ city: '', pincode: '' });
    const [showLocModal, setShowLocModal] = useState(false);
    const [pinInput, setPinInput] = useState('');

    const cartItemCount = cart?.items?.reduce((total, item) => total + item.quantity, 0) || 0;

    // Try to get location on mount
    useEffect(() => {
        const saved = localStorage.getItem('delivery_location');
        if (saved) {
            setLocation(JSON.parse(saved));
        } else {
            // Try geolocation
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    async (pos) => {
                        try {
                            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${pos.coords.latitude}&lon=${pos.coords.longitude}`);
                            const data = await res.json();
                            const loc = {
                                city: data.address?.city || data.address?.town || data.address?.village || data.address?.county || 'Your Area',
                                pincode: data.address?.postcode || '',
                            };
                            setLocation(loc);
                            localStorage.setItem('delivery_location', JSON.stringify(loc));
                        } catch {
                            setLocation({ city: 'Set Location', pincode: '' });
                        }
                    },
                    () => setLocation({ city: 'Set Location', pincode: '' })
                );
            }
        }
    }, []);

    const handleSetPincode = () => {
        if (pinInput.length >= 5) {
            const loc = { city: `PIN: ${pinInput}`, pincode: pinInput };
            setLocation(loc);
            localStorage.setItem('delivery_location', JSON.stringify(loc));
            setShowLocModal(false);
            setPinInput('');
        }
    };

    const handleDetectLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                async (pos) => {
                    try {
                        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${pos.coords.latitude}&lon=${pos.coords.longitude}`);
                        const data = await res.json();
                        const loc = {
                            city: data.address?.city || data.address?.town || data.address?.village || 'Your Area',
                            pincode: data.address?.postcode || '',
                        };
                        setLocation(loc);
                        localStorage.setItem('delivery_location', JSON.stringify(loc));
                        setShowLocModal(false);
                    } catch {
                        alert('Could not detect location');
                    }
                },
                () => alert('Location permission denied')
            );
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <>
            <nav className="bg-indigo-600 sticky top-0 z-50 shadow-lg">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center h-14 gap-4">

                        {/* Logo */}
                        <Link to="/" className="flex-shrink-0 flex items-center gap-2">
                            <div className="w-8 h-8 bg-yellow-400 rounded-lg flex items-center justify-center">
                                <svg className="w-5 h-5 text-indigo-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.016a3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72L4.318 3.44A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.06.44l1.19 1.189a3 3 0 01-.621 4.72m-13.5 8.65h3.75a.75.75 0 00.75-.75V13.5a.75.75 0 00-.75-.75H6.75a.75.75 0 00-.75.75v3.15c0 .415.336.75.75.75z" />
                                </svg>
                            </div>
                            <span className="font-bold text-lg text-white hidden sm:block">ShopKart</span>
                        </Link>

                        {/* Search Bar */}
                        <div className="flex-1 max-w-2xl hidden sm:block">
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Search for products, brands and more"
                                    className="w-full py-2 pl-4 pr-12 rounded-lg text-sm bg-white text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all"
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && e.target.value.trim()) {
                                            navigate(`/products?search=${encodeURIComponent(e.target.value.trim())}`);
                                        }
                                    }}
                                />
                                <button className="absolute right-0 top-0 h-full px-4 bg-indigo-500 hover:bg-indigo-400 rounded-r-lg transition-colors">
                                    <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        {/* Location */}
                        <button onClick={() => setShowLocModal(true)} className="hidden md:flex items-center gap-1.5 text-white hover:text-yellow-300 transition-colors text-xs">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 0115 0z" />
                            </svg>
                            <div className="text-left">
                                <p className="text-[10px] text-indigo-200 leading-none">Deliver to</p>
                                <p className="font-semibold leading-tight truncate max-w-[100px]">{location.city || 'Set Location'}</p>
                            </div>
                        </button>

                        {/* Nav Links */}
                        <div className="hidden sm:flex items-center gap-1">
                            <Link to="/products" className="text-white hover:text-yellow-300 px-3 py-2 text-sm font-medium transition-colors">
                                Products
                            </Link>
                            {user && (
                                <Link to="/orders" className="text-white hover:text-yellow-300 px-3 py-2 text-sm font-medium transition-colors">
                                    Orders
                                </Link>
                            )}
                        </div>

                        {/* Cart */}
                        <Link to="/cart" className="relative text-white hover:text-yellow-300 transition-colors p-1">
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-5.98.286h.358a3 3 0 005.622-.286zm0 0H17.25m0 0a3 3 0 105.98.286h-.358a3 3 0 00-5.622-.286zm0 0H7.5m0 0l-.698-2.622a1.125 1.125 0 00-1.087-.836H2.25" />
                            </svg>
                            {cartItemCount > 0 && (
                                <span className="absolute -top-1 -right-1 bg-yellow-400 text-indigo-900 text-[10px] font-bold rounded-full h-5 w-5 flex items-center justify-center">
                                    {cartItemCount}
                                </span>
                            )}
                        </Link>

                        {/* User */}
                        {user ? (
                            <div className="hidden sm:flex items-center gap-2">
                                <div className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center text-white text-xs font-bold border-2 border-indigo-300">
                                    {(user.full_name || 'U')[0].toUpperCase()}
                                </div>
                                <button onClick={handleLogout} className="text-xs text-indigo-200 hover:text-white transition-colors">
                                    Logout
                                </button>
                            </div>
                        ) : (
                            <div className="hidden sm:flex items-center gap-2">
                                <Link to="/login" className="text-white bg-white/10 hover:bg-white/20 px-4 py-1.5 rounded-lg text-sm font-medium transition-all">
                                    Login
                                </Link>
                            </div>
                        )}

                        {/* Mobile menu button */}
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="sm:hidden text-white p-1"
                        >
                            {isOpen ? (
                                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            ) : (
                                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                                </svg>
                            )}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                {isOpen && (
                    <div className="sm:hidden bg-indigo-700 border-t border-indigo-500">
                        <div className="px-4 py-3 space-y-1">
                            {/* Mobile Search */}
                            <input
                                type="text"
                                placeholder="Search products..."
                                className="w-full py-2 px-4 rounded-lg text-sm bg-indigo-600 text-white placeholder-indigo-300 focus:outline-none focus:ring-2 focus:ring-yellow-400 mb-2"
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && e.target.value.trim()) {
                                        navigate(`/products?search=${encodeURIComponent(e.target.value.trim())}`);
                                        setIsOpen(false);
                                    }
                                }}
                            />
                            {/* Location */}
                            <button onClick={() => { setShowLocModal(true); setIsOpen(false); }} className="flex items-center gap-2 text-indigo-200 py-2 w-full">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 0115 0z" />
                                </svg>
                                <span className="text-sm">{location.city || 'Set Delivery Location'}</span>
                            </button>
                            <Link to="/products" onClick={() => setIsOpen(false)} className="block text-white py-2 text-sm font-medium">Products</Link>
                            {user && <Link to="/orders" onClick={() => setIsOpen(false)} className="block text-white py-2 text-sm font-medium">My Orders</Link>}
                            {!user ? (
                                <>
                                    <Link to="/login" onClick={() => setIsOpen(false)} className="block text-white py-2 text-sm font-medium">Login</Link>
                                    <Link to="/register" onClick={() => setIsOpen(false)} className="block text-white py-2 text-sm font-medium">Register</Link>
                                </>
                            ) : (
                                <button onClick={() => { handleLogout(); setIsOpen(false); }} className="block text-indigo-200 py-2 text-sm w-full text-left">Logout</button>
                            )}
                        </div>
                    </div>
                )}
            </nav>

            {/* Location Modal */}
            {showLocModal && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setShowLocModal(false)}>
                    <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm mx-4" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-5">
                            <h3 className="text-lg font-bold text-gray-900">Delivery Location</h3>
                            <button onClick={() => setShowLocModal(false)} className="text-gray-400 hover:text-gray-600">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <button
                            onClick={handleDetectLocation}
                            className="w-full flex items-center gap-3 p-3 border-2 border-dashed border-indigo-200 rounded-xl text-indigo-600 hover:bg-indigo-50 transition-colors mb-4"
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 0115 0z" />
                            </svg>
                            <span className="text-sm font-semibold">Detect my location</span>
                        </button>

                        <div className="relative mb-4">
                            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200"></div></div>
                            <div className="relative flex justify-center text-xs"><span className="bg-white px-3 text-gray-400">OR</span></div>
                        </div>

                        <div className="flex gap-2">
                            <input
                                type="text"
                                placeholder="Enter pincode"
                                value={pinInput}
                                onChange={e => setPinInput(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                className="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 outline-none"
                                onKeyDown={e => e.key === 'Enter' && handleSetPincode()}
                            />
                            <button
                                onClick={handleSetPincode}
                                disabled={pinInput.length < 5}
                                className="px-5 py-3 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                                Apply
                            </button>
                        </div>

                        {location.city && location.city !== 'Set Location' && (
                            <div className="mt-4 p-3 bg-emerald-50 rounded-xl flex items-center gap-2">
                                <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                </svg>
                                <span className="text-sm text-emerald-700">Currently: <strong>{location.city}</strong> {location.pincode && `(${location.pincode})`}</span>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </>
    );
};

export default Navbar;
