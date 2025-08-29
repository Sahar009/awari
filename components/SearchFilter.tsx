"use client";

import { SearchIcon } from "lucide-react";
import { Button } from "./ui/Button";
import SearchableSelect from "./ui/Select";

export const SearchFilter = () => {

    const locationData = [
        {label: "Lagos", value: "Lagos"},
        {label: "Abuja", value: "Abuja"}
    ]

      const propertyTypes = [
    { label: "Apartment", value: "apartment" },
    { label: "Duplex", value: "duplex" },
    { label: "Office", value: "office" },
    { label: "Villa", value: "villa" },
    { label: "Bungalow", value: "bungalow" },
  ];
  return (
    <div className="w-full h-full flex flex-col lg:flex-row lg:rounded-2xl rounded-xl  shadow-lg">
      <div className="w-full grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr_auto] rounded-2xl border-l-8  border-r-8 border-primary  items-center bg-white px-4 py-8">
        {/* What are you looking for */}
        <div className="w-full px-4 py-2 flex flex-row items-center gap-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-primary transition">
       <SearchIcon size={20}  className="text-gray-500"/>
        <input
          type="text"
          placeholder="What are you looking for?"
          className="w-full "
        />
        </div>

        {/* Location Select */}
       <SearchableSelect
        options={locationData}
        placeholder="Location"
        onChange={(val) => console.log("Selected:", val)}
      />

        {/* Price Range */}
        <div className="flex gap-2 items-center">
          <div className="flex items-center border border-gray-300 rounded-lg px-2 py-2 focus-within:ring-2 focus-within:ring-primary transition w-full">
            <span className="text-gray-500 mr-1">₦</span>
            <input
              type="number"
              placeholder="Min"
              className="w-full outline-none bg-transparent text-sm"
            />
          </div>
          <span className="text-gray-500">-</span>
          <div className="flex items-center border border-gray-300 rounded-lg px-2 py-2 focus-within:ring-2 focus-within:ring-primary transition w-full">
            <span className="text-gray-500 mr-1">₦</span>
            <input
              type="number"
              placeholder="Max"
              className="w-full outline-none bg-transparent text-sm"
            />
          </div>
        </div>

        {/* Property Type Select */}
        <SearchableSelect
        options={propertyTypes}
        placeholder="Select Property Type"
        onChange={(val) => console.log("Selected:", val)}
      />

        {/* Search Button */}
       <Button label="Search Property" />
      </div>
    </div>
  );
};
