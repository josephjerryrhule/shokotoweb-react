import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import ProductCard from "../ProductCard";
import "swiper/css";

function RecommendedProducts({ products }) {
  if (!products || products.length === 0) return null;

  const inStockProducts = products.filter((prod) => prod.is_in_stock);
  const hasEnoughForLoop = inStockProducts.length >= 5;

  return (
    <div className="pt-30">
      <div className="pb-5">
        <h3>You may also like</h3>
      </div>

      <Swiper
        className="products-slide-wrapper"
        modules={[Autoplay]}
        spaceBetween={17}
        autoplay={hasEnoughForLoop ? {
          delay: 0,
          disableOnInteraction: false,
          pauseOnMouseEnter: true,
        } : false}
        speed={5000}
        loop={hasEnoughForLoop}
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
        {inStockProducts.map((prod) => (
          <SwiperSlide key={prod.id}>
            <ProductCard product={prod} />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}

export default RecommendedProducts;
