import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ArrowRight, Clock, Sparkles } from "lucide-react";
import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { Autoplay, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";
import { ProductCard } from "../../../components/ProductCard";
import { Seo } from "../../../components/Seo";
import { Accordion, Badge, Button, Card, Input } from "../../../components/ui";
import { catalogService } from "../../../services/catalogService";
import heroImg from "../../../assets/hero.png";

export const HomePage = () => {
  const { data: products = [] } = useQuery({ queryKey: ["products", "home"], queryFn: () => catalogService.getProducts() });
  const { data: categories = [] } = useQuery({ queryKey: ["categories"], queryFn: catalogService.getCategories });

  return (
    <>
      <Seo title="Fresh groceries delivered fast" description="AI-powered grocery marketplace for fresh produce, daily essentials, vendors, and fast delivery." />
      <section className="container-px grid min-h-[calc(100vh-5rem)] items-center gap-8 py-8 sm:py-10 lg:grid-cols-[1.05fr_0.95fr]">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <Badge><Sparkles className="mr-1 h-3.5 w-3.5" /> AI-powered grocery planning</Badge>
          <h1 className="mt-5 max-w-3xl text-4xl font-black tracking-normal text-ink-950 dark:text-white sm:text-5xl lg:text-6xl">Fresh groceries, smarter carts, faster dinners.</h1>
          <p className="mt-5 max-w-2xl text-base muted-copy sm:text-lg">Shop market-fresh produce, discover recipes, compare vendors, track orders live, and let PickFresh AI plan what belongs in your basket.</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg"><Link to="/products">Shop groceries <ArrowRight className="h-5 w-5" /></Link></Button>
            <Button asChild size="lg" variant="outline"><Link to="/ai">Ask AI assistant</Link></Button>
          </div>
          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            {[["18 min", "average delivery"], ["4.8/5", "freshness rating"], ["₹0", "delivery over ₹499"]].map(([metric, label]) => (
              <Card key={label} className="p-4"><p className="text-2xl font-black">{metric}</p><p className="text-sm muted-copy">{label}</p></Card>
            ))}
          </div>
        </motion.div>
        <div className="relative">
          <img src={heroImg} alt="PickFresh grocery basket" className="mx-auto aspect-[4/3] max-h-[560px] w-full rounded-3xl object-cover shadow-lift" />
          <Card className="absolute bottom-4 left-4 right-4 p-4 sm:right-auto sm:max-w-xs"><p className="font-bold">Today's cart is 18% healthier</p><p className="text-sm muted-copy">AI added spinach, mangoes and A2 milk.</p></Card>
        </div>
      </section>

      <section className="container-px py-10">
        <Swiper modules={[Autoplay, Pagination]} autoplay={{ delay: 2500 }} pagination={{ clickable: true }} spaceBetween={16} slidesPerView={1}>
          {["Flash sale: 35% off leafy greens", "Free delivery on family baskets", "Fresh mangoes from Ratnagiri just landed"].map((banner) => (
            <SwiperSlide key={banner}><Card className="border-primary-700 bg-primary-700 p-6 text-white sm:p-8"><h2 className="text-2xl font-black sm:text-3xl">{banner}</h2><p className="mt-2 text-primary-100">Limited slots, fresh batches, quick checkout.</p></Card></SwiperSlide>
          ))}
        </Swiper>
      </section>

      <Section title="Shop by category" action="/categories">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {categories.map((category) => (
            <Link key={category.id} to={`/products?category=${category.name}`} className="surface-card group overflow-hidden rounded-2xl hover:-translate-y-1 hover:shadow-lift">
              <img src={category.image} alt={category.name} className="h-36 w-full object-cover transition group-hover:scale-105" />
              <div className="p-4"><p className="font-bold">{category.name}</p><p className="text-sm muted-copy">{category.count} items</p></div>
            </Link>
          ))}
        </div>
      </Section>

      <Section title="Featured products" action="/products">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {products.slice(0, 4).map((product) => <ProductCard key={product.id} product={product} />)}
        </div>
      </Section>

      <Section title="Trending and today's deals" action="/deals">
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <Card className="p-6"><Clock className="h-8 w-8 text-citrus-500" /><h3 className="mt-4 text-2xl font-black">Flash sale ends in 42:18</h3><p className="mt-2 muted-copy">Dynamic offers, coupon stacking, wallet cashback and referral rewards.</p></Card>
          <div className="grid gap-4 sm:grid-cols-2">{products.slice(4, 6).map((product) => <ProductCard key={product.id} product={product} compact />)}</div>
        </div>
      </Section>

      <Section title="Popular brands" action="/products">
        <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {["GreenLeaf", "PureMoo", "Ovenly", "JuiceLab", "HydroFresh", "Konkan Fresh"].map((brand) => <Card key={brand} className="p-5 text-center font-bold">{brand}</Card>)}
        </div>
      </Section>

      <Section title="Loved by fresh-food people" action="/reviews">
        <div className="grid gap-5 md:grid-cols-3">
          {["Best grocery app for weekly planning.", "Vendor quality is visible before buying.", "The AI recipe cart saved dinner."].map((quote) => <Card key={quote} className="p-6"><p className="text-lg font-semibold">"{quote}"</p><p className="mt-4 text-sm muted-copy">Verified customer</p></Card>)}
        </div>
      </Section>

      <Section title="Questions before checkout" action="/support">
        <Accordion items={[
          { title: "How fast is delivery?", content: "Most urban baskets arrive within 18-35 minutes depending on slot and location." },
          { title: "Can vendors manage inventory?", content: "Yes. Vendor dashboards include inventory, coupons, orders, payouts, analytics, and reviews." },
          { title: "Does AI create meal plans?", content: "PickFresh AI supports recipes, nutrition guidance, meal plans, smart recommendations, image and voice UI." },
        ]} />
      </Section>

      <section className="container-px py-12">
        <Card className="grid gap-6 border-citrus-500 bg-citrus-500 p-6 text-white sm:p-8 md:grid-cols-[1fr_0.8fr]">
          <div><h2 className="text-3xl font-black">Get freshness alerts</h2><p className="mt-2 text-citrus-50">Newsletter, deals, restock alerts and order notifications.</p></div>
          <form className="grid gap-3 sm:grid-cols-[1fr_auto]">
            <Input placeholder="Email address" className="bg-white text-ink-950 placeholder:text-ink-500/60 dark:bg-white dark:text-ink-950 dark:placeholder:text-ink-500/60" />
            <Button variant="primary" className="bg-ink-950 text-white hover:bg-ink-900 dark:bg-white dark:text-ink-950 dark:hover:bg-ink-100">Subscribe</Button>
          </form>
        </Card>
      </section>
    </>
  );
};

const Section = ({ title, action, children }: { title: string; action: string; children: ReactNode }) => (
  <section className="container-px py-10">
    <div className="mb-6 flex items-center justify-between gap-4">
      <h2 className="section-title">{title}</h2>
      <Button asChild variant="ghost"><Link to={action}>View all <ArrowRight className="h-4 w-4" /></Link></Button>
    </div>
    {children}
  </section>
);
