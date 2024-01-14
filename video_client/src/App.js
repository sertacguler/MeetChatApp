import { Routes, Route } from "react-router-dom";
import "./App.css";
import VideoPage from "./record/VideoPage";

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<VideoPage />} />
      </Routes>
    </div>
  );
}

export default App;
