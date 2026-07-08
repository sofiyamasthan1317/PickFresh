import { useEffect, useRef, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Bell, CreditCard, Gift, MapPin, Minus, PackageCheck, Plus, Trash2, Upload, Wallet } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import { ProductCard } from "../../../components/ProductCard";
import { Seo } from "../../../components/Seo";
import { Badge, Button, Card, Checkbox, Dialog, EmptyState, Input, LoadingState, RadioGroup, Skeleton, Tabs } from "../../../components/ui";
import { currency } from "../../../lib/utils";
import { getCartTotals, useCartStore } from "../../../store/cartStore";
import { useWishlistStore } from "../../../store/wishlistStore";
import { useAuthStore } from "../../../store/authStore";
import { useNotificationStore } from "../../../store/notificationStore";
import { authService } from "../../../services/authService";
import { addressService, type CreateAddressPayload } from "../../../services/addressService";
import { catalogService } from "../../../services/catalogService";
import { couponService } from "../../../services/couponService";
import { orderService } from "../../../services/orderService";
import { userService } from "../../../services/userService";
import { walletService } from "../../../services/walletService";
import type { CartItem } from "../../../types/domain";
import { updateProfileSchema, type UpdateProfileForm } from "../../auth/validation/authSchemas";

export const CartPage = () => {
  const { items, coupon, updateQuantity, removeItem, applyCoupon, syncFromBackend } = useCartStore();
  const toggleWishlist = useWishlistStore((state) => state.toggle);
  const hasInWishlist = useWishlistStore((state) => state.has);
  const totals = getCartTotals(items, coupon);
  const [couponInput, setCouponInput] = useState("FRESH10");

  useEffect(() => {
    void syncFromBackend();
  }, [syncFromBackend]);

  const handleQuantity = (productId: string, quantity: number) => {
    if (quantity < 1) {
      handleRemove(productId);
      return;
    }
    void updateQuantity(productId, quantity).catch(() => undefined);
  };

  const handleRemove = (productId: string) => {
    void removeItem(productId).catch(() => undefined);
  };

  const handleSaveForLater = (item: CartItem) => {
    void (async () => {
      if (!hasInWishlist(item.product.id)) {
        await toggleWishlist(item.product);
      }
      await removeItem(item.product.id);
      toast.success(`${item.product.name} moved to wishlist`);
    })().catch(() => undefined);
  };

  return (
    <section className="container-px py-8">
      <Seo title="Shopping cart" description="Review cart, update quantities, apply coupons, taxes, shipping and delivery charges." />
      <h1 className="page-title">Shopping cart</h1>
      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-4">
          {items.length === 0 && <EmptyState title="Your cart is empty" body="Add fresh produce, daily essentials, and AI recommendations." />}
          {items.map((item) => (
            <Card key={item.product.id} className="grid gap-4 p-4 sm:grid-cols-[120px_minmax(0,1fr)] xl:grid-cols-[120px_minmax(0,1fr)_auto]">
              <img src={item.product.image} alt={item.product.name} className="h-28 w-full rounded-2xl object-cover" />
              <div><h2 className="font-bold">{item.product.name}</h2><p className="text-sm muted-copy">Save for later, move to wishlist, or checkout now.</p><Button variant="ghost" size="sm" onClick={() => handleSaveForLater(item)}>Save for later</Button></div>
              <div className="flex items-center gap-2 sm:col-span-2 xl:col-span-1">
                <Button size="icon" variant="outline" onClick={() => handleQuantity(item.product.id, item.quantity - 1)}><Minus className="h-4 w-4" /></Button>
                <span className="w-8 text-center font-bold">{item.quantity}</span>
                <Button size="icon" variant="outline" onClick={() => handleQuantity(item.product.id, item.quantity + 1)}><Plus className="h-4 w-4" /></Button>
                <Button size="icon" variant="ghost" onClick={() => handleRemove(item.product.id)}><Trash2 className="h-4 w-4" /></Button>
              </div>
            </Card>
          ))}
        </div>
        <OrderSummary totals={totals} couponInput={couponInput} setCouponInput={setCouponInput} applyCoupon={applyCoupon} />
      </div>
    </section>
  );
};

