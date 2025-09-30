import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./global.css";

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Root element not found");
}

const root = ReactDOM.createRoot(rootElement);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/service-worker.js")
      .then((registration) => {
        console.info("Service worker registered", registration.scope);
      })
      .catch((error) => {
        console.error("Service worker registration failed", error);
      });
  });
}
