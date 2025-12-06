import React, { useEffect } from "react";
import { User, Globe, Settings, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Link, useLocation } from "react-router-dom";

import "./Sidebar.css";

const Sidebar = () => {
  const navigate = useNavigate();
  const authToken = localStorage.getItem("authToken");
  const apiUrl = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const addGoogleTranslateScript = () => {
      if (!window.google) {
        const script = document.createElement("script");
        script.src = "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
        script.async = true;
        document.body.appendChild(script);
      }
    };

    window.googleTranslateElementInit = () => {
      if (!document.getElementById("google_translate_element").hasChildNodes()) {
        new window.google.translate.TranslateElement(
          {
            pageLanguage: "en",
            includedLanguages: "fr,de,es,hi,zh,ar",
            layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
          },
          "google_translate_element"
        );
      }
    };

    addGoogleTranslateScript();

    // Hide the Google Translate top bar
    setTimeout(() => {
      const googleFrame = document.querySelector(".goog-te-banner-frame");
      if (googleFrame) googleFrame.style.display = "none";

      document.body.style.top = "0px"; // Prevent page shifting
    }, 1000);
  }, []);

  const handleLogout = async () => {
    console.log(authToken);
    if (!authToken) {
      console.error("No auth token found. User may not be logged in.");
      return;
    }

    try {
      // const resp = await axios.delete(`${apiUrl}users/cleanup/`, {
      //   headers: { Authorization: `Token ${authToken}` },
      // });

      // await axios.post(`${apiUrl}users/logout/`,null, {
      //   headers: { Authorization: `Token ${authToken}` },
      // });

      // await axios.post(`${apiUrl}users/logout/`, null, {
      // headers: { Authorization: `Token ${authToken}` },
      // });

      // const resp = await axios.delete(`${apiUrl}users/cleanup/`, {
      // headers: { Authorization: `Token ${authToken}` },
      // });


      navigate("/");
      setTimeout(()=>{localStorage.removeItem("authToken");},2000)
      
    } catch (error) {
      console.error("Error during logout:", error.response?.data || error.message);
    }
  };

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h2>LexBotAI</h2>
      </div>
      <div className="sidebar-menu">
        {/* Language Selector */}

       {/* const location = useLocation(); // Add this near top inside Sidebar() */}

{/* <div className="sidebar-item">
  <Globe size={20} />
  <Link
    to="/upgradePlan"
    className={`nav-link ${location.pathname === "/upgradePlan" ? "active" : ""}`}
  >
    Upgrade Plan
  </Link>
</div> */}

        <div className="sidebar-item">
          <Globe size={20} />
          <Link
            to="/setting"
            className={`nav-link ${location.pathname === "/setting" ? "active" : ""}`}
          >
            Setting
          </Link>
        </div>

        <div id="google_translate_element"></div>

        <div className="sidebar-item">
          <Globe size={20} />
          <Link
            to="/notFound"
            className={`nav-link ${location.pathname === "/notFound" ? "active" : ""}`}
          >
            Profile
          </Link>
        </div>

        <button className="sidebar-item logout-btn" onClick={handleLogout}>
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
