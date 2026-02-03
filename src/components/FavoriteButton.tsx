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
      className="absolute top-2 right-2 text-xl cursor-pointer transition-transform hover:scale-110"
      aria-label="Toggle Favorite"
    >
      {favorite ? (
        <FaHeart className="text-red-500" />
      ) : (
        <FaRegHeart className="text-gray-600" />
      )}
    </button>
  );
};

export default FavoriteButton;
