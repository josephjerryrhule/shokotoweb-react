import React, { useEffect, useState } from "react";
import { fetchSingleProduct, fetchProducts } from "../../api/products";
import { addToCart } from "../../api/cart";
import { useParams, Link } from "react-router";
import TopLoadingBar from "../../components/TopLoadingBar";
import Breadcrumb from "../../components/Breadcrumb";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, FreeMode, Navigation, Thumbs } from "swiper/modules";
import "swiper/css";
import "swiper/css/thumbs";

function SingleProduct() {
  const { slug } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedVariation, setSelectedVariation] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const [itemAdded, setItemAdded] = useState(false);
  const [thumbsSwiper, setThumbsSwiper] = useState(null);
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

    const loadProductAndRecommendations = async () => {
      try {
        // Fetch the single product first
        const productData = await fetchSingleProduct(slug);
        
        // Immediately start fetching recommended products if category exists
        const recommendedPromise = 
          productData.categories && productData.categories.length > 0
            ? fetchProducts({
                category: productData.categories[0].slug,
                per_page: 10,
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
      alert("Please select a size");
      return;
    }

    setAddingToCart(true);
    try {
      // Add to cart - WooCommerce will handle updating quantity if item exists
      await addToCart(product.id, quantity, selectedVariation?.id || null);

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
        alert(cleanMessage);
      } else {
        alert("Failed to add to cart. Please try again.");
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
        key={product ? product.id : "loading"}
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
                    className="min-w-[280px] min-h-(--productslide-height) relative"
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
        ) : (
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
                {product.images && product.images.length > 0 ? (
                  <div className="flex flex-col lg:flex-row-reverse gap-4">
                    <Swiper
                      modules={[FreeMode, Thumbs, Autoplay]}
                      thumbs={{ swiper: thumbsSwiper }}
                      autoplay={{ delay: 5000, disableOnInteraction: false }}
                      spaceBetween={10}
                      className="main-swiper w-full lg:w-5/6"
                    >
                      {product.images.map((image, index) => (
                        <SwiperSlide key={index}>
                          <img
                            src={image.src}
                            alt={image.alt || product.name}
                            className="aspect-335/368 lg:aspect-711/788 w-full object-cover object-center h-full"
                          />
                        </SwiperSlide>
                      ))}
                    </Swiper>
                    <Swiper
                      onSwiper={setThumbsSwiper}
                      spaceBetween={10}
                      slidesPerView={4}
                      freeMode
                      watchSlidesProgress
                      modules={[FreeMode, Thumbs]}
                      className="thumbs-swiper w-full lg:w-1/6"
                      breakpoints={{
                        0: {
                          direction: "horizontal",
                        },
                        1024: {
                          direction: "vertical",
                        },
                      }}
                    >
                      {product.images.map((image, index) => (
                        <SwiperSlide
                          className="h-fit! product-thumb-image not-[.swiper-slide-thumb-active]:opacity-50 hover:opacity-100"
                          key={index}
                        >
                          <img
                            src={image.src}
                            alt={image.alt || product.name}
                            className="aspect-140/165 w-full object-cover object-top cursor-pointer"
                          />
                        </SwiperSlide>
                      ))}
                    </Swiper>
                  </div>
                ) : (
                  <div className="w-full aspect-square bg-gray-300 rounded"></div>
                )}
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

                <form
                  onSubmit={handleAddToCart}
                  data-product_id={product.id}
                  className="add-to-cart-form flex flex-col gap-6"
                >
                  <div className="flex items-end gap-10">
                    {product.type === "variable" && product.attributes && (
                      <>
                        {product.attributes
                          .filter((attr) => attr.has_variations)
                          .map((attribute) => (
                            <div key={attribute.id} className="attribute-group">
                              <p className="mb-3">{attribute.name}</p>
                              <div className="flex items-center gap-2 flex-wrap">
                                {attribute.terms.map((term) => {
                                  const variation = product.variations?.find(
                                    (v) =>
                                      v.attributes.some(
                                        (a) =>
                                          a.name.toLowerCase() ===
                                            attribute.name.toLowerCase() &&
                                          a.value === term.slug
                                      )
                                  );

                                  if (!variation) {
                                    return null;
                                  }

                                  const isSelected =
                                    selectedVariation?.id === variation.id;

                                  return (
                                    <label
                                      key={term.id}
                                      className={`relative cursor-pointer transition-all duration-200 ${
                                        isSelected
                                          ? "bg-black text-white"
                                          : "bg-white text-black border border-gray-300 hover:border-gray-400"
                                      }`}
                                    >
                                      <input
                                        type="radio"
                                        name={`attribute_${attribute.id}`}
                                        value={variation.id}
                                        checked={isSelected}
                                        onChange={() =>
                                          setSelectedVariation(variation)
                                        }
                                        className="sr-only"
                                      />
                                      <span className="block px-4 py-2 text-sm font-medium">
                                        {term.name}
                                      </span>
                                    </label>
                                  );
                                })}
                              </div>
                            </div>
                          ))}
                      </>
                    )}
                    <div>
                      <p className="mb-3">Quantity</p>
                      <div className="quantity flex items-center border border-gray-300">
                        <button
                          type="button"
                          onClick={() => setQuantity(Math.max(1, quantity - 1))}
                          className="px-4 py-2 hover:bg-black hover:text-white transition-all duration-300 ease-in-out cursor-pointer"
                        >
                          -
                        </button>
                        <input
                          disabled
                          type="text"
                          value={quantity}
                          onChange={(e) =>
                            setQuantity(
                              Math.max(1, parseInt(e.target.value) || 1)
                            )
                          }
                          className="w-16 text-center outline-none"
                          min="1"
                        />
                        <button
                          type="button"
                          onClick={() => setQuantity(quantity + 1)}
                          className="px-4 py-2 hover:bg-black hover:text-white transition-all duration-300 ease-in-out cursor-pointer"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="quantity-add-to-cart flex items-start gap-4 flex-col">
                    <button
                      type="submit"
                      disabled={
                        addingToCart || !product.is_in_stock || itemAdded
                      }
                      className="bg-white text-black border border-black p-[12px_48px] w-full hover:bg-black hover:text-white cursor-pointer transition-all duration-300 ease-in-out disabled:bg-gray-300 disabled:cursor-not-allowed disabled:border-gray-300"
                    >
                      {itemAdded
                        ? "Added to cart"
                        : addingToCart
                        ? "Adding..."
                        : product.is_in_stock
                        ? "Add to Cart"
                        : "Out of Stock"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
            {/* End of Hero Section */}

            {/* Recommended Section */}
            <div className="pt-30">
              <div className="pb-5">
                <h3>You may also like</h3>
              </div>

              <Swiper
                className="products-slide-wrapper"
                modules={[Autoplay]}
                spaceBetween={17}
                autoplay={{
                  delay: 0,
                  disableOnInteraction: false,
                  pauseOnMouseEnter: true,
                }}
                speed={5000}
                loop={true}
                freeMode={true}
                breakpoints={{
                  0: {
                    slidesPerView: 1.2,
                  },
                  768: {
                    slidesPerView: 3,
                  },
                  1024: {
                    slidesPerView: 4,
                  },
                  1280: {
                    slidesPerView: 5,
                  },
                }}
              >
                {recommendedProducts
                  .filter((prod) => prod.is_in_stock)
                  .map((prod) => {
                    const price = prod.prices?.price
                      ? (
                          parseInt(prod.prices.price) /
                          Math.pow(10, prod.prices.currency_minor_unit || 2)
                        ).toFixed(2)
                      : "0.00";
                    const currencySymbol = prod.prices?.currency_code || "₵";

                    return (
                      <SwiperSlide key={prod.id}>
                        <Link
                          to={`/product/${prod.slug}`}
                          className="relative p-2.5 bg-cover bg-center bg-no-repeat min-h-(--productslide-height) flex items-end"
                          style={{
                            backgroundImage: `url(${prod.images[0]?.src})`,
                          }}
                        >
                          <div className="flex items-center bg-white p-3.5 w-full justify-between gap-4">
                            <span className="text-sm font-semibold line-clamp-1">
                              {prod.name}
                            </span>
                            <span className="text-gray-700 whitespace-nowrap text-sm">
                              {currencySymbol} {price}
                            </span>
                          </div>
                        </Link>
                      </SwiperSlide>
                    );
                  })}
              </Swiper>
            </div>
            {/* End of Recommended Section */}
          </>
        )}
      </main>
    </>
  );
}

export default SingleProduct;
