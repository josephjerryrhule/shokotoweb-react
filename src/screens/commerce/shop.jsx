import React, { useEffect, useState, useRef, useCallback } from "react";
import { useParams } from "react-router";
import Breadcrumb from "../../components/Breadcrumb";
import ProductCard from "../../components/ProductCard";
import TopLoadingBar from "../../components/TopLoadingBar";
import ShopFilters from "../../components/shop/ShopFilters";
import { 
  fetchProducts, 
  fetchCategories, 
  fetchAttributes, 
  fetchAttributeTerms 
} from "../../api/products";

function Shop() {
  const { slug: categorySlug } = useParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [selectedFilters, setSelectedFilters] = useState({});
  const [filterData, setFilterData] = useState({ categories: [], attributes: [] });
  const observerTarget = useRef(null);

  const buildFilterParams = useCallback(() => {
    const params = {};

    // Handle categories
    if (selectedFilters.categories?.length > 0) {
      params.category = selectedFilters.categories.join(",");
    }

    // Handle attributes (size, color, etc.)
    Object.keys(selectedFilters).forEach((key) => {
      if (key.startsWith("attribute_") && selectedFilters[key]?.length > 0) {
        const attributeId = key.replace("attribute_", "");
        // Find the attribute to get its slug for API call
        const attribute = filterData.attributes.find(attr => attr.id.toString() === attributeId);
        if (attribute) {
          // WooCommerce attributes use taxonomy (e.g., "pa_color") - strip "pa_" prefix
          const slug = attribute.slug || (attribute.taxonomy ? attribute.taxonomy.replace('pa_', '') : null);
          if (slug) {
            params[`attribute_${slug}`] = selectedFilters[key].join(",");
          }
        }
      }
    });

    return params;
  }, [selectedFilters, filterData.attributes]);

  const loadProducts = useCallback(
    async (pageNum, resetProducts = false) => {
      if (loading || (!hasMore && !resetProducts)) return;

      setLoading(true);
      try {
        const filterParams = buildFilterParams();
        const data = await fetchProducts({
          per_page: 12,
          page: pageNum,
          ...filterParams,
        });

        if (data.length === 0) {
          setHasMore(false);
        } else {
          setProducts((prev) => (resetProducts ? data : [...prev, ...data]));
          if (data.length < 12) {
            setHasMore(false);
          }
        }
      } catch (error) {
        console.error("Failed to fetch products:", error);
      } finally {
        setLoading(false);
      }
    },
    [loading, hasMore, buildFilterParams]
  );

  // Load initial data (both products and filters)
  useEffect(() => {
    const loadInitialData = async () => {
      setInitialLoading(true);
      try {
        // Check if we have cached filter data
        const cachedFilterData = localStorage.getItem('shop_filter_data');
        const cacheTimestamp = localStorage.getItem('shop_filter_data_timestamp');
        const cacheAge = cacheTimestamp ? Date.now() - parseInt(cacheTimestamp) : Infinity;
        const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

        let categoriesData, attributesWithTerms;
        
        if (cachedFilterData && cacheAge < CACHE_DURATION) {
          // Use cached filter data
          const cached = JSON.parse(cachedFilterData);
          categoriesData = cached.categories;
          attributesWithTerms = cached.attributes;
          setFilterData({ categories: categoriesData, attributes: attributesWithTerms });
        } else {
          // Fetch filter data
          const [categoriesDataFetch, attributesData] = await Promise.all([
            fetchCategories(),
            fetchAttributes(),
          ]);

          // Fetch terms for each attribute
          attributesWithTerms = await Promise.all(
            attributesData.map(async (attr) => {
              try {
                const terms = await fetchAttributeTerms(attr.id);
                return { ...attr, terms };
              } catch (error) {
                console.error(`Failed to fetch terms for ${attr.name}:`, error);
                return { ...attr, terms: [] };
              }
            })
          );

          categoriesData = categoriesDataFetch;
          
          // Cache the filter data
          localStorage.setItem('shop_filter_data', JSON.stringify({
            categories: categoriesData,
            attributes: attributesWithTerms
          }));
          localStorage.setItem('shop_filter_data_timestamp', Date.now().toString());
          
          setFilterData({ categories: categoriesData, attributes: attributesWithTerms });
        }

        // Build initial params with category if present in URL
        const initialParams = { per_page: 12, page: 1 };
        if (categorySlug) {
          initialParams.category = categorySlug;
        }

        // Fetch products
        const productsData = await fetchProducts(initialParams);
        
        // Set all data at once
        setProducts(productsData);
        
        // Set initial filter if category slug is in URL
        if (categorySlug) {
          setSelectedFilters({ categories: [categorySlug] });
        }
        
        setHasMore(productsData.length === 12);
      } catch (error) {
        console.error("Failed to load initial data:", error);
      } finally {
        setInitialLoading(false);
      }
    };

    loadInitialData();
  }, [categorySlug]);

  // Reset products when filters change
  const isInitialMount = useRef(true);
  
  useEffect(() => {
    // Skip initial mount since data is loaded in the initial useEffect
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    
    setProducts([]);
    setPage(1);
    setHasMore(true);
    loadProducts(1, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedFilters]);

  useEffect(() => {
    // Don't set up observer until initial loading is complete
    if (initialLoading) return;
    
    const currentTarget = observerTarget.current;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          setPage((prev) => prev + 1);
        }
      },
      { threshold: 0.1 }
    );

    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [hasMore, loading, page, initialLoading]);

  useEffect(() => {
    if (page > 1) {
      loadProducts(page, false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const handleFilterChange = (newFilters) => {
    setSelectedFilters(newFilters);
  };

  // Get current category name
  const currentCategory = categorySlug 
    ? filterData.categories.find(cat => cat.slug === categorySlug)
    : null;
  const pageTitle = currentCategory?.name || "Must haves from shoko.to";

  return (
    <>
      <TopLoadingBar isLoading={initialLoading} />
      <main className="p-(--singleproduct-padding) min-h-screen">
        {initialLoading ? (
          // Full page loading skeleton
          <>
            {/* Breadcrumb skeleton */}
            <div className="flex items-center gap-2 mb-6 animate-pulse">
              <div className="h-4 w-16 bg-gray-200 rounded"></div>
              <span className="text-gray-400">|</span>
              <div className="h-4 w-20 bg-gray-200 rounded"></div>
            </div>

            {/* Title skeleton */}
            <div className="mb-8 animate-pulse">
              <div className="h-8 w-64 bg-gray-200 rounded"></div>
            </div>

            {/* Content area skeleton */}
            <div className="flex lg:flex-row flex-col gap-12.5">
              {/* Filter skeleton */}
              <div className="filter-area lg:w-1/4 w-full">
                <div className="space-y-4 animate-pulse">
                  <div className="h-10 bg-gray-200 rounded"></div>
                  <div className="h-10 bg-gray-200 rounded"></div>
                  <div className="h-10 bg-gray-200 rounded"></div>
                </div>
              </div>

              {/* Products skeleton */}
              <div className="products-loop-area lg:w-3/4 w-full">
                <div className="grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-4.25">
                  {Array.from({ length: 12 }).map((_, index) => (
                    <div
                      key={`skeleton-${index}`}
                      className="relative p-2.5 min-h-(--productslide-height) flex items-end animate-pulse"
                    >
                      <div className="absolute inset-0 m-2.5 bg-gray-300 rounded"></div>
                      <div className="relative bg-white p-3.5 w-full flex gap-4 justify-between">
                        <div className="h-4 bg-gray-200 rounded flex-1"></div>
                        <div className="h-4 w-16 bg-gray-200 rounded"></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        ) : (
          <>
            <Breadcrumb
              items={
                currentCategory
                  ? [
                      { label: "Home", link: "/" },
                      { label: "Shop", link: "/shop" },
                      { label: currentCategory.name },
                    ]
                  : [
                      { label: "Home", link: "/" },
                      { label: "Must haves from shoko.to" },
                    ]
              }
            />

            <h1 className="max-w-125 mb-8">
              {currentCategory ? (
                currentCategory.name
              ) : (
                <>Must haves from <em className="font-medium">shoko.to</em></>
              )}
            </h1>

            <div className="flex lg:flex-row flex-col gap-12.5 items-stretch">
              <div className="filter-area lg:sticky top-20 lg:w-1/4 w-full h-full">
                <ShopFilters
                  selectedFilters={selectedFilters}
                  onFilterChange={handleFilterChange}
                  filterData={filterData}
                  loading={initialLoading}
                />
              </div>
              <div className="products-loop-area lg:w-3/4 w-full">
                {loading && products.length === 0 ? (
                  // Loading skeleton (when filtering)
                  <div className="grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-4.25">
                    {Array.from({ length: 12 }).map((_, index) => (
                      <div
                        key={`skeleton-${index}`}
                        className="relative p-2.5 min-h-(--productslide-height) flex items-end animate-pulse"
                      >
                        <div className="absolute inset-0 m-2.5 bg-gray-300 rounded"></div>
                        <div className="relative bg-white p-3.5 w-full flex gap-4 justify-between">
                          <div className="h-4 bg-gray-200 rounded flex-1"></div>
                          <div className="h-4 w-16 bg-gray-200 rounded"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <>
                    <div className="grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-4.25">
                      {products.map((product, index) => (
                        <ProductCard
                          key={`product-id-${product.id}-${index}`}
                          product={product}
                        />
                      ))}
                    </div>

                    {/* Loading indicator - only for pagination */}
                    {loading && hasMore && products.length > 0 && (
                  <div className="flex justify-center items-center py-8">
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="animate-spin"
                    >
                      <g clipPath="url(#clip0_315_2667)">
                        <path
                          fillRule="evenodd"
                          clipRule="evenodd"
                          d="M11.5587 0.434995C11.2257 0.542995 11.0337 0.734995 10.9407 1.04849C10.8882 1.22399 10.8792 1.63199 10.8792 3.76199C10.8792 6.58349 10.8762 6.54749 11.1642 6.83549C11.5497 7.21949 12.4497 7.21949 12.8352 6.83549C13.1232 6.54749 13.1202 6.58349 13.1202 3.76199C13.1202 1.03199 13.1157 0.983995 12.8937 0.719995C12.7077 0.499495 12.5082 0.425995 12.0597 0.413995C11.8924 0.404567 11.7246 0.411601 11.5587 0.434995ZM4.12922 3.39899C3.89222 3.50699 3.54272 3.84899 3.42122 4.09199C3.35924 4.21347 3.32544 4.34735 3.32232 4.48369C3.31921 4.62003 3.34686 4.75531 3.40322 4.87949C3.51422 5.127 7.00022 8.62499 7.27472 8.76449C7.66322 8.96399 8.06222 8.8665 8.46422 8.47349C8.86022 8.08649 8.96522 7.66649 8.76422 7.27499C8.62472 7.00049 5.12672 3.51449 4.87922 3.40349C4.76095 3.35228 4.63356 3.32548 4.50468 3.32471C4.3758 3.32394 4.24809 3.3492 4.12922 3.39899ZM19.2792 3.423C19.0947 3.50849 18.7797 3.80399 17.2767 5.31149C15.8952 6.69599 15.4737 7.14299 15.4062 7.28999C15.3501 7.41188 15.3212 7.54449 15.3215 7.67866C15.3217 7.81283 15.3512 7.94533 15.4077 8.06699C15.5127 8.29199 15.8577 8.64599 16.0902 8.76749C16.3257 8.89049 16.6752 8.88899 16.9197 8.76449C17.1702 8.63549 20.6352 5.1705 20.7642 4.91999C20.8257 4.79103 20.8579 4.6501 20.8587 4.50725C20.8595 4.36439 20.8287 4.22312 20.7687 4.09349C20.6027 3.8159 20.3682 3.58555 20.0877 3.42449C19.9636 3.35744 19.8247 3.3222 19.6837 3.32194C19.5426 3.32168 19.4036 3.3564 19.2792 3.423ZM1.04822 10.938C0.605719 11.0775 0.386719 11.43 0.386719 11.9985C0.388219 12.579 0.604219 12.927 1.04672 13.059C1.22372 13.1115 1.61822 13.1205 3.76172 13.1205C5.99522 13.1205 6.29372 13.113 6.47672 13.053C6.61114 13.0088 6.73331 12.9337 6.83336 12.8336C6.93341 12.7336 7.00855 12.6114 7.05272 12.477C7.18172 12.0795 7.11722 11.5155 6.91172 11.2365C6.82935 11.1469 6.7325 11.0719 6.62522 11.0145L6.41972 10.9005L3.82022 10.8915C1.72772 10.8855 1.18622 10.8945 1.04822 10.938ZM17.6172 10.917C17.4144 10.9729 17.2311 11.084 17.0877 11.238C16.8822 11.5155 16.8177 12.0795 16.9467 12.477C17.0337 12.747 17.2527 12.966 17.5227 13.053C17.7057 13.113 18.0042 13.1205 20.2377 13.1205C22.3812 13.1205 22.7757 13.1115 22.9527 13.059C23.3952 12.927 23.6112 12.579 23.6127 11.9985C23.6127 11.421 23.3922 11.0745 22.9347 10.9365C22.7802 10.89 22.2957 10.881 20.2437 10.884C18.8667 10.887 17.6847 10.902 17.6172 10.917ZM7.27922 15.423C7.09472 15.5085 6.77972 15.804 5.27672 17.3115C3.89522 18.696 3.47372 19.143 3.40622 19.29C3.35013 19.4119 3.32122 19.5445 3.32148 19.6787C3.32174 19.8128 3.35116 19.9453 3.40772 20.067C3.51272 20.292 3.85772 20.646 4.09022 20.7675C4.32572 20.8905 4.67522 20.889 4.91972 20.7645C5.17022 20.6355 8.63522 17.1705 8.76422 16.92C8.82566 16.791 8.85791 16.6501 8.85869 16.5072C8.85947 16.3644 8.82875 16.2231 8.76872 16.0935C8.6027 15.8159 8.36822 15.5855 8.08772 15.4245C7.96358 15.3574 7.82475 15.3222 7.68366 15.3219C7.54256 15.3217 7.40361 15.3564 7.27922 15.423ZM16.1292 15.399C15.8922 15.507 15.5427 15.849 15.4212 16.092C15.3592 16.2135 15.3254 16.3474 15.3223 16.4837C15.3192 16.62 15.3469 16.7553 15.4032 16.8795C15.5142 17.127 19.0002 20.625 19.2747 20.7645C19.6632 20.964 20.0622 20.8665 20.4642 20.4735C20.8602 20.0865 20.9652 19.6665 20.7642 19.275C20.6247 19.0005 17.1267 15.5145 16.8792 15.4035C16.7609 15.3523 16.6336 15.3255 16.5047 15.3247C16.3758 15.3239 16.2481 15.3492 16.1292 15.399ZM11.6172 16.9155C11.4146 16.9726 11.2314 17.0841 11.0877 17.238C10.8807 17.517 10.8792 17.5365 10.8792 20.2335C10.8792 22.3815 10.8882 22.776 10.9407 22.953C11.0727 23.3955 11.4222 23.6115 11.9997 23.6115C12.5772 23.6115 12.9267 23.3955 13.0587 22.953C13.1517 22.635 13.1502 17.8125 13.0557 17.535C13.0267 17.4231 12.9735 17.3189 12.8999 17.2298C12.8263 17.1407 12.7341 17.0687 12.6297 17.019C12.4647 16.929 12.3687 16.9065 12.0852 16.896C11.929 16.8866 11.7722 16.8931 11.6172 16.9155Z"
                          fill="black"
                        />
                      </g>
                      <defs>
                        <clipPath id="clip0_315_2667">
                          <rect width="24" height="24" fill="white" />
                        </clipPath>
                      </defs>
                    </svg>
                  </div>
                )}

                    {/* Intersection observer target */}
                    <div ref={observerTarget} className="h-10" />
                  </>
                )}
              </div>
            </div>
          </>
        )}
      </main>
    </>
  );
}

export default Shop;
