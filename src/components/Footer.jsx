import React from "react";
import { footerLinks, logo } from "../assets";
import { Link } from "react-router";

function Footer() {
  return (
    <footer className="w-full border-t border-black p-(--footer-padding) flex md:flex-row flex-col justify-between md:items-end text-black gap-10">
      <div className="footer-logo-area flex flex-col gap-(--footer-logogap)">
        <Link to="/" className="block max-w-35.5">
          <img src={logo} alt="Shoko.to Logo" title="Shoko.to Logo" />
        </Link>

        <div className="footer-address-area flex flex-col gap-1">
          <p>Okodan Street, Near Blue Gate, Accra Central</p>
          <p>P.O. Box GP 1234 | Accra | Ghana</p>
        </div>
      </div>
      <div className="footer-links-area flex flex-col md:items-end">
        <div className="flex items-center gap-4">
          {footerLinks.map((link, index) => (
            <Link
              key={index}
              to={`/${link.id}`}
              className="transition-all duration-150 ease-in-out hover:underline"
            >
              {link.title}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}

export default Footer;
