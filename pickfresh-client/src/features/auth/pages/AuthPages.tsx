import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, LockKeyhole, Mail, ShieldCheck, UserRound } from "lucide-react";
import { useState, type ReactNode } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { Link, Navigate, useNavigate, useSearchParams } from "react-router-dom";
import { Seo } from "../../../components/Seo";
import { Button, Input, Select } from "../../../components/ui";
import { useAuthStore } from "../../../store/authStore";
import type { UserRole } from "../../../types/domain";
import { authService, type OtpPurpose } from "../../../services/authService";
import {
  loginSchema,
  signupSchema,
  emailSchema,
  otpSchema,
  passwordSchema,
  changePasswordSchema,
  type LoginForm,
  type SignupForm,
  type OtpForm,
  type PasswordForm,
  type ChangePasswordForm,
} from "../validation/authSchemas";
import authHero from "../../../assets/auth-hero.png";

const signupRoles = ["customer", "vendor", "delivery"] as const;

const authRouteForRole = (role: UserRole) =>
  role === "admin" ? "/admin" : role === "vendor" ? "/vendor" : role === "delivery" ? "/delivery" : "/";

const FieldError = ({ message }: { message?: string }) =>
  message ? <p className="mt-1 text-xs text-red-500">{message}</p> : null;

export const LoginPage = () => {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);
  const [showPassword, setShowPassword] = useState(false);
  
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  if (isAuthenticated && user) return <Navigate to={authRouteForRole(user.role)} replace />;

  const submit = handleSubmit(async (values) => {
    try {
      const response = await authService.login(values);
      const data = response.data;
      
      setAuth({
        user: {
          id: data._id,
          name: data.name,
          email: data.email,
          role: data.role,
          phone: data.phone,
          avatar: data.avatar,
          isEmailVerified: data.isEmailVerified,
        },
        token: data.token,
        refreshToken: data.refreshToken,
      });
      
      toast.success("Welcome back to PickFresh!");
      navigate(authRouteForRole(data.role));
    } catch {
      // Error is toasted by interceptor
    }
  });

  return (
    <AuthShell
      title="Welcome back!"
      subtitle="Sign in to access your fresh grocery cart, track orders, and enjoy personalized recommendations."
      seoTitle="Login"
      seoDesc="Login to PickFresh grocery marketplace."
    >
      <form onSubmit={submit} className="space-y-3">
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-ink-700 dark:text-ink-100">Email address</label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400 dark:text-ink-100/40" />
            <Input {...register("email")} placeholder="you@example.com" type="email" className="pl-11" />
          </div>
          <FieldError message={errors.email?.message} />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-semibold text-ink-700 dark:text-ink-100">Password</label>
          <div className="relative">
            <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400 dark:text-ink-100/40" />
            <Input {...register("password")} placeholder="Your password" type={showPassword ? "text" : "password"} className="pl-11 pr-12" />
            <button type="button" onClick={() => setShowPassword((v) => !v)} className="absolute right-4 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-700 dark:text-ink-100/40 dark:hover:text-white">
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          <FieldError message={errors.password?.message} />
        </div>

        <div className="flex items-center justify-between text-sm">
          <label className="flex cursor-pointer items-center gap-2 text-ink-600 dark:text-ink-100/70">
            <input type="checkbox" className="h-4 w-4 rounded accent-[#2c9855]" />
            Remember me
          </label>
          <Link to="/forgot-password" className="font-semibold text-[#2c9855] hover:underline">Forgot password?</Link>
        </div>

        <Button className="h-12 w-full rounded-2xl bg-[#2c9855] text-white hover:bg-[#237a44] active:scale-[0.98]" disabled={isSubmitting}>
          <LockKeyhole className="h-4 w-4" /> {isSubmitting ? "Signing in..." : "Sign in"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-ink-500 dark:text-ink-100/60">
        Don't have an account?{" "}
        <Link to="/signup" className="font-bold text-[#2c9855] hover:underline">Create one free</Link>
      </p>
    </AuthShell>
  );
};

