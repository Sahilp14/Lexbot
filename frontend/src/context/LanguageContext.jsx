import React, { createContext, useState, useEffect } from "react";
import i18n from "../i18n";

export const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
    // 💾 Retrieve initial values from localStorage to avoid layout flashes
    const [language, setLanguageState] = useState(() => {
        return localStorage.getItem("app_language") || "english";
    });

    const [theme, setThemeState] = useState(() => {
        return localStorage.getItem("app_theme") || "light";
    });

    // 🌐 Update language globally & store locally
    const setLanguage = (lang) => {
        setLanguageState(lang);
        localStorage.setItem("app_language", lang);
        
        const langMap = {
            english: "en",
            hindi: "hi",
            spanish: "es",
            french: "fr"
        };
        const code = langMap[lang.toLowerCase()] || "en";
        i18n.changeLanguage(code);
    };

    // 🌓 Update theme globally & store locally
    const setTheme = (newTheme) => {
        setThemeState(newTheme);
        localStorage.setItem("app_theme", newTheme);
    };

    // 🔄 Automatically apply theme body class and sync i18n on mount & updates
    useEffect(() => {
        // Sync Theme class on body
        document.body.classList.remove("light", "dark");
        document.body.classList.add(theme);

        // Sync Language translation config
        const langMap = {
            english: "en",
            hindi: "hi",
            spanish: "es",
            french: "fr"
        };
        const code = langMap[language.toLowerCase()] || "en";
        i18n.changeLanguage(code);
    }, [language, theme]);

    return (
        <LanguageContext.Provider value={{ language, setLanguage, theme, setTheme }}>
            {children}
        </LanguageContext.Provider>
    );
};