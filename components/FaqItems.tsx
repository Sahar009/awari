"use client";
import React, { useState } from "react";
import { Plus, Minus } from "lucide-react";

export interface FaqItemProps {
  question: string;
  answer: string;
}

export const FaqItem: React.FC<FaqItemProps> = ({ question, answer }) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="w-full border-b border-gray-300 py-6 px-8 rounded-xl hover:bg-gradient-to-r hover:from-primary/5 hover:to-secondary-color/5 transition-all duration-300 ease-out transform hover:-translate-y-1 hover:shadow-md">
      {/* Header with Question & Icon */}
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex justify-between items-center text-left"
      >
        <span className="font-semibold text-lg">{question}</span>
        {open ? <Minus size={22} className="text-primary"/> : <Plus size={22}  className="text-primary"/>}
      </button>

      {/* Collapsible Answer */}
      {open && (
        <p className="mt-2 text-purple-400 leading-relaxed transition-all duration-300">
          {answer}
        </p>
      )}
    </div>
  );
};
