import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// --- Alternative Solution: Embed translations directly ---
// To permanently fix the recurring module resolution error, we are embedding
// the translation resources directly into this file. This avoids external
// file imports that can cause issues with the browser's module loader.
const resources = {
  en: {
    translation: {
      "dashboard": "Dashboard",
      "ratebooks": "Ratebooks",
      "projects": "Projects",
      "analytics": "Analytics",
      "admin": "Admin",
      "welcome_back": "Welcome back, here's a summary of your workspace.",
      "new_project": "New Project",
      "language": "Language"
    }
  },
  hi: {
    translation: {
      "dashboard": "tableau",
      "ratebooks": "दर-पुस्तकें",
      "projects": "परियोजनाएं",
      "analytics": "विश्लेषिकी",
      "admin": "प्रशासक",
      "welcome_back": "वापसी पर स्वागत है, यहाँ आपके कार्यक्षेत्र का सारांश है।",
      "new_project": "नई परियोजना",
      "language": "भाषा"
    }
  },
  te: {
    translation: {
      "dashboard": "డాష్బోర్డ్",
      "ratebooks": "రేటు పుస్తకాలు",
      "projects": "ప్రాజెక్టులు",
      "analytics": "విశ్లేషణలు",
      "admin": "నిర్వాహకుడు",
      "welcome_back": "తిరిగి స్వాగతం, ఇక్కడ మీ కార్యస్థలం యొక్క సారాంశం ఉంది.",
      "new_project": "కొత్త ప్రాజెక్ట్",
      "language": "భాష"
    }
  },
  mr: {
    translation: {
      "dashboard": "डॅशबोर्ड",
      "ratebooks": "दरपुस्तिका",
      "projects": "प्रकल्प",
      "analytics": "विश्लेषण",
      "admin": "प्रशासक",
      "welcome_back": "परत स्वागत आहे, येथे तुमच्या कार्यक्षेत्राचा सारांश आहे.",
      "new_project": "नवीन प्रकल्प",
      "language": "भाषा"
    }
  }
};

i18n
  // detect user language
  .use(LanguageDetector)
  // pass the i18n instance to react-i18next.
  .use(initReactI18next)
  // init i18next
  .init({
    resources,
    debug: true,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false, // not needed for react as it escapes by default
    },
  });

export default i18n;
