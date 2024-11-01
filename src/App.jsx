import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Room from "./pages/Room";
import { WebSocketProvider } from "./contexts/WebSocketContext";

function App() {
  return (
    //<WebSocketProvider>
    <Router>
      <Routes>
        <Route path="/" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route
          path="/dashboard"
          element={
            <WebSocketProvider>
              <Dashboard />
            </WebSocketProvider>
          }
        />
        <Route
          path="/room"
          element={
            <WebSocketProvider>
              <Room />
            </WebSocketProvider>
          }
        />
      </Routes>
    </Router>
    //</WebSocketProvider>
  );
}

export default App;