export const CheckoutPage = () => {
  const [step, setStep] = useState("Address");
  const navigate = useNavigate();
  const { items, coupon, clear } = useCartStore();
  const totals = getCartTotals(items, coupon);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<"COD" | "Card" | "UPI" | "Wallet">("COD");
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  const placeOrder = async () => {
    if (!selectedAddressId) {
      toast.error("Choose a delivery address first.");
      return;
    }
    if (!items.length) {
      toast.error("Your cart is empty.");
      return;
    }
    setIsPlacingOrder(true);
    try {
      const order = await orderService.createOrder({
        shippingAddress: selectedAddressId,
        paymentMethod,
        products: items.map((item) => ({ product: item.product.id, quantity: item.quantity })),
        deliveryCharge: totals.delivery,
        tax: totals.tax,
        discount: totals.discount,
      });
      await clear();
      toast.success("Order placed successfully!");
      navigate(`/order-success/${order.id}`);
    } catch {
      // Axios interceptor shows the backend error.
    } finally {
      setIsPlacingOrder(false);
    }
  };

  return (
    <section className="container-px py-8">
      <Seo title="Checkout" description="Multi-step checkout with address, delivery slot, payment method, Stripe, wallet, COD and order review." />
      <h1 className="page-title">Checkout</h1>
      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <Card className="p-6">
          <Tabs tabs={[
            { value: "Address", label: "Address", content: <AddressSelection selectedAddressId={selectedAddressId} setSelectedAddressId={setSelectedAddressId} onNext={() => setStep("Delivery")} /> },
            { value: "Delivery", label: "Delivery slot", content: <RadioGroup value={step} onValueChange={setStep} options={["Today 6-8 PM", "Tomorrow 8-10 AM", "Express 30 min"]} /> },
            { value: "Payment", label: "Payment", content: <PaymentOptions paymentMethod={paymentMethod} setPaymentMethod={setPaymentMethod} /> },
            { value: "Review", label: "Review", content: <OrderReview /> },
          ]} />
          <div className="mt-6 flex justify-end"><Button onClick={placeOrder} disabled={isPlacingOrder}>{isPlacingOrder ? "Placing..." : "Place order"}</Button></div>
        </Card>
        <Card className="h-fit p-5"><SummaryRows totals={totals} /></Card>
      </div>
    </section>
  );
};

export const OrderSuccessPage = () => {
  const { id } = useParams();
  return (
    <section className="container-px grid min-h-[70vh] place-items-center py-10">
      <Seo title="Order success" description="Your PickFresh order has been placed." />
      <Card className="max-w-xl p-8 text-center">
        <PackageCheck className="mx-auto h-14 w-14 text-primary-600" />
        <h1 className="mt-4 text-3xl font-black">Order placed successfully!</h1>
        <p className="mt-2 muted-copy">Your fresh basket is being prepared. Track every status update live.</p>
        {id && <p className="mt-3 font-mono text-sm font-bold text-primary-700">{id}</p>}
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          {id && <Button asChild><Link to={`/orders/${id}`}>Track order</Link></Button>}
          <Button asChild variant="outline"><Link to="/orders">All orders</Link></Button>
        </div>
      </Card>
    </section>
  );
};

export const OrdersPage = () => {
  const { data: orders = [], isLoading } = useQuery({ queryKey: ["orders"], queryFn: orderService.getOrders });

  return (
    <section className="container-px py-8">
      <Seo title="Order history" description="View PickFresh order history and details." />
      <h1 className="page-title">Orders</h1>
      {isLoading && <p className="mt-6 text-sm muted-copy">Loading orders...</p>}
      {!isLoading && orders.length === 0 && <div className="mt-6"><EmptyState title="No orders yet" body="Your placed orders will appear here." /></div>}
      <div className="mt-6 grid gap-4">
        {orders.map((order) => <Card key={order.id} className="flex flex-wrap items-center justify-between gap-4 p-5"><div><Badge>{order.status}</Badge><h2 className="mt-2 font-bold">{order.id}</h2><p className="text-sm muted-copy">{order.placedAt} - {order.items.length} items</p></div><div className="text-right"><p className="font-black">{currency(order.total)}</p><Button asChild variant="outline" size="sm"><Link to={`/orders/${order.id}`}>View details</Link></Button></div></Card>)}
      </div>
    </section>
  );
};

