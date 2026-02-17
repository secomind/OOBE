import type { Root } from "react-dom/client";
import { createRoot } from "react-dom/client";
import { IntlProvider } from "react-intl";

import App, { AppProps } from "./App";
import datePickerStyle from "react-datepicker/dist/react-datepicker.css";

import en from "./i18n/langs-compiled/en.json";
import it from "./i18n/langs-compiled/it.json";

const messages = { en, it };

type UserPreferences = {
  language: "en" | "it";
};

type Settings = {
  themeUrl: string;
  userPreferences: UserPreferences;
};

let root: Root | null = null;

const AppLifecycle = {
  mount: (container: ShadowRoot, appProps: AppProps, settings: Settings) => {
    const { themeUrl, userPreferences } = settings;
    const { language } = userPreferences;

    root = createRoot(container);

    root.render(
      <>
        <link href={themeUrl} type="text/css" rel="stylesheet" />
        <style>{datePickerStyle.toString()}</style>
        <IntlProvider
          messages={messages[language]}
          locale={language}
          defaultLocale="en"
        >
          <App {...appProps} />
        </IntlProvider>
      </>,
    );
  },
  unmount: (container: ShadowRoot) => root?.unmount(),
};

export default AppLifecycle;
