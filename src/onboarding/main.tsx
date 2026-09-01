import React from "react";
import ReactDOM from "react-dom/client";
import Onboarding from "./Onboarding";
import "../popup/popup.css";
import "./onboarding.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Onboarding />
  </React.StrictMode>
);
