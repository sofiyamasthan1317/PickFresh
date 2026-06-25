import { useQuery } from "@tanstack/react-query";
import { Mic, SlidersHorizontal, Upload } from "lucide-react";
import { useMemo, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { useInView } from "react-intersection-observer";
import { ProductCard } from "../../../components/ProductCard";
import { Seo } from "../../../components/Seo";
import { Badge, Breadcrumb, Button, Card, Checkbox, Dialog, EmptyState, Input, RadioGroup, Select, Tabs, Textarea } from "../../../components/ui";
import { useDebouncedValue } from "../../../hooks/useDebouncedValue";
import { currency } from "../../../lib/utils";
import { catalogService } from "../../../services/catalogService";
import { useCartStore } from "../../../store/cartStore";
import { useSearchStore } from "../../../store/searchStore";

const FilterContent = ({ term, setTerm, sort, setSort, availableOnly, setAvailableOnly }: { term: string; setTerm: (val: string) => void; sort: string; setSort: (val: string) => void; availableOnly: boolean; setAvailableOnly: (val: boolean) => void }) => (
  <div className="space-y-4">
    <Input value={term} onChange={(event) => setTerm(event.target.value)} placeholder="Autocomplete search" />
    <div className="grid grid-cols-2 gap-2">
      <Button variant="outline" className="rounded-full"><Mic className="h-4 w-4 text-primary-600" /> Voice</Button>
      <Button variant="outline" className="rounded-full"><Upload className="h-4 w-4 text-citrus-500" /> Image</Button>
    </div>
    <Select value={sort} onValueChange={setSort} options={["newest", "priceLowToHigh", "priceHighToLow", "highestRated"]} placeholder="Sort" />
    <RadioGroup value="4+" onValueChange={() => undefined} options={["4+ rating", "3+ rating"]} />
    <Checkbox checked={availableOnly} onCheckedChange={setAvailableOnly} label="Available now" />
    <div className="grid grid-cols-2 gap-2">
      <Input placeholder="Min price" />
      <Input placeholder="Max price" />
    </div>
  </div>
);

export const ProductListingPage = () => {
  const [params] = useSearchParams();
  const [sort, setSort] = useState("newest");
  const term = useSearchStore((state) => state.term || params.get("category") || "");
  const setTerm = useSearchStore((state) => state.setTerm);
  const debounced = useDebouncedValue(term);
  const { ref } = useInView({ threshold: 0.1 });
  const { data: products = [] } = useQuery({ queryKey: ["products", debounced, sort], queryFn: () => catalogService.getProducts({ search: debounced, sort: sort as "newest" }) });
  const [availableOnly, setAvailableOnly] = useState(false);

  const filtered = useMemo(() => products.filter((product) => !availableOnly || product.stock > 0), [availableOnly, products]);

  return (
    <section className="container-px py-8">
      <Seo title="Shop groceries" description="Search groceries with filters, sorting, autocomplete, voice search UI, and infinite browsing." />
      <Breadcrumb items={["Home", "Products"]} />
      <div className="mt-6 grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="hidden lg:block space-y-5 lg:sticky lg:top-28 lg:self-start">
          <Card className="p-5">
            <h2 className="font-black mb-4">Advanced filters</h2>
            <FilterContent term={term} setTerm={setTerm} sort={sort} setSort={setSort} availableOnly={availableOnly} setAvailableOnly={setAvailableOnly} />
          </Card>
          <Card className="p-5">
            <h3 className="font-bold">Recent and popular searches</h3>
            <div className="mt-3 flex flex-wrap gap-2">
              {["mango", "milk", "spinach", "sourdough"].map((item) => <Badge key={item}>{item}</Badge>)}
            </div>
          </Card>
        </aside>
        <div>
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <h1 className="section-title">Fresh marketplace</h1>
            <Dialog title="Filters" trigger={<Button variant="outline" className="lg:hidden rounded-full"><SlidersHorizontal className="h-4 w-4" /> Filters</Button>}>
              <div className="py-2">
                <FilterContent term={term} setTerm={setTerm} sort={sort} setSort={setSort} availableOnly={availableOnly} setAvailableOnly={setAvailableOnly} />
              </div>
            </Dialog>
          </div>
          {filtered.length ? <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">{filtered.map((product) => <ProductCard key={product.id} product={product} />)}</div> : <EmptyState title="No groceries found" body="Try another search, category, brand, price, rating or availability filter." />}
          <div ref={ref} className="py-8 text-center text-sm muted-copy">Infinite scroll ready. More products load as the catalog grows.</div>
        </div>
      </div>
    </section>
  );
};

export const ProductDetailsPage = () => {
  const { id } = useParams();
  const { data: products = [] } = useQuery({ queryKey: ["products", "details"], queryFn: () => catalogService.getProducts() });
  const product = products.find((item) => item.id === id) ?? products[0];
  const addItem = useCartStore((state) => state.addItem);

  if (!product) return <EmptyState title="Product unavailable" body="This product could not be loaded." />;

  return (
    <section className="container-px py-8">
      <Seo title={product.name} description={`Buy ${product.name} from ${product.vendor}.`} />
      <Breadcrumb items={["Home", product.category, product.name]} />
      <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1fr)_0.9fr]">
        <div className="grid gap-4 md:grid-cols-[100px_minmax(0,1fr)]">
          <div className="grid grid-cols-3 gap-3 md:grid-cols-1">{[product.image, product.image, product.image].map((image, index) => <img key={index} src={image} alt="" className="aspect-square w-full rounded-2xl object-cover" />)}</div>
          <img src={product.image} alt={product.name} className="aspect-[4/3] w-full rounded-3xl object-cover shadow-lift lg:aspect-square" />
        </div>
        <div className="space-y-5">
          <Badge>{product.stock > 0 ? "In stock" : "Out of stock"}</Badge>
          <h1 className="page-title">{product.name}</h1>
          <p className="muted-copy">By {product.vendor}. Variants, offers, nutrition, vendor information and delivery estimate are available before checkout.</p>
          <div className="flex flex-wrap items-end gap-3"><span className="text-4xl font-black">{currency(product.offerPrice ?? product.price)}</span>{product.offerPrice && <span className="text-lg text-slate-400 line-through">{currency(product.price)}</span>}</div>
          <div className="grid gap-3 sm:grid-cols-3">{["250g", "500g", "1kg"].map((variant) => <Button key={variant} variant="outline">{variant}</Button>)}</div>
          <Button size="lg" onClick={() => addItem(product)} className="w-full">Add to cart</Button>
          <Tabs tabs={[
            { value: "nutrition", label: "Nutrition", content: <InfoList items={product.nutrition} /> },
            { value: "vendor", label: "Vendor", content: <p>{product.vendor} ships verified fresh inventory with transparent ratings.</p> },
            { value: "reviews", label: "Reviews", content: <ReviewBox /> },
            { value: "offers", label: "Offers", content: <p>Apply FRESH10, wallet cashback, referral rewards and bundle discounts.</p> },
          ]} />
        </div>
      </div>
      <div className="mt-12">
        <h2 className="mb-5 section-title">Frequently bought together</h2>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{products.filter((item) => item.id !== product.id).slice(0, 4).map((item) => <ProductCard key={item.id} product={item} compact />)}</div>
      </div>
    </section>
  );
};

const InfoList = ({ items }: { items: string[] }) => <div className="flex flex-wrap gap-2">{items.map((item) => <Badge key={item}>{item}</Badge>)}</div>;
const ReviewBox = () => <div className="space-y-3"><Textarea placeholder="Write a review" /><Button>Submit rating</Button></div>;
