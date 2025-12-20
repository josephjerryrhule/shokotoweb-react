import React, { useState } from "react";

// Helper function to decode HTML entities
const decodeHtmlEntities = (text) => {
  const textarea = document.createElement('textarea');
  textarea.innerHTML = text;
  return textarea.value;
};

// Helper function to get color hex from color name/slug
const getColorHex = (colorName) => {
  const colorMap = {
    black: "#000000",
    white: "#FFFFFF",
    red: "#EF4444",
    blue: "#3B82F6",
    green: "#10B981",
    yellow: "#FBBF24",
    purple: "#A855F7",
    pink: "#EC4899",
    gray: "#6B7280",
    grey: "#6B7280",
    orange: "#F97316",
    brown: "#92400E",
    beige: "#D4C5B9",
    navy: "#1E3A8A",
    cream: "#FFF8E7",
    tan: "#D2B48C",
    khaki: "#C3B091",
    olive: "#808000",
    maroon: "#800000",
    teal: "#14B8A6",
    cyan: "#06B6D4",
    indigo: "#6366F1",
    wine: "#722F37",
    burgundy: "#800020",
    turquoise: "#40E0D0",
    aqua: "#00FFFF",
    mint: "#98FF98",
    lime: "#84CC16",
    coral: "#FF7F50",
    salmon: "#FA8072",
    peach: "#FFE5B4",
    lavender: "#E6E6FA",
    violet: "#8B00FF",
    magenta: "#D946EF",
    gold: "#FFD700",
    silver: "#C0C0C0",
    bronze: "#CD7F32",
    charcoal: "#36454F",
    ivory: "#FFFFF0",
    emerald: "#50C878",
    ruby: "#E0115F",
    sapphire: "#0F52BA",
    rose: "#FF007F",
    mustard: "#FFDB58",
    forest: "#228B22",
    sky: "#87CEEB",
    denim: "#1560BD",
    camel: "#C19A6B",
    chocolate: "#7B3F00",
    copper: "#B87333",
  };
  
  const slug = colorName.toLowerCase().replace(/\s+/g, "-");
  return colorMap[slug] || colorMap[colorName.toLowerCase()] || "#CCCCCC";
};

