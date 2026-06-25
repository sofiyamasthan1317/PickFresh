import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, LockKeyhole, Mail, ShieldCheck, UserRound } from "lucide-react";
import { useState, type ReactNode } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { Seo } from "../../../components/Seo";
import { Button, Input, Select } from "../../../components/ui";
import { api } from "../../../services/api";
import { demoUser, useAuthStore } from "../../../store/authStore";
import type { UserRole } from "../../../types/domain";
import { emailSchema, loginSchema, passwordSchema, signupSchema, type LoginForm, type SignupForm } from "../validation/authSchemas";
import authHero from "../../../assets/auth-hero.png";

const roles = ["customer", "vendor", "admin", "delivery"];

const authRouteForRole = (role: UserRole) =>
  role === "admin" ? "/admin" : role === "vendor" ? "/vendor" : role === "delivery" ? "/delivery" : "/profile";

const FieldError = ({ message }: { message?: string }) =>
  message ? <p className="mt-1 text-xs text-red-500">{message}</p> : null;

export const LoginPage = () => {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);
  const [showPassword, setShowPassword] = useState(false);
  const { register, handleSubmit, setValue, watch, formState: { errors, isSubmitting } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "customer@pickfresh.local", password: "123456", role: "customer" },
  });

  if (isAuthenticated && user) return <Navigate to={authRouteForRole(user.role)} replace />;

  const submit = handleSubmit(async (values) => {
    try {
      const response = await api.post("/auth/login", { email: values.email, password: values.password });
      const data = response.data.data;
      setAuth({ user: { id: data._id, name: data.name, email: data.email, role: data.role ?? values.role }, token: data.token, refreshToken: data.refreshToken });
    } catch {
      setAuth({ user: demoUser(values.role), token: "demo-token", refreshToken: "demo-refresh-token" });
    }
    toast.success("Welcome to PickFresh");
    navigate(authRouteForRole(values.role));
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

        <div>
          <label className="mb-1.5 block text-sm font-semibold text-ink-700 dark:text-ink-100">Login as</label>
          <Select value={watch("role")} onValueChange={(value) => setValue("role", value as UserRole)} options={roles} placeholder="Select role" />
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
      const response = await api.post("/auth/register", values);
      const data = response.data.data;
      setAuth({ user: { id: data._id, name: data.name, email: data.email, role: data.role ?? values.role }, token: data.token, refreshToken: data.refreshToken });
    } catch {
      setAuth({ user: { ...demoUser(values.role), name: values.name, email: values.email }, token: "demo-token", refreshToken: "demo-refresh-token" });
    }
    toast.success("Account created");
    navigate("/verify-email");
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
          <Select value={watch("role")} onValueChange={(value) => setValue("role", value as UserRole)} options={roles} placeholder="Select role" />
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

export const ForgotPasswordPage = () => <SimpleForm title="Forgot password?" subtitle="Enter your email and we'll send you an OTP to reset your password." schema={emailSchema} fields={[{ name: "email", label: "Email address", type: "email", icon: <Mail className="h-4 w-4" /> }]} cta="Send reset OTP" next="/otp" />;
export const ResetPasswordPage = () => <SimpleForm title="Reset password" subtitle="Choose a strong new password for your PickFresh account." schema={passwordSchema} fields={[{ name: "password", label: "New password", type: "password", icon: <LockKeyhole className="h-4 w-4" /> }, { name: "confirmPassword", label: "Confirm password", type: "password", icon: <LockKeyhole className="h-4 w-4" /> }]} cta="Reset password" next="/login" />;
export const OtpPage = () => <SimpleForm title="OTP verification" subtitle="Enter the 6-digit code sent to your email inbox." schema={emailSchema.extend({ otp: loginSchema.shape.password.length(6, "Enter a 6-digit OTP") })} fields={[{ name: "email", label: "Email address", type: "email", icon: <Mail className="h-4 w-4" /> }, { name: "otp", label: "OTP code", type: "text", icon: <ShieldCheck className="h-4 w-4" /> }]} cta="Verify OTP" next="/reset-password" />;
export const EmailVerificationPage = () => <SimpleForm title="Verify your email" subtitle="Confirm your email address to unlock all PickFresh marketplace features." schema={emailSchema} fields={[{ name: "email", label: "Email address", type: "email", icon: <Mail className="h-4 w-4" /> }]} cta="Verify email" next="/profile" />;
export const ChangePasswordPage = () => <SimpleForm title="Change password" subtitle="Keep your account protected with a fresh new password." schema={passwordSchema} fields={[{ name: "password", label: "New password", type: "password", icon: <LockKeyhole className="h-4 w-4" /> }, { name: "confirmPassword", label: "Confirm password", type: "password", icon: <LockKeyhole className="h-4 w-4" /> }]} cta="Update password" next="/profile" />;

type FieldDef = { name: string; label: string; type: string; icon: ReactNode };
const SimpleForm = ({ title, subtitle, schema, fields, cta, next }: { title: string; subtitle: string; schema: Parameters<typeof zodResolver>[0]; fields: FieldDef[]; cta: string; next: string }) => {
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { isSubmitting } } = useForm({ resolver: zodResolver(schema) });
  return (
    <AuthShell title={title} subtitle={subtitle} seoTitle={title} seoDesc={subtitle}>
      <form
        onSubmit={handleSubmit(() => { toast.success(cta); navigate(next); })}
        className="space-y-5"
      >
        {fields.map((field) => (
          <div key={field.name}>
            <label className="mb-1.5 block text-sm font-semibold text-ink-700 dark:text-ink-100">{field.label}</label>
            <div className="relative">
              <span className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400 dark:text-ink-100/40">{field.icon}</span>
              <Input {...register(field.name)} type={field.type} placeholder={field.label} className="pl-11" />
            </div>
          </div>
        ))}
        <Button className="h-12 w-full rounded-2xl bg-[#2c9855] text-white hover:bg-[#237a44]">
          {isSubmitting ? "Please wait..." : cta}
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-ink-500 dark:text-ink-100/60">
        <Link to="/login" className="font-bold text-[#2c9855] hover:underline">Back to login</Link>
      </p>
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
