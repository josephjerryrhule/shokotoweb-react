import React, { useState, useEffect } from "react";
import { getCheckout, processCheckout } from "../../api/checkout";
import { getCart, selectShippingRate } from "../../api/cart";
import TopLoadingBar from "../../components/TopLoadingBar";

function Checkout() {
  const [loading, setLoading] = useState(true);
  const [checkoutData, setCheckoutData] = useState(null);
  const [cartData, setCartData] = useState(null);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [formData, setFormData] = useState({
    billing_address: {
      first_name: "",
      last_name: "",
      company: "",
      address_1: "",
      address_2: "",
      city: "",
      state: "",
      postcode: "",
      country: "GH",
      email: "",
      phone: "",
    },
    shipping_address: {
      first_name: "",
      last_name: "",
      company: "",
      address_1: "",
      address_2: "",
      city: "",
      state: "",
      postcode: "",
      country: "GH",
      phone: "",
    },
    payment_method: "card",
    shipping_method: "",
  });
  const [useShippingAddress, setUseShippingAddress] = useState(false);
  const [emailOptIn, setEmailOptIn] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadCheckoutData();
  }, []);

  const loadCheckoutData = async () => {
    try {
      setLoading(true);
      const [checkout, cart] = await Promise.all([
        getCheckout(), 
        getCart()
      ]);
      
      // All available payment methods from WooCommerce Store API schema
      const availablePaymentMethods = [
        { id: "paystack", title: "Pay with Card (Paystack)", description: "Secure payment with Paystack" },
        { id: "bacs", title: "Direct Bank Transfer", description: "Make payment directly into our bank account" },
        { id: "cheque", title: "Check Payments", description: "Pay by check" },
        { id: "cod", title: "Cash on Delivery", description: "Pay when you receive your order" },
      ];
      
      console.log("Checkout data:", checkout);
      console.log("Shipping rates:", checkout?.shipping_rates);
      console.log("Cart data:", cart);
      console.log("Cart shipping rates:", cart?.shipping_rates);
      console.log("Cart extensions:", cart?.extensions);
      
      setCheckoutData(checkout);
      setCartData(cart);
      setPaymentMethods(availablePaymentMethods);
      
      // Set default payment method from checkout or use first available
      const defaultPaymentMethod = checkout?.payment_method || availablePaymentMethods[0].id;
      setFormData(prev => ({
        ...prev,
        payment_method: defaultPaymentMethod,
      }));
      
      // Set default shipping method if available
      if (checkout?.shipping_rates?.length > 0) {
        const firstRate = checkout.shipping_rates[0];
        console.log("Setting default shipping method:", firstRate.rate_id);
        setFormData(prev => ({
          ...prev,
          shipping_method: firstRate.rate_id,
        }));
      }
    } catch (error) {
      console.error("Failed to load checkout:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (section, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  };

  const handleShippingMethodChange = async (methodId) => {
    try {
      setFormData(prev => ({
        ...prev,
        shipping_method: methodId
      }));
      
      // Update shipping method using dedicated endpoint
      await selectShippingRate(methodId);
      
      // Only reload cart data to get updated totals (no loading spinner)
      const cart = await getCart();
      setCartData(cart);
    } catch (error) {
      console.error("Error updating shipping method:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // Build shipping address - state is required for Ghana
      const shippingAddress = {
        first_name: formData.shipping_address.first_name || "",
        last_name: formData.shipping_address.last_name || "",
        address_1: formData.shipping_address.address_1 || "",
        city: formData.shipping_address.city || "",
        state: formData.shipping_address.state || "",
        postcode: formData.shipping_address.postcode || "",
        country: formData.shipping_address.country || "GH",
        phone: formData.shipping_address.phone || "",
      };
      
      // Add optional fields only if they have values
      if (formData.shipping_address.company) {
        shippingAddress.company = formData.shipping_address.company;
      }
      if (formData.shipping_address.address_2) {
        shippingAddress.address_2 = formData.shipping_address.address_2;
      }
      
      // Build billing address - copy from shipping but add email
      const billingAddress = {
        ...shippingAddress,
        email: formData.billing_address.email || "",
      };
      
      const orderData = {
        billing_address: billingAddress,
        shipping_address: shippingAddress,
        payment_method: formData.payment_method,
      };
      
      console.log("=== SUBMITTING ORDER ===");
      console.log("Raw form data:", formData);
      console.log("Billing Address:", billingAddress);
      console.log("Shipping Address:", shippingAddress);
      console.log("Full Order Data:", JSON.stringify(orderData, null, 2));

      const order = await processCheckout(orderData);
      
      // Redirect to order confirmation or payment page
      if (order.payment_result?.redirect_url) {
        window.location.href = order.payment_result.redirect_url;
      } else {
        window.location.href = `/order/${order.id}`;
      }
    } catch (error) {
      console.error("Failed to process checkout:", error);
      console.error("Error response:", error.response?.data);
      alert(`Failed to process order: ${error.response?.data?.message || error.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const cartItems = cartData?.items || [];
  const totals = cartData?.totals;
  
  // Extract shipping rates from checkout or cart packages
  let shippingRates = [];
  if (checkoutData?.shipping_rates) {
    shippingRates = checkoutData.shipping_rates;
  } else if (cartData?.shipping_rates) {
    // Cart shipping_rates is an array of packages, each with shipping_rates inside
    shippingRates = cartData.shipping_rates.flatMap(pkg => pkg.shipping_rates || []);
  }
  
  const selectedShippingRate = shippingRates.find(
    rate => rate.rate_id === formData.shipping_method
  );


  return (
    <>
      <TopLoadingBar isLoading={loading || submitting} />
      <main className="p-(--singleproduct-padding) min-h-screen">
        {loading ? (
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12">
              <div className="space-y-6 animate-pulse">
                <div className="h-8 bg-gray-200 rounded w-32"></div>
                <div className="space-y-4">
                  <div className="h-10 bg-gray-200 rounded"></div>
                  <div className="h-10 bg-gray-200 rounded"></div>
                  <div className="h-10 bg-gray-200 rounded"></div>
                </div>
              </div>
              <div className="space-y-6 animate-pulse">
                <div className="h-8 bg-gray-200 rounded w-48"></div>
                <div className="space-y-4">
                  <div className="h-20 bg-gray-200 rounded"></div>
                  <div className="h-20 bg-gray-200 rounded"></div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12">
              {/* Left Column - Forms */}
              <div className="space-y-8">
                {/* Contact Section */}
                <section>
                  <p className="font-medium mb-4">Contact</p>
                  <div className="space-y-4">
                    <input
                      type="email"
                      placeholder="Email"
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded focus:outline-none focus:border-black"
                      value={formData.billing_address.email}
                      onChange={(e) => handleInputChange("billing_address", "email", e.target.value)}
                    />
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={emailOptIn}
                        onChange={(e) => setEmailOptIn(e.target.checked)}
                        className="accent-black"
                      />
                      <span>Email me with news and offers</span>
                    </label>
                  </div>
                </section>

                {/* Delivery Section */}
                <section>
                  <p className="font-medium mb-4">Delivery</p>
                  <div className="space-y-4">
                    <select
                      className="w-full px-4 py-3 border border-gray-300 rounded focus:outline-none focus:border-black"
                      value={formData.shipping_address.country}
                      onChange={(e) => handleInputChange("shipping_address", "country", e.target.value)}
                    >
                      <option value="GH">Ghana</option>
                      <option value="NG">Nigeria</option>
                      <option value="US">United States</option>
                      <option value="GB">United Kingdom</option>
                    </select>

                    <div className="grid grid-cols-2 gap-4">
                      <input
                        type="text"
                        placeholder="First Name"
                        required
                        className="px-4 py-3 border border-gray-300 rounded focus:outline-none focus:border-black"
                        value={formData.shipping_address.first_name}
                        onChange={(e) => handleInputChange("shipping_address", "first_name", e.target.value)}
                      />
                      <input
                        type="text"
                        placeholder="Last Name"
                        required
                        className="px-4 py-3 border border-gray-300 rounded focus:outline-none focus:border-black"
                        value={formData.shipping_address.last_name}
                        onChange={(e) => handleInputChange("shipping_address", "last_name", e.target.value)}
                      />
                    </div>

                    <input
                      type="text"
                      placeholder="Address"
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded focus:outline-none focus:border-black"
                      value={formData.shipping_address.address_1}
                      onChange={(e) => handleInputChange("shipping_address", "address_1", e.target.value)}
                    />

                    <input
                      type="text"
                      placeholder="Apartment, suite, etc. (optional)"
                      className="w-full px-4 py-3 border border-gray-300 rounded focus:outline-none focus:border-black"
                      value={formData.shipping_address.address_2}
                      onChange={(e) => handleInputChange("shipping_address", "address_2", e.target.value)}
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <input
                        type="text"
                        placeholder="City"
                        required
                        className="px-4 py-3 border border-gray-300 rounded focus:outline-none focus:border-black"
                        value={formData.shipping_address.city}
                        onChange={(e) => handleInputChange("shipping_address", "city", e.target.value)}
                      />
                      <input
                        type="text"
                        placeholder="Postal Code"
                        className="px-4 py-3 border border-gray-300 rounded focus:outline-none focus:border-black"
                        value={formData.shipping_address.postcode}
                        onChange={(e) => handleInputChange("shipping_address", "postcode", e.target.value)}
                      />
                    </div>

                    <input
                      type="text"
                      placeholder="State / Region"
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded focus:outline-none focus:border-black"
                      value={formData.shipping_address.state}
                      onChange={(e) => handleInputChange("shipping_address", "state", e.target.value)}
                    />

                    <input
                      type="tel"
                      placeholder="Phone Number"
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded focus:outline-none focus:border-black"
                      value={formData.shipping_address.phone}
                      onChange={(e) => handleInputChange("shipping_address", "phone", e.target.value)}
                    />
                  </div>
                </section>

                {/* Shipping Method Section */}
                <section>
                  <p className="font-medium mb-4">Shipping method</p>
                  {shippingRates.length === 0 ? (
                    <div className="p-4 border border-gray-300 rounded bg-gray-50">
                      <p className="text-sm text-gray-600">
                        No shipping methods available. Please contact support.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {shippingRates.map((rate) => (
                        <label
                          key={rate.rate_id}
                          className="flex items-center justify-between p-4 border border-gray-300 rounded cursor-pointer hover:border-black transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <input
                              type="radio"
                              name="shipping_method"
                              value={rate.rate_id}
                              checked={formData.shipping_method === rate.rate_id}
                              onChange={() => handleShippingMethodChange(rate.rate_id)}
                              className="accent-black"
                            />
                            <div>
                              <div className="font-medium">{rate.name}</div>
                              {rate.delivery_time && (
                                <div className="text-sm text-gray-600">{rate.delivery_time}</div>
                              )}
                            </div>
                          </div>
                          <span className="font-medium">
                            {rate.price === "0" ? "Free" : `${rate.currency_symbol}${(parseInt(rate.price) / 100).toFixed(2)}`}
                          </span>
                        </label>
                      ))}
                    </div>
                  )}
                </section>

                {/* Payment Section */}
                <section>
                  <p className="font-medium mb-4">Payment</p>
                  <p className="text-sm text-gray-600 mb-4">All transactions are secure and encrypted.</p>
                  
                  <div className="space-y-3">
                    {paymentMethods.length > 0 ? (
                      paymentMethods.map((method) => (
                        <label
                          key={method.id}
                          className="flex items-center justify-between p-4 border border-gray-300 rounded cursor-pointer hover:border-black transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <input
                              type="radio"
                              name="payment_method"
                              value={method.id}
                              checked={formData.payment_method === method.id}
                              onChange={(e) => setFormData(prev => ({ ...prev, payment_method: e.target.value }))}
                              className="accent-black"
                            />
                            <div>
                              <div className="font-medium">{method.title}</div>
                              {method.description && (
                                <div className="text-sm text-gray-600" dangerouslySetInnerHTML={{ __html: method.description }} />
                              )}
                            </div>
                          </div>
                        </label>
                      ))
                    ) : (
                      <div className="p-4 border border-gray-300 rounded text-center text-gray-600">
                        No payment methods available
                      </div>
                    )}
                  </div>

                  <label className="flex items-center gap-2 mt-4 text-sm">
                    <input
                      type="checkbox"
                      checked={useShippingAddress}
                      onChange={(e) => setUseShippingAddress(e.target.checked)}
                      className="accent-black"
                    />
                    <span>Use shipping address as billing address</span>
                  </label>
                </section>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-black text-white py-4 rounded font-medium hover:bg-gray-800 transition-colors disabled:opacity-50"
                >
                  {submitting ? "Processing..." : "Pay Now"}
                </button>
              </div>

              {/* Right Column - Order Summary */}
              <div>
                <div className="sticky top-4">
                  <h2 className="text-xl font-semibold mb-6">Order Summary</h2>
                  
                  {/* Cart Items */}
                  <div className="space-y-4 mb-6">
                    {cartItems.map((item) => (
                      <div key={item.key} className="flex gap-4">
                        <div className="relative">
                          <img
                            src={item.images?.[0]?.thumbnail || item.images?.[0]?.src}
                            alt={item.name}
                            className="w-16 h-16 object-cover rounded border border-gray-300"
                          />
                          <span className="absolute -top-2 -right-2 bg-gray-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                            {item.quantity}
                          </span>
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-sm">{item.name}</p>
                          {item.variation?.map((v, idx) => (
                            <p key={v.attribute || idx} className="text-xs text-gray-600">
                              {v.attribute}: {v.value}
                            </p>
                          ))}
                        </div>
                        <p className="font-medium">
                          {item.prices?.currency_symbol}
                          {(parseInt(item.prices?.price || 0) / Math.pow(10, item.prices?.currency_minor_unit || 2) * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Totals */}
                  <div className="border-t border-gray-300 pt-4 space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span className="font-medium">
                        {totals?.currency_symbol}
                        {(parseInt(totals?.total_items || 0) / 100).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tax</span>
                      <span className="font-medium">
                        {totals?.currency_symbol}
                        {(parseInt(totals?.total_tax || 0) / 100).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Shipping</span>
                      <span className="font-medium">
                        {selectedShippingRate
                          ? selectedShippingRate.price === "0"
                            ? "Free"
                            : `${totals?.currency_symbol}${(parseInt(selectedShippingRate.price) / 100).toFixed(2)}`
                          : "Select shipping method"}
                      </span>
                    </div>
                  </div>

                  <div className="border-t border-gray-300 mt-4 pt-4 flex justify-between text-lg font-semibold">
                    <span>Total</span>
                    <span>
                      {totals?.currency_symbol}
                      {(() => {
                        const subtotal = parseInt(totals?.total_price || 0);
                        const shippingCost = selectedShippingRate ? parseInt(selectedShippingRate.price || 0) : 0;
                        return ((subtotal + shippingCost) / 100).toFixed(2);
                      })()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </form>
        )}
      </main>
    </>
  );
}

export default Checkout;
