import woo from "../lib/woocommerce";

const CACHE_KEY = "products_cache";
const CACHE_DURATION = 5 * 60 * 1000; // 2 minutes

// Fetch products list
export async function fetchProducts(params = {}) {
  try {
    // Check cache first for default params only
    if (Object.keys(params).length === 0) {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const { data, timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp < CACHE_DURATION) {
          return data;
        }
      }
    }

    // Fetch from API
    const response = await woo.get("/products", {
      params: {
        per_page: 20,
        status: "publish",
        orderby: "date",
        order: "desc",
        ...params,
      },
    });

    // Store in cache only for default params
    if (Object.keys(params).length === 0) {
      localStorage.setItem(
        CACHE_KEY,
        JSON.stringify({
          data: response.data,
          timestamp: Date.now(),
        })
      );
    }

    return response.data;
  } catch (error) {
    console.error("Error fetching products:", error);
    throw error;
  }
}

// Fetch single product by slug
export async function fetchSingleProduct(slug) {
  try {
    const cacheKey = `product_${slug}`;

    // Check cache first
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      const { data, timestamp } = JSON.parse(cached);
      if (Date.now() - timestamp < CACHE_DURATION) {
        return data;
      }
    }

    const response = await woo.get("/products", {
      params: {
        slug: slug,
        catalog_visibility: "visible",
        _fields:
          "id,name,prices,images,description,short_description,is_in_stock,categories,tags,slug,attributes,variations,type,parent",
      },
    });

    if (response.data && response.data.length > 0) {
      // Filter out variation products (they have a parent ID)
      const parentProducts = response.data.filter((p) => p.parent === 0);
      const product = parentProducts[0] || response.data[0];

      // Store in cache
      localStorage.setItem(
        cacheKey,
        JSON.stringify({
          data: product,
          timestamp: Date.now(),
        })
      );

      return product;
    }

    throw new Error("Product not found");
  } catch (error) {
    console.error("Error fetching single product:", error);
    throw error;
  }
}

// Fetch single product by ID
export async function fetchProductById(productId) {
  try {
    const response = await woo.get(`/products/${productId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching product by ID:", error);
    throw error;
  }
}

// Fetch product categories
export async function fetchCategories(params = {}) {
  try {
    const response = await woo.get("/products/categories", {
      params: {
        per_page: 100,
        hide_empty: true,
        ...params,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching categories:", error);
    throw error;
  }
}

// Fetch single category
export async function fetchCategoryById(categoryId) {
  try {
    const response = await woo.get(`/products/categories/${categoryId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching category:", error);
    throw error;
  }
}

// Fetch product tags
export async function fetchTags(params = {}) {
  try {
    const response = await woo.get("/products/tags", {
      params: {
        per_page: 100,
        hide_empty: true,
        ...params,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching tags:", error);
    throw error;
  }
}

// Fetch product attributes
export async function fetchAttributes() {
  try {
    const response = await woo.get("/products/attributes");
    return response.data;
  } catch (error) {
    console.error("Error fetching attributes:", error);
    throw error;
  }
}

// Fetch attribute terms
export async function fetchAttributeTerms(attributeId, params = {}) {
  try {
    const response = await woo.get(`/products/attributes/${attributeId}/terms`, {
      params: {
        per_page: 100,
        ...params,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching attribute terms:", error);
    throw error;
  }
}

// Fetch product reviews
export async function fetchReviews(params = {}) {
  try {
    const response = await woo.get("/products/reviews", {
      params: {
        per_page: 10,
        ...params,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching reviews:", error);
    throw error;
  }
}

// Fetch product collection data (aggregated data like price ranges, counts)
export async function fetchCollectionData(params = {}) {
  try {
    const response = await woo.get("/products/collection-data", {
      params: {
        calculate_price_range: true,
        calculate_stock_status_counts: true,
        calculate_rating_counts: true,
        ...params,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching collection data:", error);
    throw error;
  }
}
