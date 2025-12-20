import React from "react";

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

function ProductForm({
  product,
  selectedVariation,
  setSelectedVariation,
  quantity,
  setQuantity,
  addingToCart,
  itemAdded,
  onSubmit,
}) {
  return (
    <form
      onSubmit={onSubmit}
      data-product_id={product.id}
      className="add-to-cart-form flex flex-col gap-6"
    >
      <div className="flex items-end gap-6 flex-wrap">
        {/* Variations */}
        {product.type === "variable" && product.attributes && (
          <>
            {product.attributes
              .filter((attr) => attr.has_variations)
              .map((attribute) => {
                const isColorAttribute = attribute.name.toLowerCase().includes("color") || attribute.name.toLowerCase().includes("colour");
                
                return (
                <div key={attribute.id} className="attribute-group">
                  <p className="mb-3 font-medium">{attribute.name}</p>
                  <div className="flex items-center gap-2 flex-wrap">
                    {attribute.terms.map((term) => {
                      const variation = product.variations?.find((v) =>
                        v.attributes.some(
                          (a) =>
                            a.name.toLowerCase() ===
                              attribute.name.toLowerCase() &&
                            a.value === term.slug
                        )
                      );

                      if (!variation) {
                        return null;
                      }

                      const isSelected = selectedVariation?.id === variation.id;
                      const decodedName = decodeHtmlEntities(term.name);

                      if (isColorAttribute) {
                        const colors = decodedName.split('&').map(c => c.trim());
                        const isDualColor = colors.length === 2;

                        return (
                          <label
                            key={term.id}
                            className={`relative cursor-pointer transition-all duration-200 border-2 rounded-full p-0.5 ${
                              isSelected
                                ? "border-black ring-2 ring-black ring-offset-2"
                                : "border-gray-300 hover:border-gray-400"
                            }`}
                            title={decodedName}
                          >
                            <input
                              type="radio"
                              name={`attribute_${attribute.id}`}
                              value={variation.id}
                              checked={isSelected}
                              onChange={() => setSelectedVariation(variation)}
                              className="sr-only"
                            />
                            {isDualColor ? (
                              <div className="w-8 h-8 rounded-full overflow-hidden flex">
                                <div className="w-1/2" style={{ backgroundColor: getColorHex(colors[0]) }} />
                                <div className="w-1/2" style={{ backgroundColor: getColorHex(colors[1]) }} />
                              </div>
                            ) : (
                              <div
                                className="w-8 h-8 rounded-full"
                                style={{ backgroundColor: getColorHex(decodedName) }}
                              />
                            )}
                          </label>
                        );
                      }

                      // Default text button for non-color attributes
                      return (
                        <label
                          key={term.id}
                          className={`relative cursor-pointer transition-all duration-200 ${
                            isSelected
                              ? "bg-black text-white"
                              : "bg-white text-black border border-gray-300 hover:border-gray-400"
                          }`}
                        >
                          <input
                            type="radio"
                            name={`attribute_${attribute.id}`}
                            value={variation.id}
                            checked={isSelected}
                            onChange={() => setSelectedVariation(variation)}
                            className="sr-only"
                          />
                          <span className="block px-4 py-2 text-sm font-medium">
                            {decodedName}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )})}
          </>
        )}

        {/* Quantity */}
        <div>
          <p className="mb-3">Quantity</p>
          <div className="quantity flex items-center border border-gray-300 max-w-max">
            <button
              type="button"
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="px-4 py-2 hover:bg-black hover:text-white transition-all duration-300 ease-in-out cursor-pointer"
            >
              -
            </button>
            <input
              disabled
              type="text"
              value={quantity}
              className="w-16 text-center outline-none"
              min="1"
            />
            <button
              type="button"
              onClick={() => setQuantity(quantity + 1)}
              className="px-4 py-2 hover:bg-black hover:text-white transition-all duration-300 ease-in-out cursor-pointer"
            >
              +
            </button>
          </div>
        </div>
      </div>

      {/* Add to Cart Button */}
      <div className="quantity-add-to-cart flex items-start gap-4 flex-col">
        <button
          type="submit"
          disabled={addingToCart || !product.is_in_stock || itemAdded}
          className="bg-white text-black border border-black p-[12px_48px] w-full hover:bg-black hover:text-white cursor-pointer transition-all duration-300 ease-in-out disabled:bg-gray-300 disabled:cursor-not-allowed disabled:border-gray-300"
        >
          {itemAdded
            ? "Added to cart"
            : addingToCart
            ? "Adding..."
            : product.is_in_stock
            ? "Add to Cart"
            : "Out of Stock"}
        </button>
      </div>
    </form>
  );
}

export default ProductForm;
