import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { CreditCard, Gift, MapPin, Minus, PackageCheck, Plus, Route, Trash2, Wallet } from "lucide-react";
import { ProductCard } from "../../../components/ProductCard";
import { Seo } from "../../../components/Seo";
import { Badge, Button, Card, EmptyState, Input, RadioGroup, Tabs } from "../../../components/ui";
import { currency } from "../../../lib/utils";
import { getCartTotals, useCartStore } from "../../../store/cartStore";
import { useWishlistStore } from "../../../store/wishlistStore";
import { addresses, orders, products } from "../../../utils/mockData";

export const CartPage = () => {
  const { items, coupon, updateQuantity, removeItem, applyCoupon } = useCartStore();
  const totals = getCartTotals(items, coupon);
  const [couponInput, setCouponInput] = useState("FRESH10");

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
              <div><h2 className="font-bold">{item.product.name}</h2><p className="text-sm muted-copy">Save for later, move to wishlist, or checkout now.</p><Button variant="ghost" size="sm">Save for later</Button></div>
              <div className="flex items-center gap-2 sm:col-span-2 xl:col-span-1">
                <Button size="icon" variant="outline" onClick={() => updateQuantity(item.product.id, item.quantity - 1)}><Minus className="h-4 w-4" /></Button>
                <span className="w-8 text-center font-bold">{item.quantity}</span>
                <Button size="icon" variant="outline" onClick={() => updateQuantity(item.product.id, item.quantity + 1)}><Plus className="h-4 w-4" /></Button>
                <Button size="icon" variant="ghost" onClick={() => removeItem(item.product.id)}><Trash2 className="h-4 w-4" /></Button>
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
  const { items, coupon } = useCartStore();
  const totals = getCartTotals(items, coupon);

  return (
    <section className="container-px py-8">
      <Seo title="Checkout" description="Multi-step checkout with address, delivery slot, payment method, Stripe, wallet, COD and order review." />
      <h1 className="page-title">Checkout</h1>
      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <Card className="p-6">
          <Tabs tabs={[
            { value: "Address", label: "Address", content: <AddressSelection onNext={() => setStep("Delivery")} /> },
            { value: "Delivery", label: "Delivery slot", content: <RadioGroup value={step} onValueChange={setStep} options={["Today 6-8 PM", "Tomorrow 8-10 AM", "Express 30 min"]} /> },
            { value: "Payment", label: "Payment", content: <PaymentOptions /> },
            { value: "Review", label: "Review", content: <OrderReview /> },
          ]} />
          <div className="mt-6 flex justify-end"><Button asChild><Link to="/order-success">Place order</Link></Button></div>
        </Card>
        <Card className="h-fit p-5"><SummaryRows totals={totals} /></Card>
      </div>
    </section>
  );
};

export const OrderSuccessPage = () => (
  <section className="container-px grid min-h-[70vh] place-items-center py-10">
    <Seo title="Order success" description="Your PickFresh order has been placed." />
    <Card className="max-w-xl p-8 text-center"><PackageCheck className="mx-auto h-14 w-14 text-primary-600" /><h1 className="mt-4 text-3xl font-black">Order placed successfully</h1><p className="mt-2 muted-copy">Your fresh basket is being prepared. Track every status update live.</p><Button asChild className="mt-6"><Link to="/orders/PF-2026-1042">Track order</Link></Button></Card>
  </section>
);

export const OrdersPage = () => (
  <section className="container-px py-8">
    <Seo title="Order history" description="View PickFresh order history and details." />
    <h1 className="page-title">Orders</h1>
    <div className="mt-6 grid gap-4">
      {orders.map((order) => <Card key={order.id} className="flex flex-wrap items-center justify-between gap-4 p-5"><div><Badge>{order.status}</Badge><h2 className="mt-2 font-bold">{order.id}</h2><p className="text-sm muted-copy">{order.placedAt} - {order.items.length} items</p></div><div className="text-right"><p className="font-black">{currency(order.total)}</p><Button asChild variant="outline" size="sm"><Link to={`/orders/${order.id}`}>View details</Link></Button></div></Card>)}
    </div>
  </section>
);

export const OrderDetailsPage = () => {
  const { id } = useParams();
  const order = orders.find((item) => item.id === id) ?? orders[0];
  return (
    <section className="container-px py-8">
      <Seo title={`Order ${order.id}`} description="Order details and tracking timeline." />
      <h1 className="page-title">{order.id}</h1>
      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <Card className="p-6"><OrderTrackingTimeline /><div className="mt-6 grid gap-4">{order.items.map((item) => <ProductCard key={item.product.id} product={item.product} compact />)}</div></Card>
        <Card className="h-fit p-5"><h2 className="font-bold">Delivery partner</h2><p className="mt-2 text-sm muted-copy">Aarav is delivering your order. ETA: {order.eta}</p><div className="mt-5 h-52 rounded-2xl bg-primary-50 p-5 text-primary-700 dark:bg-primary-500/15"><Route className="h-8 w-8" /><p className="mt-3 font-bold">Live map placeholder</p></div></Card>
      </div>
    </section>
  );
};

