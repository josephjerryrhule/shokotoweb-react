import React from "react";

function TopLoadingBar({ isLoading }) {
  if (!isLoading) return null;

  return (
    <div className="fixed top-0 left-0 right-0 h-0.5 z-50 bg-gray-200">
      <div className="h-full bg-linear-to-r from-white to-zinc-900 from animate-progress origin-left"></div>
    </div>
  );
}

export default TopLoadingBar;
