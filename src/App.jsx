import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  NavLink,
  Navigate,
  useLocation,
  useNavigate,
} from "react-router-dom";
import './App.css';

import LoginPage from "./pages/LoginPage";
import UserManagement from "./pages/UserManagement";
import PersonalEmails from "./pages/PersonalEmails";
import DomainEmails from "./pages/DomainEmails";
import CustomEmails from "./pages/CustomEmails";
import Dashboard from "./pages/Dashboard";
import ProtectedRoute from "./pages/ProtectedRoute";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();

  if (location.pathname === "/login" || location.pathname === "/") return null;

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <img
          src="/MailMatrix Logo Design.png" 
          alt="Logo"
          className="navbar-logo"
        />
        <span className="navbar-brand">MailMatrix</span>

        <NavLink 
          to="/dashboard" 
          className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}
        >
          Dashboard
        </NavLink>

        <NavLink 
          to="/user-management" 
          className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}
        >
          User Management
        </NavLink>

        <NavLink 
          to="/personal-emails" 
          className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}
        >
          Personal Emails
        </NavLink>

        <NavLink 
          to="/domain-emails" 
          className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}
        >
          Domain Emails
        </NavLink>

        <NavLink 
          to="/custom-emails" 
          className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}
        >
          Custom Emails
        </NavLink>
      </div>

      <div className="navbar-right">
        <button className="sign-in-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </nav>
  );
}

function App() {
  return (
    <Router>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          minHeight: "100vh",
        }}
      >
        <Navbar />
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "1rem",
          }}
        >
          <Routes>
            <Route path="/" element={<Navigate to="/login" />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/logout" element={<Navigate to="/login" replace />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/user-management"
              element={
                <ProtectedRoute>
                  <UserManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/personal-emails"
              element={
                <ProtectedRoute>
                  <PersonalEmails />
                </ProtectedRoute>
              }
            />
            <Route
              path="/custom-emails"
              element={
                <ProtectedRoute>
                  <CustomEmails />
                </ProtectedRoute>
              }
            />
            <Route
              path="/domain-emails"
              element={
                <ProtectedRoute>
                  <DomainEmails />
                </ProtectedRoute>
              }
            />
          </Routes>
        </div>

        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          pauseOnHover
          draggable
        />
      </div>
    </Router>
  );
}

export default App;
