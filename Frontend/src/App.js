// src/App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import History from './components/History';
import MapComponent from './components/MapComponent';
import Menu from './components/Menu';

function App() {
  return (
    <Router>
      <div className="flex flex-col h-screen w-screen">
        <Navbar />
        <div className="flex-grow relative">
          <Routes>
            <Route path="/" element={<MapComponent />} />
            <Route path="/history" element={<History/>}/>
            {/* Add other routes here */}
          </Routes>
        </div>
        <Menu />
      </div>
    </Router>
  );
}

export default App;