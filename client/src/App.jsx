// src/App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Homepage from "./pages/Home";
import Auth from "./pages/Auth";
import Home2 from "./pages/Home2";
import Track from "./pages/Track";
import Test from "./pages/Test";
import Result from "./pages/Result";
import DebugLogin from "./pages/DebugLogin";
import PrivateRoute from './components/PrivateRoute';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/home2" element={
          <PrivateRoute>
            <Home2 />
          </PrivateRoute>
        } />
        <Route path="/track" element={
          <PrivateRoute>
            <Track />
          </PrivateRoute>
        } />
        <Route path="/test" element={<Test />} />
        <Route path="/result" element={<Result />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/debug-login" element={<DebugLogin />} />
      </Routes>
    </Router>
  );
}

export default App;
