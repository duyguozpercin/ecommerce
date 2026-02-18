"use client";

import Link from "next/link";
import { Instagram, Twitter, Facebook, Mail } from "lucide-react";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-stone-200/70 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:border-stone-800/70 dark:bg-stone-950/70">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        {/* Top */}
        <div className="grid gap-10 py-12 md:grid-cols-4">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link
              href="/"
              className="text-lg font-semibold tracking-tight text-stone-900 dark:text-stone-100"
            >
              SweetHome
            </Link>
            <p className="mt-3 text-sm leading-6 text-stone-600 dark:text-stone-300">
              Clean, modern pieces for a calmer home. Shop favorites, add to cart, and checkout in seconds.
            </p>

            <div className="mt-5 flex items-center gap-2">
              <Link
                href="/"
                aria-label="Instagram"
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-stone-200 bg-white text-stone-700 shadow-sm transition hover:bg-stone-50 hover:text-rose-500 active:scale-[0.98] dark:border-stone-800 dark:bg-stone-950 dark:text-stone-200 dark:hover:bg-stone-900"
              >
                <Instagram size={18} />
              </Link>
              <Link
                href="/"
                aria-label="Twitter"
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-stone-200 bg-white text-stone-700 shadow-sm transition hover:bg-stone-50 hover:text-sky-500 active:scale-[0.98] dark:border-stone-800 dark:bg-stone-950 dark:text-stone-200 dark:hover:bg-stone-900"
              >
                <Twitter size={18} />
              </Link>
              <Link
                href="/"
                aria-label="Facebook"
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-stone-200 bg-white text-stone-700 shadow-sm transition hover:bg-stone-50 hover:text-blue-600 active:scale-[0.98] dark:border-stone-800 dark:bg-stone-950 dark:text-stone-200 dark:hover:bg-stone-900"
              >
                <Facebook size={18} />
              </Link>
            </div>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-100">
              Shop
            </h3>
            <ul className="mt-4 space-y-3 text-sm">
              <li>
                <Link className="text-stone-600 hover:text-stone-900 dark:text-stone-300 dark:hover:text-white" href="/products">
                  All products
                </Link>
              </li>
              <li>
                <Link className="text-stone-600 hover:text-stone-900 dark:text-stone-300 dark:hover:text-white" href="/favorites">
                  Favorites
                </Link>
              </li>
              <li>
                <Link className="text-stone-600 hover:text-stone-900 dark:text-stone-300 dark:hover:text-white" href="/cart">
                  Cart
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-100">
              Company
            </h3>
            <ul className="mt-4 space-y-3 text-sm">
              <li>
                <Link className="text-stone-600 hover:text-stone-900 dark:text-stone-300 dark:hover:text-white" href="/about">
                  About
                </Link>
              </li>
              <li>
                <Link className="text-stone-600 hover:text-stone-900 dark:text-stone-300 dark:hover:text-white" href="/contact">
                  Contact
                </Link>
              </li>
              <li>
                <Link className="text-stone-600 hover:text-stone-900 dark:text-stone-300 dark:hover:text-white" href="/faq">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-100">
              Stay in touch
            </h3>
            <p className="mt-4 text-sm text-stone-600 dark:text-stone-300">
              Get product updates and small deals. No spam.
            </p>

            <form
              className="mt-4 flex gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                alert("Subscribed (demo)");
              }}
            >
              <div className="relative flex-1">
                <Mail
                  size={16}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-stone-400"
                />
                <input
                  type="email"
                  required
                  placeholder="Email address"
                  className="w-full rounded-xl border border-stone-200 bg-white py-2.5 pl-9 pr-3 text-sm text-stone-900 shadow-sm outline-none transition focus:border-stone-300 focus:ring-2 focus:ring-stone-200 dark:border-stone-800 dark:bg-stone-950 dark:text-stone-100 dark:focus:ring-stone-700"
                />
              </div>
              <button
                type="submit"
                className="inline-flex h-11 items-center justify-center rounded-xl bg-stone-900 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-stone-800 active:scale-[0.98] dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-white"
              >
                Join
              </button>
            </form>

            <p className="mt-3 text-xs text-stone-500 dark:text-stone-400">
              By subscribing you agree to our privacy policy.
            </p>
          </div>
        </div>

        {/* Bottom */}
        <div className="flex flex-col gap-3 border-t border-stone-200/70 py-6 text-sm text-stone-600 dark:border-stone-800/70 dark:text-stone-300 sm:flex-row sm:items-center sm:justify-between">
          <p>© {year} SweetHome. All rights reserved.</p>

          <div className="flex flex-wrap gap-x-4 gap-y-2">
            <Link className="hover:text-stone-900 dark:hover:text-white" href="/privacy">
              Privacy
            </Link>
            <Link className="hover:text-stone-900 dark:hover:text-white" href="/terms">
              Terms
            </Link>
            <Link className="hover:text-stone-900 dark:hover:text-white" href="/shipping">
              Shipping & Returns
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
