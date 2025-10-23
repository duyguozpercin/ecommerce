"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/utils/firebase";
import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  query,
} from "firebase/firestore";

interface FavoriteContextType {
  favorites: string[];
  toggleFavorite: (productId: string) => Promise<void>;
  isFavorite: (productId: string) => boolean;
}

const FavoriteContext = createContext<FavoriteContextType | undefined>(undefined);

export const FavoritesProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
const { user, loading } = useAuth();

const [favorites, setFavorites] = useState<string[]>([]);

 useEffect(() => {
  // Eğer Auth durumu hâlâ yükleniyorsa hiçbir şey yapma
  if (loading) return;

  // Kullanıcı yoksa favorileri sıfırla
  if (!user) {
    setFavorites([]);
    return;
  }

  // Kullanıcı varsa Firestore'dan favorileri dinle
  const favRef = collection(db, "users", user.uid, "favorites");
  const q = query(favRef);

  const unsubscribe = onSnapshot(q, (snapshot) => {
    const favIds = snapshot.docs.map((doc) => doc.id);
    setFavorites(favIds);
  });

  return () => unsubscribe();
}, [user, loading]);


  // 🔹 Favoriyi ekle / kaldır
  async function toggleFavorite(productId: string) {
    if (!user) {
      console.warn("Please sign in to use favorites.");
      alert("You need to sign in to add favorites.");
      return;
    }

    const favRef = doc(db, "users", user.uid, "favorites", productId);
    const isFav = favorites.includes(productId);

    try {
      if (isFav) {
        await deleteDoc(favRef);
      } else {
        await setDoc(favRef, {
          productId,
          createdAt: new Date(),
        });
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
    }
  }

  // 🔹 Favori kontrolü
  function isFavorite(productId: string) {
    return favorites.includes(productId);
  }

  return (
    <FavoriteContext.Provider value={{ favorites, toggleFavorite, isFavorite }}>
      {children}
    </FavoriteContext.Provider>
  );
};

// 🔹 Hook export
export const useFavorites = () => {
  const context = useContext(FavoriteContext);
  if (!context) {
    throw new Error("useFavorites must be used within a FavoritesProvider");
  }
  return context;
};
