"use client";

import React, { useEffect, useState } from "react";
import { useFavorites } from "@/context/FavoriteContext";
import { db } from "@/utils/firebase";
import { doc, getDoc } from "firebase/firestore";
import Image from "next/image";
import Link from "next/link";
import FavoriteButton from "@/components/FavoriteButton";
import AddToCartButton from "@/components/AddToCartButton";
import { BuyButton } from "@/app/BuyButton";

interface Product {
  id: string;
  title: string;
  price: number;
  thumbnail?: string;
  images?: string[];
  brand?: string;
}

const FavoritesPage = () => {
  const { favorites } = useFavorites();
  const [favoriteProducts, setFavoriteProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFavorites = async () => {
      setLoading(true);
      try {
        if (favorites.length === 0) {
          setFavoriteProducts([]);
          setLoading(false);
          return;
        }

        const productPromises = favorites.map(async (id) => {
          const docRef = doc(db, "products", id);
          const productSnap = await getDoc(docRef);
          if (productSnap.exists()) {
            return { id: productSnap.id, ...productSnap.data() } as Product;
          }
          return null;
        });

        const products = (await Promise.all(productPromises)).filter(
          (p): p is Product => p !== null
        );

        setFavoriteProducts(products);
      } catch (error) {
        console.error("Error fetching favorite products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFavorites();
  }, [favorites]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <p className="text-gray-500">Loading your favorites...</p>
      </div>
    );
  }

  if (favoriteProducts.length === 0) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[60vh] text-center">
        <p className="text-gray-500 text-lg">You have no favorites yet.</p>
        <Link
          href="/"
          className="mt-4 px-4 py-2 bg-black text-white rounded hover:bg-gray-800 transition-colors"
        >
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <main className="px-4 py-8 sm:px-8">
      <h1 className="text-2xl font-semibold text-center mb-8">My Favorites</h1>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {favoriteProducts.map((product) => (
          <div
            key={product.id}
            className="bg-white dark:text-stone-900 shadow-xl rounded p-3 sm:p-4 flex flex-col items-center hover:scale-105 transition-transform duration-200 cursor-pointer bg-[#C2C2AF] w-full"
          >

            <div className="relative w-full h-[160px] sm:h-[180px] overflow-hidden rounded mb-3">
              <Link
                href={`/products/${product.id}`}
                className="block w-full h-full"
                data-testid="product-link"
              >
                <Image
                  src={product.thumbnail || product.images?.[0] || "/placeholder.png"}
                  alt={product.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                />
              </Link>


              <div className="absolute top-2 right-2 z-10">
                <FavoriteButton productId={product.id} />
              </div>
            </div>


            <h2 className="text-sm sm:text-base font-semibold text-center">
              {product.brand}
            </h2>
            <p className="text-sm sm:text-md text-center">{product.title}</p>
            <h2 className="font-semibold text-center text-sm sm:text-base">
              {product.price}$
            </h2>

         
            <div className="flex flex-row items-center gap-x-4 mt-2">
              <AddToCartButton productId={String(product.id)} />


              <BuyButton productId={String(product.id)} />
            </div>
          </div>
        ))}
      </div>
    </main>
  );
};

export default FavoritesPage;
