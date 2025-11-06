"use client";
import Image from "next/image";
import clsx from "clsx";

interface AvatarProps {
  src?: string;
  alt?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
  onClick?: () => void;
}

const sizeClasses = {
  sm: "w-8 h-8",
  md: "w-10 h-10",
  lg: "w-16 h-16",
};

export const Avatar: React.FC<AvatarProps> = ({
  src,
  alt = "Avatar",
  size = "md",
  className,
  onClick,
}) => {
  const initials = alt
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "?";

  return (
    <div
      onClick={onClick}
      className={clsx(
        "rounded-full overflow-hidden flex items-center justify-center bg-gray-200 text-gray-600 font-semibold",
        sizeClasses[size],
        onClick && "cursor-pointer hover:opacity-80 transition-opacity",
        className
      )}
    >
      {src ? (
        <Image
          src={src}
          width={size === "sm" ? 32 : size === "md" ? 40 : 64}
          height={size === "sm" ? 32 : size === "md" ? 40 : 64}
          alt={alt}
          className="w-full h-full object-cover"
        />
      ) : (
        <span className="text-xs">{initials}</span>
      )}
    </div>
  );
};
