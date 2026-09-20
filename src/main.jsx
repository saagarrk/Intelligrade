import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import { ErrorBoundary } from "./components/ErrorBoundary.jsx";
import "./index.css";

// Intercept benign sandboxed environment errors (e.g. Vite HMR websocket disconnection when DISABLE_HMR is enabled)
if (typeof window !== "undefined") {
  window.addEventListener("unhandledrejection", (event) => {
    const reason = event?.reason;
    const msg = typeof reason === "string" ? reason : reason?.message || "";
    if (
      msg.includes("WebSocket closed without opened") ||
      msg.includes("failed to connect to websocket") ||
      msg.includes("WebSocket connection to")
    ) {
      // Benign dev sandbox websocket event: prevent noise from escalating to the app crash dialog
      event.preventDefault();
      event.stopPropagation();
    }
  });

  window.addEventListener("error", (event) => {
    const msg = event?.message || "";
    if (
      msg.includes("WebSocket closed without opened") ||
      msg.includes("failed to connect to websocket")
    ) {
      event.preventDefault();
      event.stopPropagation();
    }
  });
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>
);
