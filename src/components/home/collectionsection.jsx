import React from "react";
import { hero2 } from "../../assets";
import { Link } from "react-router";

function CollectionSection() {
  return (
    <div className="p-(--collectionsection-padding) w-full flex items-end justify-between gap-(--collectionsection-gap) md:flex-row flex-col-reverse">
      <div
        className="w-full bg-cover bg-center bg-no-repeat min-h-(--collectionimg-height)"
        style={{ backgroundImage: `url(${hero2})` }}
      ></div>
      <div className="w-full flex flex-col gap-4">
        <h2>Long trousers</h2>
        <Link
          to="/shop"
          className="bg-white text-black p-[12px_48px] block max-w-max transition-all duration-150 ease-in-out hover:bg-black hover:text-white border border-black"
        >
          Shop trousers
        </Link>
      </div>
    </div>
  );
}

export default CollectionSection;
