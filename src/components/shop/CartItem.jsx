import React from "react";

function CartItem({ item, onUpdateQuantity, onRemove }) {
  const { quantity, key } = item;
  const imageUrl = item?.images?.[0]?.thumbnail || item?.images?.[0]?.src || "";
  const productName = item?.name || "";
  const price = item?.prices?.price || "0";
  const currencySymbol = item?.prices?.currency_code || "₵";
  const currencyMinorUnit = item?.prices?.currency_minor_unit || 2;

  // Calculate actual price (price is stored as integer, divide by 10^minor_unit)
  const actualPrice = parseInt(price) / Math.pow(10, currencyMinorUnit);
  const lineTotal = (actualPrice * quantity).toFixed(currencyMinorUnit);

  const handleQuantityChange = (newQuantity) => {
    if (newQuantity > 0) {
      onUpdateQuantity(key, newQuantity);
    }
  };

  const handleDelete = () => {
    onRemove(key);
  };

  return (
    <div className="flex lg:items-center bg-[#F6F6F6] justify-between p-4 lg:flex-row flex-col gap-4">
      {/* Left side: Image and Title */}
      <div className="flex items-center gap-4 flex-1">
        {imageUrl && (
          <img
            src={imageUrl}
            alt={productName}
            className="w-20 h-20 object-cover"
          />
        )}
        <p className="text-black font-medium">{productName}</p>
      </div>

      {/* Right side: Quantity, Price, Delete */}
      <div className="flex items-center gap-6 justify-between">
        {/* Quantity Controls */}
        <div className="flex items-center gap-2 border border-white bg-white">
          <button
            onClick={() => handleQuantityChange(quantity - 1)}
            className="px-3 py-1 hover:bg-black cursor-pointer hover:text-white transition-colors"
          >
            −
          </button>
          <span className="px-3 py-1 min-w-10 text-center">{quantity}</span>
          <button
            onClick={() => handleQuantityChange(quantity + 1)}
            className="px-3 py-1 hover:bg-black cursor-pointer hover:text-white transition-colors"
          >
            +
          </button>
        </div>

        {/* Price */}
        <div className="min-w-20 text-right">
          <p className="text-black font-medium">
            {currencySymbol}
            {lineTotal}
          </p>
        </div>

        {/* Delete Icon */}
        <button
          onClick={handleDelete}
          className="hover:opacity-70 transition-opacity cursor-pointer"
          aria-label="Remove item"
        >
          <svg
            width="30"
            height="30"
            viewBox="0 0 30 30"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="hidden lg:block"
          >
            <path
              d="M11.4636 5C11.9784 3.54351 13.3675 2.5 15.0002 2.5C16.633 2.5 18.0221 3.54351 18.5369 5"
              stroke="black"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            <path
              d="M25.6251 7.5H4.375"
              stroke="black"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            <path
              d="M23.5414 10.625L22.9664 19.2489C22.7451 22.5675 22.6345 24.2269 21.5533 25.2384C20.472 26.25 18.809 26.25 15.483 26.25H14.5164C11.1903 26.25 9.52732 26.25 8.44606 25.2384C7.36481 24.2269 7.25418 22.5675 7.03293 19.2489L6.45801 10.625"
              stroke="black"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            <path
              d="M11.875 13.75L12.5 20"
              stroke="black"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            <path
              d="M18.125 13.75L17.5 20"
              stroke="black"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>

          <svg
            className="lg:hidden"
            width="30"
            height="30"
            viewBox="0 0 30 30"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M11.4636 5C11.9784 3.54351 13.3675 2.5 15.0002 2.5C16.633 2.5 18.0221 3.54351 18.5369 5"
              stroke="black"
              stroke-width="1.5"
              stroke-linecap="round"
            />
            <path
              d="M25.6251 7.5H4.375"
              stroke="black"
              stroke-width="1.5"
              stroke-linecap="round"
            />
            <path
              d="M23.5414 10.625L22.9664 19.2489C22.7451 22.5675 22.6345 24.2269 21.5533 25.2384C20.472 26.25 18.809 26.25 15.483 26.25H14.5164C11.1903 26.25 9.52732 26.25 8.44606 25.2384C7.36481 24.2269 7.25418 22.5675 7.03293 19.2489L6.45801 10.625"
              stroke="black"
              stroke-width="1.5"
              stroke-linecap="round"
            />
            <path
              d="M11.875 13.75L12.5 20"
              stroke="black"
              stroke-width="1.5"
              stroke-linecap="round"
            />
            <path
              d="M18.125 13.75L17.5 20"
              stroke="black"
              stroke-width="1.5"
              stroke-linecap="round"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}

export default CartItem;