export const OrderDetailsPage = () => {
  const { id } = useParams();
  const { data: order, isLoading } = useQuery({
    queryKey: ["order", id],
    queryFn: () => orderService.getOrderById(id!),
    enabled: !!id,
  });

  if (isLoading) return <div className="container-px py-20 text-center text-sm muted-copy">Loading order...</div>;
  if (!order) return <EmptyState title="Order unavailable" body="This order could not be loaded." />;

  return (
    <section className="container-px py-8">
      <Seo title={`Order ${order.id}`} description="Order details and tracking timeline." />
      <h1 className="page-title">{order.id}</h1>
      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <Card className="p-6"><OrderTrackingTimeline order={order} /><div className="mt-6 grid gap-4">{order.items.map((item) => <ProductCard key={item.product.id} product={item.product} compact />)}</div></Card>
        <div className="space-y-4">
          <Card className="p-5">
            <h2 className="font-bold">Order Summary</h2>
            <div className="mt-3 space-y-2 text-sm">
              <div className="flex justify-between"><span className="muted-copy">Order ID</span><span className="font-mono font-bold text-xs">{order.id}</span></div>
              <div className="flex justify-between"><span className="muted-copy">Placed</span><span>{order.placedAt}</span></div>
              <div className="flex justify-between"><span className="muted-copy">Total</span><span className="font-black">{currency(order.total)}</span></div>
              {order.eta && <div className="flex justify-between"><span className="muted-copy">Est. Delivery</span><span>{order.eta}</span></div>}
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
};

export const ProfilePage = () => (
  <section className="container-px py-8">
    <Seo title="Profile" description="Manage profile, avatar, addresses, orders, wishlist, wallet, notifications, referral and settings." />
    <h1 className="page-title mb-3">Profile</h1>
    <Tabs tabs={[
      { value: "profile", label: "Edit profile", content: <ProfileForm /> },
      { value: "addresses", label: "Addresses", content: <AddressCards /> },
      { value: "orders", label: "Orders", content: <OrdersPage /> },
      { value: "wishlist", label: "Wishlist", content: <WishlistPage /> },
      { value: "wallet", label: "Wallet", content: <WalletPage /> },
      { value: "notifications", label: "Notifications", content: <NotificationsPage /> },
      { value: "referral", label: "Referral", content: <ReferralPage /> },
      { value: "settings", label: "Settings", content: <Card className="p-6">Dark mode, privacy, language and communication preferences.</Card> },
    ]} />
  </section>
);

export const WishlistPage = () => {
  const wishlist = useWishlistStore((state) => state.products);
  const syncFromBackend = useWishlistStore((state) => state.syncFromBackend);
  useEffect(() => {
    void syncFromBackend();
  }, [syncFromBackend]);
  return <section className="container-px py-8"><Seo title="Wishlist" description="Saved products." />{wishlist.length ? <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{wishlist.map((product) => <ProductCard key={product.id} product={product} />)}</div> : <EmptyState title="Wishlist is empty" body="Heart products to save them here." />}</section>;
};

export const AddressPage = () => <section className="container-px py-8"><Seo title="Saved addresses" description="Manage saved delivery addresses." /><AddressCards /></section>;
type AddMoneyForm = {
  amount: number;
  description?: string;
};
const addMoneySchema: z.ZodType<AddMoneyForm> = z.object({
  amount: z.coerce.number().min(1, "Minimum ₹1").max(50000, "Maximum ₹50,000"),
  description: z.string().optional(),
});

const WalletDashboard = () => {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<"all" | "credit" | "debit" | "refund" | "cashback" | "payment">("all");
  const [page, setPage] = useState(1);

  const { data: walletData, isLoading: balanceLoading } = useQuery({
    queryKey: ["wallet", "balance"],
    queryFn: walletService.getBalance,
  });

  const { data: txData, isLoading: txLoading } = useQuery({
    queryKey: ["wallet", "transactions", page, filter],
    queryFn: () => walletService.getTransactions(page, 10, filter),
  });

  const addMoneyMutation = useMutation({
    mutationFn: ({ amount, description }: { amount: number; description?: string }) =>
      walletService.addMoney(amount, description),
    onSuccess: () => {
      toast.success("Money added to wallet!");
      void queryClient.invalidateQueries({ queryKey: ["wallet"] });
    },
  });

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<AddMoneyForm>({
    resolver: zodResolver(addMoneySchema as any),
    defaultValues: { amount: 500 },
  });

  const onAddMoney = handleSubmit(async (values) => {
    await addMoneyMutation.mutateAsync({ amount: values.amount, description: values.description });
    reset({ amount: 500 });
  });

  const transactions = txData?.transactions ?? [];
  const pagination = txData?.pagination;

  return (
    <div className="space-y-5">
      {/* Balance Card */}
      <Card className="p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Wallet className="h-6 w-6 text-primary-600" />
              <span className="font-semibold text-ink-500 dark:text-ink-100/60">Wallet Balance</span>
            </div>
            {balanceLoading
              ? <Skeleton className="mt-2 h-9 w-36" />
              : <p className="mt-1 text-3xl font-black text-ink-950 dark:text-white">{currency(walletData?.balance ?? 0)}</p>
            }
          </div>
          <Dialog
            title="Add Money to Wallet"
            trigger={<Button>Add Money</Button>}
          >
            <form onSubmit={onAddMoney} className="space-y-4">
              <div>
                <label className="mb-1 block text-xs font-semibold text-ink-500">Amount (₹)</label>
                <Input {...register("amount")} type="number" min={1} max={50000} placeholder="Enter amount" />
                {errors.amount && <p className="mt-1 text-xs text-red-500">{errors.amount.message}</p>}
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-ink-500">Description (Optional)</label>
                <Input {...register("description")} placeholder="e.g. Top up" />
              </div>
              <div className="flex flex-wrap gap-2">
                {[100, 200, 500, 1000, 2000].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => reset({ amount: amt })}
                    className="rounded-xl border border-ink-200 px-3 py-1.5 text-sm font-semibold hover:border-primary-400 hover:bg-primary-50 dark:border-white/10 dark:hover:bg-white/10"
                  >
                    {currency(amt)}
                  </button>
                ))}
              </div>
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Adding..." : "Add Money"}
              </Button>
            </form>
          </Dialog>
        </div>
      </Card>

      {/* Transactions */}
      <Card className="overflow-hidden p-0">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-ink-200 p-4 dark:border-white/10">
          <h2 className="font-black text-ink-950 dark:text-white">Transaction History</h2>
          <div className="flex gap-2">
            {(["all", "credit", "debit", "refund", "cashback", "payment"] as const).map((f) => (
              <button
                key={f}
                onClick={() => { setFilter(f); setPage(1); }}
                className={`rounded-full px-3 py-1 text-xs font-semibold capitalize transition ${
                  filter === f
                    ? "bg-primary-600 text-white"
                    : "bg-ink-100 text-ink-600 hover:bg-ink-200 dark:bg-white/10 dark:text-ink-100"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {txLoading && <LoadingState />}
        {!txLoading && transactions.length === 0 && (
          <div className="p-6">
            <EmptyState title="No transactions" body="Your wallet transactions will appear here." />
          </div>
        )}
        {!txLoading && transactions.length > 0 && (
          <div className="divide-y divide-ink-100 dark:divide-white/5">
            {transactions.map((tx) => (
              <div key={tx._id} className="flex items-center justify-between gap-3 px-4 py-3">
                <div>
                  <p className="text-sm font-semibold text-ink-950 dark:text-white">{tx.description}</p>
                  <p className="text-xs muted-copy">{new Date(tx.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}</p>
                </div>
                <div className="text-right">
                  <p className={`font-black ${["credit", "refund", "cashback"].includes(tx.type) ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                    {(["credit", "refund", "cashback"].includes(tx.type) ? "+" : "-")}{currency(tx.amount)}
                  </p>
                  <Badge className={tx.status === "completed" ? "bg-green-50 text-green-700 dark:bg-green-500/15 dark:text-green-400" : ""}>
                    {tx.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}

        {pagination && pagination.pages > 1 && (
          <div className="flex items-center justify-between border-t border-ink-200 p-4 dark:border-white/10">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Previous</Button>
            <span className="text-xs muted-copy">Page {page} of {pagination.pages}</span>
            <Button variant="outline" size="sm" disabled={page >= pagination.pages} onClick={() => setPage((p) => p + 1)}>Next</Button>
          </div>
        )}
      </Card>
    </div>
  );
};

export const WalletPage = () => {
  return <WalletDashboard />;
};

export const ReferralPage = () => {
  const user = useAuthStore((s) => s.user);
  const code = `PICK${(user?.name ?? "FRESH").toUpperCase().replace(/\s+/g, "").slice(0, 6)}`;
  const handleCopy = () => { void navigator.clipboard.writeText(code); toast.success("Referral code copied!"); };
  return (
    <Card className="p-6">
      <Gift className="h-9 w-9 text-citrus-500" />
      <h2 className="mt-4 text-2xl font-black">Give {currency(100)}, get {currency(100)}</h2>
      <p className="mt-2 muted-copy">Share your code with friends. Both get {currency(100)} wallet credit on first order.</p>
      <div className="mt-5 flex items-center gap-3">
        <code className="flex-1 rounded-2xl border border-dashed border-primary-400 bg-primary-50 px-4 py-3 font-mono text-lg font-bold text-primary-700 dark:bg-primary-500/15 dark:text-primary-300">{code}</code>
        <Button onClick={handleCopy}>Copy</Button>
      </div>
    </Card>
  );
};

export const NotificationsPage = () => {
  const { items, isSyncing, syncFromBackend, markOneRead, markAllRead, remove, clearAll } = useNotificationStore();
  const [filter, setFilter] = useState("all");
  const [query, setQuery] = useState("");
  useEffect(() => { void syncFromBackend(1, 50, filter); }, [syncFromBackend, filter]);
  const unread = items.filter((n) => !n.read).length;
  const filteredItems = items.filter((n) => {
    const matchesQuery = !query || `${n.title} ${n.body}`.toLowerCase().includes(query.toLowerCase());
    return matchesQuery && (filter === "all" || (filter === "unread" ? !n.read : filter === "read" ? n.read : false));
  });

  return (
    <div className="grid gap-4">
      <div className="flex flex-col gap-3 rounded-2xl border border-ink-200 bg-white/70 p-4 dark:border-white/10 dark:bg-white/5 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-primary-600" />
          <span className="font-black">Notifications</span>
          {unread > 0 && <Badge>{unread} unread</Badge>}
        </div>
        <div className="flex flex-wrap gap-2">
          <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search" className="w-48" />
          <Button variant="ghost" size="sm" onClick={() => setFilter("all")}>All</Button>
          <Button variant="ghost" size="sm" onClick={() => setFilter("unread")}>Unread</Button>
          <Button variant="ghost" size="sm" onClick={() => setFilter("read")}>Read</Button>
          {unread > 0 && <Button variant="ghost" size="sm" onClick={() => void markAllRead()}>Mark all read</Button>}
          <Button variant="ghost" size="sm" onClick={() => void clearAll()}>Clear all</Button>
        </div>
      </div>
      {isSyncing && <LoadingState />}
      {!isSyncing && filteredItems.length === 0 && <EmptyState title="All caught up" body="No notifications match your current filters." />}
      {filteredItems.map((n) => (
        <Card key={n.id} className={`p-4 ${n.read ? "opacity-60" : ""}`}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-semibold text-sm">{n.title}</p>
              <p className="mt-1 text-sm muted-copy">{n.body}</p>
              <p className="mt-2 text-xs muted-copy">{n.createdAt}</p>
            </div>
            <div className="flex gap-1 shrink-0">
              {!n.read && <Button variant="ghost" size="sm" onClick={() => void markOneRead(n.id)}>Read</Button>}
              <Button variant="ghost" size="sm" onClick={() => void remove(n.id)}><Trash2 className="h-4 w-4 text-red-400" /></Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};
export const ReviewsPage = () => <section className="container-px py-8"><Seo title="Reviews" description="Ratings and reviews." /><Card className="p-6"><h1 className="section-title">Reviews and ratings</h1><p className="mt-2 muted-copy">One review per product per user, with automatic average rating updates on the backend.</p></Card></section>;
export const DealsPage = () => {
  const { data: products = [] } = useQuery({ queryKey: ["products", "deals"], queryFn: () => catalogService.getProducts({ sort: "priceLowToHigh" }) });
  return <section className="container-px py-8"><Seo title="Deals" description="Today's deals and flash sales." /><div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{products.filter((product) => product.offerPrice).slice(0, 8).map((product) => <ProductCard key={product.id} product={product} />)}</div></section>;
};

export const CategoriesPage = () => {
  const { data: categories = [] } = useQuery({ queryKey: ["categories"], queryFn: catalogService.getCategories });
  return <section className="container-px py-8"><Seo title="Categories" description="Browse grocery categories." /><div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{categories.map((category) => <Link key={category.id} to={`/products?category=${encodeURIComponent(category.name)}`}><Card className="h-full overflow-hidden"><img src={category.image} alt={category.name} className="h-40 w-full object-cover" /><div className="p-5"><h2 className="font-black">{category.name}</h2><p className="mt-2 text-sm muted-copy">{category.description}</p></div></Card></Link>)}</div></section>;
};

const OrderSummary = ({ totals, couponInput, setCouponInput, applyCoupon }: { totals: ReturnType<typeof getCartTotals>; couponInput: string; setCouponInput: (value: string) => void; applyCoupon: (code: string) => void }) => {
  const [isApplying, setIsApplying] = useState(false);
  const handleApply = async () => {
    setIsApplying(true);
    try {
      await couponService.applyCoupon(couponInput, totals.subtotal);
      applyCoupon(couponInput);
    } catch {
      // Axios interceptor shows invalid coupon messages.
    } finally {
      setIsApplying(false);
    }
  };

  return (
    <Card className="h-fit p-5">
      <h2 className="text-xl font-black">Order summary</h2>
      <div className="mt-4 flex gap-2"><Input value={couponInput} onChange={(event) => setCouponInput(event.target.value)} /><Button onClick={handleApply} disabled={isApplying}>{isApplying ? "Applying..." : "Apply"}</Button></div>
      <SummaryRows totals={totals} />
      <Button asChild className="mt-5 w-full"><Link to="/checkout">Checkout</Link></Button>
    </Card>
  );
};

const SummaryRows = ({ totals }: { totals: ReturnType<typeof getCartTotals> }) => (
  <div className="mt-5 space-y-3 text-sm">
    {[["Subtotal", totals.subtotal], ["Discount", -totals.discount], ["Taxes", totals.tax], ["Shipping", totals.delivery], ["Grand total", totals.total]].map(([label, value]) => <div key={label} className="flex justify-between"><span>{label}</span><strong>{currency(Number(value))}</strong></div>)}
  </div>
);

const AddressSelection = ({ selectedAddressId, setSelectedAddressId, onNext }: { selectedAddressId: string | null; setSelectedAddressId: (id: string) => void; onNext: () => void }) => {
  const { data: addresses = [], isLoading } = useQuery({ queryKey: ["addresses"], queryFn: addressService.getAddresses });

  if (isLoading) return <p className="text-sm muted-copy">Loading addresses...</p>;
  if (!addresses.length) return <EmptyState title="No saved addresses" body="Add an address from your profile before checkout." />;

  return <div className="grid gap-4">{addresses.map((address) => <button key={address.id} type="button" onClick={() => setSelectedAddressId(address.id)} className="text-left"><Card className={`p-4 ${selectedAddressId === address.id ? "ring-2 ring-primary-500" : ""}`}><MapPin className="h-5 w-5 text-primary-600" /><h3 className="mt-2 font-bold">{address.label}</h3><p className="text-sm muted-copy">{address.line}, {address.city} - {address.pincode}</p></Card></button>)}<Button onClick={onNext} disabled={!selectedAddressId}>Use selected address</Button></div>;
};
const PaymentOptions = ({ paymentMethod, setPaymentMethod }: { paymentMethod: "COD" | "Card" | "UPI" | "Wallet"; setPaymentMethod: (method: "COD" | "Card" | "UPI" | "Wallet") => void }) => <div className="grid gap-3"><Button variant={paymentMethod === "Card" ? "primary" : "outline"} onClick={() => setPaymentMethod("Card")}><CreditCard className="h-4 w-4" /> Stripe card</Button><Button variant={paymentMethod === "Wallet" ? "primary" : "outline"} onClick={() => setPaymentMethod("Wallet")}><Wallet className="h-4 w-4" /> Wallet</Button><Button variant={paymentMethod === "COD" ? "primary" : "outline"} onClick={() => setPaymentMethod("COD")}>Cash on delivery</Button></div>;
const OrderReview = () => <Card className="p-4">Review products, address, delivery slot, payment method, coupons and totals before placing the order.</Card>;
const OrderTrackingTimeline = ({ order }: { order: any }) => {
  const steps = ["Order Placed", "Confirmed", "Packed", "Out For Delivery", "Delivered"];
  const cancelledSteps = ["Order Placed", "Cancelled"];
  const status = order?.status ?? "Pending";
  const isCancelled = status === "Cancelled";
  const activeSteps = isCancelled ? cancelledSteps : steps;
  const currentIndex = Math.max(activeSteps.indexOf(status), 0);
  const statusBadgeClass = isCancelled
    ? "bg-red-50 text-red-700 dark:bg-red-500/15 dark:text-red-400"
    : status === "Delivered"
      ? "bg-green-50 text-green-700 dark:bg-green-500/15 dark:text-green-400"
      : "bg-blue-50 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400";

  return (
    <div className="space-y-1">
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <h2 className="font-black text-ink-950 dark:text-white">Order Tracking</h2>
        <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold ${statusBadgeClass}`}>{status}</span>
      </div>
      <div className="mb-4 grid gap-3 rounded-2xl border border-ink-200 bg-ink-50/70 p-4 text-sm dark:border-white/10 dark:bg-white/5 sm:grid-cols-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-ink-500 dark:text-ink-100/60">Estimated delivery</p>
          <p className="mt-1 font-semibold text-ink-950 dark:text-white">{order?.eta ?? "Today, 7:30 PM"}</p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-ink-500 dark:text-ink-100/60">Order date</p>
          <p className="mt-1 font-semibold text-ink-950 dark:text-white">{order?.placedAt ?? "—"}</p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-ink-500 dark:text-ink-100/60">Delivery partner</p>
          <p className="mt-1 font-semibold text-ink-950 dark:text-white">{order?.deliveryPartner ?? "Assigned soon"}</p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-ink-500 dark:text-ink-100/60">Tracking number</p>
          <p className="mt-1 font-mono font-semibold text-ink-950 dark:text-white">{order?.id ?? "—"}</p>
        </div>
      </div>
      <div className="relative">
        {activeSteps.map((step, index) => {
          const isDone = index < currentIndex;
          const isActive = index === currentIndex;
          const isPending = index > currentIndex;
          return (
            <div key={step} className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                  isCancelled && step === "Cancelled" ? "bg-red-500 text-white"
                  : isDone ? "bg-green-500 text-white"
                  : isActive ? "bg-primary-600 text-white ring-4 ring-primary-100 dark:ring-primary-500/20"
                  : "bg-ink-100 text-ink-400 dark:bg-white/10"
                }`}>
                  {isDone ? "✓" : index + 1}
                </div>
                {index < activeSteps.length - 1 && (
                  <div className={`my-1 min-h-[2rem] w-0.5 flex-1 ${isDone ? "bg-green-400" : "bg-ink-200 dark:bg-white/10"}`} />
                )}
              </div>
              <div className="pb-6">
                <p className={`text-sm font-semibold ${
                  isCancelled && step === "Cancelled" ? "text-red-600 dark:text-red-400"
                  : isDone ? "text-green-700 dark:text-green-400"
                  : isActive ? "text-primary-700 dark:text-primary-300"
                  : "muted-copy"
                }`}>{step}</p>
                {isActive && !isCancelled && <p className="mt-0.5 text-xs muted-copy">Current status</p>}
                {isPending && !isCancelled && <p className="mt-0.5 text-xs muted-copy">Pending</p>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
const ProfileForm = () => {
  const user = useAuthStore((state) => state.user);
  const setAuth = useAuthStore((state) => state.setAuth);
  const token = useAuthStore((state) => state.token);
  const refreshToken = useAuthStore((state) => state.refreshToken);
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(user?.avatar ?? "");

  const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm<UpdateProfileForm>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: { name: user?.name ?? "", phone: user?.phone ?? "", avatar: user?.avatar ?? "" },
  });

  const handleAvatarUpload = async (file: File) => {
    setUploading(true);
    try {
      const result = await userService.uploadAvatar(file);
      const baseUrl = import.meta.env.VITE_SOCKET_URL;
      const url = result.avatar.startsWith("http") ? result.avatar : `${baseUrl}${result.avatar}`;
      setValue("avatar", url);
      setAvatarPreview(url);
      toast.success("Avatar uploaded");
    } catch {
      // toast shown by interceptor
    } finally {
      setUploading(false);
    }
  };

  const submit = handleSubmit(async (values) => {
    try {
      const response = await authService.updateProfile(values);
      const data = response.data;
      if (user && token && refreshToken) {
        setAuth({ user: { ...user, name: data.name, phone: data.phone, avatar: data.avatar, isEmailVerified: data.isEmailVerified }, token, refreshToken });
      }
      toast.success("Profile updated successfully!");
    } catch {
      // Error is toasted by Axios interceptor
    }
  });

  return (
    <form onSubmit={submit} className="w-full">
      <Card className="grid gap-4 p-6 md:grid-cols-2">
        <div className="md:col-span-2 flex items-center gap-5">
          <div className="relative h-20 w-20 shrink-0">
            {avatarPreview
              ? <img src={avatarPreview} alt="Avatar" className="h-20 w-20 rounded-full object-cover border-2 border-primary-200" />
              : <div className="h-20 w-20 rounded-full bg-primary-100 grid place-items-center text-2xl font-black text-primary-700">{user?.name?.slice(0, 2).toUpperCase()}</div>}
          </div>
          <div>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) void handleAvatarUpload(f); }} />
            <Button type="button" variant="outline" size="sm" disabled={uploading} onClick={() => fileRef.current?.click()}>
              <Upload className="h-4 w-4" />{uploading ? "Uploading..." : "Upload photo"}
            </Button>
            <p className="mt-1 text-xs muted-copy">JPG, PNG or WebP · max 5 MB</p>
          </div>
        </div>
        <div>
          <label className="text-xs font-semibold text-ink-500 block mb-1">Full name</label>
          <Input {...register("name")} placeholder="Full name" />
          {errors.name?.message && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
        </div>
        <div>
          <label className="text-xs font-semibold text-ink-500 block mb-1">Email address (read-only)</label>
          <Input value={user?.email ?? ""} placeholder="Email" disabled className="bg-ink-100 dark:bg-ink-800" />
        </div>
        <div>
          <label className="text-xs font-semibold text-ink-500 block mb-1">Phone number</label>
          <Input {...register("phone")} placeholder="Phone" />
          {errors.phone?.message && <p className="text-xs text-red-500 mt-1">{errors.phone.message}</p>}
        </div>
        <div>
          <label className="text-xs font-semibold text-ink-500 block mb-1">Avatar URL (or upload above)</label>
          <Input {...register("avatar")} placeholder="Avatar URL" />
        </div>
        <div className="md:col-span-2">
          <Button disabled={isSubmitting}>{isSubmitting ? "Saving..." : "Save profile"}</Button>
        </div>
      </Card>
    </form>
  );
};
const emptyAddressForm: CreateAddressPayload = {
  fullName: "",
  phone: "",
  houseNumber: "",
  street: "",
  city: "",
  state: "",
  pincode: "",
  landmark: "",
  isDefault: false,
};

const AddressCards = () => {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<CreateAddressPayload>(emptyAddressForm);
  const [isSaving, setIsSaving] = useState(false);
  const { data: addresses = [], isLoading } = useQuery({ queryKey: ["addresses"], queryFn: addressService.getAddresses });

  const setField = <K extends keyof CreateAddressPayload>(key: K, value: CreateAddressPayload[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const saveAddress = async () => {
    setIsSaving(true);
    try {
      await addressService.createAddress(form);
      setForm(emptyAddressForm);
      toast.success("Address saved");
      await queryClient.invalidateQueries({ queryKey: ["addresses"] });
    } catch {
      // Axios interceptor shows validation errors.
    } finally {
      setIsSaving(false);
    }
  };

  const deleteAddress = async (id: string) => {
    try {
      await addressService.deleteAddress(id);
      toast.success("Address removed");
      await queryClient.invalidateQueries({ queryKey: ["addresses"] });
    } catch {
      // Axios interceptor shows the backend error.
    }
  };

  if (isLoading) return <p className="text-sm muted-copy">Loading addresses...</p>;
  return (
    <div className="grid gap-5">
      <Card className="grid gap-3 p-5 md:grid-cols-2">
        <Input value={form.fullName} onChange={(event) => setField("fullName", event.target.value)} placeholder="Full name" />
        <Input value={form.phone} onChange={(event) => setField("phone", event.target.value)} placeholder="Phone" />
        <Input value={form.houseNumber} onChange={(event) => setField("houseNumber", event.target.value)} placeholder="House / flat number" />
        <Input value={form.street} onChange={(event) => setField("street", event.target.value)} placeholder="Street" />
        <Input value={form.city} onChange={(event) => setField("city", event.target.value)} placeholder="City" />
        <Input value={form.state} onChange={(event) => setField("state", event.target.value)} placeholder="State" />
        <Input value={form.pincode} onChange={(event) => setField("pincode", event.target.value)} placeholder="Pincode" />
        <Input value={form.landmark} onChange={(event) => setField("landmark", event.target.value)} placeholder="Landmark" />
        <div className="md:col-span-2 flex flex-wrap items-center justify-between gap-3">
          <Checkbox checked={form.isDefault} onCheckedChange={(checked) => setField("isDefault", checked)} label="Set as default address" />
          <Button onClick={saveAddress} disabled={isSaving}>{isSaving ? "Saving..." : "Save address"}</Button>
        </div>
      </Card>
      {!addresses.length && <EmptyState title="No saved addresses" body="Saved delivery addresses will appear here." />}
      <div className="grid gap-4 md:grid-cols-2">
        {addresses.map((address) => <Card key={address.id} className="p-5"><Badge>{address.isDefault ? "Default" : address.label}</Badge><h3 className="mt-3 font-bold">{address.fullName}</h3><p className="mt-1 text-sm muted-copy">{address.line}, {address.city} - {address.pincode}</p><Button variant="ghost" size="sm" className="mt-4" onClick={() => void deleteAddress(address.id)}>Delete</Button></Card>)}
      </div>
    </div>
  );
};
