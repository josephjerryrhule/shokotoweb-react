import React from "react";
import { hype } from "../../assets";

function HypeSection() {
  return (
    <div className="flex flex-col gap-(--hypesection-gap) p-(--hypesection-padding)">
      <div className="flex items-start justify-between md:flex-row flex-col">
        <h2 className="w-full font-semibold">The Hype is real...</h2>
        <h3>For us, comfort isn’t rocket science — it’s lifestyle.</h3>
      </div>

      <div
        className="w-full bg-cover bg-center bg-no-repeat min-h-(--collectionimg-height)"
        style={{ backgroundImage: `url(${hype})` }}
      ></div>
    </div>
  );
}

export default HypeSection;
