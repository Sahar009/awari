"use client";
import React, { forwardRef } from "react";
import clsx from "clsx";
import { ChevronDown } from "lucide-react";

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  className?: string;
  children: React.ReactNode;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, helperText, className, children, ...rest }, ref) => {
    return (
      <div className="flex flex-col gap-2">
        {label && (
          <label className="text-sm font-medium text-gray-700">
            {label}
            {rest.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            className={clsx(
              "w-full px-4 py-3 border rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary appearance-none bg-white cursor-pointer",
              error
                ? "border-red-500 bg-red-50"
                : "border-gray-300 hover:border-gray-400",
              rest.disabled && "bg-gray-100 cursor-not-allowed",
              className
            )}
            {...rest}
          >
            {children}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
        </div>
        {error && (
          <span className="text-sm text-red-500 flex items-center gap-1">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {error}
          </span>
        )}
        {helperText && !error && (
          <span className="text-sm text-gray-500">{helperText}</span>
        )}
      </div>
    );
  }
);

Select.displayName = "Select";

interface Option {
  label: string;
  value: string;
}

interface SearchableSelectProps {
  options: Option[];
  placeholder?: string;
  onChange?: (value: string) => void;
  value?: string;
  className?: string;
}

export const SearchableSelect: React.FC<SearchableSelectProps> = ({
  options,
  placeholder = "Select an option",
  onChange,
  value,
  className
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (onChange) {
      onChange(e.target.value);
    }
  };

  return (
    <div className="relative">
      <select
        value={value || ""}
        onChange={handleChange}
        className={clsx(
          "w-full px-4 py-3 border border-gray-300 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary appearance-none bg-white cursor-pointer hover:border-gray-400",
          className
        )}
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
    </div>
  );
};

export default SearchableSelect;