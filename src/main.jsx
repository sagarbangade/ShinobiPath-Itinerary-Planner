import { createRoot } from "react-dom/client";
import "./index.css";
import "@mui/material/styles";
import App from "./App.jsx";
import { ChatbotProvider } from "./contexts/ChatbotContext";
import { ItineraryDataProvider } from "./contexts/ItineraryDataContext.jsx";

createRoot(document.getElementById("root")).render(
  <ItineraryDataProvider>
    <ChatbotProvider>
      <App />
    </ChatbotProvider>
  </ItineraryDataProvider>
);
