"use client";

import { useState } from "react";
import { SearchIcon } from "lucide-react";
import { Button } from "./ui/Button";
import SearchableSelect from "./ui/Select";

export interface Option {
  label: string;
  value: string;
}

export interface SearchCriteria {
  query: string;
  location: string;
  propertyType: string;
  minPrice?: number;
  maxPrice?: number;
}

interface SearchFilterProps {
  locations?: Option[];
  propertyTypes?: Option[];
  onSearch?: (criteria: SearchCriteria) => void;
}

const defaultLocations: Option[] = [
  { label: "All locations", value: "all" },
  { label: "Lagos", value: "Lagos" },
  { label: "Abuja", value: "Abuja" }
];

const defaultPropertyTypes: Option[] = [
  { label: "All property types", value: "all" },
  { label: "For Rent", value: "For Rent" },
  { label: "For Sale", value: "For Sale" },
  { label: "Shortlet", value: "Shortlet" }
];

export const SearchFilter: React.FC<SearchFilterProps> = ({
  locations = defaultLocations,
  propertyTypes = defaultPropertyTypes,
  onSearch
}) => {
  const [query, setQuery] = useState("");
  const [location, setLocation] = useState("all");
  const [propertyType, setPropertyType] = useState("all");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSearch?.({
      query: query.trim(),
      location: location === "all" ? "" : location,
      propertyType: propertyType === "all" ? "" : propertyType,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined
    });
  };

  const handleReset = () => {
    setQuery("");
    setLocation("all");
    setPropertyType("all");
    setMinPrice("");
    setMaxPrice("");
    onSearch?.({
      query: "",
      location: "",
      propertyType: "",
      minPrice: undefined,
      maxPrice: undefined
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full rounded-3xl border border-slate-200/80 bg-white/95 p-6 shadow-xl backdrop-blur-md"
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr_auto] lg:items-end">
        <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50/60 px-4 py-3 transition focus-within:border-primary">
          <SearchIcon size={20} className="text-slate-400" />
          <input
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by keyword (e.g. Penthouse, Duplex)"
            className="w-full bg-transparent text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none"
          />
        </div>

        <SearchableSelect
          options={locations}
          placeholder="Location"
          value={location}
          onChange={(value) => setLocation(value)}
        />

        <div className="flex gap-2">
          <div className="flex flex-1 items-center rounded-xl border border-slate-200 px-3 py-2 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/15 transition">
            <span className="text-slate-400 mr-2 text-sm">₦</span>
            <input
              type="number"
              min={0}
              value={minPrice}
              onChange={(event) => setMinPrice(event.target.value)}
              placeholder="Min price"
              className="w-full bg-transparent text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none"
            />
          </div>
          <div className="flex flex-1 items-center rounded-xl border border-slate-200 px-3 py-2 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/15 transition">
            <span className="text-slate-400 mr-2 text-sm">₦</span>
            <input
              type="number"
              min={0}
              value={maxPrice}
              onChange={(event) => setMaxPrice(event.target.value)}
              placeholder="Max price"
              className="w-full bg-transparent text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none"
            />
          </div>
        </div>

        <SearchableSelect
          options={propertyTypes}
          placeholder="Property type"
          value={propertyType}
          onChange={(value) => setPropertyType(value)}
        />

        <div className="flex flex-col gap-2 sm:flex-row lg:flex-col">
          <Button
            type="submit"
            label="Search Property"
            className="w-full bg-linear-to-r from-primary to-primary/90 text-white shadow-lg hover:from-primary/90 hover:to-primary"
          />
          <Button
            type="button"
            variant="outline"
            label="Reset"
            className="w-full"
            onClick={handleReset}
          />
        </div>
      </div>
    </form>
  );
};
