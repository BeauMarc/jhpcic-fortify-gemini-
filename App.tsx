import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Admin from './pages/Admin';
import Buffer from './pages/Buffer';
import ClientIndex from './pages/ClientIndex';

const App: React.FC = () => {
  return (
    <HashRouter>
      <Routes>
        {/* 
           Route Structure:
           /autopay -> Admin Panel (Entry for Agents)
           /buffer -> The 4-second delay page (Entry for Clients via QR)
           /index -> The main insurance flow (Terms -> Verify -> Sign -> Pay)
        */}
        <Route path="/autopay" element={<Admin />} />
        <Route path="/buffer" element={<Buffer />} />
        <Route path="/index" element={<ClientIndex />} />
        
        {/* Default redirect to Autopay for dev convenience, or 404 */}
        <Route path="/" element={<Navigate to="/autopay" replace />} />
      </Routes>
    </HashRouter>
  );
};

export default App;