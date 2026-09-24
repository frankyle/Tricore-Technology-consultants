import React from "react";
import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Home from "./Home";
import Layout from "./market/Layout";
import Auth from "./market/Auth";
import Dashboard from "./market/Dashboard";
import Jobs from "./market/Jobs";
import { Technicians, TechnicianDetail, Companies } from "./market/Directory";

const App = () => (
  <AuthProvider>
    <Routes>
      <Route path="/" element={<Home />} />
      <Route element={<Layout />}>
        <Route path="/technicians" element={<Technicians />} />
        <Route path="/technicians/:id" element={<TechnicianDetail />} />
        <Route path="/companies" element={<Companies />} />
        <Route path="/jobs" element={<Jobs />} />
        <Route path="/login" element={<Auth />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Route>
    </Routes>
  </AuthProvider>
);

export default App;
