import { Heart, Minus, Plus, Star } from "lucide-react";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import { currency } from "../lib/utils";
import { useCartStore } from "../store/cartStore";
import { useWishlistStore } from "../store/wishlistStore";
import type { Product } from "../types/domain";
import { Badge, Button, Card } from "./ui";

export const ProductCard = ({ product, compact = false }: { product: Product; compact?: boolean }) => {
  const addItem = useCartStore((state) => state.addItem);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);
  const cartItem = useCartStore((state) => state.items.find((item) => item.product.id === product.id));
  const toggleWishlist = useWishlistStore((state) => state.toggle);
  const isWishlisted = useWishlistStore((state) => state.has(product.id));
  const quantity = cartItem?.quantity ?? 0;

  const handleAdd = async () => {
    try {
      await addItem(product);
      toast.success(`${product.name} added to cart`);
    } catch {
      // Axios interceptor shows the backend error.
    }
  };

  const handleQuantity = async (nextQuantity: number) => {
    if (!cartItem) return;
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

  return (
    <Card className="group flex h-full flex-col overflow-hidden hover:-translate-y-1 hover:shadow-lift">
      <Link to={`/products/${product.id}`} className="block">
        <div className={compact ? "aspect-[4/3] overflow-hidden" : "aspect-[5/4] overflow-hidden"}>
          <img src={product.image} alt={product.name} loading="lazy" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
        </div>
      </Link>
      <div className="flex flex-1 flex-col space-y-3 p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wide text-primary-600">{product.category}</p>
            <Link to={`/products/${product.id}`} className="mt-1 line-clamp-2 font-bold text-ink-950 dark:text-white">{product.name}</Link>
          </div>
          <button
            aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
            onClick={() => {
              void toggleWishlist(product).catch(() => undefined);
            }}
            className="rounded-full p-2 hover:bg-slate-100 dark:hover:bg-white/10"
          >
            <Heart className={isWishlisted ? "h-5 w-5 fill-red-500 text-red-500" : "h-5 w-5"} />
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {product.tags.slice(0, 2).map((tag) => <Badge key={tag}>{tag}</Badge>)}
        </div>
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-black">{currency(product.offerPrice ?? product.price)}</span>
              {product.offerPrice && <span className="text-sm text-slate-400 line-through">{currency(product.price)}</span>}
            </div>
            <p className="text-xs muted-copy">per {product.unit}</p>
          </div>
          <div className="flex items-center gap-1 text-sm font-semibold text-amber-500"><Star className="h-4 w-4 fill-current" />{product.rating}</div>
        </div>
        {quantity > 0 ? (
          <div className="mt-auto grid grid-cols-[44px_minmax(0,1fr)_44px] items-center gap-2">
            <Button size="icon" variant="outline" onClick={() => handleQuantity(quantity - 1)} aria-label={`Decrease ${product.name} quantity`}>
              <Minus className="h-4 w-4" />
            </Button>
            <span className="grid h-11 place-items-center rounded-2xl border border-ink-200 bg-white text-sm font-black dark:border-white/10 dark:bg-ink-900">
              {quantity} in cart
            </span>
            <Button size="icon" onClick={() => handleQuantity(quantity + 1)} aria-label={`Increase ${product.name} quantity`}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <Button className="mt-auto w-full" onClick={handleAdd} disabled={product.stock < 1}>
            <Plus className="h-4 w-4" /> {product.stock < 1 ? "Out of stock" : "Add"}
          </Button>
        )}
      </div>
    </Card>
  );
};
