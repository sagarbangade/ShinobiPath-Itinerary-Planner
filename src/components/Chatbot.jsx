// src\components\Chatbot.jsx
import React, { useRef } from "react";
import "../scss/chat.css";
import "font-awesome/css/font-awesome.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import { useChatbot } from "../contexts/ChatbotContext";
import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = "YOUR_API_KEY"; // **Replace with your actual API key!**
const genAI = new GoogleGenerativeAI(apiKey);

const generationConfig = {
  temperature: 0.7,
  topP: 0.9,
  maxOutputTokens: 2048,
};

const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = SpeechRecognition ? new SpeechRecognition() : null;
if (recognition) {
  recognition.continuous = false;
  recognition.interimResults = false;
  recognition.lang = "en-US";
}

const speechSynthesis = window.speechSynthesis;

function textToSpeech(text) {
  speechSynthesis.cancel();
  const utterance = new SynthesisUtterance(text);

  utterance.rate = 1.0;
  utterance.pitch = 1.0;
  utterance.volume = 1.0;

  let voices = speechSynthesis.getVoices();
  if (voices.length === 0) {
    speechSynthesis.onvoiceschanged = () => {
      voices = speechSynthesis.getVoices();
    };
  }

  const femaleVoice = voices.find(
    (voice) =>
      voice.lang.startsWith("en-") &&
      (voice.name.toLowerCase().includes("female") ||
        voice.name.toLowerCase().includes("woman") ||
        voice.name.includes("Samantha") ||
        voice.name.includes("Microsoft Zira"))
  );
  const englishVoice = voices.find((voice) => voice.lang.startsWith("en-"));
  utterance.voice = femaleVoice || englishVoice;

  speechSynthesis.speak(utterance);
}

const Chatbot = () => {
  const {
    isChatOpen,
    openChat,
    closeChat,
    messages,
    textInputRef,
    messagesContainerRef,
    sendMessage,
    userName,
    userPhotoURL,
    isListening,
    setIsListening,
    loadingHistory,
  } = useChatbot();

  const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash-lite-preview-02-05",
    systemInstruction: userName
      ? `You are a helpful and friendly AI assistant specialized in travel planning. Your name is TravelAI. You are assisting ${userName} with planning their itinerary. Please address the user by their name, ${userName}, in your responses to make the conversation more personal and engaging for their travel planning needs.`
      : `You are a helpful and friendly AI assistant specialized in travel planning. Your name is TravelAI. You are assisting users with planning their itineraries. Please provide helpful and informative responses related to travel planning.`,
  });

  const handleSendMessage = async () => {
    const newMessageText = textInputRef.current?.textContent || "";
    sendMessage(newMessageText);
  };

  const handleKeyDown = (event) => {
    if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
      handleSendMessage();
      event.preventDefault();
    }
  };

  const startSpeechRecognition = () => {
    if (
      !("SpeechRecognition" in window || "webkitSpeechRecognition" in window)
    ) {
      alert("Speech recognition is not supported in your browser.");
      return;
    }

    const newRecognition = new (window.SpeechRecognition ||
      window.webkitSpeechRecognition)();
    newRecognition.lang = "en-US";
    newRecognition.interimResults = false;
    newRecognition.maxAlternatives = 1;

    newRecognition.onstart = () => {
      setIsListening(true);
    };

    newRecognition.onresult = (event) => {
      if (event.results && event.results[0] && event.results[0][0]) {
        const transcript = event.results[0][0].transcript;
        if (textInputRef.current) {
          textInputRef.current.textContent = transcript;
        }
      }
      setIsListening(false);
    };

    newRecognition.onerror = (event) => {
      console.error("startSpeechRecognition: recognition error:", event.error);
      setIsListening(false);
    };

    newRecognition.onend = () => {
      setIsListening(false);
    };

    try {
      newRecognition.start();
    } catch (error) {
      console.error(
        "startSpeechRecognition: error starting recognition:",
        error
      );
      setIsListening(false);
      alert(
        "Error starting speech recognition. Please check console for details."
      );
    }
  };

  const stopSpeechRecognition = () => {
    if (recognition) {
      recognition.stop();
      setIsListening(false);
    }
  };

  return (
    <div
      className={`floating-chat ${isChatOpen ? "expand enter" : "enter"}`}
      onClick={!isChatOpen ? openChat : undefined}
    >
      {!isChatOpen && <i className="fa fa-comments" aria-hidden="true"></i>}
      <div className={`chat ${isChatOpen ? "enter" : ""}`}>
        <div className="header">
          <span className="title">Travel AI Assistant</span>
          <button onClick={closeChat}>
            <i className="fa fa-times" aria-hidden="true"></i>
          </button>
        </div>

        <ul className="messages" ref={messagesContainerRef}>
          {loadingHistory && <li>Loading chat history...</li>}
          {messages.map((message, index) => (
            <li
              key={index}
              className={message.type}
              style={
                message.type === "self" && userPhotoURL
                  ? {
                      "--user-bg-image": `url(${userPhotoURL})`, // Keep CSS variable
                    }
                  : {}
              }
            >
              <div dangerouslySetInnerHTML={{ __html: message.text }} />
            </li>
          ))}
        </ul>
        <div className="footer">
          <div
            ref={textInputRef}
            className="text-box"
            contentEditable={true}
            role="textbox"
            onKeyDown={handleKeyDown}
            suppressContentEditableWarning={true}
            spellCheck="false"
          ></div>

          <button id="micButton" onClick={startSpeechRecognition}>
            <i
              className={`bi bi-mic ${
                isListening ? "text-danger" : "text-mic"
              }`}
            ></i>
          </button>
          <button id="sendMessage" onClick={handleSendMessage}>
            send
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;
