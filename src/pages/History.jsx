import { useEffect, useState } from "react";
import Header from "../components/Header";

const History = () => {
  // ! LOCAL STORAGE AS OF NOW
  const [profileName] = useState(
    localStorage.getItem("profileName") || "D E E P A K K N"
  );
  const [historyData, setHistoryData] = useState([]);
  useEffect(() => {
    const getHistoryData = async () => {
      const response = await fetch(
        `http://localhost:5000/get-history-data?profileName=${profileName}`
      );
      const data = await response.json();
      console.log(data);
      setHistoryData(data.history);
    };
    getHistoryData();
  }, []);
  return (
    <div className="flex flex-col h-screen w-screen text-white font-roboto">
      <Header />
      <div className="flex flex-col h-full w-full bg-[#C5E6DF] text-black items-center space-y-20">
        <h1 className="text-2xl tracking-widest mt-20 font-bebas-neue border-2 p-2 border-black pl-8 pr-8">
          HISTORY
        </h1>
        <div className="text-white space-y-4 w-60">
          {historyData &&
            historyData.length > 0 &&
            historyData.map((history, index) => (
              <div
                className={`${
                  history.result === "won"
                    ? "bg-[#44b165]"
                    : history.result === "lost"
                    ? "bg-[#ac3737]"
                    : history.result === "draw"
                    ? "bg-[#a2a72e]"
                    : "bg-[#E0E0E0]"
                } p-4 px-6 justify-between rounded-3xl flex space-x-4 shadow-sm`}
                key={index}
              >
                <h2>
                  <span className="mr-2">vs</span>
                  {history.opponent}
                </h2>
                <span className="uppercase">{history.result[0]}</span>
                {/* {history.result === "won" && <span>+5</span>} */}
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default History;
