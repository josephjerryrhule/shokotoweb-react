import woo from "../lib/woocommerce";

// Generate or retrieve cart token
export function getCartToken() {
  let token = localStorage.getItem("wc_cart_token");
  if (!token) {
    token = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem("wc_cart_token", token);
  }
  return token;
}

// Get cart contents
export async function getCart() {
  try {
    const cartToken = getCartToken();
    
    const response = await woo.get("/cart", {
      headers: {
        "Cart-Token": cartToken,
      },
    });
    
    return response.data;
  } catch (error) {
    console.error("Error fetching cart:", error);
    throw error;
  }
}

// Add item to cart
export async function addToCart(productId, quantity = 1, variationId = null) {
  try {
    const cartToken = getCartToken();
    
    const response = await woo.post(
      "/cart/add-item",
      {
        id: variationId || productId,
        quantity: quantity,
      },
      {
        headers: {
          "Cart-Token": cartToken,
        },
      }
    );
    
    return response.data;
  } catch (error) {
    console.error("Error adding to cart:", error);
    console.error("Response:", error.response?.data);
    throw error;
  }
}

// Update cart item quantity
export async function updateCartItem(itemKey, quantity) {
  try {
    const cartToken = getCartToken();
    
    const response = await woo.post(
      "/cart/update-item",
      {
        key: itemKey,
        quantity: quantity,
      },
      {
        headers: {
          "Cart-Token": cartToken,
        },
      }
    );
    
    return response.data;
  } catch (error) {
    console.error("Error updating cart item:", error);
    throw error;
  }
}

// Remove item from cart
export async function removeCartItem(itemKey) {
  try {
    const cartToken = getCartToken();
    
    const response = await woo.post(
      "/cart/remove-item",
      {
        key: itemKey,
      },
      {
        headers: {
          "Cart-Token": cartToken,
        },
      }
    );
    
    return response.data;
  } catch (error) {
    console.error("Error removing cart item:", error);
    throw error;
  }
}

// Get all cart items
export async function getCartItems() {
  try {
    const cartToken = getCartToken();
    
    const response = await woo.get("/cart/items", {
      headers: {
        "Cart-Token": cartToken,
      },
    });
    
    return response.data;
  } catch (error) {
    console.error("Error fetching cart items:", error);
    throw error;
  }
}

// Clear all cart items
export async function clearCart() {
  try {
    const cartToken = getCartToken();
    
    const response = await woo.delete("/cart/items", {
      headers: {
        "Cart-Token": cartToken,
      },
    });
    
    return response.data;
  } catch (error) {
    console.error("Error clearing cart:", error);
    throw error;
  }
}

// Apply coupon to cart
export async function applyCoupon(couponCode) {
  try {
    const cartToken = getCartToken();
    
    const response = await woo.post(
      "/cart/apply-coupon",
      {
        code: couponCode,
      },
      {
        headers: {
          "Cart-Token": cartToken,
        },
      }
    );
    
    return response.data;
  } catch (error) {
    console.error("Error applying coupon:", error);
    throw error;
  }
}

// Remove coupon from cart
export async function removeCoupon(couponCode) {
  try {
    const cartToken = getCartToken();
    
    const response = await woo.post(
      "/cart/remove-coupon",
      {
        code: couponCode,
      },
      {
        headers: {
          "Cart-Token": cartToken,
        },
      }
    );
    
    return response.data;
  } catch (error) {
    console.error("Error removing coupon:", error);
    throw error;
  }
}

// Update customer information
export async function updateCustomer(billingAddress, shippingAddress = null) {
  try {
    const cartToken = getCartToken();
    
    const response = await woo.post(
      "/cart/update-customer",
      {
        billing_address: billingAddress,
        ...(shippingAddress && { shipping_address: shippingAddress }),
      },
      {
        headers: {
          "Cart-Token": cartToken,
        },
      }
    );
    
    return response.data;
  } catch (error) {
    console.error("Error updating customer:", error);
    throw error;
  }
}

