import React, { useEffect, useState } from "react";
import { fetchProducts } from "../../api/products";
import { Swiper, SwiperSlide } from "swiper/react";
import ProductCard from "../ProductCard";

import "swiper/css";
import { Autoplay, Pagination } from "swiper/modules";
import { Link } from "react-router";
import LinkButton from "./linkbutton";

function ProductsSlide() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts()
      .then((data) => {
        setProducts(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Failed to fetch products:", error);
        setProducts([]);
        setLoading(false);
      });
  }, []);
  return (
    <div className="p-(--productslide-section-padding)">
      <div className="flex items-center justify-between pb-5">
        <h3>Top Selling</h3>
        <LinkButton link="/shop" title="Shop Now" />
      </div>
      <Swiper
        className="products-slide-wrapper"
        modules={[Autoplay, Pagination]}
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
        {loading
          ? // Loading skeleton with pulse animation
            Array.from({ length: 10 }).map((_, index) => (
              <SwiperSlide
                key={`skeleton-${index}`}
                className="relative p-2.5 min-h-(--productslide-height) flex! items-end"
              >
                <div className="absolute inset-0 m-2.5 bg-gray-300 animate-pulse rounded"></div>
                <div className="relative bg-white p-3.5 w-full flex gap-4 justify-between">
                  <div className="h-4 bg-gray-200 animate-pulse rounded flex-1"></div>
                  <div className="h-4 w-16 bg-gray-200 animate-pulse rounded"></div>
                </div>
              </SwiperSlide>
            ))
          : Array.isArray(products) &&
            products
              .filter((product) => product.is_in_stock)
              .map((product) => (
                <SwiperSlide key={product.id}>
                  <ProductCard product={product} />
                </SwiperSlide>
              ))}
      </Swiper>
    </div>
  );
}

export default ProductsSlide;
