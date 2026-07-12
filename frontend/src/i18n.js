import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  en: {
    translation: {
     "home": "Home",
      "welcome": "Transparency starts with you.",
      "report_btn": "Report Corruption",
      "location_label": "Sub-county",
      "submit": "Submit Report"  }
  },
  lango: {
    translation: {
      "home": "Paco",
      "welcome": "Tic ma tye ka maleng cake kwedi.",
      "report_btn": "Dot camucana",
      "location_label": "Gombola",
      "submit": "Cwal Adot"
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    interpolation: { escapeValue: false }
  });

export default i18n;