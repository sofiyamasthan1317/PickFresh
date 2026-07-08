import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { Mic } from "lucide-react";
import { Seo } from "../../../components/Seo";
import { Badge, Button, Card, Input } from "../../../components/ui";
import { useDebouncedValue } from "../../../hooks/useDebouncedValue";
import { searchService } from "../../../services/searchService";
import { useSearchStore } from "../../../store/searchStore";
import { currency } from "../../../lib/utils";

export const SearchPage = () => {
  const { term, setTerm, commit, recent } = useSearchStore();
  const [inputValue, setInputValue] = useState(term);
  const debouncedQuery = useDebouncedValue(inputValue, 350);

  const [results, setResults] = useState<Awaited<ReturnType<typeof searchService.globalSearch>> | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  const runSearch = useCallback(async (q: string) => {
    if (!q.trim()) { setResults(null); return; }
    setIsSearching(true);
    try {
      const data = await searchService.globalSearch(q);
      setResults(data);
    } catch {
      // interceptor shows error
    } finally {
      setIsSearching(false);
    }
  }, []);

  // Debounced auto-search
  useEffect(() => {
    void runSearch(debouncedQuery);
  }, [debouncedQuery, runSearch]);

  const handleChange = (value: string) => {
    setInputValue(value);
    setTerm(value);
  };

  const handleSubmit = () => {
    commit(inputValue);
    void runSearch(inputValue);
  };

  return (
    <section className="container-px py-8">
      <Seo title="Search" description="Autocomplete, voice search, recent searches and product results." />
      <h1 className="page-title mb-5">Search</h1>
      <Card className="p-6">
        <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="flex gap-2">
          <Input value={inputValue} onChange={(e) => handleChange(e.target.value)} placeholder="Search products, brands, categories" autoFocus />
          <Button type="submit">Search</Button>
          <Button type="button" variant="outline"><Mic className="h-4 w-4" /></Button>
        </form>

        {!inputValue && recent.length > 0 && (
          <div className="mt-5">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide muted-copy">Recent searches</p>
            <div className="flex flex-wrap gap-2">
              {recent.map((r) => (
                <button key={r} type="button" onClick={() => handleChange(r)} className="rounded-full border border-ink-200 px-3 py-1 text-sm hover:bg-primary-50 dark:border-white/10 dark:hover:bg-white/10">{r}</button>
              ))}
            </div>
          </div>
        )}

        {isSearching && <p className="mt-5 text-sm muted-copy">Searching...</p>}

        {results && !isSearching && (
          <div className="mt-5 grid gap-6">
            {results.categories.length > 0 && (
              <div>
                <p className="mb-3 text-xs font-semibold uppercase tracking-wide muted-copy">Categories</p>
                <div className="flex flex-wrap gap-2">
                  {results.categories.map((c) => (
                    <Link key={c.id} to={`/products?category=${encodeURIComponent(c.name)}`}>
                      <Badge className="cursor-pointer hover:bg-primary-100 dark:hover:bg-primary-500/30">{c.name}</Badge>
                    </Link>
                  ))}
                </div>
              </div>
            )}
            {results.products.length > 0 && (
              <div>
                <p className="mb-3 text-xs font-semibold uppercase tracking-wide muted-copy">Products</p>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {results.products.map((p) => (
                    <Link key={p.id} to={`/products/${p.id}`}>
                      <Card className="flex items-center gap-3 p-3 hover:ring-2 hover:ring-primary-300">
                        {p.image && <img src={p.image} alt={p.name} className="h-14 w-14 rounded-xl object-cover shrink-0" />}
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-sm">{p.name}</p>
                          <p className="text-xs muted-copy">{p.category}</p>
                          <p className="mt-1 font-black text-primary-700 text-sm">{currency(p.price)}</p>
                        </div>
                      </Card>
                    </Link>
                  ))}
                </div>
              </div>
            )}
            {results.products.length === 0 && results.categories.length === 0 && (
              <p className="text-sm muted-copy">No results found for "{inputValue}".</p>
            )}
          </div>
        )}
      </Card>
    </section>
  );
};
