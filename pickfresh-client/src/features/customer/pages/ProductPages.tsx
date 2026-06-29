import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Mic, Minus, Plus, SlidersHorizontal, Star, Upload } from "lucide-react";
import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useParams, useSearchParams } from "react-router-dom";
import { useInView } from "react-intersection-observer";
import { ProductCard } from "../../../components/ProductCard";
import { Seo } from "../../../components/Seo";
import { Badge, Breadcrumb, Button, Card, Checkbox, Dialog, EmptyState, Input, RadioGroup, Select, Tabs, Textarea } from "../../../components/ui";
import { useDebouncedValue } from "../../../hooks/useDebouncedValue";
import { currency } from "../../../lib/utils";
import { catalogService } from "../../../services/catalogService";
import { reviewService } from "../../../services/reviewService";
import { useCartStore } from "../../../store/cartStore";
import { useSearchStore } from "../../../store/searchStore";

const FilterContent = ({
  term,
  setTerm,
  sort,
  setSort,
  availableOnly,
  setAvailableOnly,
  minPrice,
  setMinPrice,
  maxPrice,
  setMaxPrice,
  rating,
  setRating,
}: {
  term: string;
  setTerm: (val: string) => void;
  sort: string;
  setSort: (val: string) => void;
  availableOnly: boolean;
  setAvailableOnly: (val: boolean) => void;
  minPrice: string;
  setMinPrice: (val: string) => void;
  maxPrice: string;
  setMaxPrice: (val: string) => void;
  rating: string;
  setRating: (val: string) => void;
}) => (
  <div className="space-y-4">
    <Input value={term} onChange={(event) => setTerm(event.target.value)} placeholder="Autocomplete search" />
    <div className="grid grid-cols-2 gap-2">
      <Button variant="outline" className="rounded-full"><Mic className="h-4 w-4 text-primary-600" /> Voice</Button>
      <Button variant="outline" className="rounded-full"><Upload className="h-4 w-4 text-citrus-500" /> Image</Button>
    </div>
    <Select value={sort} onValueChange={setSort} options={["newest", "priceLowToHigh", "priceHighToLow", "highestRated"]} placeholder="Sort" />
    <RadioGroup value={rating} onValueChange={setRating} options={["0", "3", "4"]} />
    <Checkbox checked={availableOnly} onCheckedChange={setAvailableOnly} label="Available now" />
    <div className="grid grid-cols-2 gap-2">
      <Input type="number" min="0" value={minPrice} onChange={(event) => setMinPrice(event.target.value)} placeholder="Min price" />
      <Input type="number" min="0" value={maxPrice} onChange={(event) => setMaxPrice(event.target.value)} placeholder="Max price" />
    </div>
  </div>
);

