import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import PrivateRoute from './components/PrivateRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import ProductList from './pages/ProductList';
import ProductDetails from './pages/ProductDetails';
import CartPage from './pages/Cart';
import OrderHistory from './pages/OrderHistory';
import OrderConfirmation from './pages/OrderConfirmation';
import CheckoutPage from './pages/CheckoutPage';
import PaymentStatus from './pages/PaymentStatus';
import AuthModal from './components/AuthModal';
import { useAuth } from './context/AuthContext';

function App() {
  const { isModalOpen, closeModal } = useAuth();

  return (
    <Router>
      <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
        <Navbar />
        <AuthModal isOpen={isModalOpen} onClose={closeModal} />
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Products are public for browsing */}
          <Route path="/products" element={<ProductList />} />
          <Route path="/products/:id" element={<ProductDetails />} />

          <Route path="/" element={<Navigate to="/products" replace />} />

          {/* Protected Routes */}
          <Route path="/cart" element={
            <PrivateRoute>
              <CartPage />
            </PrivateRoute>
          } />

          <Route path="/orders" element={
            <PrivateRoute>
              <OrderHistory />
            </PrivateRoute>
          } />

          {/* Phase 3: Payment Routes */}
          <Route path="/checkout" element={
            <PrivateRoute>
              <CheckoutPage />
            </PrivateRoute>
          } />
          <Route path="/payment/status" element={
            <PrivateRoute>
              <PaymentStatus />
            </PrivateRoute>
          } />

          <Route path="/order-confirmation" element={
            <PrivateRoute>
              <OrderConfirmation />
            </PrivateRoute>
          } />

          <Route path="*" element={<div className="p-8 text-center">404 Not Found</div>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
