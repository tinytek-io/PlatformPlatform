import React from "react";
import ReactDOM from "react-dom/client";
import "./main.css";
import { ReactFilesystemRouter } from "@platformplatform/client-filesystem-router/react";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ReactFilesystemRouter />
  </React.StrictMode>
);