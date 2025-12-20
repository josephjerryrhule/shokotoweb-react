import woo from "../lib/woocommerce";
import { getCartToken } from "./cart";

// Get checkout data
export async function getCheckout() {
  try {
    const cartToken = getCartToken();

    const response = await woo.get("/checkout", {
      headers: {
        "Cart-Token": cartToken,
      },
    });

    return response.data;
  } catch (error) {
    console.error("Error fetching checkout:", error);
    throw error;
  }
}

// Process checkout and create order
export async function processCheckout(checkoutData) {
  try {
    const cartToken = getCartToken();

    const response = await woo.post("/checkout", checkoutData, {
      headers: {
        "Cart-Token": cartToken,
      },
    });

    return response.data;
  } catch (error) {
    console.error("Error processing checkout:", error);
    throw error;
  }
}

// Update checkout data (billing, shipping, payment method)
export async function updateCheckout(updateData) {
  try {
    const cartToken = getCartToken();

    const response = await woo.put("/checkout", updateData, {
      headers: {
        "Cart-Token": cartToken,
      },
    });

    return response.data;
  } catch (error) {
    console.error("Error updating checkout:", error);
    throw error;
  }
}

// Get order by ID
export async function getOrder(orderId) {
  try {
    const response = await woo.get(`/order/${orderId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching order:", error);
    throw error;
  }
}

// Get available payment methods
export async function getPaymentMethods() {
  try {
    const cartToken = getCartToken();

    const response = await woo.get("/payment-methods", {
      headers: {
        "Cart-Token": cartToken,
      },
    });

    return response.data;
  } catch (error) {
    console.error("Error fetching payment methods:", error);
    throw error;
  }
}
