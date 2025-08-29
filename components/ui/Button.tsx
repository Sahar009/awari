"use client";
import React from "react";
import clsx from "clsx";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  disable?: boolean;
  variant?: "primary" | "secondary" | "outline";
  className?: string;
}

export const Button: React.FC<ButtonProps> = ({
  label,
  variant = "primary",
  disable = false,
  className,
  ...rest
}) => {
  const baseStyles =
    "rounded-lg px-6 py-2 font-bold transition-colors duration-200";

  const variantStyles: Record<string, string> = {
    primary: "bg-primary text-white hover:opacity-100",
    secondary: "bg-gray-200 text-gray-800 hover:bg-gray-300",
    outline: "border-2 border-primary text-primary hover:bg-blue-50",
  };

  return (
    <button
      disabled={disable}
      className={clsx(
        baseStyles,
        variantStyles[variant],
        disable && "bg-gray-400 text-gray-200 cursor-not-allowed border-none",
        className
      )}
      {...rest}
    >
      {label}
    </button>
  );
};
