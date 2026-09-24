import { Suspense, lazy } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import BackHome from '../components/BackHome';

// Layouts (eager - needed on first paint)
import MainLayout from '../layouts/MainLayout';
import DashboardLayout from '../layouts/DashboardLayout';
import AdminLayout from '../layouts/AdminLayout';

// Public Pages (lazy - loaded on demand)
const Home = lazy(() => import('../pages/Home'));
const Products = lazy(() => import('../pages/Products'));
const ProductDetail = lazy(() => import('../pages/ProductDetail'));
const Login = lazy(() => import('../pages/Login'));
const Register = lazy(() => import('../pages/Register'));
const ForgotPassword = lazy(() => import('../pages/ForgotPassword'));
const ResetPassword = lazy(() => import('../pages/ResetPassword'));
const AccessDenied = lazy(() => import('../pages/AccessDenied'));

// Information Pages
const PrivacyPolicy = lazy(() => import('../pages/PrivacyPolicy'));
const TermsConditions = lazy(() => import('../pages/TermsConditions'));
const CookiePolicy = lazy(() => import('../pages/CookiePolicy'));
const ShippingDelivery = lazy(() => import('../pages/ShippingDelivery'));
const ReturnsRefunds = lazy(() => import('../pages/ReturnsRefunds'));
const WarrantyInfo = lazy(() => import('../pages/WarrantyInfo'));
const FAQ = lazy(() => import('../pages/FAQ'));
const Help = lazy(() => import('../pages/Help'));
const Settings = lazy(() => import('../pages/Settings'));
const MyMessages = lazy(() => import('../pages/MyMessages'));

// Protected Pages
const Cart = lazy(() => import('../pages/Cart'));
const Checkout = lazy(() => import('../pages/Checkout'));
const Profile = lazy(() => import('../pages/Profile'));
const Orders = lazy(() => import('../pages/Orders'));
const OrderDetail = lazy(() => import('../pages/OrderDetail'));
const Wishlist = lazy(() => import('../pages/Wishlist'));
const Notifications = lazy(() => import('../pages/Notifications'));
const PaymentProcessing = lazy(() => import('../pages/PaymentProcessing'));

// Admin Pages
const AdminDashboard = lazy(() => import('../pages/Admin/Dashboard'));
const ProductsAdmin = lazy(() => import('../pages/Admin/ProductsAdmin'));
const OrdersAdmin = lazy(() => import('../pages/Admin/OrdersAdmin'));
const UsersAdmin = lazy(() => import('../pages/Admin/UsersAdmin'));
const CategoriesAdmin = lazy(() => import('../pages/Admin/CategoriesAdmin'));
const NotificationsAdmin = lazy(() => import('../pages/Admin/NotificationsAdmin'));
const DiscountsAdmin = lazy(() => import('../pages/Admin/DiscountsAdmin'));
const ProductForm = lazy(() => import('../pages/Admin/ProductForm'));
const SettingsAdmin = lazy(() => import('../pages/Admin/SettingsAdmin'));
const MessagesAdmin = lazy(() => import('../pages/Admin/MessagesAdmin'));

// Route fallback shown while a lazy chunk downloads
const RouteFallback = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
  </div>
);

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  // Remember where the user was headed so we can send them back after login
  return isAuthenticated ? children : (
    <Navigate to="/login" replace state={{ from: location }} />
  );
};

// Admin Route Component
const AdminRoute = ({ children }) => {
  const { isAuthenticated, isAdmin, user } = useAuth();
  
  // Debug logging to help identify the issue
  console.log('🔐 Admin Route Check:', { isAuthenticated, isAdmin, user });
  
  if (!isAuthenticated) {
    console.log('🚫 Not authenticated, redirecting to login');
    return <Navigate to="/login" replace />;
  }
  
  // Check if user exists and has admin role
  if (!user) {
    console.log('⚠️ No user data found, redirecting to login');
    return <Navigate to="/login" replace />;
  }
  
  if (user.role !== 'admin') {
    console.log('🚫 User is not admin, role:', user.role);
    return <AccessDenied />;
  }
  
  console.log('✅ Admin access granted');
  return children;
};

const AppRoutes = () => {
  return (
    <Suspense fallback={<RouteFallback />}>
      <Routes>
        {/* Landing Page with Navigation */}
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Home />} />
        </Route>

        {/* Auth Pages (No Layout) */}
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route path="forgot-password" element={<ForgotPassword />} />
        <Route path="reset-password" element={<ResetPassword />} />

        {/* Dashboard Layout for All Other Pages */}
        <Route element={<DashboardLayout />}>
          {/* Products & Browse */}
          <Route path="products" element={<Products />} />
          <Route path="products/:id" element={<ProductDetail />} />
          
          {/* Information Pages */}
          <Route path="privacy" element={<PrivacyPolicy />} />
          <Route path="privacy-policy" element={<PrivacyPolicy />} />
          <Route path="terms" element={<TermsConditions />} />
          <Route path="terms-conditions" element={<TermsConditions />} />
          <Route path="cookies" element={<CookiePolicy />} />
          <Route path="shipping" element={<ShippingDelivery />} />
          <Route path="returns" element={<ReturnsRefunds />} />
          <Route path="warranty" element={<WarrantyInfo />} />
          <Route path="faq" element={<FAQ />} />
          <Route path="help" element={<Help />} />
          
          {/* Protected Routes */}
          <Route path="settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
          <Route path="my-messages" element={<ProtectedRoute><MyMessages /></ProtectedRoute>} />
          <Route path="cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
          <Route path="checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
          <Route path="profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
          <Route path="orders/:id" element={<ProtectedRoute><OrderDetail /></ProtectedRoute>} />
          <Route path="payment/processing/:orderId" element={<ProtectedRoute><PaymentProcessing /></ProtectedRoute>} />
          <Route path="wishlist" element={<ProtectedRoute><Wishlist /></ProtectedRoute>} />
          <Route path="notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
        </Route>

        {/* Admin Routes */}
        <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
          <Route index element={<AdminDashboard />} />
          <Route path="products" element={<ProductsAdmin />} />
          <Route path="products/new" element={<ProductForm />} />
          <Route path="products/:id/edit" element={<ProductForm />} />
          <Route path="orders" element={<OrdersAdmin />} />
          <Route path="users" element={<UsersAdmin />} />
          <Route path="categories" element={<CategoriesAdmin />} />
          <Route path="notifications" element={<NotificationsAdmin />} />
          <Route path="discounts" element={<DiscountsAdmin />} />
          <Route path="messages" element={<MessagesAdmin />} />
          <Route path="settings" element={<SettingsAdmin />} />
        </Route>

        {/* 404 */}
        <Route path="*" element={
          <div className="min-h-screen flex flex-col items-center justify-center gap-4">
            <h1 className="text-4xl font-bold">404 - Page Not Found</h1>
            <BackHome />
          </div>
        } />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;