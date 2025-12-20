import React from "react";
import { Link } from "react-router";

function Breadcrumb({ items }) {
  return (
    <nav className="flex items-center gap-2 text-sm mb-8">
      {items.map((item, index) => (
        <React.Fragment key={index}>
          {index > 0 && <span className="text-black">|</span>}
          {item.link ? (
            <Link to={item.link} className="text-black hover:text-black transition-colors">
              {item.label}
            </Link>
          ) : (
            <span className="text-[#476FBD] font-normal">{item.label}</span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
}

export default Breadcrumb;
