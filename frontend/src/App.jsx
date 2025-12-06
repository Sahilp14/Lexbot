// App.jsx
import React from 'react';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index/Index";
import Login from "./pages/Login/Login";
import Register from "./pages/Register/Register";
import NotFound from "./pages/NotFound/NotFound";
import Dashboard from './pages/Dashboard/Dashboard';
import { ToastContainer } from "react-toastify";
import DocumentViewer from './pages/DocumentViewer/DocumentViewer';
import ProtectedRoute from "./component/ProtectedRoute";
import Pricing from "./component/Pricing/Pricing";
import About from "./component/About/About";
import Contact from './component/Contact/Contact';
// import UpgradePlan from "./component/UpgradePlan/UpgradePlan";
import Settings from './component/Setting/Setting';
import "./i18n"; // Import i18n config



const queryClient = new QueryClient();

const App = () => (
  // const { t, i18n } = useTranslation();


  <QueryClientProvider client={queryClient}>
    <ToastContainer/>

    <BrowserRouter>
     {/* <Navbar/> */}
  <Routes>
    <Route path="/" element={<Index />} />
    <Route path="/login" element={<Login />} />
    <Route path="/pricing" element={<Pricing />} />
    <Route path="/about" element={<About />} />
     {/* <Route path="/upgradePlan" element={<UpgradePlan />} /> */}
    <Route path="/contact" element={<Contact />} />
    <Route path="/notFound" element={<NotFound />} />
    <Route path="/setting" element={<Settings />} />
    <Route path="/register" element={<Register />} />
    <Route path="/signup" element={<Register />} />

    {/* Protected Routes */}
    <Route 
      path="/dashboard" 
      element={
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      } 
    />

    <Route 
      path="/profile" 
      element={
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      } 
    />

    <Route 
      path="/viewer" 
      element={
        <ProtectedRoute>
          <DocumentViewer />
        </ProtectedRoute>
      } 
    />

    <Route path="*" element={<NotFound />} />
  </Routes>
</BrowserRouter>

  </QueryClientProvider>
);

export default App;