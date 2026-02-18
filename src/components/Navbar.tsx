"use client";

import Link from "next/link";
import { Menu, X, Heart } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import NavigationMenu from "./NavigationMenu";
import CartBadge from "./CartBadge";
import UserDropdown from "./UserDropdown";
import MobileMenu from "./MobileMenu";
import { useAuth } from "@/context/AuthContext";
import { signOut } from "firebase/auth";
import { auth } from "@/utils/firebase";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user } = useAuth();

  const displayEmail = useMemo(() => {
    const email = user?.email ?? "";
    if (!email) return "";
    if (email.length <= 22) return email;
    return `${email.slice(0, 10)}…${email.slice(-8)}`;
  }, [user?.email]);

  useEffect(() => {
    if (!menuOpen) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, [menuOpen]);

  return (
    <header className="sticky top-0 z-50 border-b border-stone-300/50 bg-[#F5F3EF]/80 backdrop-blur supports-[backdrop-filter]:bg-[#F5F3EF]/60">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Left */}
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="text-lg sm:text-xl font-semibold tracking-tight text-stone-900"
              aria-label="Go to homepage"
            >
              SweetHome
            </Link>

            <button
              aria-label="Toggle menu"
              data-testid="mobile-toggle"
              onClick={() => setMenuOpen((v) => !v)}
              className="
                md:hidden inline-flex h-10 w-10 items-center justify-center
                rounded-xl border border-stone-200/70
                bg-white/80 backdrop-blur
                text-stone-900 shadow-sm
                transition hover:bg-white active:scale-[0.98]
              "
            >
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>

          {/* Center */}
          <nav className="hidden md:block">
            <NavigationMenu />
          </nav>

          {/* Right */}
          <div className="flex items-center gap-2 sm:gap-3">
            {user && (
              <span
                data-testid="welcome-text"
                className="hidden lg:inline text-sm text-stone-600"
                title={user.email ?? ""}
              >
                Welcome, <span className="font-medium text-stone-900">{displayEmail}</span>
              </span>
            )}

            <div className="relative">
              <CartBadge />
            </div>

            <Link
              href="/favorites"
              aria-label="Go to Favorites"
              className="
                inline-flex h-10 w-10 items-center justify-center
                rounded-xl border border-stone-200/70
                bg-white/80 backdrop-blur
                text-stone-700 shadow-sm
                transition
                hover:bg-white hover:text-[#C6937B]
                active:scale-[0.98]
              "
            >
              <Heart size={18} strokeWidth={2} />
            </Link>

            <div className="hidden sm:block">
              <UserDropdown />
            </div>

            {user && (
              <button
                onClick={() => signOut(auth)}
                className="
                  hidden sm:inline-flex h-10 items-center justify-center
                  rounded-xl px-3 text-sm font-semibold
                  text-stone-700 transition
                  hover:bg-white/70 active:scale-[0.98]
                "
              >
                Log out
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile menu + overlay */}
      {menuOpen && (
        <>
          <button
            aria-label="Close mobile menu overlay"
            className="fixed inset-0 z-40 bg-black/35 md:hidden"
            onClick={() => setMenuOpen(false)}
          />

          <div className="relative z-50 md:hidden">
            <MobileMenu setMenuOpen={setMenuOpen} />

            <div className="mx-auto max-w-7xl px-4 sm:px-6 pb-4">
              <div className="mt-3 flex items-center justify-between rounded-2xl border border-stone-200/70 bg-white/85 backdrop-blur p-3 shadow-sm">
                <UserDropdown />

                {user ? (
                  <button
                    onClick={() => signOut(auth)}
                    className="inline-flex h-10 items-center justify-center rounded-xl px-3 text-sm font-semibold text-stone-700 hover:bg-white active:scale-[0.98]"
                  >
                    Log out
                  </button>
                ) : (
                  <Link
                    href="/login"
                    onClick={() => setMenuOpen(false)}
                    className="inline-flex h-10 items-center justify-center rounded-xl bg-stone-900 px-4 text-sm font-semibold text-white shadow-sm hover:bg-stone-800 active:scale-[0.98]"
                  >
                    Sign in
                  </Link>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </header>
  );
}
