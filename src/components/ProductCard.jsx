import React from "react";
import { Link } from "react-router";

function ProductCard({ product }) {
  const price = product.prices?.price
    ? (
        parseInt(product.prices.price) /
        Math.pow(10, product.prices.currency_minor_unit || 2)
      ).toFixed(2)
    : "0.00";
  const currencySymbol = product.prices?.currency_code || "₵";
  const isOutOfStock = !product.is_in_stock;

  return (
    <Link
      to={`/product/${product.slug}`}
      className={`relative p-2.5 bg-cover bg-center bg-no-repeat min-h-(--productslide-height) flex items-end ${
        isOutOfStock ? "opacity-50" : ""
      }`}
      data-product-id={product.id}
      title={product.name}
      style={{
        backgroundImage: `url(${product.images[0]?.src})`,
      }}
    >
      <div className="flex items-center bg-white p-3.5 w-full justify-between gap-4">
        <span className="text-sm font-semibold line-clamp-1">
          {isOutOfStock ? "Sold out" : product.name}
        </span>
        {!isOutOfStock && (
          <span className="text-gray-700 whitespace-nowrap text-sm">
            {currencySymbol} {price}
          </span>
        )}
      </div>
    </Link>
  );
}

export default ProductCard;
