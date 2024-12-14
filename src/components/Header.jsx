import React, { useState } from "react";
import { Link } from "react-router-dom";
export default function Header() {
  const [isHamburgerMenuOpen, setIsHamburgerMenuOpen] = useState(false);

  return (
    <header className="relative flex flex-col h-32 font-roboto justify-center bg-gradient-to-l from-[#86B1A8] to-[#77918b]">
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
        className={`absolute z-10 text-[#232222] text-lg top-0 right-0 flex flex-col items-center justify-start h-screen space-y-10 duration-300 ${
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
            <mask id="path-2-inside-1_148_2" fill="black">
              <path d="M4.4 9.125L3.875 8.6L5.975 6.5L3.875 4.4L4.4 3.875L6.5 5.975L8.6 3.875L9.125 4.4L7.025 6.5L9.125 8.6L8.6 9.125L6.5 7.025L4.4 9.125Z" />
            </mask>
            <path
              d="M4.4 9.125L3.875 8.6L5.975 6.5L3.875 4.4L4.4 3.875L6.5 5.975L8.6 3.875L9.125 4.4L7.025 6.5L9.125 8.6L8.6 9.125L6.5 7.025L4.4 9.125Z"
              fill="black"
            />
            <path
              d="M4.4 9.125L-278.443 291.968L4.40006 574.81L287.243 291.968L4.4 9.125ZM3.875 8.6L-278.968 -274.243L-561.81 8.60005L-278.968 291.443L3.875 8.6ZM5.975 6.5L288.818 289.343L571.66 6.49999L288.818 -276.343L5.975 6.5ZM3.875 4.4L-278.968 -278.443L-561.81 4.40001L-278.968 287.243L3.875 4.4ZM4.4 3.875L287.243 -278.968L4.40001 -561.81L-278.443 -278.968L4.4 3.875ZM6.5 5.975L-276.343 288.818L6.49999 571.66L289.343 288.818L6.5 5.975ZM8.6 3.875L291.443 -278.968L8.60005 -561.81L-274.243 -278.968L8.6 3.875ZM9.125 4.4L291.968 287.243L574.81 4.40006L291.968 -278.443L9.125 4.4ZM7.025 6.5L-275.818 -276.343L-558.66 6.49999L-275.818 289.343L7.025 6.5ZM9.125 8.6L291.968 291.443L574.81 8.6L291.968 -274.243L9.125 8.6ZM8.6 9.125L-274.243 291.968L8.6 574.81L291.443 291.968L8.6 9.125ZM6.5 7.025L289.343 -275.818L6.49999 -558.66L-276.343 -275.818L6.5 7.025ZM287.243 -273.718L286.718 -274.243L-278.968 291.443L-278.443 291.968L287.243 -273.718ZM286.718 291.443L288.818 289.343L-276.868 -276.343L-278.968 -274.243L286.718 291.443ZM288.818 -276.343L286.718 -278.443L-278.968 287.243L-276.868 289.343L288.818 -276.343ZM286.718 287.243L287.243 286.718L-278.443 -278.968L-278.968 -278.443L286.718 287.243ZM-278.443 286.718L-276.343 288.818L289.343 -276.868L287.243 -278.968L-278.443 286.718ZM289.343 288.818L291.443 286.718L-274.243 -278.968L-276.343 -276.868L289.343 288.818ZM-274.243 286.718L-273.718 287.243L291.968 -278.443L291.443 -278.968L-274.243 286.718ZM-273.718 -278.443L-275.818 -276.343L289.868 289.343L291.968 287.243L-273.718 -278.443ZM-275.818 289.343L-273.718 291.443L291.968 -274.243L289.868 -276.343L-275.818 289.343ZM-273.718 -274.243L-274.243 -273.718L291.443 291.968L291.968 291.443L-273.718 -274.243ZM291.443 -273.718L289.343 -275.818L-276.343 289.868L-274.243 291.968L291.443 -273.718ZM-276.343 -275.818L-278.443 -273.718L287.243 291.968L289.343 289.868L-276.343 -275.818Z"
              fill="black"
              mask="url(#path-2-inside-1_148_2)"
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
              className="w-[200%] rounded-3xl p-4 px-6 hover:bg-emerald-600 hover:text-white duration-300"
            >
              <button className="text-left tracking-wide font-medium">
                Profile
              </button>
            </Link>
            <Link
              to="/leaderboard"
              className="w-[200%] rounded-3xl p-4 px-6 hover:bg-emerald-600 hover:text-white duration-300"
            >
              <button className="text-left tracking-wide font-medium">
                Leaderboard
              </button>
            </Link>
            <Link
              to="/achievements"
              className="w-[200%] rounded-3xl p-4 px-6 hover:bg-emerald-600 hover:text-white duration-300"
            >
              <button className="text-left tracking-wide font-medium">
                Achievements
              </button>
            </Link>
            <Link
              to="/leaderboard"
              className="w-[200%] rounded-3xl p-4 px-6 hover:bg-emerald-600 hover:text-white duration-300"
            >
              <button className="text-left tracking-wide font-medium">
                Feedback
              </button>
            </Link>
            <Link
              to="/profile"
              className="w-[200%] rounded-3xl p-4 px-6 hover:bg-emerald-600 hover:text-white duration-300"
            >
              <button className="text-left tracking-wide font-medium">
                History
              </button>
            </Link>
            <Link
              to="/leaderboard"
              className="w-[200%] rounded-3xl p-4 px-6 hover:bg-emerald-600 hover:text-white duration-300"
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
