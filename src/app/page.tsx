import Link from "next/link";
import Image from "next/image";
import { getAllProducts } from "@/services/productService";
import { Product } from "@/types/product";
import HeroSlider from "@/components/HeroSlider";
import AddToCartButton from "@/components/AddToCartButton";
import { BuyButton } from "./BuyButton";
import FavoriteButton from "@/components/FavoriteButton";

interface HomeProps {
  searchParams?: { [key: string]: string | string[] | undefined };
}

function normalizeParam(p?: string | string[]) {
  return Array.isArray(p) ? p[0] : p;
}

function formatPrice(price: number | string) {
  const n = typeof price === "string" ? Number(price) : price;
  if (Number.isNaN(n)) return `${price}$`;
  return `$${n.toFixed(2)}`;
}

export default async function Home({ searchParams }: HomeProps) {
  const canceled = normalizeParam(searchParams?.canceled);
  const q = (normalizeParam(searchParams?.q) ?? "").trim().toLowerCase();
  const sort = normalizeParam(searchParams?.sort) ?? "featured";

  if (canceled) {
    console.log("Order canceled -- continue to shop around and checkout when you’re ready.");
  }

  let products: Product[] = [];

  try {
    products = await getAllProducts();
  } catch (error) {
    console.error("Failed to fetch products:", error);
    return (
      <main className="px-4 py-10 sm:px-6">
        <p className="text-center text-red-500">Failed to load products.</p>
      </main>
    );
  }

  const filtered = q
    ? products.filter((p) => {
        const brand = (p.brand ?? "").toLowerCase();
        const title = (p.title ?? "").toLowerCase();
        return brand.includes(q) || title.includes(q);
      })
    : products;

  const sorted = [...filtered].sort((a, b) => {
    const ap = Number(a.price) || 0;
    const bp = Number(b.price) || 0;

    if (sort === "price-asc") return ap - bp;
    if (sort === "price-desc") return bp - ap;
    if (sort === "brand") return String(a.brand ?? "").localeCompare(String(b.brand ?? ""));
    return 0;
  });

  const topPicks = sorted.slice(0, 4);

  return (
    <>
      <HeroSlider />

      <main className="px-4 pb-14 pt-6 sm:px-6">
        <section className="mx-auto max-w-7xl">
          {/* Header */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-stone-500">
                SweetHome Market
              </p>
              <h1 className="mt-2 text-2xl sm:text-3xl font-semibold tracking-tight text-stone-900">
                New arrivals, timeless pieces
              </h1>
              <p className="mt-1 text-sm text-stone-600">
                Browse, favorite, add to cart, or checkout instantly.
              </p>
            </div>

            {/* Toolbar */}
            <form
              className="mt-2 sm:mt-0 flex w-full sm:w-auto gap-2"
              action="/"
              method="get"
            >
              <div className="relative flex-1 sm:w-[300px]">
                <input
                  name="q"
                  defaultValue={q}
                  placeholder="Search brand or title…"
                  className="
                    w-full rounded-xl
                    border border-stone-200/70
                    bg-white/80 backdrop-blur
                    px-4 py-2.5 text-sm text-stone-900
                    shadow-sm outline-none transition
                    focus:border-stone-300 focus:ring-2 focus:ring-stone-200
                  "
                />
              </div>

              <select
                name="sort"
                defaultValue={sort}
                className="
                  rounded-xl border border-stone-200/70
                  bg-white/80 backdrop-blur
                  px-3 py-2.5 text-sm text-stone-900
                  shadow-sm outline-none transition
                  focus:border-stone-300 focus:ring-2 focus:ring-stone-200
                "
                aria-label="Sort products"
              >
                <option value="featured">Featured</option>
                <option value="price-asc">Price: Low → High</option>
                <option value="price-desc">Price: High → Low</option>
                <option value="brand">Brand</option>
              </select>

              <button
                className="
                  rounded-xl bg-stone-900
                  px-4 py-2.5 text-sm font-semibold
                  text-white shadow-sm transition
                  hover:bg-stone-800 active:scale-[0.98]
                "
                type="submit"
              >
                Apply
              </button>
            </form>
          </div>

          {/* USP cards */}
          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            {[
              { title: "Fast delivery", desc: "Carefully packed & quick shipment." },
              { title: "Secure checkout", desc: "Stripe-powered payments." },
              { title: "Easy returns", desc: "Simple return flow & support." },
            ].map((item) => (
              <div
                key={item.title}
                className="
                  rounded-2xl
                  border border-stone-200/70
                  bg-stone-50/70
                  p-4 shadow-sm
                  backdrop-blur
                "
              >
                <p className="text-sm font-semibold text-stone-900">{item.title}</p>
                <p className="mt-1 text-sm text-stone-600">{item.desc}</p>
              </div>
            ))}
          </div>

          {/* Featured picks (modern şerit) */}
          {topPicks.length > 0 && (
            <div className="mt-8 overflow-hidden rounded-3xl border border-stone-200/70 bg-white/70 backdrop-blur shadow-sm">
              <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-stone-500">
                    Featured picks
                  </p>
                  <p className="mt-1 text-sm text-stone-700">
                    A small selection we think you’ll love.
                  </p>
                </div>

                <Link
                  href="/products"
                  className="inline-flex h-11 items-center justify-center rounded-xl bg-stone-900 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-stone-800 active:scale-[0.98]"
                >
                  Explore all products
                </Link>
              </div>

              <div className="grid grid-cols-2 gap-3 p-5 pt-0 md:grid-cols-4">
                {topPicks.map((p) => (
                  <Link
                    key={p.id}
                    href={`/products/${p.id}`}
                    className="
                      group rounded-2xl
                      border border-stone-200/70
                      bg-white
                      p-3 shadow-sm transition
                      hover:-translate-y-0.5 hover:shadow-md
                    "
                  >
                    <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">
                      {p.brand}
                    </p>
                    <p className="mt-1 line-clamp-2 text-sm font-semibold text-stone-900">
                      {p.title}
                    </p>
                    <p className="mt-2 text-sm font-semibold text-stone-900">
                      {formatPrice(p.price)}
                    </p>
                    <p className="mt-2 text-xs text-stone-500 group-hover:text-stone-700">
                      View details →
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Result meta */}
          <div className="mt-10 flex items-center justify-between text-sm text-stone-600">
            <p>
              Showing{" "}
              <span className="font-semibold text-stone-900">{sorted.length}</span>{" "}
              items
              {q ? (
                <>
                  {" "}
                  for{" "}
                  <span className="font-semibold text-stone-900">“{q}”</span>
                </>
              ) : null}
            </p>

            {q ? (
              <Link
                href="/"
                className="underline decoration-stone-300 underline-offset-4 hover:text-stone-900"
              >
                Clear search
              </Link>
            ) : (
              <span />
            )}
          </div>

          {/* Empty state */}
          {sorted.length === 0 ? (
            <div className="mt-10 rounded-3xl border border-stone-200/70 bg-white/80 backdrop-blur p-8 text-center shadow-sm">
              <h2 className="text-lg font-semibold text-stone-900">
                No products found
              </h2>
              <p className="mt-2 text-sm text-stone-600">
                Try a different keyword or clear the search.
              </p>
              <div className="mt-5">
                <Link
                  href="/"
                  className="inline-flex h-11 items-center justify-center rounded-xl bg-stone-900 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-stone-800 active:scale-[0.98]"
                >
                  Back to all products
                </Link>
              </div>
            </div>
          ) : null}

          {/* Grid */}
          <div className="mt-8 grid grid-cols-2 gap-4 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
            {sorted.map((product) => {
              const imgSrc =
                product.thumbnail || product.images?.[0] || "/placeholder.png";

              return (
                <article
                  key={product.id}
                  className="
                    group relative overflow-hidden rounded-2xl
                    border border-stone-200/70
                    bg-white/90 backdrop-blur
                    shadow-sm transition
                    hover:-translate-y-0.5 hover:shadow-lg
                  "
                >
                  {/* Image */}
                  <div className="relative aspect-[4/5] w-full overflow-hidden bg-stone-100">
                    <Link
                      href={`/products/${product.id}`}
                      className="block h-full w-full"
                      data-testid="product-link"
                    >
                      <Image
                        src={imgSrc}
                        alt={product.title}
                        fill
                        className="object-cover transition duration-300 group-hover:scale-[1.03]"
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        priority={false}
                      />
                      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/35 to-transparent opacity-0 transition group-hover:opacity-100" />
                    </Link>

                    <FavoriteButton productId={String(product.id)} />

                    <div className="absolute left-3 top-3 rounded-full bg-white/85 px-2.5 py-1 text-[11px] font-medium text-stone-900 shadow-sm backdrop-blur">
                      Curated
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-3 sm:p-4">
                    <h3 className="text-xs font-semibold uppercase tracking-wide text-stone-500">
                      {product.brand}
                    </h3>

                    <p className="mt-1 line-clamp-2 text-sm font-medium text-stone-900">
                      {product.title}
                    </p>

                    <div className="mt-2 flex items-center justify-between">
                      <p className="text-sm font-semibold text-stone-900">
                        {formatPrice(product.price)}
                      </p>
                      <span className="text-xs text-stone-500">Free returns</span>
                    </div>

                    {/* Actions */}
                    <div className="mt-4 flex items-center gap-2">
                      <div className="flex-1">
                        <AddToCartButton productId={String(product.id)} className="w-full" />
                      </div>
                      <div className="flex-1">
                        <BuyButton productId={String(product.id)} className="w-full h-11" />
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          {/* Bottom */}
          <div className="mt-12 grid gap-6 md:grid-cols-2">
            <div className="rounded-3xl border border-stone-200/70 bg-white/80 backdrop-blur p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-stone-900">Why SweetHome?</h3>
              <p className="mt-2 text-sm text-stone-600">
                We keep the catalog curated, the experience fast, and the checkout frictionless.
              </p>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {[
                  { title: "Curated picks", desc: "No clutter, just good pieces." },
                  { title: "Fast checkout", desc: "Stripe redirect in seconds." },
                  { title: "Favorites", desc: "Save and revisit anytime." },
                  { title: "Cart ready", desc: "Add and manage instantly." },
                ].map((x) => (
                  <div
                    key={x.title}
                    className="rounded-2xl border border-stone-200/70 bg-white p-4 shadow-sm"
                  >
                    <p className="text-sm font-semibold text-stone-900">{x.title}</p>
                    <p className="mt-1 text-sm text-stone-600">{x.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-stone-200/70 bg-white/80 backdrop-blur p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-stone-900">Quick FAQ</h3>

              <div className="mt-4 space-y-4">
                {[
                  { q: "Do I need an account to buy?", a: "You can checkout as guest. Favorites require sign-in." },
                  { q: "Is checkout secure?", a: "Payments are handled via Stripe." },
                  { q: "How do returns work?", a: "Simple returns flow—contact support and we’ll guide you." },
                ].map((f) => (
                  <div key={f.q} className="rounded-2xl border border-stone-200/70 bg-white p-4 shadow-sm">
                    <p className="text-sm font-semibold text-stone-900">{f.q}</p>
                    <p className="mt-1 text-sm text-stone-600">{f.a}</p>
                  </div>
                ))}
              </div>

              <div className="mt-6">
                <Link
                  href="/contact"
                  className="inline-flex h-11 items-center justify-center rounded-xl bg-stone-900 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-stone-800 active:scale-[0.98]"
                >
                  Contact support
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
