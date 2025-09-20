'use client';

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { signOut } from "firebase/auth";
import { auth } from "@/utils/firebase";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";

export default function UserDropdown() {
  const { user, role } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setDropdownOpen((prev) => !prev)}
        className="flex items-center justify-center rounded-full p-2 hover:bg-neutral-200 transition"
        aria-label="User Menu"
      >
      
        <Image
          src="/icons/user.svg"
          alt="User Icon"
          width={26}
          height={26}
          priority
        />
      </button>

      {dropdownOpen && (
        <div className="absolute right-0 mt-2 w-40 bg-white border border-neutral-300 rounded shadow-lg z-50">
          {user ? (
            <>
              <Link href="/profile" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">Profile</Link>
              {role === "admin" && (
                <Link href="/admin/products/manage" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">Dashboard</Link>
              )}
              <button
                onClick={() => {
                  signOut(auth);
                  setDropdownOpen(false);
                }}
                className="block w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100"
              >
                Log Out
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">Login</Link>
              <Link href="/signup" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">Sign Up</Link>
            </>
          )}
        </div>
      )}
    </div>
  );
}
