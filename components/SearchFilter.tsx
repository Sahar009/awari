"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { SearchIcon, X } from "lucide-react";
import { Button } from "./ui/Button";
import SearchableSelect from "./ui/Select";
import { PropertyFilters } from "@/store/slices/propertySlice";

// Export types for backward compatibility
export interface Option {
  label: string;
  value: string;
}

export interface SearchCriteria {
  query: string;
  location?: string;
  propertyType?: string;
  minPrice?: number;
  maxPrice?: number;
}

interface SearchFilterProps {
  // New API
  onFilterChange?: (filters: PropertyFilters) => void;
  defaultFilters?: PropertyFilters;
  // Old API (for backward compatibility with HomePage)
  locations?: Option[];
  propertyTypes?: Option[];
  onSearch?: (criteria: SearchCriteria) => void;
}

export const SearchFilter = ({ 
  onFilterChange, 
  defaultFilters = {},
  locations,
  propertyTypes,
  onSearch
}: SearchFilterProps) => {
  // Determine which API to use
  const useOldAPI = !!onSearch;
  
  const [search, setSearch] = useState<string>(defaultFilters.search || "");
  const [city, setCity] = useState<string>(defaultFilters.city || "");
  const [state, setState] = useState<string>(defaultFilters.state || "");
  const [minPrice, setMinPrice] = useState<string>(defaultFilters.minPrice?.toString() || "");
  const [maxPrice, setMaxPrice] = useState<string>(defaultFilters.maxPrice?.toString() || "");
  const [propertyType, setPropertyType] = useState<string>(defaultFilters.propertyType || "");
  const [selectedLocation, setSelectedLocation] = useState<string>("");

  const defaultLocationData = [
  { label: "Lagos", value: "Lagos" },
    { label: "Abuja", value: "Abuja" },
    { label: "Port Harcourt", value: "Port Harcourt" },
    { label: "Kano", value: "Kano" },
    { label: "Ibadan", value: "Ibadan" },
    { label: "Enugu", value: "Enugu" },
    { label: "Kaduna", value: "Kaduna" },
    { label: "Benin City", value: "Benin City" },
    { label: "Aba", value: "Aba" },
    { label: "Warri", value: "Warri" },
  ];

  const defaultPropertyTypes = [
    { label: "All Types", value: "" },
    { label: "Apartment", value: "apartment" },
    { label: "House", value: "house" },
    { label: "Villa", value: "villa" },
    { label: "Duplex", value: "duplex" },
    { label: "Bungalow", value: "bungalow" },
    { label: "Condo", value: "condo" },
    { label: "Studio", value: "studio" },
    { label: "Penthouse", value: "penthouse" },
    { label: "Townhouse", value: "townhouse" },
    { label: "Office", value: "office" },
    { label: "Commercial", value: "commercial" },
    { label: "Land", value: "land" },
    { label: "Hotel", value: "hotel" },
    { label: "Resort", value: "resort" },
    { label: "Motel", value: "motel" },
    { label: "Hostel", value: "hostel" },
    { label: "Guesthouse", value: "guesthouse" },
    { label: "Boutique Hotel", value: "boutique_hotel" },
    { label: "Serviced Apartment", value: "serviced_apartment" },
    { label: "Bed & Breakfast", value: "bed_and_breakfast" },
  ];

  // Use provided options or defaults
  const locationData = locations || defaultLocationData;
  const propertyTypeOptions = propertyTypes || defaultPropertyTypes;

  // Build filters object - use useMemo to prevent unnecessary recalculations
  const filters = useMemo((): PropertyFilters => {
    const filterObj: PropertyFilters = {};
    
    if (search.trim()) {
      filterObj.search = search.trim();
    }
    
    if (city) {
      filterObj.city = city;
    }
    
    if (state) {
      filterObj.state = state;
    }
    
    if (minPrice) {
      const min = parseFloat(minPrice);
      if (!isNaN(min) && min > 0) {
        filterObj.minPrice = min;
      }
    }
    
    if (maxPrice) {
      const max = parseFloat(maxPrice);
      if (!isNaN(max) && max > 0) {
        filterObj.maxPrice = max;
      }
    }
    
    if (propertyType) {
      filterObj.propertyType = propertyType;
    }
    
    return filterObj;
  }, [search, city, state, minPrice, maxPrice, propertyType]);

  // Use ref to track previous filters and prevent unnecessary calls
  const prevFiltersRef = useRef<string>('');
  
  // Debounce search input to avoid too many API calls (new API only)
  useEffect(() => {
    if (useOldAPI || !onFilterChange) return;
    
    const filtersKey = JSON.stringify(filters);
    
    // Only trigger if filters actually changed
    if (prevFiltersRef.current === filtersKey) return;
    
    const timeoutId = setTimeout(() => {
      prevFiltersRef.current = filtersKey;
      onFilterChange(filters);
    }, search ? 500 : 0); // 500ms delay for search, immediate for other filters
    
    return () => clearTimeout(timeoutId);
  }, [filters, search, onFilterChange, useOldAPI]);

  const handleSearch = () => {
    if (useOldAPI && onSearch) {
      // Old API: convert to SearchCriteria
      const criteria: SearchCriteria = {
        query: search,
        location: selectedLocation || city || undefined,
        propertyType: propertyType || undefined,
        minPrice: minPrice ? parseFloat(minPrice) : undefined,
        maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
      };
      onSearch(criteria);
    } else if (onFilterChange) {
      // New API: use PropertyFilters
      prevFiltersRef.current = JSON.stringify(filters);
      onFilterChange(filters);
    }
  };

  const handleClear = () => {
    setSearch("");
    setCity("");
    setState("");
    setMinPrice("");
    setMaxPrice("");
    setPropertyType("");
    setSelectedLocation("");
    
    if (useOldAPI && onSearch) {
      onSearch({ query: "" });
    } else if (onFilterChange) {
      prevFiltersRef.current = '';
      onFilterChange({});
    }
  };

  const hasActiveFilters = search || (useOldAPI ? selectedLocation : city) || state || minPrice || maxPrice || propertyType;

  return (
    <div className="w-full h-full flex flex-col lg:flex-row lg:rounded-2xl rounded-xl shadow-lg">
      <div className="w-full grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr_auto] rounded-2xl border-l-8 border-r-8 border-primary items-center bg-white px-4 py-8">
        {/* Search Input */}
        <div className="w-full px-4 py-2 flex flex-row items-center gap-2 border border-gray-300 rounded-full focus-within:ring-2 focus-within:ring-primary transition relative">
          <SearchIcon size={20} className="text-gray-500 shrink-0" />
          <input
            type="text"
            placeholder="What are you looking for?"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSearch();
              }
            }}
            className="w-full outline-none bg-transparent"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-2 p-1 hover:bg-gray-100 rounded-full transition"
              aria-label="Clear search"
            >
              <X size={16} className="text-gray-500" />
            </button>
          )}
        </div>

        {/* Location Select */}
        <SearchableSelect
          options={locationData}
          placeholder="Location"
          value={useOldAPI ? selectedLocation : (city || "")}
          onChange={(val) => {
            if (useOldAPI) {
              setSelectedLocation(val || "");
            } else {
              if (val) {
                setCity(val);
              } else {
                setCity("");
              }
            }
          }}
        />

        {/* Price Range */}
        <div className="flex gap-2 items-center">
          <div className="flex items-center border border-gray-300 rounded-lg px-2 py-2 focus-within:ring-2 focus-within:ring-primary transition w-full">
            <span className="text-gray-500 mr-1">₦</span>
            <input
              type="number"
              placeholder="Min"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              className="w-full outline-none bg-transparent text-sm"
              min="0"
            />
          </div>
          <span className="text-gray-500">-</span>
          <div className="flex items-center border border-gray-300 rounded-lg px-2 py-2 focus-within:ring-2 focus-within:ring-primary transition w-full">
            <span className="text-gray-500 mr-1">₦</span>
            <input
              type="number"
              placeholder="Max"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="w-full outline-none bg-transparent text-sm"
              min="0"
            />
          </div>
        </div>

        {/* Property Type Select */}
        <SearchableSelect
          options={propertyTypeOptions}
          placeholder="Property Type"
          value={propertyType}
          onChange={(val) => setPropertyType(val || "")}
        />

        {/* Action Buttons */}
        <div className="flex gap-2">
          {hasActiveFilters && (
            <button
              onClick={handleClear}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-1"
              aria-label="Clear filters"
            >
              <X size={16} />
              Clear
            </button>
          )}
          <Button
            label="Search" 
            onClick={handleSearch}
            className="whitespace-nowrap"
          />
        </div>
      </div>
    </div>
  );
};
