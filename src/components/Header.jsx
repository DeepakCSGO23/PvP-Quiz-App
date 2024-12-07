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
          height="60"
          width="60"
          title="Duel of Wits"
        />
        <div className="flex flex-col text-base">
          <h1>Duel of Wits</h1>
          <h6 className="text-xs text-gray-200">Challenge Your Knowledge!</h6>
        </div>
      </div>
      <div
        className={`absolute z-10 text-[#232222] text-xl top-0 right-0 flex flex-col items-center justify-start h-screen space-y-10 duration-300 ${
          isHamburgerMenuOpen ? "w-full  bg-[#bbceb7]" : "w-14"
        } `}
      >
        {!isHamburgerMenuOpen ? (
          <img
            onClick={() => setIsHamburgerMenuOpen((prev) => !prev)}
            className={`cursor-pointer mt-10 duration-300 ${
              isHamburgerMenuOpen ? "rotate-180" : "rotate-0"
            }`}
            src="hamburger.svg"
            alt="Hamburger"
            height="25"
            width="25"
          />
        ) : (
          <img
            onClick={() => setIsHamburgerMenuOpen((prev) => !prev)}
            className={`cursor-pointer mt-10 duration-300 ${
              isHamburgerMenuOpen ? "rotate-180" : "rotate-0"
            }`}
            src="close.svg"
            alt="Hamburger"
            height="25"
            width="25"
          />
        )}

        {isHamburgerMenuOpen && (
          <div className="flex flex-col space-y-6">
            <h3 className="text-sm w-60">
              {" "}
              "Pro Tip: Challenge yourself with a new quiz every day to sharpen
              your wits!"
            </h3>
            <Link to="/profile">
              <button className="w-20 text-left tracking-wider font-medium">
                Profile
              </button>
            </Link>
            <Link to="/leaderboard">
              <button className="w-20 text-left tracking-wider font-medium">
                Leaderboard
              </button>
            </Link>
            <Link to="/achievements">
              <button className="w-20 text-left tracking-wider font-medium">
                Achievements
              </button>
            </Link>
            <Link to="/leaderboard">
              <button className="w-20 text-left tracking-wider font-medium">
                Feedback
              </button>
            </Link>
            <Link to="/profile">
              <button className="w-20 text-left tracking-wider font-medium">
                History
              </button>
            </Link>
            <Link to="/leaderboard">
              <button className="w-20 text-left tracking-wider font-medium">
                Logout
              </button>
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
