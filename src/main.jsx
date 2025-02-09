import { createRoot } from "react-dom/client";
import "./index.css";
import "@mui/material/styles";
import App from "./App.jsx";
import { ChatbotProvider } from "./contexts/ChatbotContext";

createRoot(document.getElementById("root")).render(
  <ChatbotProvider>
    <App />
  </ChatbotProvider>
);
