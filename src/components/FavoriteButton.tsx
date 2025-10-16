"use client";

import React, { useContext } from "react";
import { FavoriteContext } from "@/context/FavoriteContext";
import { FaHeart, FaRegHeart } from "react-icons/fa";

interface FavoriteButtonProps {
  productId: string;
}

const FavoriteButton = ({ productId }: FavoriteButtonProps) => {
  const { isFavorite, toggleFavorite } = useContext(FavoriteContext)!;

  const favorite = isFavorite(productId);

  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        toggleFavorite(productId);
      }}
      className="absolute top-2 right-2 text-xl cursor-pointer transition-transform hover:scale-110"
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
