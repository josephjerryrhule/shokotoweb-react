import woo from "../lib/woocommerce";

const CACHE_KEY = "products_cache";
const CACHE_DURATION = 2 * 60 * 1000; // 2 minutes

export async function fetchProducts() {
  try {
    // Check cache first
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      const { data, timestamp } = JSON.parse(cached);
      if (Date.now() - timestamp < CACHE_DURATION) {
        return data;
      }
    }

    // Fetch from API
    const response = await woo.get("/products", {
      params: {
        per_page: 10,
        status: "publish",
        orderby: "date",
        order: "desc",
        _fields: "id,name,price,images,slug,stock_status",
      },
    });

    // Store in cache
    localStorage.setItem(
      CACHE_KEY,
      JSON.stringify({
        data: response.data,
        timestamp: Date.now(),
      })
    );

    return response.data;
  } catch (error) {
    console.error("Error fetching products:", error);
    throw error;
  }
}
