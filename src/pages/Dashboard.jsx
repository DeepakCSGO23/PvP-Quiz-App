import "../index.css";
import "../App.css";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useWebSocket } from "../contexts/WebSocketContext";
import Header from "../components/Header";
export default function Dashboard() {
  const { ws } = useWebSocket();

  // const wsRef = useRef(null);
  const [isFindingMatch, setIsFindingMatch] = useState(true);
  const url = new URL(window.location.href);

  const [userName] = useState(url.searchParams.get("userName"));
  const history = useNavigate();
  useEffect(() => {
    // Log ws whenever it changes
    if (ws) {
      console.log("websocket obj", ws);
      ws.onmessage = (e) => {
        const data = JSON.parse(e.data);
        console.log(data);
        if (data.message === "Match found!") {
          history(`/room?id=${data.roomId}`);
        }
      };
    } else {
      console.error("WebSocket is not initialized.");
    }
  }, [ws]);
  const handleFindingMatch = () => {
    // First send the player name details to the websocket server after clicking "Find Match" button
    if (ws) {
      console.log("finding match");
      ws.send(
        JSON.stringify({
          action: "connect",
          userName: userName,
        })
      );
    } else {
      console.error("WebSocket is not initialized during button click.");
    }
    setIsFindingMatch(false);
  };
  // Disconnect user from the user
  const handleDisconnectingMatch = () => {
    if (ws) {
      ws.send(
        JSON.stringify({
          action: "disconnect",
          userName: userName,
        })
      );
      console.log("disconnecting");
    }

    setIsFindingMatch(true);
  };
  return (
    <div className="flex flex-col h-screen w-screen text-white font-roboto">
      <Header />
      <div className="flex flex-col h-full w-full bg-[#C5E6DF] text-black items-center justify-center dashboard">
        {/* Connect to websocket server after clicking */}
        {isFindingMatch ? (
          <button
            onClick={handleFindingMatch}
            type="button"
            className="flex items-center p-4 bg-green-500 text-white text-sm rounded-3xl hover:bg-green-600 duration-500"
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
        ) : (
          <button
            onClick={handleDisconnectingMatch}
            type="button"
            className="flex items-center p-4 bg-green-400 text-white text-sm rounded-3xl hover:bg-green-500 duration-500"
          >
            <img
              src="search.svg"
              alt="Search"
              height="20"
              width="20"
              className="mr-1"
            />
            End match
          </button>
        )}
      </div>
    </div>
  );
}
