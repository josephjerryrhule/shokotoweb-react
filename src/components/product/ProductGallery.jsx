import React, { useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { FreeMode, Thumbs, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/thumbs";

function ProductGallery({ images, productName }) {
  const [thumbsSwiper, setThumbsSwiper] = useState(null);

  if (!images || images.length === 0) {
    return <div className="w-full aspect-square bg-gray-300 rounded"></div>;
  }

  return (
    <div className="flex flex-col lg:flex-row-reverse gap-4">
      <Swiper
        modules={[FreeMode, Thumbs, Autoplay]}
        thumbs={{
          swiper: thumbsSwiper && !thumbsSwiper.destroyed ? thumbsSwiper : null,
        }}
        autoplay={{ delay: 5000, disableOnInteraction: false }}
        spaceBetween={10}
        className="main-swiper w-full lg:w-5/6 h-(--singleproduct-galleryimg-h)!"
      >
        {images.map((image, index) => (
          <SwiperSlide className="h-(--singleproduct-galleryimg-h)!" key={index}>
            <img
              src={image.src}
              alt={image.alt || productName}
              className="aspect-335/368 lg:aspect-711/788 w-full object-cover object-[center_28%] h-full"
            />
          </SwiperSlide>
        ))}
      </Swiper>
      <Swiper
        onSwiper={setThumbsSwiper}
        spaceBetween={10}
        slidesPerView={4}
        freeMode={true}
        watchSlidesProgress={true}
        modules={[FreeMode, Thumbs]}
        className="thumbs-swiper w-full lg:w-1/6 lg:h-(--singleproduct-galleryimg-h)!"
        breakpoints={{
          0: {
            direction: "horizontal",
          },
          1024: {
            direction: "vertical",
          },
        }}
      >
        {images.map((image, index) => (
          <SwiperSlide
            className="h-fit! product-thumb-image not-[.swiper-slide-thumb-active]:opacity-50 hover:opacity-100"
            key={index}
          >
            <img
              src={image.src}
              alt={image.alt || productName}
              className="aspect-140/165 w-full object-cover object-top cursor-pointer"
            />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}

export default ProductGallery;
