import "../index.css";
import "../App.css";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useWebSocket } from "../contexts/WebSocketContext";
import Header from "../components/Header";
export default function Dashboard() {
  const { ws } = useWebSocket();
  const [totalTrophies, setTotalTrophies] = useState(null);
  const [isInQueue, setIsInQueue] = useState(false);
  const [inQueueCountUp, setInQueueCountUp] = useState(0);
  const [isMatchFound, setIsMatchFound] = useState(false);
  const [opponentName, setOpponentName] = useState("");
  const [joiningRoomCountDown, setJoiningRoomCountDown] = useState(3);
  const profileName = new URLSearchParams(window.location.search).get(
    "profileName"
  );
  const history = useNavigate();
  // First find the total trophies the user got so far
  useEffect(() => {
    const fetchTotalTrophies = async () => {
      try {
        // ! create a http endpoint
        const response = await fetch(
          `http://localhost:5000/get-trophies?profileName=${profileName}`
        );
        const totalTrohpies = await response.json();
        if (totalTrohpies) {
          setTotalTrophies(totalTrohpies);
        } else {
          console.log("Error fetching trophies from database");
        }
      } catch (err) {
        console.error("Error fetching trohpies from database", err);
      }
    };
    fetchTotalTrophies();
  }, []);
  useEffect(() => {
    // Log ws whenever it changes
    if (ws) {
      ws.onmessage = (e) => {
        const data = JSON.parse(e.data);
        console.log(data);
        if (data.message === "Match found!") {
          setOpponentName(data.opponent);
          setIsMatchFound(true);
          const intervalId = setInterval(() => {
            setJoiningRoomCountDown((prev) => {
              if (prev == 0) {
                // Clear interval first
                clearInterval(intervalId);
                history(`/room?id=${data.roomId}&profileName=${profileName}`);
                return 0;
              }
              return prev - 1;
            });
          }, 1000);
        }
      };
    }
  }, [ws]);

  const handleFindingMatch = () => {
    // First send the player name details to the websocket server after clicking "Find Match" button
    if (ws) {
      console.log(profileName);
      ws.send(
        JSON.stringify({
          action: "connect",
          profileName: profileName,
          totalTrophies: 20,
        })
      );
    } else {
      console.error("WebSocket is not initialized during button click.");
    }
    const queueIntervalId = setInterval(() => {
      setInQueueCountUp((prev) => prev + 1);
    }, 1000);

    setIsInQueue(true);
    // Cleanup interval on onmount or when a new match is found
    return () => {
      clearInterval(queueIntervalId);
    };
  };

  return (
    <div className="flex flex-col h-screen w-screen text-white font-roboto overflow-hidden">
      <Header />
      <div
        className={`flex flex-col h-full w-full ${
          isMatchFound ? "bg-[#C5E6DF]/80" : "bg-[#C5E6DF]"
        }  text-black items-center justify-center `}
      >
        {isMatchFound ? (
          // Match found now show who is the opponent
          <div className="flex flex-col border-2 items-center justify-center border-black h-60 w-60 rounded-full">
            <span className="text-4xl">{joiningRoomCountDown}</span>
            <h1>Match found !</h1>
            <div className="flex font-semibold text-base">{opponentName}</div>
          </div>
        ) : isInQueue ? (
          <button
            type="button"
            className="shadow-2xl flex items-center p-4 bg-green-700 text-white text-sm rounded-3xl hover:bg-green-600 duration-500 cursor-pointer"
          >
            Finding Match {inQueueCountUp}
          </button>
        ) : (
          <button
            onClick={handleFindingMatch}
            type="button"
            className="shadow-2xl flex items-center p-4 bg-green-700 text-white text-sm rounded-3xl hover:bg-green-600 duration-500 cursor-pointer"
          >
            <img
              src="search.svg"
              alt="Search"
              height="20"
              width="20"
              className="mr-1"
            />
            Find Match
          </button>
        )}
      </div>
    </div>
  );
}
