import React from "react";

export const Rating: React.FC<{ rating: number }> = ({ rating }) => {
  const full = Math.floor(rating);
  const half = rating - full >= 0.5;

  const stars = Array.from({ length: 5 }).map((_, i) => (
    <svg
      key={i}
      viewBox="0 0 24 24"
      className={`w-5 h-5 ${
        i < full
          ? "fill-yellow-400"
          : half && i === full
          ? "fill-yellow-400"
          : "fill-gray-300"
      }`}
    >
      <path d="M12 .587l3.668 7.431 8.2 1.192-5.934 5.787 1.402 8.17L12 18.897l-7.336 3.87 1.402-8.17L.132 9.21l8.2-1.192z" />
    </svg>
  ));

  return (
    <div className="flex items-center gap-1">
      {stars}
      <span className="text-sm text-gray-600">{rating.toFixed(2)}</span>
    </div>
  );
};
