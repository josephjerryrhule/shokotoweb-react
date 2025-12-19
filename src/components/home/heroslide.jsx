import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { slides } from "../../assets";
import { Autoplay, Pagination } from "swiper/modules";

import "swiper/css";
import "swiper/css/pagination";
import { Link } from "react-router";

function HeroSlide() {
  return (
    <Swiper
      modules={[Autoplay, Pagination]}
      slidesPerView={1}
      autoplay={{ delay: 5000, disableOnInteraction: false }}
      loop={true}
      pagination={{ clickable: true, bulletClass: "swiper-pagination-bullet !bg-white hover:!opacity-100 transition-all duration-150 ease-in-out" }}
    >
      {slides.map((slide, index) => (
        <SwiperSlide
          key={slide.id || index}
          className="w-full min-h-(--heroslide-height) bg-cover bg-center bg-no-repeat"
          data-slide-id={slide.id || index}
          style={{ backgroundImage: `url(${slide.image})` }}
        >
          <div className="w-full min-h-(--heroslide-height) flex flex-col justify-end bg-[#00000080] text-white p-(--heroslide-padding) gap-5">
            <h1
              className="max-w-(--heroslide-titlemaxw)"
              dangerouslySetInnerHTML={{ __html: slide.title }}
            ></h1>
            <Link to="/shop" className="bg-white text-black p-[12px_48px] block max-w-max transition-all duration-150 ease-in-out hover:bg-black hover:text-white">Shop all</Link>
          </div>
        </SwiperSlide>
      ))}
    </Swiper>
  );
}

export default HeroSlide;
