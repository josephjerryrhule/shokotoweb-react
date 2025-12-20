import React, { useState, useEffect } from "react";
import Breadcrumb from "../../components/Breadcrumb";
import CartItem from "../../components/shop/CartItem";
import { getCart, updateCartItem, removeCartItem } from "../../api/cart";
import TopLoadingBar from "../../components/TopLoadingBar";
import { Link } from "react-router";

function Cart() {
  const [cartData, setCartData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = async () => {
    try {
      setLoading(true);
      const data = await getCart();
      setCartData(data);
    } catch (error) {
      console.error("Failed to load cart:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateQuantity = async (itemKey, quantity) => {
    try {
      setLoading(true);
      await updateCartItem(itemKey, quantity);
      await loadCart();
    } catch (error) {
      console.error("Failed to update quantity:", error);
      setLoading(false);
    }
  };

  const handleRemoveItem = async (itemKey) => {
    try {
      setLoading(true);
      await removeCartItem(itemKey);
      await loadCart();
    } catch (error) {
      console.error("Failed to remove item:", error);
      setLoading(false);
    }
  };

  const cartItems = cartData?.items || [];
  const cartTotals = cartData?.totals;
  const isCartEmpty = cartItems.length === 0;

  return (
    <>
      <TopLoadingBar isLoading={loading} />
      <main className="p-(--singleproduct-padding) min-h-screen">
      <Breadcrumb
        items={[
          { label: "Home", link: "/" },
          { label: "Shop", link: "/shop" },
          { label: "Cart" },
        ]}
      />

      <h1 className="text-black mb-8">Your Cart</h1>

      {loading ? (
        <div className="flex lg:flex-row flex-col justify-between gap-8">
          {/* Cart Items Skeleton */}
          <div className="flex-1 space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between border-b border-gray-200 py-4 animate-pulse">
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-20 h-20 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-48"></div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="h-10 bg-gray-200 rounded w-32"></div>
                  <div className="h-4 bg-gray-200 rounded w-20"></div>
                  <div className="w-8 h-8 bg-gray-200 rounded"></div>
                </div>
              </div>
            ))}
          </div>

          {/* Summary Skeleton */}
          <div className="lg:w-96 w-full">
            <div className="border border-gray-200 rounded p-6 animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-32 mb-4"></div>
              <div className="space-y-3 mb-6">
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-full"></div>
              </div>
              <div className="h-4 bg-gray-200 rounded w-full mb-6"></div>
              <div className="h-12 bg-gray-200 rounded w-full"></div>
            </div>
          </div>
        </div>
      ) : isCartEmpty ? (
        <div className="text-center py-12">
          <p className="text-gray-600 mb-4">Your cart is empty</p>
          <a
            href="/shop"
            className="inline-block px-6 py-3 bg-black text-white rounded hover:bg-gray-800 transition-colors"
          >
            Continue Shopping
          </a>
        </div>
      ) : (
        <div className="flex lg:flex-row flex-col justify-between gap-8">
          {/* Cart Items */}
          <div className="flex-1 flex flex-col gap-4">
            {cartItems.map((item) => (
              <CartItem
                key={item.key}
                item={item}
                onUpdateQuantity={handleUpdateQuantity}
                onRemove={handleRemoveItem}
              />
            ))}
          </div>

          {/* Cart Summary */}
          <div className="lg:w-96 w-full">
            <div className="border border-black p-6 sticky top-4">
              <p className="text-xl font-semibold mb-4">Order Summary</p>
              
              <div className="space-y-3 mb-6 text-sm">
                <div className="flex justify-between">
                  <span className="text-black">Subtotal</span>
                  <span className="font-medium">
                    {cartTotals?.currency_code}
                    {(parseInt(cartTotals?.total_price || 0) / 100).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-black">Shipping</span>
                  <span className="font-medium">Calculated at checkout</span>
                </div>
              </div>

              <div className="border-t pt-4 mb-6 text-sm">
                <div className="flex justify-between font-medium">
                  <span>Total</span>
                  <span>
                    {cartTotals?.currency_code}
                    {(parseInt(cartTotals?.total_price || 0) / 100).toFixed(2)}
                  </span>
                </div>
              </div>

              <Link to='/checkout' className="w-full bg-black text-white py-3 hover:bg-gray-800 transition-colors cursor-pointer block text-center">
                Proceed to Checkout
              </Link>
            </div>
          </div>
        </div>
      )}
    </main>
    </>
  );
}

export default Cart;
