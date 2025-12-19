import { useState } from "react";
import "./App.css";
import Home from "./screens/home";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { Route, Routes } from "react-router";

function App() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <Routes>
        <Route index element={<Home />} />
      </Routes>
      <Footer />
    </div>
  );
}

export default App;
