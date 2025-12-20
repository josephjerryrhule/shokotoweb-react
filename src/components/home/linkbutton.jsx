import React from "react";
import { Link } from "react-router";

function LinkButton({ link, title }) {
  return (
    <>
      <Link
        to={link}
        className="bg-white text-black border border-black p-[12px_48px] transition-all duration-150 ease-in-out hover:bg-black hover:text-white max-w-max"
      >
        {title}
      </Link>
    </>
  );
}

export default LinkButton;
