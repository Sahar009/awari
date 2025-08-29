"use client";
import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, SearchIcon } from "lucide-react";

interface Option {
  label: string;
  value: string;
}

interface SearchableSelectProps {
  options: Option[];
  placeholder?: string;
  onChange: (value: string) => void;
}

const SearchableSelect: React.FC<SearchableSelectProps> = ({
  options,
  placeholder = "Select an option",
  onChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Option | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  // Close dropdown if clicked outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredOptions = options.filter((opt) =>
    opt.label.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = (option: Option) => {
    setSelected(option);
    onChange(option.value);
    setIsOpen(false);
    setSearch(""); // reset search when closed
  };

  return (
    <div className="relative w-full" ref={ref}>
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full border text-gray-500 border-gray-300 rounded-lg p-2 flex justify-between items-center bg-white "
      >
        {selected ? selected.label : placeholder}
        <span className="ml-2"><ChevronDown size={20} /></span>
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-[100] mt-2 w-full bg-white border border-gray-300 rounded-lg shadow-lg">
        <div className="flex flex-row items-center gap-2 w-full h-full  p-2 border-b border-secondary-color outline-none">
        <SearchIcon size={20} className="text-gray-500"/>
        <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search..."
            className="w-full placeholder:text-gray-500 outline-none border-none text-sm"
          />
        </div>
          

          <ul className="max-h-40 overflow-y-auto z-50">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => (
                <li
                  key={option.value}
                  onClick={() => handleSelect(option)}
                  className="p-2 hover:bg-primary hover:text-white text-gray-500 font-light text-sm transition duration-300 ease-in-out cursor-pointer "
                >
                  {option.label}
                </li>
              ))
            ) : (
              <li className="p-2 text-gray-400 text-sm font-extralight">No results found</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export default SearchableSelect;