export const ProductListingPage = () => {
  const [params] = useSearchParams();
  const [sort, setSort] = useState("newest");
  const category = params.get("category") || "";
  const term = useSearchStore((state) => state.term);
  const setTerm = useSearchStore((state) => state.setTerm);
  const debounced = useDebouncedValue(term);
  const { ref } = useInView({ threshold: 0.1 });
  const [availableOnly, setAvailableOnly] = useState(false);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [rating, setRating] = useState("0");
  const { data: products = [] } = useQuery({
    queryKey: ["products", debounced, category, sort, availableOnly, minPrice, maxPrice, rating],
    queryFn: () => catalogService.getProducts({
      search: debounced,
      category,
      sort: sort as "newest",
      isAvailable: availableOnly || undefined,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
      rating: rating !== "0" ? Number(rating) : undefined,
    }),
  });

  const filtered = useMemo(() => products, [products]);

  return (
    <section className="container-px py-8">
      <Seo title="Shop groceries" description="Search groceries with filters, sorting, autocomplete, voice search UI, and infinite browsing." />
      <Breadcrumb items={["Home", "Products"]} />
      <div className="mt-6 grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="hidden lg:block space-y-5 lg:sticky lg:top-28 lg:self-start">
          <Card className="p-5">
            <h2 className="font-black mb-4">Advanced filters</h2>
            <FilterContent term={term} setTerm={setTerm} sort={sort} setSort={setSort} availableOnly={availableOnly} setAvailableOnly={setAvailableOnly} minPrice={minPrice} setMinPrice={setMinPrice} maxPrice={maxPrice} setMaxPrice={setMaxPrice} rating={rating} setRating={setRating} />
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
                <FilterContent term={term} setTerm={setTerm} sort={sort} setSort={setSort} availableOnly={availableOnly} setAvailableOnly={setAvailableOnly} minPrice={minPrice} setMinPrice={setMinPrice} maxPrice={maxPrice} setMaxPrice={setMaxPrice} rating={rating} setRating={setRating} />
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
  const { data: product, isLoading } = useQuery({
    queryKey: ["product", id],
    queryFn: () => catalogService.getProductById(id!),
    enabled: !!id,
  });
  const { data: related = [] } = useQuery({
    queryKey: ["products", "related"],
    queryFn: () => catalogService.getProducts(),
  });
  const addItem = useCartStore((state) => state.addItem);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);
  const cartItem = useCartStore((state) => state.items.find((item) => item.product.id === id));
  const quantity = cartItem?.quantity ?? 0;

  const handleAdd = async () => {
    if (!product) return;
    try {
      await addItem(product);
    } catch {
      // Axios interceptor shows the backend error.
    }
  };

  const handleQuantity = async (nextQuantity: number) => {
    if (!product) return;
    try {
      if (nextQuantity < 1) {
        await removeItem(product.id);
      } else {
        await updateQuantity(product.id, nextQuantity);
      }
    } catch {
      // Axios interceptor shows the backend error.
    }
  };

  if (isLoading) return <div className="container-px py-20 text-center text-sm muted-copy">Loading product...</div>;
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
          {quantity > 0 ? (
            <div className="grid grid-cols-[56px_minmax(0,1fr)_56px] items-center gap-3">
              <Button size="lg" variant="outline" onClick={() => void handleQuantity(quantity - 1)} aria-label="Decrease quantity">
                <Minus className="h-5 w-5" />
              </Button>
              <span className="grid h-14 place-items-center rounded-2xl border border-ink-200 bg-white text-base font-black dark:border-white/10 dark:bg-ink-900">
                {quantity} in cart
              </span>
              <Button size="lg" onClick={() => void handleQuantity(quantity + 1)} aria-label="Increase quantity">
                <Plus className="h-5 w-5" />
              </Button>
            </div>
          ) : (
            <Button size="lg" onClick={() => void handleAdd()} disabled={product.stock < 1} className="w-full bg-[#2c9855] hover:bg-[#237a44] text-white">
              {product.stock < 1 ? "Out of stock" : "Add to cart"}
            </Button>
          )}
          <Tabs tabs={[
            { value: "nutrition", label: "Nutrition", content: <InfoList items={product.nutrition} /> },
            { value: "vendor", label: "Vendor", content: <p>{product.vendor} ships verified fresh inventory with transparent ratings.</p> },
            { value: "reviews", label: "Reviews", content: <ReviewBox productId={product.id} /> },
            { value: "offers", label: "Offers", content: <p>Apply FRESH10, wallet cashback, referral rewards and bundle discounts.</p> },
          ]} />
        </div>
      </div>
      <div className="mt-12">
        <h2 className="mb-5 section-title">Frequently bought together</h2>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{related.filter((item) => item.id !== product.id).slice(0, 4).map((item) => <ProductCard key={item.id} product={item} compact />)}</div>
      </div>
    </section>
  );
};

const InfoList = ({ items }: { items: string[] }) => <div className="flex flex-wrap gap-2">{items.map((item) => <Badge key={item}>{item}</Badge>)}</div>;
const ReviewBox = ({ productId }: { productId: string }) => {
  const queryClient = useQueryClient();
  const [rating, setRating] = useState("5");
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { data: reviews = [], isLoading } = useQuery({
    queryKey: ["reviews", productId],
    queryFn: () => reviewService.getProductReviews(productId),
  });

  const submit = async () => {
    setIsSubmitting(true);
    try {
      await reviewService.createReview({ product: productId, rating: Number(rating), comment });
      setComment("");
      toast.success("Review submitted");
      await queryClient.invalidateQueries({ queryKey: ["reviews", productId] });
      await queryClient.invalidateQueries({ queryKey: ["product", productId] });
    } catch {
      // Axios interceptor shows the backend error.
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-[160px_minmax(0,1fr)_auto]">
        <Select value={rating} onValueChange={setRating} options={["5", "4", "3", "2", "1"]} placeholder="Rating" />
        <Textarea value={comment} onChange={(event) => setComment(event.target.value)} placeholder="Write a review" />
        <Button onClick={submit} disabled={isSubmitting}>{isSubmitting ? "Submitting..." : "Submit"}</Button>
      </div>
      {isLoading && <p className="text-sm muted-copy">Loading reviews...</p>}
      <div className="grid gap-3">
        {reviews.map((review) => (
          <Card key={review.id} className="p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <strong>{review.userName}</strong>
              <span className="flex items-center gap-1 text-sm font-semibold text-amber-500"><Star className="h-4 w-4 fill-current" />{review.rating}</span>
            </div>
            {review.comment && <p className="mt-2 text-sm muted-copy">{review.comment}</p>}
            <p className="mt-2 text-xs muted-copy">{review.createdAt}</p>
          </Card>
        ))}
        {!isLoading && reviews.length === 0 && <p className="text-sm muted-copy">No reviews yet.</p>}
      </div>
    </div>
  );
};
