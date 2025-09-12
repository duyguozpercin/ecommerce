'use client';

import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { auth, db, collections } from "@/utils/firebase";

export default function SignUpPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await setDoc(doc(db, collections.users, user.uid), {
        email: user.email,
        role: "user",
      });

      router.push("/");
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError("Registration failed. The email may already be in use.");
      } else {
        setError("An unknown error occurred.");
      }
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#F5F5F5]">
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-6 dark:text-stone-700">Sign Up</h1>
        <form onSubmit={handleSignUp} className="space-y-4">
          <input
            type="email"
            placeholder="E-posta"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
          <input
            type="password"
            placeholder="Şifre"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button type="submit" className="w-full bg-[#BABA8D] text-white py-2 rounded hover:bg-[#A4A489]">
            Sign Up
          </button>
        </form>
        <p className="mt-4 text-sm text-center dark:text-stone-700">
          Do you already have an account?{" "}
          <a href="/login" className="text-blue-600 underline">
            Log in
          </a>
        </p>
      </div>
    </main>
  );
}
