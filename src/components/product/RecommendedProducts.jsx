import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import { Link } from "react-router";
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
        {inStockProducts.map((prod) => {
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
                  className="block relative p-2.5 bg-cover bg-center bg-no-repeat min-h-(--productslide-height) flex items-end"
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
  );
}

export default RecommendedProducts;
