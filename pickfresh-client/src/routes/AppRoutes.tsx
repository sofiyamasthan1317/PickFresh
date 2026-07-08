import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { AppLayout } from "../layouts/AppLayout";
import { CustomerLayout } from "../layouts/CustomerLayout";
import { AdminLayout } from "../layouts/AdminLayout";
import { VendorLayout } from "../layouts/VendorLayout";
import { DeliveryLayout } from "../layouts/DeliveryLayout";
import { ProtectedRoute } from "./ProtectedRoute";
import { LoadingState } from "../components/ui";

// ─── Auth pages ───────────────────────────────────────────────────────────────
const LoginPage             = lazy(() => import("../features/auth/pages/AuthPages").then((m) => ({ default: m.LoginPage })));
const SignupPage            = lazy(() => import("../features/auth/pages/AuthPages").then((m) => ({ default: m.SignupPage })));
const ForgotPasswordPage    = lazy(() => import("../features/auth/pages/AuthPages").then((m) => ({ default: m.ForgotPasswordPage })));
const ResetPasswordPage     = lazy(() => import("../features/auth/pages/AuthPages").then((m) => ({ default: m.ResetPasswordPage })));
const OtpPage               = lazy(() => import("../features/auth/pages/AuthPages").then((m) => ({ default: m.OtpPage })));
const EmailVerificationPage = lazy(() => import("../features/auth/pages/AuthPages").then((m) => ({ default: m.EmailVerificationPage })));
const ChangePasswordPage    = lazy(() => import("../features/auth/pages/AuthPages").then((m) => ({ default: m.ChangePasswordPage })));

// ─── Error pages ──────────────────────────────────────────────────────────────
const NotFoundPage     = lazy(() => import("../pages/ErrorPages").then((m) => ({ default: m.NotFoundPage })));
const ForbiddenPage    = lazy(() => import("../pages/ErrorPages").then((m) => ({ default: m.ForbiddenPage })));
const UnauthorizedPage = lazy(() => import("../pages/ErrorPages").then((m) => ({ default: m.UnauthorizedPage })));
const ServerErrorPage  = lazy(() => import("../pages/ErrorPages").then((m) => ({ default: m.ServerErrorPage })));
const MaintenancePage  = lazy(() => import("../pages/ErrorPages").then((m) => ({ default: m.MaintenancePage })));
const OfflinePage      = lazy(() => import("../pages/ErrorPages").then((m) => ({ default: m.OfflinePage })));

// ─── Customer pages ───────────────────────────────────────────────────────────
const HomePage          = lazy(() => import("../features/customer/pages/HomePage").then((m) => ({ default: m.HomePage })));
const ProductListingPage = lazy(() => import("../features/customer/pages/ProductPages").then((m) => ({ default: m.ProductListingPage })));
const ProductDetailsPage = lazy(() => import("../features/customer/pages/ProductPages").then((m) => ({ default: m.ProductDetailsPage })));
const CartPage          = lazy(() => import("../features/customer/pages/CommercePages").then((m) => ({ default: m.CartPage })));
const CheckoutPage      = lazy(() => import("../features/customer/pages/CommercePages").then((m) => ({ default: m.CheckoutPage })));
const OrderSuccessPage  = lazy(() => import("../features/customer/pages/CommercePages").then((m) => ({ default: m.OrderSuccessPage })));
const OrdersPage        = lazy(() => import("../features/customer/pages/CommercePages").then((m) => ({ default: m.OrdersPage })));
const OrderDetailsPage  = lazy(() => import("../features/customer/pages/CommercePages").then((m) => ({ default: m.OrderDetailsPage })));
const ProfilePage       = lazy(() => import("../features/customer/pages/CommercePages").then((m) => ({ default: m.ProfilePage })));
const WishlistPage      = lazy(() => import("../features/customer/pages/CommercePages").then((m) => ({ default: m.WishlistPage })));
const AddressPage       = lazy(() => import("../features/customer/pages/CommercePages").then((m) => ({ default: m.AddressPage })));
const WalletPage        = lazy(() => import("../features/customer/pages/CommercePages").then((m) => ({ default: m.WalletPage })));
const NotificationsPage = lazy(() => import("../features/customer/pages/CommercePages").then((m) => ({ default: m.NotificationsPage })));
const ReviewsPage       = lazy(() => import("../features/customer/pages/CommercePages").then((m) => ({ default: m.ReviewsPage })));
const DealsPage         = lazy(() => import("../features/customer/pages/CommercePages").then((m) => ({ default: m.DealsPage })));
const CategoriesPage    = lazy(() => import("../features/customer/pages/CommercePages").then((m) => ({ default: m.CategoriesPage })));
const ReferralPage      = lazy(() => import("../features/customer/pages/CommercePages").then((m) => ({ default: m.ReferralPage })));
const SearchPage        = lazy(() => import("../features/ai/pages/AiPages").then((m) => ({ default: m.SearchPage })));
const ChatPage          = lazy(() => import("../features/chat/pages/ChatPage").then((m) => ({ default: m.ChatPage })));
const DeliveryTrackPage = lazy(() => import("../features/customer/pages/DeliveryTrackPage").then((m) => ({ default: m.DeliveryTrackPage })));

