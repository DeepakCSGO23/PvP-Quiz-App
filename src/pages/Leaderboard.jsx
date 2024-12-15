import "../index.css";
import "../App.css";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Header from "../components/Header";

export default function Leaderboard() {
  const [leaderboardList, setLeaderboardList] = useState(null);
  useEffect(() => {
    const fetchLeaderboardData = async () => {
      const response = await fetch("http://localhost:5000/leaderboard-data");
      const data = await response.json();
      setLeaderboardList(data);
    };
    fetchLeaderboardData();
  }, []);

  return (
    <div className="flex flex-col h-screen w-screen font-roboto overflow-hidden">
      <Header />
      {/* Correct y-axis space between topic and the next section */}
      <div className="bg-[#C5E6DF] text-black flex flex-col space-y-20 h-full w-full items-center">
        {/* Correct space of header from header section */}
        <h1 className="text-2xl tracking-widest mt-20 font-bebas-neue border-2 p-2 border-black pl-8 pr-8">
          Leaderboard
        </h1>
        <div className="flex flex-col h-full w-full">
          {/* 1st 2nd 3rd */}
          <div className="flex items-end">
            {leaderboardList &&
              leaderboardList.slice(0, 3).map((item, index) => (
                <div
                  key={item.profileName}
                  className={`relative bg-[#0b574e] ${
                    index === 1 ? "h-56" : "h-40"
                  } w-1/3 rounded-t-3xl flex flex-col items-center justify-center text-white text-xs`}
                >
                  <div className="absolute rounded-full bg-[#313131] flex items-center justify-center h-12 w-12 -top-6">
                    {index + 1}
                  </div>
                  <div className="flex flex-col items-center space-y-2">
                    <span>{item.profileName}</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-base">{item.totalTrophies}</span>
                      <img
                        src="trophy.svg"
                        alt="Trophy"
                        height="20"
                        width="20"
                      />
                    </div>
                  </div>
                </div>
              ))}
          </div>
          {/* remaining places */}
          <div className="bg-[#0b574e] h-full flex flex-col items-center text-xs text-white space-y-2">
            {leaderboardList &&
              leaderboardList.length > 3 &&
              leaderboardList.slice(3).map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between w-52"
                >
                  <div className="flex items-center space-x-2">
                    <div className="rounded-full bg-[#313131] flex items-center justify-center h-8 w-8">
                      {index + 4}
                    </div>
                    <span>{item.profileName}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-base">{item.totalTrophies}</span>
                    <img src="trophy.svg" alt="Trophy" height="20" width="20" />
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
