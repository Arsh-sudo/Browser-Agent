import React from "react";
import ReactDOM from "react-dom/client";
import SidePanel from "./SidePanel";
import "../popup/popup.css";
import "./sidepanel.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <SidePanel />
  </React.StrictMode>
);
