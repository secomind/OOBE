import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { IntlProvider } from "react-intl";
import App from "./App.tsx";
import "./index.scss";
import "bootstrap/dist/css/bootstrap.min.css";

import en from "./i18n/langs-compiled/en.json";
import it from "./i18n/langs-compiled/it.json";

const translationsByLanguage = { en, it };

type Language = keyof typeof translationsByLanguage;

const defaultLanguage: Language = "en";

const getDefaultLanguage = () => {
  const browserLanguage = navigator.language.slice(0, 2);
  return browserLanguage in translationsByLanguage
    ? (browserLanguage as Language)
    : defaultLanguage;
};

const language = getDefaultLanguage();

const translations =
  translationsByLanguage[language] || translationsByLanguage[defaultLanguage];

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <IntlProvider
        locale={language}
        defaultLocale={defaultLanguage}
        messages={translations}
      >
        <App />
      </IntlProvider>
    </BrowserRouter>
  </StrictMode>,
);
