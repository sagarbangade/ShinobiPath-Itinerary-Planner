import  { useState, useRef, useEffect } from 'react';
import '../scss/chat.css';
import 'font-awesome/css/font-awesome.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = 'AIzaSyBYCyPObqcCeOHxrtWf8kfFYkhOnmHxWOI'; // **Replace with your actual API key!**
const genAI = new GoogleGenerativeAI(apiKey);

const model = genAI.getGenerativeModel({
  model: "gemini-2.0-flash-lite-preview-02-05",
  systemInstruction: `You are a helpful AI assistant.`,
});


const generationConfig = {
  temperature: 0.7,
  topP: 0.9,
  maxOutputTokens: 2048,
};


const speechSynthesis = window.speechSynthesis;

function textToSpeech(text) {
  speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);

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
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [textInput, setTextInput] = useState('');
  const messagesContainerRef = useRef(null);
  const textInputRef = useRef(null);
  const [isListening, setIsListening] = useState(false);

  useEffect(() => {
    const chatId = localStorage.getItem("chatID") || createUUID();
    localStorage.setItem("chatID", chatId);

    const timer = setTimeout(() => {
      setIsChatOpen(true);
      setMessages([{ type: 'other', text: "👋 Hello! I'm Sagar's AI Assistant, here to help. What would you like to know?" }]);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (isChatOpen) {
      scrollToBottom();
      textInputRef.current.focus();
    }
  }, [isChatOpen]);

  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  };

  const openChat = () => {
    setIsChatOpen(true);
  };

  const closeChat = () => {
    setIsChatOpen(false);
  };

  const sendMessage = async () => {
    const newMessageText = textInput.replace(/\n/g, '<br>');

    if (!newMessageText.trim()) return;

    const userMessage = { type: 'self', text: newMessageText };
    setMessages(prevMessages => [...prevMessages, userMessage]);
    setTextInput('');
    console.log("sendMessage: setTextInput('') called");
    console.log("sendMessage: textInput state after setTextInput:", textInput);

    if (textInputRef.current) {
      console.log("sendMessage: textInputRef.current.textContent before clear:", textInputRef.current.textContent);
      textInputRef.current.textContent = '';
      console.log("sendMessage: textInputRef.current.textContent after clear:", textInputRef.current.textContent);
    }


    try {
      let historyToSend = messages.map(msg => ({
        role: msg.type === 'self' ? 'user' : 'model',
        parts: [{ text: msg.text.replace(/<br>/g, '\n') }],
      }));

      if (messages.length > 1) {
        historyToSend = historyToSend.slice(1);
      } else {
        historyToSend = [];
      }

      const chatSession = model.startChat({
        generationConfig,
        history: historyToSend,
      });

      const geminiResponse = await chatSession.sendMessage(newMessageText.trim());
      const responseText = geminiResponse.response.text();

      const aiResponse = { type: 'other', text: responseText };
      setMessages(prevMessages => [...prevMessages, aiResponse]);
      textToSpeech(responseText);

    } catch (error) {
      console.error("Error sending message to Gemini:", error);
      const errorResponse = { type: 'other', text: "Sorry, error from AI. Try again." };
      setMessages(prevMessages => [...prevMessages, errorResponse]);
    } finally {
      scrollToBottom();
    }
  };


  const handleKeyDown = (event) => {
    if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
      sendMessage();
      event.preventDefault();
    }
  };

  const startSpeechRecognition = () => {
    if (!('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
      alert("Speech recognition is not supported in your browser.");
      return;
    }

    console.log("startSpeechRecognition: function called");

    const newRecognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    newRecognition.lang = "en-US";
    newRecognition.interimResults = false;
    newRecognition.maxAlternatives = 1;

    newRecognition.onstart = () => {
      console.log("startSpeechRecognition: recognition started");
      setIsListening(true);
    };

    newRecognition.onresult = (event) => {
      console.log("startSpeechRecognition: recognition result received");
      console.log("startSpeechRecognition: event object:", event); // Log the entire event
      console.log("startSpeechRecognition: event.results:", event.results); // Log event.results

      if (event.results && event.results[0] && event.results[0][0]) {
        const transcript = event.results[0][0].transcript;
        console.log("startSpeechRecognition: transcript:", transcript); // Log the transcript
        setTextInput(transcript); // Update React state
        if (textInputRef.current) {
          textInputRef.current.textContent = transcript; // Directly update DOM
          console.log("startSpeechRecognition: textInputRef.current.textContent updated to:", transcript); // Confirm DOM update
        }
      } else {
        console.warn("startSpeechRecognition: No transcript found in event.results"); // Warn if no transcript
      }
      setIsListening(false);
    };

    newRecognition.onerror = (event) => {
      console.error("startSpeechRecognition: recognition error:", event.error);
      setIsListening(false);
    };

    newRecognition.onend = () => {
      console.log("startSpeechRecognition: recognition ended");
      setIsListening(false);
    };

    try {
      newRecognition.start();
    } catch (error) {
      console.error("startSpeechRecognition: error starting recognition:", error);
      setIsListening(false);
      alert("Error starting speech recognition. Please check console for details.");
    }
  };

  const stopSpeechRecognition = () => {
    if (recognition) {
      recognition.stop();
      setIsListening(false);
    }
  };


  function createUUID() {
    var s = [];
    var hexDigits = "0123456789abcdef";
    for (var i = 0; i < 36; i++) {
      s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
    }
    s[14] = "4";
    s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1);
    s[8] = s[13] = s[18] = s[23] = "-";
    var uuid = s.join("");
    return uuid;
  }


  return (
    <div className={`floating-chat ${isChatOpen ? 'expand enter' : 'enter'}`} onClick={!isChatOpen ? openChat : undefined}>
      {!isChatOpen && <i className="fa fa-comments" aria-hidden="true"></i>}
      <div className={`chat ${isChatOpen ? 'enter' : ''}`}>
        <div className="header">
          <span className="title">
            Chat with AI
          </span>
          <button onClick={closeChat}>
            <i className="fa fa-times" aria-hidden="true"></i>
          </button>
        </div>

        <ul className="messages" ref={messagesContainerRef}>
          {messages.map((message, index) => (
            <li key={index} className={message.type}>
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
            onInput={(e) => setTextInput(e.target.textContent)}
            suppressContentEditableWarning={true}
            spellCheck="false"
          ></div>

          <button id="micButton" onClick={startSpeechRecognition}>
            <i className={`bi bi-mic ${isListening ? 'text-danger' : 'text-mic'}`}></i>
          </button>
          <button id="sendMessage" onClick={sendMessage}>send</button>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;