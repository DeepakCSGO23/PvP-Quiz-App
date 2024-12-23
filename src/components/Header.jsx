import React, { useState } from "react";
import { Link } from "react-router-dom";
export default function Header() {
  const [isHamburgerMenuOpen, setIsHamburgerMenuOpen] = useState(false);

  return (
    <header className="relative flex flex-col h-32 font-roboto justify-center bg-gradient-to-l from-[#86B1A8] to-[#77918b]">
      <div className="flex items-center justify-center space-x-2">
        <img
          fetchpriority="high"
          src="logo.png"
          alt="logo"
          height="60"
          width="60"
          title="Duel of Wits"
        />
        <div className="flex flex-col">
          <h1 className="text-base">Duel of Wits</h1>
          <h2 className="text-xs text-gray-200">Challenge Your Knowledge!</h2>
        </div>
      </div>
      <div
        className={`absolute z-10 text-[#232222] text-base top-0 right-0 flex flex-col items-center justify-start h-screen space-y-10 duration-300 ${
          isHamburgerMenuOpen ? "w-full bg-[#bbceb7]" : "w-14"
        } `}
      >
        {!isHamburgerMenuOpen ? (
          // Hamburger Icon
          <svg
            onClick={() => setIsHamburgerMenuOpen((prev) => !prev)}
            className={`cursor-pointer mt-10 duration-300 ${
              isHamburgerMenuOpen ? "rotate-180" : "rotate-0"
            }`}
            width="25"
            height="25"
            viewBox="0 0 29 29"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="14.5" cy="14.5" r="14" stroke="#E5E7EB" />
            <path
              d="M9.5 10H20.5M9.5 14H20.5M9.5 18H20.5"
              stroke="#E5E7EB"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        ) : (
          // Close Icon
          <svg
            onClick={() => setIsHamburgerMenuOpen((prev) => !prev)}
            className={`cursor-pointer mt-10 duration-300 ${
              isHamburgerMenuOpen ? "rotate-180" : "rotate-0"
            }`}
            width="25"
            height="25"
            viewBox="0 0 13 13"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="6.30054" cy="6.30054" r="5.80054" stroke="black" />

            <path
              d="M4.4 9.125L3.875 8.6L5.975 6.5L3.875 4.4L4.4 3.875L6.5 5.975L8.6 3.875L9.125 4.4L7.025 6.5L9.125 8.6L8.6 9.125L6.5 7.025L4.4 9.125Z"
              fill="black"
            />
          </svg>
        )}
        {isHamburgerMenuOpen && (
          <div className="flex flex-col space-y-2">
            <svg
              className="absolute bottom-20 right-10 rotate-12"
              width="141"
              height="233"
              viewBox="0 0 141 233"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M32.8855 85.5569L3 64.2419C23.8724 -1.22142 68.5889 -3.64445 98 7C200.25 65.2558 78.7323 132.452 77.4766 180L34.3086 168.384C34.3086 128.255 122.78 63.1879 82.6947 47.2776C58.0273 42.0884 40.0011 72.0851 32.8855 85.5569Z"
                fill="#1E743F"
                stroke="black"
                strokeWidth="4"
              />
              <circle
                cx="48"
                cy="208"
                r="23"
                fill="#1E743F"
                stroke="black"
                strokeWidth="4"
              />
            </svg>

            <Link
              to="/profile"
              className="rounded-3xl p-4 px-6 hover:bg-emerald-500 hover:text-white duration-300"
            >
              <button className="text-left tracking-wide font-medium">
                Profile
              </button>
            </Link>
            <Link
              to="/leaderboard"
              className="rounded-3xl p-4 px-6 hover:bg-emerald-500 hover:text-white duration-300"
            >
              <button className="text-left tracking-wide font-medium">
                Leaderboard
              </button>
            </Link>
            <Link
              to="/achievements"
              className="rounded-3xl p-4 px-6 hover:bg-emerald-500 hover:text-white duration-300"
            >
              <button className="text-left tracking-wide font-medium">
                Achievements
              </button>
            </Link>
            <Link
              to="/leaderboard"
              className="rounded-3xl p-4 px-6 hover:bg-emerald-500 hover:text-white duration-300"
            >
              <button className="text-left tracking-wide font-medium">
                Feedback
              </button>
            </Link>
            <Link
              to="/profile"
              className="rounded-3xl p-4 px-6 hover:bg-emerald-500 hover:text-white duration-300"
            >
              <button className="text-left tracking-wide font-medium">
                History
              </button>
            </Link>
            <Link
              to="/leaderboard"
              className="rounded-3xl p-4 px-6 hover:bg-emerald-500 hover:text-white duration-300"
            >
              <button className="text-left tracking-wide font-medium">
                Logout
              </button>
            </Link>
            <h3 className="text-sm w-60 relative top-10">
              "Pro Tip: Challenge yourself with a new quiz every day to sharpen
              your wits!"
            </h3>
          </div>
        )}
      </div>
    </header>
  );
}
