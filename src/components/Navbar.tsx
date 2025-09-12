'use client';

import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import NavigationMenu from "./NavigationMenu";
import CartBadge from "./CartBadge";
import UserDropdown from "./UserDropdown";
import MobileMenu from "./MobileMenu";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="bg-blue-50 px-6 py-4 border-b border-neutral-200 shadow-sm">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">

        {/* Sol taraf */}
        <div className="flex items-center justify-between w-full md:w-auto">
          <Link href="/" className="text-2xl font-bold text-[#171212] hover:text-black font-sans tracking-wide">
            Home
          </Link>
          <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden p-2">
            {menuOpen ? <X size={26} /> : <Menu size={26} />}
          </button>
        </div>

        {/* Orta kısım */}
        <NavigationMenu />

        {/* Sağ taraf */}
        <div className="flex items-center justify-center md:justify-end w-full md:w-auto gap-4 relative">
          <CartBadge />
          <UserDropdown />
        </div>
      </div>

      {/* Mobil Menü */}
      {menuOpen && <MobileMenu setMenuOpen={setMenuOpen} />}
    </header>
  );
}
