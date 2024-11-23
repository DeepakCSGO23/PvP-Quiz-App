import "../index.css";
import "../App.css";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Header from "../components/Header";

export default function Profile() {
  return (
    <div className="flex flex-col h-screen w-screen font-roboto overflow-hidden">
      <Header />
      {/* Correct y-axis space between topic and the next section */}
      <div className="bg-[#C5E6DF] text-black flex flex-col space-y-20 h-full w-full items-center">
        {/* Correct space of header from header section */}
        <h1 className="text-2xl tracking-widest mt-10 font-bebas-neue border-2 p-2 border-black pl-8 pr-8">
          Profile
        </h1>
        <div className="flex flex-col h-full w-full"></div>
      </div>
    </div>
  );
}
