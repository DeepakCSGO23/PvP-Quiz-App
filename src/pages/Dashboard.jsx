import "../index.css";
import "../App.css";
import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Header from "../components/Header";
export default function Signup() {
  const wsRef = useRef(null);
  const history = useNavigate();
  useEffect(() => {
    // Initialiazing the WebSocket connection
    wsRef.current = new WebSocket("ws://localhost:5000/ws");
    // Called only one time after the websocket connection is established
    wsRef.current.onopen = () => {
      console.log("connected to websocket server");
    };

    // Clean up the WebSocket connection when the component unmounts
    return () => {
      wsRef.current.close();
    };
  }, []);
  //
  const names = [
    "Alice",
    "Bob",
    "Charlie",
    "David",
    "Emma",
    "Frank",
    "Grace",
    "Hannah",
    "Isaac",
    "Jack",
    "Katie",
    "Liam",
    "Mia",
    "Noah",
    "Olivia",
    "Peter",
    "Quinn",
    "Ruby",
    "Sophia",
    "Thomas",
  ];
  const handleFindingMatch = () => {
    // First send the player name details to the websocket server after clicking "Find Match" button
    wsRef.current.send(
      JSON.stringify({
        action: "open",
        userName: names[Math.floor(Math.random() * names.length)],
      })
    );
    // When the client receives any message from the socket server
    wsRef.current.onmessage = (e) => {
      const data = JSON.parse(e.data);
      console.log("Message from server:", data);
    };
    wsRef.current.onerror = (error) => {
      console.error("WebSocket error:", error);
    };
    // Send profile name from here then in backend remove the profile name on closing state
    wsRef.current.onclose = () => {
      console.log("WebSocket connection closed");
    };
  };
  return (
    <div className="flex flex-col h-screen w-screen text-white font-roboto">
      <Header />
      <div className="flex flex-col h-full w-full bg-[#C5E6DF] text-black items-center justify-center dashboard">
        {/* Connect to websocket server after clicking */}
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
      </div>
    </div>
  );
}
