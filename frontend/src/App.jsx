import { Routes, Route } from "react-router-dom";
import { useState, useEffect } from "react";
import DonorMatch from "./pages/DonorMatch";
import DonorCamps from "./pages/DonorCamps";
import Login from "./pages/Login";
import Register from "./pages/Register";
import BloodInventory from "./pages/BloodInventory";
import AdminCamps from "./pages/AdminCamps";
import Chatbot from "./components/Chatbot";
import EmergencyBackground from "./components/EmergencyBackground";

import DonorLanding from "./pages/DonorLanding";
import DonorRegister from "./pages/DonorRegister";
import DonorHistory from "./pages/DonorHistory";
import DonorTips from "./pages/DonorTips";

import StaffLanding from "./pages/StaffLanding";
import StaffRequest from "./pages/StaffRequest";
import StaffPending from "./pages/StaffPending";
import StaffDashboard from "./pages/StaffDashboard";

import AdminLanding from "./pages/AdminLanding";
import AdminDashboardStats from "./pages/AdminDashboardStats";
import AdminBloodInventory from "./pages/AdminBloodInventory";
import AdminDonorList from "./pages/AdminDonorList";
import AdminRequests from "./pages/AdminRequests";
import AdminAuditLogs from "./pages/AdminAuditLogs";

export default function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [isDashboard, setIsDashboard] = useState(false);

  const [bloodStock, setBloodStock] = useState({
    "A+": 0, "A-": 0, "B+": 0, "B-": 0,
    "O+": 0, "O-": 0, "AB+": 0, "AB-": 0,
  });

  useEffect(() => {
    document.body.className = darkMode ? "dark" : "";
  }, [darkMode]);

  // Show emergency background on all dashboard pages
  useEffect(() => {
    const path = window.location.pathname;
    const onDash = path !== "/" && path !== "/register";
    setIsDashboard(onDash);
  }, []);

  return (
    <>
      {isDashboard && <EmergencyBackground />}
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Donor */}
        <Route path="/donor"          element={<DonorLanding   darkMode={darkMode} setDarkMode={setDarkMode} />} />
        <Route path="/donor/register" element={<DonorRegister  darkMode={darkMode} setDarkMode={setDarkMode} />} />
        <Route path="/donor/history"  element={<DonorHistory   darkMode={darkMode} setDarkMode={setDarkMode} />} />
        <Route path="/donor/tips"     element={<DonorTips      darkMode={darkMode} setDarkMode={setDarkMode} />} />
        <Route path="/donor/camps"    element={<DonorCamps     darkMode={darkMode} setDarkMode={setDarkMode} />} />

        {/* Staff */}
        <Route path="/staff"           element={<StaffLanding   darkMode={darkMode} setDarkMode={setDarkMode} />} />
        <Route path="/staff/dashboard" element={<StaffDashboard darkMode={darkMode} setDarkMode={setDarkMode} />} />
        <Route path="/staff/request"   element={<StaffRequest   darkMode={darkMode} setDarkMode={setDarkMode} />} />
        <Route path="/staff/pending"   element={<StaffPending   darkMode={darkMode} setDarkMode={setDarkMode} />} />

        {/* Admin */}
        <Route path="/admin"                  element={<AdminLanding        darkMode={darkMode} setDarkMode={setDarkMode} />} />
        <Route path="/admin/dashboard-stats"  element={<AdminDashboardStats bloodStock={bloodStock} />} />
        <Route path="/admin/blood-inventory"  element={<AdminBloodInventory bloodStock={bloodStock} />} />
        <Route path="/admin/donors"           element={<AdminDonorList />} />
        <Route path="/admin/requests"         element={<AdminRequests />} />
        <Route path="/admin/donor-match"      element={<DonorMatch    darkMode={darkMode} setDarkMode={setDarkMode} />} />
        <Route path="/admin/camps"            element={<AdminCamps    darkMode={darkMode} setDarkMode={setDarkMode} />} />
        <Route path="/admin/audit-logs"       element={<AdminAuditLogs darkMode={darkMode} setDarkMode={setDarkMode} />} />
      </Routes>
      <Chatbot />
    </>
  );
}