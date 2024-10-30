import React from "react";

export default function Header() {
  return (
    <header className="flex h-32 text-sm items-center justify-around bg-[#86B1A8]">
      <div className="flex flex-col">
        <h1>Duel of Wits</h1>
        <h6 className="text-xs text-gray-200">Challenge Your Knowledge!</h6>
      </div>
      <img src="hamburger.svg" alt="Hamburger" height="30" width="30" />
    </header>
  );
}
