import React, { useEffect, useState } from "react";
import { fetchSingleProduct, fetchProducts } from "../../api/products";
import { addToCart } from "../../api/cart";
import { useParams } from "react-router";
import toast from "react-hot-toast";
import TopLoadingBar from "../../components/TopLoadingBar";
import Breadcrumb from "../../components/Breadcrumb";
import ProductGallery from "../../components/product/ProductGallery";
import ProductForm from "../../components/product/ProductForm";
import RecommendedProducts from "../../components/product/RecommendedProducts";

function SingleProduct() {
  const { slug } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedVariation, setSelectedVariation] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const [itemAdded, setItemAdded] = useState(false);
  const [recommendedProducts, setRecommendedProducts] = useState([]);

  // Get current price display
  const getCurrentPrice = () => {
    // For variable products, show price range
    if (product?.type === "variable") {
      const priceRange = product.prices?.price_range;
      if (priceRange && priceRange.min_amount !== priceRange.max_amount) {
        const minPrice = (
          parseInt(priceRange.min_amount) /
          Math.pow(10, product.prices.currency_minor_unit || 2)
        ).toFixed(2);
        const maxPrice = (
          parseInt(priceRange.max_amount) /
          Math.pow(10, product.prices.currency_minor_unit || 2)
        ).toFixed(2);
        return {
          isRange: true,
          minPrice,
          maxPrice,
          currency_code: product.prices.currency_code || "₵",
        };
      }
    }

    // For simple products, show base price
    return {
      isRange: false,
      price: product?.prices?.price,
      currency_code: product?.prices?.currency_code || "₵",
      currency_minor_unit: product?.prices?.currency_minor_unit || 2,
    };
  };

  useEffect(() => {
    if (!slug) return;

    // Show loading and reset states when slug changes
    setLoading(true);
    setProduct(null);
    setRecommendedProducts([]);
    setSelectedVariation(null);
    setQuantity(1);

    const loadProductAndRecommendations = async () => {
      try {
        // Fetch the single product first
        const productData = await fetchSingleProduct(slug);

        // Immediately start fetching recommended products if category exists
        const recommendedPromise =
          productData.categories && productData.categories.length > 0
            ? fetchProducts({
                category: productData.categories[0].slug,
                per_page: 20,
                exclude: [productData.id],
              }).catch(() => [])
            : Promise.resolve([]);

        // Wait for recommended products to finish
        const recommendedData = await recommendedPromise;

        // Update all state at once
        setProduct(productData);
        setRecommendedProducts(recommendedData);
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch product:", error);
        setProduct(null);
        setLoading(false);
      }
    };

    loadProductAndRecommendations();
  }, [slug]);

  const handleAddToCart = async (e) => {
    e.preventDefault();

    if (product.type === "variable" && !selectedVariation) {
      toast.error("Please select a size");
      return;
    }

    setAddingToCart(true);
    try {
      // Add to cart - WooCommerce will handle updating quantity if item exists
      await addToCart(product.id, quantity, selectedVariation?.id || null);

      // Get price
      const price = product.prices?.price
        ? (
            parseInt(product.prices.price) /
            Math.pow(10, product.prices.currency_minor_unit || 2)
          ).toFixed(2)
        : "0.00";
      const currencySymbol = product.prices?.currency_code || "₵";

      // Show custom success toast
      toast.custom(
        (t) => (
          <div
            className={`${
              t.visible ? "animate-enter" : "animate-leave"
            } max-w-md w-full bg-white shadow-lg rounded-[1px] pointer-events-auto flex`}
          >
            <div className="flex-1 w-0 p-4">
              <div className="flex items-start">
                <div className="shrink-0 pt-0.5">
                  <img
                    className="h-16 w-16 rounded object-cover"
                    src={product.images?.[0]?.src}
                    alt={product.name}
                  />
                </div>
                <div className="ml-3 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-[10px] font-medium text-gray-900">
                      Added to cart successfully
                    </p>
                  </div>
                  <p className="mt-1 text-[10px] text-gray-700 font-semibold line-clamp-1">
                    {product.name}
                  </p>
                  <p className="mt-1 text-[10px] text-gray-500">
                    {currencySymbol} {price} × {quantity}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex border-l border-gray-200">
              <button
                onClick={() => toast.dismiss(t.id)}
                className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-gray-600 hover:text-gray-500 focus:outline-none"
              >
                Close
              </button>
            </div>
          </div>
        ),
        { duration: 4000 }
      );

      // Show "Added to cart" feedback
      setItemAdded(true);
      setTimeout(() => {
        setItemAdded(false);
      }, 2000);
    } catch (error) {
      console.error("Failed to add to cart", error);

      // Check if it's a quantity limit error
      const errorMessage = error.response?.data?.message;
      if (errorMessage) {
        // Remove HTML entities and tags for cleaner display
        const cleanMessage = errorMessage
          .replace(/&quot;/g, '"')
          .replace(/&lt;/g, "<")
          .replace(/&gt;/g, ">")
          .replace(/<[^>]*>/g, "");
        toast.error(cleanMessage);
      } else {
        toast.error("Failed to add to cart. Please try again.");
      }
    } finally {
      setAddingToCart(false);
    }
  };

  return (
    <>
      <TopLoadingBar isLoading={loading} />
      <main
        className="p-(--singleproduct-padding) min-h-screen"
        data-product-item={product?.id}
        data-product-name={product?.name}
        key={slug}
      >
        {!product ? (
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-48 mb-8"></div>

            {/* Hero Section Skeleton */}
            <div className="w-full flex items-start gap-12 md:flex-row flex-col">
              <div className="gallery-area w-full">
                <div className="flex gap-4 lg:flex-row flex-col-reverse">
                  {/* Thumbnails Skeleton */}
                  <div className="lg:w-24 w-full">
                    <div className="hidden lg:flex lg:flex-col gap-2.5">
                      <div className="w-full h-24 bg-gray-300 rounded"></div>
                      <div className="w-full h-24 bg-gray-300 rounded"></div>
                      <div className="w-full h-24 bg-gray-300 rounded"></div>
                      <div className="w-full h-24 bg-gray-300 rounded"></div>
                    </div>
                    <div className="flex lg:hidden gap-2.5">
                      <div className="w-24 h-24 bg-gray-300 rounded"></div>
                      <div className="w-24 h-24 bg-gray-300 rounded"></div>
                      <div className="w-24 h-24 bg-gray-300 rounded"></div>
                      <div className="w-24 h-24 bg-gray-300 rounded"></div>
                    </div>
                  </div>

                  {/* Main Image Skeleton */}
                  <div className="flex-1">
                    <div className="w-full aspect-square bg-gray-300 rounded"></div>
                  </div>
                </div>
              </div>

              <div className="product-info-area flex flex-col gap-16 w-full">
                <div className="title-price-area flex flex-col gap-4">
                  <div className="h-12 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-8 bg-gray-200 rounded w-32"></div>
                </div>
                <div className="space-y-3">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                  <div className="h-4 bg-gray-200 rounded w-4/6"></div>
                </div>
                <div className="space-y-4">
                  <div className="h-10 bg-gray-200 rounded w-40"></div>
                  <div className="flex gap-2">
                    <div className="h-10 w-16 bg-gray-200 rounded"></div>
                    <div className="h-10 w-16 bg-gray-200 rounded"></div>
                    <div className="h-10 w-16 bg-gray-200 rounded"></div>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="h-12 w-32 bg-gray-200 rounded"></div>
                  <div className="h-12 flex-1 bg-gray-200 rounded"></div>
                </div>
              </div>
            </div>

            {/* Recommended Section Skeleton */}
            <div className="pt-30">
              <div className="h-8 bg-gray-200 rounded w-48 mb-5"></div>
              <div className="flex gap-4 overflow-hidden">
                {Array.from({ length: 5 }).map((_, index) => (
                  <div
                    key={`rec-skeleton-${index}`}
                    className="min-w-70 min-h-(--productslide-height) relative"
                  >
                    <div className="absolute inset-0 bg-gray-300 rounded"></div>
                    <div className="absolute bottom-0 left-0 right-0 bg-white p-3.5 flex gap-4 justify-between">
                      <div className="h-4 bg-gray-200 rounded flex-1"></div>
                      <div className="h-4 w-16 bg-gray-200 rounded"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : product ? (
          <>
            <Breadcrumb
              items={[
                { label: "Home", link: "/" },
                { label: "Shop", link: "/shop" },
                { label: product.name, link: null },
              ]}
            />

            {/* Hero Section */}
            <div className="w-full flex items-start gap-12 lg:flex-row flex-col">
              <div className="gallery-area w-full lg:w-3/5">
                <ProductGallery
                  images={product.images}
                  productName={product.name}
                />
              </div>

              <div className="product-info-area flex flex-col gap-10 lg:gap-16 w-full">
                <div className="title-price-area flex flex-col gap-4">
                  <h1>{product.name}</h1>
                  <span className="text-black whitespace-nowrap text-(length:--pricetext)">
                    {(() => {
                      const currentPrice = getCurrentPrice();
                      if (currentPrice.isRange) {
                        return `${currentPrice.currency_code}${currentPrice.minPrice} – ${currentPrice.currency_code}${currentPrice.maxPrice}`;
                      }
                      return `${currentPrice.currency_code}${(
                        parseInt(currentPrice.price) /
                        Math.pow(10, currentPrice.currency_minor_unit)
                      ).toFixed(2)}`;
                    })()}
                  </span>
                </div>

                <div
                  className="description-area"
                  dangerouslySetInnerHTML={{
                    __html: product.description || product.short_description,
                  }}
                />

                <ProductForm
                  product={product}
                  selectedVariation={selectedVariation}
                  setSelectedVariation={setSelectedVariation}
                  quantity={quantity}
                  setQuantity={setQuantity}
                  addingToCart={addingToCart}
                  itemAdded={itemAdded}
                  onSubmit={handleAddToCart}
                />
              </div>
            </div>
            {/* End of Hero Section */}

            {/* Recommended Section */}
            <RecommendedProducts products={recommendedProducts} />
            {/* End of Recommended Section */}
          </>
        ) : null}
      </main>
    </>
  );
}

export default SingleProduct;
