import React, { useState, useContext, useEffect } from "react";
import "./Setting.css";
import { LanguageContext } from "../../context/LanguageContext";
import { useTranslation } from "react-i18next";
import axios from "axios";
import { toast } from "react-toastify";
import { Loader2, Save, Settings as SettingsIcon } from "lucide-react";

const Settings = () => {
  const { language, setLanguage, theme, setTheme } = useContext(LanguageContext);
  const { t } = useTranslation();
  const apiUrl = import.meta.env.VITE_API_URL;

  // Local draft states
  const [draftTheme, setDraftTheme] = useState("light");
  const [draftLanguage, setDraftLanguage] = useState("english");
  const [draftNotifications, setDraftNotifications] = useState(true);
  const [draftAutoSave, setDraftAutoSave] = useState(true);

  // Status states
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Load settings on mount
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const authToken = localStorage.getItem("authToken");
        if (!authToken) {
          throw new Error("No authentication token found");
        }

        const res = await axios.get(`${apiUrl}settings/`, {
          headers: {
            Authorization: `Token ${authToken}`,
          },
        });

        if (res.data) {
          const fetchedTheme = res.data.theme || "light";
          const fetchedLang = res.data.language || "english";
          const fetchedNotif = res.data.notifications !== undefined ? res.data.notifications : true;
          const fetchedAuto = res.data.autoSave !== undefined ? res.data.autoSave : true;

          // Update drafts
          setDraftTheme(fetchedTheme);
          setDraftLanguage(fetchedLang);
          setDraftNotifications(fetchedNotif);
          setDraftAutoSave(fetchedAuto);

          // Apply to global app context
          setTheme(fetchedTheme);
          setLanguage(fetchedLang);

          // Save to localStorage as a cached copy
          localStorage.setItem("app_theme", fetchedTheme);
          localStorage.setItem("app_language", fetchedLang);
          localStorage.setItem("app_notifications", JSON.stringify(fetchedNotif));
          localStorage.setItem("app_autoSave", JSON.stringify(fetchedAuto));
        }
      } catch (err) {
        console.warn("Failed to fetch settings from API, falling back to local cache:", err);
        
        // Fallback to local storage or global context
        const cachedTheme = localStorage.getItem("app_theme") || theme || "light";
        const cachedLang = localStorage.getItem("app_language") || language || "english";
        const cachedNotif = localStorage.getItem("app_notifications") 
          ? JSON.parse(localStorage.getItem("app_notifications")) 
          : true;
        const cachedAuto = localStorage.getItem("app_autoSave")
          ? JSON.parse(localStorage.getItem("app_autoSave"))
          : true;

        setDraftTheme(cachedTheme);
        setDraftLanguage(cachedLang);
        setDraftNotifications(cachedNotif);
        setDraftAutoSave(cachedAuto);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, [apiUrl, theme, language, setTheme, setLanguage]);

  // Save changes
  const saveSettings = async () => {
    setSaving(true);
    try {
      const authToken = localStorage.getItem("authToken");

      // 1. Sync globally (Context triggers body class and i18n change instantly)
      setTheme(draftTheme);
      setLanguage(draftLanguage);

      // 2. Cache in localStorage
      localStorage.setItem("app_theme", draftTheme);
      localStorage.setItem("app_language", draftLanguage);
      localStorage.setItem("app_notifications", JSON.stringify(draftNotifications));
      localStorage.setItem("app_autoSave", JSON.stringify(draftAutoSave));

      // 3. Send to Django REST backend
      if (authToken) {
        await axios.post(
          `${apiUrl}settings/`,
          {
            theme: draftTheme,
            language: draftLanguage,
            notifications: draftNotifications,
            autoSave: draftAutoSave,
          },
          {
            headers: {
              Authorization: `Token ${authToken}`,
            },
          }
        );
      }

      toast.success("Settings saved and applied successfully!", {
        position: "top-right",
        autoClose: 3000,
      });
    } catch (err) {
      console.error("Error saving settings to API:", err);
      toast.warn("Settings applied locally, but could not sync with database.", {
        position: "top-right",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" }}>
          <Loader2 size={40} className="spinner-icon" style={{ color: "#2563eb", animation: "spin 1s linear infinite" }} />
          <p style={{ color: "var(--text-secondary)", fontWeight: 500 }}>{t("loading_prefs")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="settings-container">
      {/* HEADER */}
      <div className="settings-header">
        <h1 className="settings-title">
          <SettingsIcon size={28} style={{ marginRight: "10px", verticalAlign: "middle" }} />
          {t("settings")}
        </h1>
        <p className="settings-subtitle">{t("customize_experience")}</p>
      </div>

      {/* NOTIFICATIONS */}
      <div className="settings-section">
        <div className="setting-item">
          <div>
            <h3 className="setting-title">{t("notifications")}</h3>
            <p className="setting-desc">{t("notifications_desc")}</p>
          </div>

          <label className="switch">
            <input
              type="checkbox"
              checked={draftNotifications}
              onChange={() => setDraftNotifications(!draftNotifications)}
            />
            <span className="slider"></span>
          </label>
        </div>
      </div>

      {/* AUTO SAVE */}
      <div className="settings-section">
        <div className="setting-item">
          <div>
            <h3 className="setting-title">{t("auto_save")}</h3>
            <p className="setting-desc">{t("auto_save_desc")}</p>
          </div>

          <label className="switch">
            <input
              type="checkbox"
              checked={draftAutoSave}
              onChange={() => setDraftAutoSave(!draftAutoSave)}
            />
            <span className="slider"></span>
          </label>
        </div>
      </div>

      {/* THEME */}
      <div className="settings-section">
        <h3 className="section-heading">{t("theme")}</h3>

        <div className="radio-group">
          <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
            <input
              type="radio"
              value="light"
              checked={draftTheme === "light"}
              onChange={(e) => setDraftTheme(e.target.value)}
            />
            {t("light")}
          </label>

          <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
            <input
              type="radio"
              value="dark"
              checked={draftTheme === "dark"}
              onChange={(e) => setDraftTheme(e.target.value)}
            />
            {t("dark")}
          </label>
        </div>
      </div>

      {/* LANGUAGE */}
      <div className="settings-section">
        <h3 className="section-heading">{t("language")}</h3>

        <select
          className="select-box"
          value={draftLanguage}
          onChange={(e) => setDraftLanguage(e.target.value)}
          style={{ width: "100%", maxWidth: "300px", padding: "10px", borderRadius: "8px", cursor: "pointer" }}
        >
          <option value="english">English</option>
          <option value="hindi">Hindi</option>
          <option value="spanish">Spanish</option>
          <option value="french">French</option>
        </select>
      </div>

      {/* SAVE BUTTON */}
      <button className="save-btn" onClick={saveSettings} disabled={saving} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        {saving ? (
          <>
            <Loader2 size={18} className="spinner-icon" style={{ animation: "spin 1s linear infinite" }} />
            <span>{t("saving")}</span>
          </>
        ) : (
          <>
            <Save size={18} />
            <span>{t("save_settings")}</span>
          </>
        )}
      </button>
    </div>
  );
};

export default Settings;