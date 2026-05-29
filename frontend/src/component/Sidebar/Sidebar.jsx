import React, { useEffect, useState, useRef } from "react";
import { 
  Globe, 
  Settings, 
  LogOut, 
  Home, 
  User, 
  Plus, 
  FileText, 
  Sparkles, 
  ChevronRight,
  Store,
  PanelLeftClose
} from "lucide-react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import axios from "axios";

import "./Sidebar.css";

const Sidebar = ({ collapsed, onToggle }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const apiUrl = import.meta.env.VITE_API_URL;

  const [username, setUsername] = useState("");
  const [fileHistory, setFileHistory] = useState([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Load user info from localStorage
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      try {
        const userObj = JSON.parse(savedUser);
        if (userObj && userObj.username) {
          setUsername(userObj.username);
        }
      } catch (err) {
        console.error("Error parsing user from localStorage:", err);
      }
    }
  }, []);

  // Fetch document history
  const fetchUserDocs = async () => {
    try {
      const authToken = localStorage.getItem("authToken");
      if (!authToken) return;

      const response = await axios.get(`${apiUrl}users/history/`, {
        headers: {
          Authorization: `Token ${authToken}`,
        },
      });
      setFileHistory(response.data.file_history || []);
    } catch (error) {
      console.error("Error fetching file history in Sidebar:", error);
    }
  };

  useEffect(() => {
    fetchUserDocs();

    // Listen for custom event to refresh history when a new document is analyzed
    const handleDocumentUploaded = () => {
      fetchUserDocs();
    };
    window.addEventListener("documentUploaded", handleDocumentUploaded);
    return () => {
      window.removeEventListener("documentUploaded", handleDocumentUploaded);
    };
  }, []);

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    navigate("/");
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(prev => !prev);
  };

  // Helper to parse unique file_name prefix
  const cleanFileName = (name) => {
    if (!name) return "";
    const parts = name.split('_');
    return parts.length >= 3 ? parts.slice(2).join('_') : name;
  };

  // Helper to get initials
  const getInitials = () => {
    if (!username) return "RP"; // Fallback to RP matching user initials from screenshots
    return username.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  };

  return (
    <div className={`sidebar ${collapsed ? "collapsed" : ""}`}>
      {/* Sidebar Header */}
      <div className="sidebar-header">
        <h2>LexBotAI</h2>
        <button 
          onClick={onToggle} 
          className="sidebar-toggle-btn-inside" 
          title={t("close_sidebar") || "Close sidebar"}
        >
          <PanelLeftClose size={18} />
        </button>
      </div>

      {/* New Scan Button */}
      <div className="new-scan-container">
        <Link to="/dashboard" className="new-scan-btn">
          <Plus size={18} />
          <span>{t("new_scan") || "New Scan"}</span>
        </Link>
      </div>

      {/* Scrollable Recents History List */}
      <div className="sidebar-history-section">
        <div className="history-header">
          <span>{t("recents") || "Recents"}</span>
        </div>
        <div className="history-list">
          {fileHistory.length > 0 ? (
            fileHistory.map((file) => {
              const cleanedName = cleanFileName(file.file_name);
              const isActive = location.state && location.state.fileId === file.id;
              
              return (
                <div
                  key={file.id}
                  onClick={() => navigate("/viewer", { 
                    state: { 
                      fileId: file.id, 
                      fileName: cleanedName, 
                      fileUrl: file.file_url 
                    } 
                  })}
                  className={`history-item ${isActive ? "active" : ""}`}
                  title={cleanedName}
                >
                  <FileText size={16} className="history-icon" />
                  <span className="history-filename">{cleanedName}</span>
                </div>
              );
            })
          ) : (
            <div className="history-empty">
              <span>{t("no_scans") || "No recent scans"}</span>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Profile Footer & Floating Dropdown */}
      <div className="sidebar-footer">
        {/* Floating Dropdown Card Popup */}
        {isDropdownOpen && (
          <div className="profile-dropdown-card" ref={dropdownRef}>
            <div 
              className="dropdown-profile-header" 
              onClick={() => { setIsDropdownOpen(false); navigate("/profile"); }}
            >
              <div className="dropdown-avatar">{getInitials()}</div>
              <div className="profile-header-info">
                <span className="profile-name">{username || "Rajvardhan Patil"}</span>
                <span className="profile-go">{t("Basic") || "Go"}</span>
              </div>
              <ChevronRight size={16} className="chevron-right-icon" />
            </div>
            
            <hr className="dropdown-divider" />
            
            <Link to="/upgradePlan" className="dropdown-item" onClick={() => setIsDropdownOpen(false)}>
              <Sparkles size={18} className="item-icon-sparkle" />
              <span>{t("upgrade_plan")}</span>
            </Link>
            
            <Link to="/profile" className="dropdown-item" onClick={() => setIsDropdownOpen(false)}>
              <User size={18} className="item-icon" />
              <span>{t("profile")}</span>
            </Link>
            
            <Link to="/setting" className="dropdown-item" onClick={() => setIsDropdownOpen(false)}>
              <Settings size={18} className="item-icon" />
              <span>{t("settings")}</span>
            </Link>
            
            <hr className="dropdown-divider" />
            
            <button 
              className="dropdown-item logout-item" 
              onClick={() => { setIsDropdownOpen(false); handleLogout(); }}
            >
              <LogOut size={18} className="item-icon-logout" />
              <span>{t("logout")}</span>
            </button>
          </div>
        )}

        {/* Pinned Profile Footer Container */}
        <div 
          className={`profile-footer-btn ${isDropdownOpen ? "active-footer" : ""}`} 
          onClick={toggleDropdown}
        >
          <div className="profile-avatar-initials">{getInitials()}</div>
          <span className="profile-footer-name">{username || "Rajvardhan Patil"}</span>
          <Store size={18} className="profile-footer-store-icon" />
        </div>
      </div>
    </div>
  );
};

export default Sidebar;