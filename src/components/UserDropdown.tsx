'use client';

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { signOut } from "firebase/auth";
import { auth } from "@/utils/firebase";
import { useEffect, useRef, useState } from "react";

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
        <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" fill="#171212" viewBox="0 0 24 24">
          <path d="M12 12c2.7 0 5.7 1.3 6 4v2h-12v-2c.3-2.7 3.3-4 6-4zm0-2c-1.7 0-3-1.3-3-3s1.3-3 3-3 3 1.3 3 3-1.3 3-3 3z" />
        </svg>
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
