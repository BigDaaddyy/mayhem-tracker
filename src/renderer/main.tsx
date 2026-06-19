import { createRoot } from "react-dom/client";
import App from "./App";
import { I18nProvider } from "./hooks/useI18n";
import { FontSizeProvider } from "./hooks/useFontSize";
import { PatchVersionProvider } from "./hooks/usePatchVersion";
import { applyFontSize, parseFontSize } from "./lib/fontSize";
import "./global.css";

void window.api.getSetting("font_size").then((val) => {
  applyFontSize(parseFontSize(val));
});

const root = createRoot(document.getElementById("root")!);
root.render(
  <I18nProvider>
    <FontSizeProvider>
      <PatchVersionProvider>
        <App />
      </PatchVersionProvider>
    </FontSizeProvider>
  </I18nProvider>,
);