export const SignupPage = () => {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [showPassword, setShowPassword] = useState(false);
  
  const { register, handleSubmit, setValue, watch, formState: { errors, isSubmitting } } = useForm<SignupForm>({
    resolver: zodResolver(signupSchema),
    defaultValues: { role: "customer" },
  });

  const submit = handleSubmit(async (values) => {
    try {
      const response = await authService.register(values);
      const data = response.data;
      
      setAuth({
        user: {
          id: data._id,
          name: data.name,
          email: data.email,
          role: data.role ?? values.role,
          phone: data.phone,
          avatar: data.avatar,
          isEmailVerified: data.isEmailVerified,
        },
        token: data.token,
        refreshToken: data.refreshToken,
      });
      
      toast.success("Account created successfully!");
      navigate(`/verify-email?email=${encodeURIComponent(values.email)}`);
    } catch {
      // Error is toasted by interceptor
    }
  });

  return (
    <AuthShell
      title="Join PickFresh"
      subtitle="Create your free account and start shopping for the freshest groceries delivered straight to your door."
      seoTitle="Signup"
      seoDesc="Create a PickFresh account."
    >
      <form onSubmit={submit} className="space-y-3">
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-ink-700 dark:text-ink-100">Full name</label>
          <div className="relative">
            <UserRound className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400 dark:text-ink-100/40" />
            <Input {...register("name")} placeholder="Your full name" className="pl-11" />
          </div>
          <FieldError message={errors.name?.message} />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-semibold text-ink-700 dark:text-ink-100">Email address</label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400 dark:text-ink-100/40" />
            <Input {...register("email")} placeholder="you@example.com" type="email" className="pl-11" />
          </div>
          <FieldError message={errors.email?.message} />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-semibold text-ink-700 dark:text-ink-100">Password</label>
          <div className="relative">
            <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400 dark:text-ink-100/40" />
            <Input {...register("password")} placeholder="Create a password" type={showPassword ? "text" : "password"} className="pl-11 pr-12" />
            <button type="button" onClick={() => setShowPassword((v) => !v)} className="absolute right-4 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-700 dark:text-ink-100/40 dark:hover:text-white">
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          <FieldError message={errors.password?.message} />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-semibold text-ink-700 dark:text-ink-100">I am a</label>
          <Select value={watch("role")} onValueChange={(value) => setValue("role", value as UserRole)} options={[...signupRoles]} placeholder="Select role" />
          <p className="mt-1.5 text-xs text-ink-400 dark:text-ink-100/40">
            {watch("role") === "vendor" && "Vendors list products and manage inventory on PickFresh."}
            {watch("role") === "delivery" && "Delivery partners pick up and deliver orders to customers."}
            {watch("role") === "customer" && "Shop for fresh groceries, track orders and get doorstep delivery."}
          </p>
        </div>

        <Button className="mt-2 h-12 w-full rounded-2xl bg-[#2c9855] text-white hover:bg-[#237a44] active:scale-[0.98]" disabled={isSubmitting}>
          <UserRound className="h-4 w-4" /> {isSubmitting ? "Creating account..." : "Create free account"}
        </Button>
      </form>

      <p className="mt-3 text-center text-sm text-ink-500 dark:text-ink-100/60">
        Already have an account?{" "}
        <Link to="/login" className="font-bold text-[#2c9855] hover:underline">Sign in</Link>
      </p>
    </AuthShell>
  );
};

export const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(emailSchema),
  });

  const submit = handleSubmit(async (values) => {
    try {
      await authService.forgotPassword(values.email);
      toast.success("Password reset OTP sent to email!");
      navigate(`/otp?purpose=forgot-password&email=${encodeURIComponent(values.email)}`);
    } catch {
      // Handled by interceptor
    }
  });

  return (
    <AuthShell
      title="Forgot password?"
      subtitle="Enter your email and we'll send you an OTP to reset your password."
      seoTitle="Forgot Password"
      seoDesc="Forgot password request"
    >
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-ink-700 dark:text-ink-100">Email address</label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400 dark:text-ink-100/40" />
            <Input {...register("email")} placeholder="you@example.com" type="email" className="pl-11" />
          </div>
          <FieldError message={errors.email?.message as string} />
        </div>

        <Button className="h-12 w-full rounded-2xl bg-[#2c9855] text-white hover:bg-[#237a44]" disabled={isSubmitting}>
          {isSubmitting ? "Sending OTP..." : "Send reset OTP"}
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-ink-500 dark:text-ink-100/60">
        <Link to="/login" className="font-bold text-[#2c9855] hover:underline">Back to login</Link>
      </p>
    </AuthShell>
  );
};

