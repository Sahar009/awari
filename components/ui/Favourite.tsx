"use client";

import { Heart } from "lucide-react";
import { useState } from "react";

export const Favourite = () => {
  const [isLiked, setIsLiked] = useState(false);

  const toggleLike = () => {
    setIsLiked((prev) => !prev);
  };

  return (
    <div
      onClick={toggleLike}
      className="bg-white rounded-full p-2 shadow-md cursor-pointer hover:scale-110 transition"
    >
      {isLiked ? (
        <Heart size={25} fill="#BE79DF" color="#BE79DF" />
      ) : (
        <Heart size={25} fill="#d8d8e070" color="#BE79DF" />
      )}
    </div>
  );
};
