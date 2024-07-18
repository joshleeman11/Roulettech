import "./App.css";
import React from "react";
import { BrowserRouter, Routes, Route, Router, Link } from "react-router-dom";
import Recipes from "./recipes";
import Home from "./Home";

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Recipes />} />
                <Route path="home" element={<Home />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
