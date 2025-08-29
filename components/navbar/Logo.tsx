"use client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React from "react";

export const Logo: React.FC = () => {
  const router = useRouter();

  return (
    <div
      onClick={() => router.push("/home")}
      className="cursor-pointer select-none"
    >
      <Image
        width={100}
        height={100}
        src="/assets/images/logo.png"
        alt="Logo"
        priority
      />
    </div>
  );
};
