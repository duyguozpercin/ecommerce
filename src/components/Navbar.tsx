'use client';

import Link from "next/link";
import { Menu, X, Heart } from "lucide-react"; // ❤️ Heart eklendi
import { useState } from "react";
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

  return (
    <header className="bg-blue-50 px-6 py-4 border-b border-neutral-200 shadow-sm">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">

        {/* 🔹 Logo & mobile menu */}
        <div className="flex items-center justify-between w-full md:w-auto">
          <Link
            href="/"
            className="text-2xl font-bold text-[#171212] hover:text-black font-sans tracking-wide"
          >
            Home
          </Link>
          <button
            aria-label="Toggle menu"
            data-testid="mobile-toggle"
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-2"
          >
            {menuOpen ? <X size={26} /> : <Menu size={26} />}
          </button>
        </div>

        {/* 🔹 Orta menü */}
        <NavigationMenu />

        {/* 🔹 Sağ taraf: cart, favorites, user */}
        <div className="flex items-center justify-center md:justify-end w-full md:w-auto gap-4 relative">

          {user && (
            <span
              data-testid="welcome-text"
              className="text-sm text-gray-700 hidden md:inline"
            >
              Welcome, {user.email}
            </span>
          )}

          {/* 🛒 Sepet */}
          <CartBadge />

          {/* ❤️ Favoriler sayfası linki */}
          <Link
            href="/favorites"
            aria-label="Go to Favorites"
            className="text-gray-700 hover:text-red-500 transition-colors duration-300 relative"
          >
            <Heart size={22} strokeWidth={2} />
          </Link>

          {/* 👤 Kullanıcı menüsü */}
          <UserDropdown />

          {/* 🚪 Log out */}
          {user && (
            <button
              onClick={() => signOut(auth)}
              className="text-xs text-gray-700 hover:underline"
            >
              Log Out
            </button>
          )}
        </div>
      </div>

      {menuOpen && <MobileMenu setMenuOpen={setMenuOpen} />}
    </header>
  );
}
