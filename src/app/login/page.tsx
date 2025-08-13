'use client';

import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useRouter } from "next/navigation";
import { auth } from "@/utils/firebase";
import { useAuth } from "@/app/context/AuthContext";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { role } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      await signInWithEmailAndPassword(auth, email, password);

      if (role === "admin") {
        router.push("/admin");
      } else {
        router.push("/");
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error("Login error:", err.message);
        setError("Login failed. The email or password is incorrect.");
      } else {
        console.error("Unknown error", err);
        setError("An unknown error occurred. Please try again later.");
      }
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#F5F5F5]">
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-6 dark:text-stone-700">Log in</h1>
        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="email"
            placeholder="E-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button type="submit" className="w-full bg-[#BABA8D] text-white py-2 rounded hover:bg-[#A4A489]">
            Log in
          </button>
        </form>
        <p className="mt-4 text-sm text-center dark:text-stone-700">
        Don't have an account? <a href="/signup" className="text-blue-600 underline">Sign Up</a>
        </p>
      </div>
    </main>
  );
}