// ─── Admin pages (lazy-loaded group) ─────────────────────────────────────────
const AdminDashboard       = lazy(() => import("../features/admin/pages/AdminDashboard").then((m) => ({ default: m.AdminDashboard })));
const AdminProducts        = lazy(() => import("../features/admin/pages/AdminProducts").then((m) => ({ default: m.AdminProducts })));
const AdminCategories      = lazy(() => import("../features/admin/pages/AdminCategories").then((m) => ({ default: m.AdminCategories })));
const AdminOrders          = lazy(() => import("../features/admin/pages/AdminOrders").then((m) => ({ default: m.AdminOrders })));
const AdminCustomers       = lazy(() => import("../features/admin/pages/AdminCustomers").then((m) => ({ default: m.AdminCustomers })));
const AdminVendors         = lazy(() => import("../features/admin/pages/AdminVendors").then((m) => ({ default: m.AdminVendors })));
const AdminDeliveryPartners = lazy(() => import("../features/admin/pages/AdminDeliveryPartners").then((m) => ({ default: m.AdminDeliveryPartners })));
const AdminCoupons         = lazy(() => import("../features/admin/pages/AdminCoupons").then((m) => ({ default: m.AdminCoupons })));
const AdminBanners         = lazy(() => import("../features/admin/pages/AdminBanners").then((m) => ({ default: m.AdminBanners })));
const AdminReports         = lazy(() => import("../features/admin/pages/AdminReports").then((m) => ({ default: m.AdminReports })));
const AdminReviews         = lazy(() => import("../features/admin/pages/AdminReviews").then((m) => ({ default: m.AdminReviews })));
const AdminSettings        = lazy(() => import("../features/admin/pages/AdminSettings").then((m) => ({ default: m.AdminSettings })));

// ─── Vendor pages (lazy-loaded group) ────────────────────────────────────────
const VendorDashboard   = lazy(() => import("../features/vendor/pages/VendorDashboard").then((m) => ({ default: m.VendorDashboard })));
const VendorProducts    = lazy(() => import("../features/vendor/pages/VendorProducts").then((m) => ({ default: m.VendorProducts })));
const VendorAddProduct  = lazy(() => import("../features/vendor/pages/VendorAddProduct").then((m) => ({ default: m.VendorAddProduct })));
const VendorInventory   = lazy(() => import("../features/vendor/pages/VendorInventory").then((m) => ({ default: m.VendorInventory })));
const VendorOrders      = lazy(() => import("../features/vendor/pages/VendorOrders").then((m) => ({ default: m.VendorOrders })));
const VendorReviews     = lazy(() => import("../features/vendor/pages/VendorReviews").then((m) => ({ default: m.VendorReviews })));
const VendorEarnings    = lazy(() => import("../features/vendor/pages/VendorEarnings").then((m) => ({ default: m.VendorEarnings })));
const VendorProfile     = lazy(() => import("../features/vendor/pages/VendorProfile").then((m) => ({ default: m.VendorProfile })));

// ─── Delivery pages (lazy-loaded group) ──────────────────────────────────────
const DeliveryDashboard = lazy(() => import("../features/delivery/pages/DeliveryDashboard").then((m) => ({ default: m.DeliveryDashboard })));
const DeliveryOrders    = lazy(() => import("../features/delivery/pages/DeliveryOrders").then((m) => ({ default: m.DeliveryOrders })));
const DeliveryHistory   = lazy(() => import("../features/delivery/pages/DeliveryHistory").then((m) => ({ default: m.DeliveryHistory })));
const DeliveryEarnings  = lazy(() => import("../features/delivery/pages/DeliveryEarnings").then((m) => ({ default: m.DeliveryEarnings })));
const DeliveryProfile   = lazy(() => import("../features/delivery/pages/DeliveryProfile").then((m) => ({ default: m.DeliveryProfile })));

