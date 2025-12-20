import React from "react";
import { hero2 } from "../../assets";
import LinkButton from "./linkbutton";

function CollectionSection() {
  return (
    <div className="p-(--collectionsection-padding) w-full flex items-end justify-between gap-(--collectionsection-gap) md:flex-row flex-col-reverse">
      <div
        className="w-full bg-cover bg-center bg-no-repeat min-h-(--collectionimg-height)"
        style={{ backgroundImage: `url(${hero2})` }}
      ></div>
      <div className="w-full flex flex-col gap-4">
        <h2>Long trousers</h2>
        <LinkButton link="/shop" title="Shop trousers" />
      </div>
    </div>
  );
}

export default CollectionSection;