export const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email") || "";
  const otp = searchParams.get("otp") || "";

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<PasswordForm>({
    resolver: zodResolver(passwordSchema),
  });

  const submit = handleSubmit(async (values) => {
    if (!email || !otp) {
      toast.error("Required parameter email or OTP code is missing");
      return;
    }
    try {
      await authService.resetPassword({ email, otp, password: values.password });
      toast.success("Password reset successfully! Please log in.");
      navigate("/login");
    } catch {
      // Handled by interceptor
    }
  });

  return (
    <AuthShell
      title="Reset password"
      subtitle="Choose a strong new password for your PickFresh account."
      seoTitle="Reset Password"
      seoDesc="Choose new password"
    >
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-ink-700 dark:text-ink-100">New password</label>
          <div className="relative">
            <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400 dark:text-ink-100/40" />
            <Input {...register("password")} placeholder="New password" type="password" className="pl-11" />
          </div>
          <FieldError message={errors.password?.message} />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-semibold text-ink-700 dark:text-ink-100">Confirm password</label>
          <div className="relative">
            <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400 dark:text-ink-100/40" />
            <Input {...register("confirmPassword")} placeholder="Confirm new password" type="password" className="pl-11" />
          </div>
          <FieldError message={errors.confirmPassword?.message} />
        </div>

        <Button className="h-12 w-full rounded-2xl bg-[#2c9855] text-white hover:bg-[#237a44]" disabled={isSubmitting}>
          {isSubmitting ? "Resetting..." : "Reset password"}
        </Button>
      </form>
    </AuthShell>
  );
};

export const OtpPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const emailParam = searchParams.get("email") || "";
  const purposeParam = (searchParams.get("purpose") as OtpPurpose) || "forgot-password";

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<OtpForm>({
    resolver: zodResolver(otpSchema),
    defaultValues: { email: emailParam, otp: "" },
  });

  const submit = handleSubmit(async (values) => {
    try {
      await authService.verifyOtp({
        email: values.email,
        otp: values.otp,
        purpose: purposeParam,
      });
      toast.success("OTP verified successfully!");
      if (purposeParam === "forgot-password") {
        navigate(`/reset-password?email=${encodeURIComponent(values.email)}&otp=${encodeURIComponent(values.otp)}`);
      } else {
        const user = useAuthStore.getState().user;
        if (user) {
          useAuthStore.getState().setAuth({
            user: { ...user, isEmailVerified: true },
            token: useAuthStore.getState().token || "",
            refreshToken: useAuthStore.getState().refreshToken || "",
          });
        }
        navigate("/profile");
      }
    } catch {
      // Handled by interceptor
    }
  });

  const handleResend = async () => {
    const emailParamVal = searchParams.get("email") || "";
    if (!emailParamVal) {
      toast.error("Email is required to resend OTP");
      return;
    }
    try {
      await authService.resendOtp({ email: emailParamVal, purpose: purposeParam });
      toast.success("A new OTP has been sent to your email!");
    } catch {
      // Handled by interceptor
    }
  };

  return (
    <AuthShell
      title="OTP verification"
      subtitle="Enter the 6-digit code sent to your email inbox."
      seoTitle="OTP Verification"
      seoDesc="Verify security code"
    >
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-ink-700 dark:text-ink-100">Email address</label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400 dark:text-ink-100/40" />
            <Input {...register("email")} placeholder="you@example.com" type="email" className="pl-11" />
          </div>
          <FieldError message={errors.email?.message} />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-semibold text-ink-700 dark:text-ink-100">OTP code</label>
          <div className="relative">
            <ShieldCheck className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400 dark:text-ink-100/40" />
            <Input {...register("otp")} placeholder="Enter 6-digit OTP" type="text" maxLength={6} className="pl-11" />
          </div>
          <FieldError message={errors.otp?.message} />
        </div>

        <Button className="h-12 w-full rounded-2xl bg-[#2c9855] text-white hover:bg-[#237a44]" disabled={isSubmitting}>
          {isSubmitting ? "Verifying..." : "Verify OTP"}
        </Button>
      </form>

      <div className="mt-4 text-center">
        <button type="button" onClick={handleResend} className="text-sm font-semibold text-[#2c9855] hover:underline bg-transparent border-0 cursor-pointer">
          Resend OTP
        </button>
      </div>

      <p className="mt-6 text-center text-sm text-ink-500 dark:text-ink-100/60">
        <Link to="/login" className="font-bold text-[#2c9855] hover:underline">Back to login</Link>
      </p>
    </AuthShell>
  );
};