// ─── Suspense fallback ────────────────────────────────────────────────────────
const Fallback = () => <LoadingState />;

export const AppRoutes = () => (
  <Routes>
    {/* Public standalone pages (no layout) */}
    <Route path="/login"          element={<Suspense fallback={<Fallback />}><LoginPage /></Suspense>} />
    <Route path="/signup"         element={<Suspense fallback={<Fallback />}><SignupPage /></Suspense>} />
    <Route path="/forgot-password" element={<Suspense fallback={<Fallback />}><ForgotPasswordPage /></Suspense>} />
    <Route path="/reset-password" element={<Suspense fallback={<Fallback />}><ResetPasswordPage /></Suspense>} />
    <Route path="/otp"            element={<Suspense fallback={<Fallback />}><OtpPage /></Suspense>} />
    <Route path="/verify-email"   element={<Suspense fallback={<Fallback />}><EmailVerificationPage /></Suspense>} />
    <Route path="/401"            element={<Suspense fallback={<Fallback />}><UnauthorizedPage /></Suspense>} />
    <Route path="/403"            element={<Suspense fallback={<Fallback />}><ForbiddenPage /></Suspense>} />
    <Route path="/404"            element={<Suspense fallback={<Fallback />}><NotFoundPage /></Suspense>} />
    <Route path="/500"            element={<Suspense fallback={<Fallback />}><ServerErrorPage /></Suspense>} />
    <Route path="/maintenance"    element={<Suspense fallback={<Fallback />}><MaintenancePage /></Suspense>} />
    <Route path="/offline"        element={<Suspense fallback={<Fallback />}><OfflinePage /></Suspense>} />

    {/* ── Root: AppLayout wraps everything (global context/syncing) ─────────── */}
    <Route element={<AppLayout />}>

      {/* ── CUSTOMER STOREFRONT ─────────────────────────────────────────────── */}
      <Route element={<CustomerLayout />}>
        {/* Public storefront routes */}
        <Route index            element={<Suspense fallback={<Fallback />}><HomePage /></Suspense>} />
        <Route path="products"  element={<Suspense fallback={<Fallback />}><ProductListingPage /></Suspense>} />
        <Route path="products/:id" element={<Suspense fallback={<Fallback />}><ProductDetailsPage /></Suspense>} />
        <Route path="categories" element={<Suspense fallback={<Fallback />}><CategoriesPage /></Suspense>} />
        <Route path="deals"     element={<Suspense fallback={<Fallback />}><DealsPage /></Suspense>} />
        <Route path="search"    element={<Suspense fallback={<Fallback />}><SearchPage /></Suspense>} />
        <Route path="chat"      element={<Suspense fallback={<Fallback />}><ChatPage /></Suspense>} />
        <Route path="reviews"   element={<Suspense fallback={<Fallback />}><ReviewsPage /></Suspense>} />
        <Route path="support"   element={<Suspense fallback={<Fallback />}><ChatPage /></Suspense>} />

        {/* Protected customer routes */}
        <Route element={<ProtectedRoute roles={["customer", "admin"]} />}>
          <Route path="cart"           element={<Suspense fallback={<Fallback />}><CartPage /></Suspense>} />
          <Route path="checkout"       element={<Suspense fallback={<Fallback />}><CheckoutPage /></Suspense>} />
          <Route path="order-success"  element={<Suspense fallback={<Fallback />}><OrderSuccessPage /></Suspense>} />
          <Route path="order-success/:id" element={<Suspense fallback={<Fallback />}><OrderSuccessPage /></Suspense>} />
          <Route path="orders"         element={<Suspense fallback={<Fallback />}><OrdersPage /></Suspense>} />
          <Route path="orders/:id"     element={<Suspense fallback={<Fallback />}><OrderDetailsPage /></Suspense>} />
          <Route path="orders/:id/track" element={<Suspense fallback={<Fallback />}><DeliveryTrackPage /></Suspense>} />
          <Route path="profile"        element={<Suspense fallback={<Fallback />}><ProfilePage /></Suspense>} />
          <Route path="wishlist"       element={<Suspense fallback={<Fallback />}><WishlistPage /></Suspense>} />
          <Route path="addresses"      element={<Suspense fallback={<Fallback />}><AddressPage /></Suspense>} />
          <Route path="wallet"         element={<Suspense fallback={<Fallback />}><WalletPage /></Suspense>} />
          <Route path="referral"       element={<Suspense fallback={<Fallback />}><ReferralPage /></Suspense>} />
          <Route path="notifications"  element={<Suspense fallback={<Fallback />}><NotificationsPage /></Suspense>} />
          <Route path="change-password" element={<Suspense fallback={<Fallback />}><ChangePasswordPage /></Suspense>} />
        </Route>
      </Route>

      {/* ── ADMIN PORTAL ────────────────────────────────────────────────────── */}
      <Route element={<ProtectedRoute roles={["admin"]} />}>
        <Route path="admin" element={<AdminLayout />}>
          <Route index              element={<Suspense fallback={<Fallback />}><AdminDashboard /></Suspense>} />
          <Route path="products"   element={<Suspense fallback={<Fallback />}><AdminProducts /></Suspense>} />
          <Route path="categories" element={<Suspense fallback={<Fallback />}><AdminCategories /></Suspense>} />
          <Route path="orders"     element={<Suspense fallback={<Fallback />}><AdminOrders /></Suspense>} />
          <Route path="customers"  element={<Suspense fallback={<Fallback />}><AdminCustomers /></Suspense>} />
          <Route path="vendors"    element={<Suspense fallback={<Fallback />}><AdminVendors /></Suspense>} />
          <Route path="delivery"   element={<Suspense fallback={<Fallback />}><AdminDeliveryPartners /></Suspense>} />
          <Route path="coupons"    element={<Suspense fallback={<Fallback />}><AdminCoupons /></Suspense>} />
          <Route path="banners"    element={<Suspense fallback={<Fallback />}><AdminBanners /></Suspense>} />
          <Route path="reports"    element={<Suspense fallback={<Fallback />}><AdminReports /></Suspense>} />
          <Route path="reviews"    element={<Suspense fallback={<Fallback />}><AdminReviews /></Suspense>} />
          <Route path="settings"   element={<Suspense fallback={<Fallback />}><AdminSettings /></Suspense>} />
          <Route path="*"          element={<Navigate to="/admin" replace />} />
        </Route>
      </Route>

      {/* ── VENDOR PORTAL ───────────────────────────────────────────────────── */}
      <Route element={<ProtectedRoute roles={["vendor"]} />}>
        <Route path="vendor" element={<VendorLayout />}>
          <Route index                element={<Suspense fallback={<Fallback />}><VendorDashboard /></Suspense>} />
          <Route path="products"      element={<Suspense fallback={<Fallback />}><VendorProducts /></Suspense>} />
          <Route path="add-product"   element={<Suspense fallback={<Fallback />}><VendorAddProduct /></Suspense>} />
          <Route path="inventory"     element={<Suspense fallback={<Fallback />}><VendorInventory /></Suspense>} />
          <Route path="orders"        element={<Suspense fallback={<Fallback />}><VendorOrders /></Suspense>} />
          <Route path="reviews"       element={<Suspense fallback={<Fallback />}><VendorReviews /></Suspense>} />
          <Route path="earnings"      element={<Suspense fallback={<Fallback />}><VendorEarnings /></Suspense>} />
          <Route path="profile"       element={<Suspense fallback={<Fallback />}><VendorProfile /></Suspense>} />
          <Route path="*"             element={<Navigate to="/vendor" replace />} />
        </Route>
      </Route>

      {/* ── DELIVERY PORTAL ─────────────────────────────────────────────────── */}
      <Route element={<ProtectedRoute roles={["delivery"]} />}>
        <Route path="delivery" element={<DeliveryLayout />}>
          <Route index           element={<Suspense fallback={<Fallback />}><DeliveryDashboard /></Suspense>} />
          <Route path="orders"   element={<Suspense fallback={<Fallback />}><DeliveryOrders /></Suspense>} />
          <Route path="history"  element={<Suspense fallback={<Fallback />}><DeliveryHistory /></Suspense>} />
          <Route path="earnings" element={<Suspense fallback={<Fallback />}><DeliveryEarnings /></Suspense>} />
          <Route path="profile"  element={<Suspense fallback={<Fallback />}><DeliveryProfile /></Suspense>} />
          <Route path="*"        element={<Navigate to="/delivery" replace />} />
        </Route>
      </Route>

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/404" replace />} />
    </Route>
  </Routes>
);
