import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./i18n";
import { registerServiceWorker } from "./lib/pwa";
import "./styles/global.scss";

const container = document.getElementById("root");

if (!container) {
  throw new Error("Root element #root was not found.");
}

registerServiceWorker();

createRoot(container).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