export const EmailVerificationPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const storeUser = useAuthStore((state) => state.user);
  const emailParam = searchParams.get("email") || storeUser?.email || "";

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<OtpForm>({
    resolver: zodResolver(otpSchema),
    defaultValues: { email: emailParam, otp: "" },
  });

  const submit = handleSubmit(async (values) => {
    try {
      await authService.verifyOtp({
        email: values.email,
        otp: values.otp,
        purpose: "email-verify",
      });
      toast.success("Email verified successfully!");
      
      const user = useAuthStore.getState().user;
      if (user) {
        useAuthStore.getState().setAuth({
          user: { ...user, isEmailVerified: true },
          token: useAuthStore.getState().token || "",
          refreshToken: useAuthStore.getState().refreshToken || "",
        });
      }
      navigate("/profile");
    } catch {
      // Handled by interceptor
    }
  });

  const handleResend = async () => {
    const emailParamVal = emailParam;
    if (!emailParamVal) {
      toast.error("Email is required to resend verification OTP");
      return;
    }
    try {
      await authService.resendOtp({ email: emailParamVal, purpose: "email-verify" });
      toast.success("Verification OTP sent to your email!");
    } catch {
      // Handled by interceptor
    }
  };

  return (
    <AuthShell
      title="Verify your email"
      subtitle="Confirm your email address to unlock all PickFresh marketplace features."
      seoTitle="Verify Email"
      seoDesc="Verify email address"
    >
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-ink-700 dark:text-ink-100">Email address</label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400 dark:text-ink-100/40" />
            <Input {...register("email")} placeholder="you@example.com" type="email" className="pl-11" />
          </div>
          <FieldError message={errors.email?.message} />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-semibold text-ink-700 dark:text-ink-100">OTP code</label>
          <div className="relative">
            <ShieldCheck className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400 dark:text-ink-100/40" />
            <Input {...register("otp")} placeholder="Enter 6-digit OTP" type="text" maxLength={6} className="pl-11" />
          </div>
          <FieldError message={errors.otp?.message} />
        </div>

        <Button className="h-12 w-full rounded-2xl bg-[#2c9855] text-white hover:bg-[#237a44]" disabled={isSubmitting}>
          {isSubmitting ? "Verifying..." : "Verify email"}
        </Button>
      </form>

      <div className="mt-4 text-center">
        <button type="button" onClick={handleResend} className="text-sm font-semibold text-[#2c9855] hover:underline bg-transparent border-0 cursor-pointer">
          Resend verification OTP
        </button>
      </div>
    </AuthShell>
  );
};

export const ChangePasswordPage = () => {
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ChangePasswordForm>({
    resolver: zodResolver(changePasswordSchema),
  });

  const submit = handleSubmit(async (values) => {
    try {
      await authService.changePassword({
        currentPassword: values.currentPassword,
        newPassword: values.password,
      });
      toast.success("Password updated successfully! Please login again.");
      useAuthStore.getState().logout();
      navigate("/login");
    } catch {
      // Handled by interceptor
    }
  });

  return (
    <AuthShell
      title="Change password"
      subtitle="Keep your account protected with a fresh new password."
      seoTitle="Change Password"
      seoDesc="Update your password"
    >
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-ink-700 dark:text-ink-100">Current password</label>
          <div className="relative">
            <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400 dark:text-ink-100/40" />
            <Input {...register("currentPassword")} placeholder="Current password" type="password" className="pl-11" />
          </div>
          <FieldError message={errors.currentPassword?.message} />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-semibold text-ink-700 dark:text-ink-100">New password</label>
          <div className="relative">
            <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400 dark:text-ink-100/40" />
            <Input {...register("password")} placeholder="New password" type="password" className="pl-11" />
          </div>
          <FieldError message={errors.password?.message} />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-semibold text-ink-700 dark:text-ink-100">Confirm password</label>
          <div className="relative">
            <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400 dark:text-ink-100/40" />
            <Input {...register("confirmPassword")} placeholder="Confirm password" type="password" className="pl-11" />
          </div>
          <FieldError message={errors.confirmPassword?.message} />
        </div>

        <Button className="h-12 w-full rounded-2xl bg-[#2c9855] text-white hover:bg-[#237a44]" disabled={isSubmitting}>
          {isSubmitting ? "Updating password..." : "Update password"}
        </Button>
      </form>
    </AuthShell>
  );
};

