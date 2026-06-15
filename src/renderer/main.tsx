import { createRoot } from "react-dom/client";
import App from "./App";
import { I18nProvider } from "./hooks/useI18n";
import "./global.css";

const root = createRoot(document.getElementById("root")!);
root.render(
  <I18nProvider>
    <App />
  </I18nProvider>,
);
