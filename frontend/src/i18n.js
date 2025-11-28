import i18n from "i18next";
import { initReactI18next } from "react-i18next";

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: { welcome: "Welcome", profile: "Profile", language: "Language", settings: "Settings", logout: "Logout" } },
      es: { translation: { welcome: "Bienvenido", profile: "Perfil", language: "Idioma", settings: "Configuraciones", logout: "Cerrar sesión" } },
      fr: { translation: { welcome: "Bienvenue", profile: "Profil", language: "Langue", settings: "Paramètres", logout: "Se déconnecter" } },
      hi: { translation: { welcome: "स्वागत है", profile: "प्रोफ़ाइल", language: "भाषा", settings: "सेटिंग्स", logout: "लॉग आउट" } }
    },
    lng: "en", // Default language
    fallbackLng: "en",
    interpolation: { escapeValue: false },
  });

export default i18n;
