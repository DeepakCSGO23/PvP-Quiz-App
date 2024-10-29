import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Signup from "./pages/Signup";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Signup />} />
        {/* <Route path="/room" element={<Room />} /> */}
      </Routes>
    </Router>
  );
}

export default App;