const AuthShell = ({ title, subtitle, seoTitle, seoDesc, children }: { title: string; subtitle: string; seoTitle: string; seoDesc: string; children: ReactNode }) => (
  <div className="flex min-h-screen bg-ink-50 dark:bg-ink-950">
    <Seo title={seoTitle} description={seoDesc} />

    {/* Left Panel — Illustration */}
    <div className="relative hidden flex-col overflow-hidden lg:flex lg:w-1/2">
      {/* Full bleed image */}
      <img
        src={authHero}
        alt="Fresh groceries"
        className="absolute inset-0 h-full w-full object-cover"
      />
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#1a7040]/80 via-[#2c9855]/60 to-[#1a5c34]/70" />

      {/* Content on top of image */}
      <div className="relative z-10 flex h-full flex-col justify-between p-10">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/20 backdrop-blur">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
              <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 3.5 0 9.5A7 7 0 0 1 11 20z" />
              <path d="M9 22v-4" />
            </svg>
          </div>
          <div>
            <p className="text-xl font-black text-white">PickFresh</p>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-white/70">Premium Organic Market</p>
          </div>
        </div>

        {/* Hero text */}
        <div>
          <h1 className="text-4xl font-black leading-tight text-white xl:text-5xl">
            Farm-fresh.<br />
            <span className="text-white/80">Delivered fast.</span>
          </h1>
          <p className="mt-4 max-w-sm text-base text-white/80">
            Shop verified organic produce, compare vendors, track orders live — all in one premium marketplace.
          </p>

          {/* Trust badges */}
          <div className="mt-8 flex flex-wrap gap-3">
            {[
              { icon: "🥬", label: "100% organic" },
              { icon: "⚡", label: "18 min delivery" },
              { icon: "⭐", label: "4.8/5 freshness" },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-semibold text-white backdrop-blur-sm">
                <span>{item.icon}</span>
                {item.label}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>

    {/* Right Panel — Form */}
    <div className="flex w-full flex-col items-center justify-center px-6 py-10 lg:w-1/2 lg:px-16 xl:px-24">
      {/* Mobile logo */}
      <div className="mb-8 flex items-center gap-2 lg:hidden">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#2c9855]">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
            <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 3.5 0 9.5A7 7 0 0 1 11 20z" />
            <path d="M9 22v-4" />
          </svg>
        </div>
        <span className="text-xl font-black text-ink-950 dark:text-white">PickFresh</span>
      </div>

      <div className="w-full max-w-md">
        {/* Header */}
        <div className="mb-5">
          <h2 className="text-3xl font-black text-ink-950 dark:text-white">{title}</h2>
          <p className="mt-2 text-sm leading-relaxed text-ink-500 dark:text-ink-100/60">{subtitle}</p>
        </div>

        {/* Form Card */}
        <div className="rounded-3xl border border-ink-200/60 bg-white p-8 shadow-soft dark:border-white/10 dark:bg-ink-900">
          {children}
        </div>

        {/* Footer links */}
        <div className="mt-4 flex flex-wrap justify-center gap-4 text-xs text-ink-400 dark:text-ink-100/40">
          <Link to="/signup" className="hover:text-[#2c9855]">Sign up</Link>
          <span>·</span>
          <Link to="/forgot-password" className="hover:text-[#2c9855]">Forgot password</Link>
          <span>·</span>
          <Link to="/otp" className="hover:text-[#2c9855]">OTP verify</Link>
          <span>·</span>
          <Link to="/" className="hover:text-[#2c9855]">Home</Link>
        </div>
      </div>
    </div>
  </div>
);
