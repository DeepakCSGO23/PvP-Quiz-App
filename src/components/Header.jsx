import React, { useState } from "react";
import { Link } from "react-router-dom";
export default function Header() {
  const [isHamburgerMenuOpen, setIsHamburgerMenuOpen] = useState(false);

  return (
    <header className="relative flex flex-col h-32 font-roboto justify-center bg-[#86B1A8]">
      <div className="flex items-center justify-center space-x-2">
        <img
          src="logo.png"
          alt="logo"
          height="50"
          width="50"
          title="Duel of Wits"
        />
        <div className="flex flex-col text-base">
          <h1>Duel of Wits</h1>
          <h6 className="text-xs text-gray-200">Challenge Your Knowledge!</h6>
        </div>
      </div>
      <div
        className={`absolute text-black text-sm top-0 right-0 flex flex-col items-center justify-start z-10 h-screen space-y-10 duration-500 ${
          isHamburgerMenuOpen ? "w-40 lg:w-60" : "w-10"
        }  bg-[#bbceb7]`}
      >
        <img
          onClick={() => setIsHamburgerMenuOpen((prev) => !prev)}
          className={`cursor-pointer mt-10 duration-500 ${
            isHamburgerMenuOpen ? "rotate-180" : "rotate-0"
          }`}
          src="hamburger.svg"
          alt="Hamburger"
          height="25"
          width="25"
        />
        {isHamburgerMenuOpen && (
          <div className="flex flex-col space-y-6">
            <Link to="/profile">
              <div className="flex space-x-2">
                <img src="profile.svg" alt="Profile" height="20" width="20" />
                <button className="w-20 text-left">Profile</button>
              </div>
            </Link>
            <Link to="/leaderboard">
              <div className="flex space-x-2">
                <img
                  src="leaderboard.svg"
                  alt="Profile"
                  height="20"
                  width="20"
                />
                <button className="w-20 text-left">Leaderboard</button>
              </div>
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
