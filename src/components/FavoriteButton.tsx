"use client";

import React from "react";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import { useFavorites } from "@/context/FavoriteContext";
import { useAuth } from "@/context/AuthContext";

interface FavoriteButtonProps {
  productId: string;
}

const FavoriteButton = ({ productId }: FavoriteButtonProps) => {
  const { isFavorite, toggleFavorite } = useFavorites();
  const { user } = useAuth();
  const favorite = isFavorite(productId);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();

    if (!user) {
      alert("Please sign in to add favorites.");
      return;
    }

    toggleFavorite(productId);
  };

  return (
    <button
      onClick={handleClick}
      className="
        absolute right-3 top-3
        inline-flex h-9 w-9 items-center justify-center
        rounded-full bg-white/90 shadow-sm backdrop-blur
        transition
        hover:scale-105 active:scale-[0.98]
        dark:bg-stone-950/70
      "
      aria-label="Toggle Favorite"
      title={favorite ? "Remove from favorites" : "Add to favorites"}
      type="button"
    >
      {favorite ? (
        <FaHeart className="text-[18px] text-rose-500" />
      ) : (
        <FaRegHeart className="text-[18px] text-stone-700 dark:text-stone-200" />
      )}
    </button>
  );
};

export default FavoriteButton;
