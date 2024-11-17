import React, { useState } from "react";
import { Link } from "react-router-dom";
export default function Header() {
  const [isHamburgerMenuOpen, setIsHamburgerMenuOpen] = useState(false);
  return (
    <header className="relative flex flex-col h-32 text-sm justify-center bg-[#86B1A8]">
      <div className="flex justify-around">
        <div className="flex flex-col">
          <h1>Duel of Wits</h1>
          <h6 className="text-xs text-gray-200">Challenge Your Knowledge!</h6>
        </div>
      </div>
      <div
        className={`absolute top-0 right-0 flex flex-col items-center justify-start h-screen space-y-6 duration-500 ${
          isHamburgerMenuOpen ? "w-40 lg:w-60" : "w-12"
        }  bg-[#A8B9A5]`}
      >
        <img
          onClick={() => setIsHamburgerMenuOpen((prev) => !prev)}
          className="cursor-pointer"
          src="hamburger.svg"
          alt="Hamburger"
          height="30"
          width="30"
        />
        {isHamburgerMenuOpen && (
          <div className="flex flex-col space-y-4">
            <button className="text-gray-200 hover:text-white w-20 tracking-wider">
              PROFILE
            </button>
            <Link to="/leaderboard">
              <button className="text-gray-200 hover:text-white w-20 tracking-wider">
                LEADERBOARD
              </button>
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
