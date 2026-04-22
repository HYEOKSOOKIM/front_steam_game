import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./styles/tokens.css";
import "./features/report/styles/report.css";

createRoot(document.getElementById("root")).render(<App />);
