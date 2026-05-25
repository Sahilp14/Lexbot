import React, { useState } from 'react';
import { PanelLeft } from "lucide-react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";

import Index from "./pages/Index/Index";
import Login from "./pages/Login/Login";
import ForgotPassword from "./pages/Login/ForgotPassword";
import ResetPassword from "./pages/Login/ResetPassword";
import Register from "./pages/Register/Register";
import NotFound from "./pages/NotFound/NotFound";
import Dashboard from './pages/Dashboard/Dashboard';
import Profile from './pages/Profile/Profile';
import DocumentViewer from './pages/DocumentViewer/DocumentViewer';

import Pricing from "./component/Pricing/Pricing";
import About from "./component/About/About";
import Contact from './component/Contact/Contact';
import UpgradePlan from "./component/UpgradePlan/UpgradePlan";
import Settings from './component/Setting/Setting';

import Navbar from './component/Navbar/Navbar';
import Sidebar from './component/Sidebar/Sidebar';
import ProtectedRoute from "./component/ProtectedRoute";

import { ToastContainer } from "react-toastify";
import "./i18n";
import './styles/theme.css';

// 📦 Query client
const queryClient = new QueryClient();


// ✅ Layout Wrapper (Sidebar + Content)
const DashboardLayout = ({ children }) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar collapsed={isSidebarCollapsed} onToggle={() => setIsSidebarCollapsed(true)} />
      
      {isSidebarCollapsed && (
        <button 
          onClick={() => setIsSidebarCollapsed(false)} 
          className="sidebar-toggle-btn-outside" 
          title="Open sidebar"
        >
          <PanelLeft size={20} />
        </button>
      )}

      <div style={{ 
        flex: 1, 
        paddingTop: "30px",
        paddingBottom: "30px",
        paddingRight: "30px",
        paddingLeft: isSidebarCollapsed ? "80px" : "30px", 
        marginLeft: isSidebarCollapsed ? "0" : "300px", 
        background: "var(--bg-color-primary)", 
        color: "var(--text-primary)",
        transition: "margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1), padding-left 0.3s cubic-bezier(0.4, 0, 0.2, 1), background 0.3s ease, color 0.3s ease",
        minHeight: "100vh" 
      }}>
        {children}
      </div>
    </div>
  );
};


// ✅ Hide Navbar on dashboard pages
const AppContent = () => {
  const location = useLocation();

  const hideNavbarRoutes = ["/dashboard", "/setting", "/profile", "/viewer", "/upgradePlan"];
  const hideNavbar = hideNavbarRoutes.includes(location.pathname);

  return (
    <>
      {!hideNavbar && <Navbar />}

      <Routes>

        {/* 🌐 Public Routes */}
        <Route path="/" element={<Index />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/register" element={<Register />} />
        <Route path="/signup" element={<Register />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />

        {/* 🔐 Protected Routes (with Sidebar) */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <Dashboard />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/setting"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <Settings />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/upgradePlan"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <UpgradePlan />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <Profile />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/viewer"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <DocumentViewer />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        {/* ❌ Not Found */}
        <Route path="*" element={<NotFound />} />

      </Routes>
    </>
  );
};


// ✅ Main App
const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ToastContainer />
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;