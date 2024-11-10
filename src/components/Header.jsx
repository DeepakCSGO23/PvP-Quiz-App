import React, { useState } from "react";

export default function Header() {
  const [isHamburgerMenuOpen, setIsHamburgerMenuOpen] = useState(false);
  return (
    <header className="relative flex flex-col h-32 text-sm justify-center bg-[#86B1A8] border-2">
      <div className="flex justify-around">
        <div className="flex flex-col">
          <h1>Duel of Wits</h1>
          <h6 className="text-xs text-gray-200">Challenge Your Knowledge!</h6>
        </div>
        <img
          onClick={() => setIsHamburgerMenuOpen((prev) => !prev)}
          className="cursor-pointer"
          src="hamburger.svg"
          alt="Hamburger"
          height="30"
          width="30"
        />
      </div>
      {isHamburgerMenuOpen && (
        <div
          className={`absolute top-0 right-0 flex flex-col items-center justify-center space-y-4 h-screen ${
            isHamburgerMenuOpen ? "w-40" : "w-80"
          }  bg-[#A8B9A5]`}
        >
          <div className="flex space-x-2 w-32 border-b-2 p-2 border-gray-200 border-">
            <img src="profile.svg" alt="" height="20" width="20" />
            <button className="text-gray-200 hover:text-white">Profile</button>
          </div>
          <div className="flex space-x-2 w-32 border-b-2 p-2 border-gray-200 border-">
            <img src="leaderboard.svg" alt="" height="20" width="20" />
            <button className="text-gray-200 hover:text-white">
              Leaderboard
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
