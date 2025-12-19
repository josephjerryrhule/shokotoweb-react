import React from "react";
import { Link } from "react-router";
import { logo } from "../assets";

function Navbar() {
  return (
    <nav className="w-full bg-white sticky top-0 flex items-center justify-between p-(--navpadding) z-10">
      <div className="lang-area"></div>
      <Link to="/" className="max-w-max">
        <img
          src={logo}
          alt="Shoko.to Logo"
          title="Shoko.to Logo"
          className="max-w-(--logomaxw) w-full transition-all duration-150 ease-in-out"
        />
      </Link>
      <div className="navlink-items-area"></div>
    </nav>
  );
}

export default Navbar;
