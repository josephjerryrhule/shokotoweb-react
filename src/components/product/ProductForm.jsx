import React from "react";

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
              .map((attribute) => (
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
                            {term.name}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              ))}
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