// FilterSection component defined outside to avoid recreation on each render
const FilterSection = ({ 
  title, 
  items, 
  type, 
  idKey = "id", 
  nameKey = "name",
  isExpanded,
  toggleSection,
  selectedItems,
  handleFilterChange
}) => {
  const isColorAttribute = title.toLowerCase().includes("color") || title.toLowerCase().includes("colour");
  
  return (
    <div className="border-b border-gray-200 last:border-b-0">
      <button
        onClick={() => toggleSection(type)}
        className="w-full flex items-center justify-between py-4 text-left hover:bg-gray-50 transition-colors cursor-pointer"
      >
        <span className="font-medium">
          {title}
        </span>
        <svg
          className={`w-4 h-4 transition-transform ${
            isExpanded ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          isExpanded ? "max-h-125 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className={`pb-4 ${isColorAttribute ? "space-y-2" : "space-y-2"} max-h-80 overflow-y-auto pr-2`}>
          {items.map((item) => {
            const isSelected = selectedItems.includes(item.slug);
            
            if (isColorAttribute) {
              // Color swatch rendering
              const decodedName = decodeHtmlEntities(item[nameKey]);
              const colors = decodedName.split('&').map(c => c.trim());
              const isDualColor = colors.length === 2;
              
              return (
                <button
                  key={item[idKey]}
                  onClick={() => handleFilterChange(type, item.slug)}
                  className={`flex items-center gap-2.5 cursor-pointer hover:bg-gray-50 py-1.5 px-2 -mx-2 rounded transition-all w-full text-left ${
                    isSelected ? "bg-gray-100" : ""
                  }`}
                >
                  {isDualColor ? (
                    <div
                      className={`w-5 h-5 rounded-full border-2 transition-all overflow-hidden ${
                        isSelected ? "border-black ring-2 ring-black ring-offset-2" : "border-gray-300"
                      }`}
                    >
                      <div className="flex h-full">
                        <div className="w-1/2" style={{ backgroundColor: getColorHex(colors[0]) }} />
                        <div className="w-1/2" style={{ backgroundColor: getColorHex(colors[1]) }} />
                      </div>
                    </div>
                  ) : (
                    <div
                      className={`w-5 h-5 rounded-full border-2 transition-all ${
                        isSelected ? "border-black ring-2 ring-black ring-offset-2" : "border-gray-300"
                      }`}
                      style={{ backgroundColor: getColorHex(decodedName) }}
                    />
                  )}
                  <span className={`text-sm ${isSelected ? "font-semibold" : ""}`}>
                    {decodedName}
                    {item.count !== undefined && (
                      <span className="text-gray-400 ml-1">({item.count})</span>
                    )}
                  </span>
                </button>
              );
            }
            
            // Default checkbox rendering for other attributes
            return (
              <label
                key={item[idKey]}
                className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 py-1 px-2 -mx-2 rounded transition-colors"
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => handleFilterChange(type, item.slug)}
                  className="w-4 h-4 border-gray-300 rounded focus:ring-0 focus:ring-offset-0"
                />
                <span className="text-sm">
                  {item[nameKey]}
                  {item.count !== undefined && (
                    <span className="text-gray-400 ml-1">({item.count})</span>
                  )}
                </span>
              </label>
            );
          })}
        </div>
      </div>
    </div>
  );
};

function ShopFilters({ selectedFilters, onFilterChange, filterData, loading }) {
  const [expandedSections, setExpandedSections] = useState(() => {
    // Initialize with first section expanded on desktop
    if (typeof window !== 'undefined' && window.innerWidth >= 1024) {
      return { categories: true };
    }
    return {};
  });
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const { categories = [], attributes = [] } = filterData || {};

  const toggleSection = (section) => {
    setExpandedSections((prev) => {
      // If clicking on already expanded section, close it
      if (prev[section]) {
        return { [section]: false };
      }
      // Otherwise, close all and open only this one
      return { [section]: true };
    });
  };

  const handleFilterChange = (type, value) => {
    const currentFilters = selectedFilters[type] || [];
    const newFilters = currentFilters.includes(value)
      ? currentFilters.filter((v) => v !== value)
      : [...currentFilters, value];

    onFilterChange({
      ...selectedFilters,
      [type]: newFilters,
    });
  };

  const clearAllFilters = () => {
    onFilterChange({});
    setIsMobileOpen(false);
  };

  const getActiveFilterCount = () => {
    return Object.values(selectedFilters).reduce(
      (sum, filters) => sum + (filters?.length || 0),
      0
    );
  };

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-12 bg-gray-200 rounded"></div>
        ))}
      </div>
    );
  }

  return (
    <>
      {/* Desktop version - Accordion */}
      <div className="hidden lg:block">
        <div className="sticky top-4">
          <div className="flex items-center justify-between mb-6">
            <p className="font-medium">
              Filters
            </p>
            {getActiveFilterCount() > 0 && (
              <button
                onClick={clearAllFilters}
                className="text-xs text-gray-600 hover:text-black underline"
              >
                Clear all
              </button>
            )}
          </div>
          <div className="border-t border-gray-200">
            {categories.length > 0 && (
              <FilterSection
                title="Categories"
                items={categories}
                type="categories"
                isExpanded={expandedSections.categories}
                toggleSection={toggleSection}
                selectedItems={selectedFilters.categories || []}
                handleFilterChange={handleFilterChange}
              />
            )}
            {attributes.map(
              (attr) =>
                attr.terms &&
                attr.terms.length > 0 && (
                  <FilterSection
                    key={attr.id}
                    title={attr.name}
                    items={attr.terms}
                    type={`attribute_${attr.id}`}
                    isExpanded={expandedSections[`attribute_${attr.id}`]}
                    toggleSection={toggleSection}
                    selectedItems={selectedFilters[`attribute_${attr.id}`] || []}
                    handleFilterChange={handleFilterChange}
                  />
                )
            )}
          </div>
        </div>
      </div>

      {/* Mobile version - Dropdown */}
      <div className="lg:hidden mb-6">
        <button
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="w-full flex items-center justify-between py-3 px-4 border border-gray-300 bg-white hover:bg-gray-50 transition-colors"
        >
          <span className="font-medium">
            Filters
            {getActiveFilterCount() > 0 && (
              <span className="ml-2 inline-flex items-center justify-center w-5 h-5 text-xs bg-black text-white rounded-full">
                {getActiveFilterCount()}
              </span>
            )}
          </span>
          <svg
            className={`w-4 h-4 transition-transform ${
              isMobileOpen ? "rotate-180" : ""
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>

        <div
          className={`overflow-hidden transition-all duration-300 ease-in-out ${
            isMobileOpen ? "max-h-500 opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <div className="mt-2 border border-gray-300 bg-white p-4">
            <div className="flex items-center justify-between mb-4">
              <p className="font-medium">
                Filter
              </p>
              {getActiveFilterCount() > 0 && (
                <button
                  onClick={clearAllFilters}
                  className="text-xs text-gray-600 hover:text-black underline"
                >
                  Clear all
                </button>
              )}
            </div>
            <div className="border-t border-gray-200">
              {categories.length > 0 && (
                <FilterSection
                  title="Categories"
                  items={categories}
                  type="categories"
                  isExpanded={expandedSections.categories}
                  toggleSection={toggleSection}
                  selectedItems={selectedFilters.categories || []}
                  handleFilterChange={handleFilterChange}
                />
              )}
              {attributes.map(
                (attr) =>
                  attr.terms &&
                  attr.terms.length > 0 && (
                    <FilterSection
                      key={attr.id}
                      title={attr.name}
                      items={attr.terms}
                      type={`attribute_${attr.id}`}
                      isExpanded={expandedSections[`attribute_${attr.id}`]}
                      toggleSection={toggleSection}
                      selectedItems={selectedFilters[`attribute_${attr.id}`] || []}
                      handleFilterChange={handleFilterChange}
                    />
                  )
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default ShopFilters;