export const ProfilePage = () => (
  <section className="container-px py-8">
    <Seo title="Profile" description="Manage profile, avatar, addresses, orders, wishlist, wallet, notifications, referral and settings." />
    <h1 className="page-title">Profile</h1>
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
  return <section className="container-px py-8"><Seo title="Wishlist" description="Saved products." />{wishlist.length ? <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{wishlist.map((product) => <ProductCard key={product.id} product={product} />)}</div> : <EmptyState title="Wishlist is empty" body="Heart products to save them here." />}</section>;
};

export const AddressPage = () => <section className="container-px py-8"><Seo title="Saved addresses" description="Manage saved delivery addresses." /><AddressCards /></section>;
export const WalletPage = () => <Card className="p-6"><Wallet className="h-9 w-9 text-primary-600" /><h2 className="mt-4 text-2xl font-black">{currency(1240)} wallet balance</h2><p className="muted-copy">Cashback, refunds, and wallet payments are ready for checkout.</p></Card>;
export const ReferralPage = () => <Card className="p-6"><Gift className="h-9 w-9 text-citrus-500" /><h2 className="mt-4 text-2xl font-black">Give {currency(100)}, get {currency(100)}</h2><p className="muted-copy">Share PICKFRESH100 with friends.</p></Card>;
export const NotificationsPage = () => <Card className="p-6">Realtime notification center with unread counters, toast alerts, and drawer access is enabled globally.</Card>;
export const ReviewsPage = () => <section className="container-px py-8"><Seo title="Reviews" description="Ratings and reviews." /><Card className="p-6"><h1 className="section-title">Reviews and ratings</h1><p className="mt-2 muted-copy">One review per product per user, with automatic average rating updates on the backend.</p></Card></section>;
export const DealsPage = () => <section className="container-px py-8"><Seo title="Deals" description="Today's deals and flash sales." /><div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{products.slice(0, 4).map((product) => <ProductCard key={product.id} product={product} />)}</div></section>;
export const CategoriesPage = () => <section className="container-px py-8"><Seo title="Categories" description="Browse grocery categories." /><div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{products.map((product) => <ProductCard key={product.id} product={product} compact />)}</div></section>;

const OrderSummary = ({ totals, couponInput, setCouponInput, applyCoupon }: { totals: ReturnType<typeof getCartTotals>; couponInput: string; setCouponInput: (value: string) => void; applyCoupon: (code: string) => void }) => (
  <Card className="h-fit p-5">
    <h2 className="text-xl font-black">Order summary</h2>
    <div className="mt-4 flex gap-2"><Input value={couponInput} onChange={(event) => setCouponInput(event.target.value)} /><Button onClick={() => applyCoupon(couponInput)}>Apply</Button></div>
    <SummaryRows totals={totals} />
    <Button asChild className="mt-5 w-full"><Link to="/checkout">Checkout</Link></Button>
  </Card>
);

const SummaryRows = ({ totals }: { totals: ReturnType<typeof getCartTotals> }) => (
  <div className="mt-5 space-y-3 text-sm">
    {[["Subtotal", totals.subtotal], ["Discount", -totals.discount], ["Taxes", totals.tax], ["Shipping", totals.delivery], ["Grand total", totals.total]].map(([label, value]) => <div key={label} className="flex justify-between"><span>{label}</span><strong>{currency(Number(value))}</strong></div>)}
  </div>
);

const AddressSelection = ({ onNext }: { onNext: () => void }) => <div className="grid gap-4">{addresses.map((address) => <Card key={address.id} className="p-4"><MapPin className="h-5 w-5 text-primary-600" /><h3 className="mt-2 font-bold">{address.label}</h3><p className="text-sm muted-copy">{address.line}, {address.city} - {address.pincode}</p></Card>)}<Button onClick={onNext}>Use selected address</Button></div>;
const PaymentOptions = () => <div className="grid gap-3"><Button variant="outline"><CreditCard className="h-4 w-4" /> Stripe card</Button><Button variant="outline"><Wallet className="h-4 w-4" /> Wallet</Button><Button variant="outline">Cash on delivery</Button></div>;
const OrderReview = () => <Card className="p-4">Review products, address, delivery slot, payment method, coupons and totals before placing the order.</Card>;
const OrderTrackingTimeline = () => <div className="grid gap-4">{["Pending", "Confirmed", "Packed", "Shipped", "Delivered"].map((step, index) => <div key={step} className="flex gap-3"><span className="grid h-8 w-8 place-items-center rounded-full bg-primary-600 text-sm text-white">{index + 1}</span><div><p className="font-bold">{step}</p><p className="text-sm muted-copy">Status updates sync from backend order status.</p></div></div>)}</div>;
const ProfileForm = () => <Card className="grid gap-4 p-6 md:grid-cols-2"><Input placeholder="Full name" defaultValue="Sofiya Khan" /><Input placeholder="Email" defaultValue="customer@pickfresh.local" /><Input placeholder="Phone" defaultValue="9876543210" /><Button>Save profile</Button></Card>;
const AddressCards = () => <div className="grid gap-4 md:grid-cols-2">{addresses.map((address) => <Card key={address.id} className="p-5"><Badge>{address.isDefault ? "Default" : address.label}</Badge><h3 className="mt-3 font-bold">{address.fullName}</h3><p className="mt-1 text-sm muted-copy">{address.line}, {address.city} - {address.pincode}</p></Card>)}</div>;
