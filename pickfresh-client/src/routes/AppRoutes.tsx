import { lazy } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { AppLayout } from "../layouts/AppLayout";
import { ProtectedRoute } from "./ProtectedRoute";

const HomePage = lazy(() => import("../features/customer/pages/HomePage").then((module) => ({ default: module.HomePage })));
const ProductListingPage = lazy(() => import("../features/customer/pages/ProductPages").then((module) => ({ default: module.ProductListingPage })));
const ProductDetailsPage = lazy(() => import("../features/customer/pages/ProductPages").then((module) => ({ default: module.ProductDetailsPage })));
const LoginPage = lazy(() => import("../features/auth/pages/AuthPages").then((module) => ({ default: module.LoginPage })));
const SignupPage = lazy(() => import("../features/auth/pages/AuthPages").then((module) => ({ default: module.SignupPage })));
const ForgotPasswordPage = lazy(() => import("../features/auth/pages/AuthPages").then((module) => ({ default: module.ForgotPasswordPage })));
const ResetPasswordPage = lazy(() => import("../features/auth/pages/AuthPages").then((module) => ({ default: module.ResetPasswordPage })));
const OtpPage = lazy(() => import("../features/auth/pages/AuthPages").then((module) => ({ default: module.OtpPage })));
const EmailVerificationPage = lazy(() => import("../features/auth/pages/AuthPages").then((module) => ({ default: module.EmailVerificationPage })));
const ChangePasswordPage = lazy(() => import("../features/auth/pages/AuthPages").then((module) => ({ default: module.ChangePasswordPage })));
const CartPage = lazy(() => import("../features/customer/pages/CommercePages").then((module) => ({ default: module.CartPage })));
const CheckoutPage = lazy(() => import("../features/customer/pages/CommercePages").then((module) => ({ default: module.CheckoutPage })));
const OrderSuccessPage = lazy(() => import("../features/customer/pages/CommercePages").then((module) => ({ default: module.OrderSuccessPage })));
const OrdersPage = lazy(() => import("../features/customer/pages/CommercePages").then((module) => ({ default: module.OrdersPage })));
const OrderDetailsPage = lazy(() => import("../features/customer/pages/CommercePages").then((module) => ({ default: module.OrderDetailsPage })));
const ProfilePage = lazy(() => import("../features/customer/pages/CommercePages").then((module) => ({ default: module.ProfilePage })));
const WishlistPage = lazy(() => import("../features/customer/pages/CommercePages").then((module) => ({ default: module.WishlistPage })));
const AddressPage = lazy(() => import("../features/customer/pages/CommercePages").then((module) => ({ default: module.AddressPage })));
const WalletPage = lazy(() => import("../features/customer/pages/CommercePages").then((module) => ({ default: module.WalletPage })));
const ReferralPage = lazy(() => import("../features/customer/pages/CommercePages").then((module) => ({ default: module.ReferralPage })));
const NotificationsPage = lazy(() => import("../features/customer/pages/CommercePages").then((module) => ({ default: module.NotificationsPage })));
const ReviewsPage = lazy(() => import("../features/customer/pages/CommercePages").then((module) => ({ default: module.ReviewsPage })));
const DealsPage = lazy(() => import("../features/customer/pages/CommercePages").then((module) => ({ default: module.DealsPage })));
const CategoriesPage = lazy(() => import("../features/customer/pages/CommercePages").then((module) => ({ default: module.CategoriesPage })));
const AiHubPage = lazy(() => import("../features/ai/pages/AiPages").then((module) => ({ default: module.AiHubPage })));
const SearchPage = lazy(() => import("../features/ai/pages/AiPages").then((module) => ({ default: module.SearchPage })));
const ChatPage = lazy(() => import("../features/chat/pages/ChatPage").then((module) => ({ default: module.ChatPage })));
const VendorDashboardPage = lazy(() => import("../features/dashboard/pages/DashboardPages").then((module) => ({ default: module.VendorDashboardPage })));
const AdminDashboardPage = lazy(() => import("../features/dashboard/pages/DashboardPages").then((module) => ({ default: module.AdminDashboardPage })));
const DeliveryDashboardPage = lazy(() => import("../features/dashboard/pages/DashboardPages").then((module) => ({ default: module.DeliveryDashboardPage })));
const NotFoundPage = lazy(() => import("../pages/ErrorPages").then((module) => ({ default: module.NotFoundPage })));
const ForbiddenPage = lazy(() => import("../pages/ErrorPages").then((module) => ({ default: module.ForbiddenPage })));
const UnauthorizedPage = lazy(() => import("../pages/ErrorPages").then((module) => ({ default: module.UnauthorizedPage })));
const ServerErrorPage = lazy(() => import("../pages/ErrorPages").then((module) => ({ default: module.ServerErrorPage })));
const MaintenancePage = lazy(() => import("../pages/ErrorPages").then((module) => ({ default: module.MaintenancePage })));
const OfflinePage = lazy(() => import("../pages/ErrorPages").then((module) => ({ default: module.OfflinePage })));

export const AppRoutes = () => (
  <Routes>
    <Route path="/login" element={<LoginPage />} />
    <Route path="/signup" element={<SignupPage />} />
    <Route path="/forgot-password" element={<ForgotPasswordPage />} />
    <Route path="/reset-password" element={<ResetPasswordPage />} />
    <Route path="/otp" element={<OtpPage />} />
    <Route path="/verify-email" element={<EmailVerificationPage />} />
      <Route path="/401" element={<UnauthorizedPage />} />
      <Route path="/403" element={<ForbiddenPage />} />
      <Route path="/404" element={<NotFoundPage />} />
      <Route path="/500" element={<ServerErrorPage />} />
    <Route path="/maintenance" element={<MaintenancePage />} />
    <Route path="/offline" element={<OfflinePage />} />

    <Route element={<AppLayout />}>
      <Route index element={<HomePage />} />
      <Route path="products" element={<ProductListingPage />} />
      <Route path="products/:id" element={<ProductDetailsPage />} />
      <Route path="categories" element={<CategoriesPage />} />
      <Route path="deals" element={<DealsPage />} />
      <Route path="search" element={<SearchPage />} />
      <Route path="ai" element={<AiHubPage />} />
      <Route path="chat" element={<ChatPage />} />
      <Route path="reviews" element={<ReviewsPage />} />
      <Route path="support" element={<ChatPage />} />

      <Route element={<ProtectedRoute roles={["customer", "admin"]} />}>
        <Route path="cart" element={<CartPage />} />
        <Route path="checkout" element={<CheckoutPage />} />
        <Route path="order-success" element={<OrderSuccessPage />} />
        <Route path="orders" element={<OrdersPage />} />
        <Route path="orders/:id" element={<OrderDetailsPage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="wishlist" element={<WishlistPage />} />
        <Route path="addresses" element={<AddressPage />} />
        <Route path="wallet" element={<WalletPage />} />
        <Route path="referral" element={<ReferralPage />} />
        <Route path="notifications" element={<NotificationsPage />} />
        <Route path="change-password" element={<ChangePasswordPage />} />
      </Route>

      <Route element={<ProtectedRoute roles={["vendor"]} />}>
        <Route path="vendor" element={<VendorDashboardPage />} />
      </Route>

      <Route element={<ProtectedRoute roles={["admin"]} />}>
        <Route path="admin" element={<AdminDashboardPage />} />
      </Route>

      <Route element={<ProtectedRoute roles={["delivery"]} />}>
        <Route path="delivery" element={<DeliveryDashboardPage />} />
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Route>
    <Route path="*" element={<Navigate to="/404" replace />} />
  </Routes>
);
