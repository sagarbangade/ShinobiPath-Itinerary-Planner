// src\contexts\ChatbotContext.jsx
import React, {
  createContext,
  useState,
  useEffect,
  useRef,
  useContext,
} from "react";
import { useItineraryData } from "./ItineraryDataContext";
import { db, auth } from "../firebase/firebaseConfig";
import {
  collection,
  doc,
  onSnapshot,
  addDoc,
  serverTimestamp,
  query,
  orderBy,
  getDoc,
} from "firebase/firestore";
import { GoogleGenerativeAI } from "@google/generative-ai";

const ChatbotContext = createContext();

const apiKey = "AIzaSyBYCyPObqcCeOHxrtWf8kfFYkhOnmHxWOI"; // **Replace with your actual API key!**
const genAI = new GoogleGenerativeAI(apiKey);

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

export const useChatbot = () => useContext(ChatbotContext);

export const ChatbotProvider = ({ children }) => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const messagesContainerRef = useRef(null);
  const textInputRef = useRef(null);
  const [isListening, setIsListening] = useState(false);
  const [userName, setUserName] = useState(null);
  const [userPhotoURL, setUserPhotoURL] = useState(null);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const { currentTravelPlans } = useItineraryData();
  useEffect(() => {
    if (isChatOpen) {
      scrollToBottom();
      textInputRef.current.focus();
    }
  }, [isChatOpen]);

  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop =
        messagesContainerRef.current.scrollHeight;
    }
  };

  const openChat = () => {
    setIsChatOpen(true);
  };

  const closeChat = () => {
    setIsChatOpen(false);
  };

  useEffect(() => {
    setLoadingHistory(true);
    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
      if (user) {
        const fetchUserProfile = async () => {
          try {
            const userDoc = await getDoc(doc(db, "users", user.uid));
            if (userDoc.exists()) {
              const userData = userDoc.data();
              setUserPhotoURL(userData.photoURL || user.photoURL || null);
              setUserName(userData.displayName || user.displayName || null);
            } else {
              setUserPhotoURL(user.photoURL || null);
              setUserName(user.displayName || null);
            }
          } catch (error) {
            console.error("Error fetching user document:", error);
            setUserPhotoURL(user.photoURL || null);
            setUserName(user.displayName || null);
          }
        };
        fetchUserProfile();

        const userChatRef = collection(db, "userChats", user.uid, "messages");
        const orderedQuery = query(userChatRef, orderBy("timestamp", "asc"));

        const unsubscribeMessages = onSnapshot(
          orderedQuery,
          (snapshot) => {
            const fetchedMessages = snapshot.docs.map((doc) => {
              const data = doc.data();
              return {
                type: data.role === "user" ? "self" : "other",
                text: data.text,
                timestamp: data.timestamp?.toDate() || null,
              };
            });
            setMessages(fetchedMessages);
            setLoadingHistory(false);
            scrollToBottom();
          },
          (error) => {
            console.error(
              "Error fetching chat messages from Firestore:",
              error
            );
            setLoadingHistory(false);
          }
        );
        return () => {
          unsubscribeMessages();
        };
      } else {
        setUserName(null);
        setUserPhotoURL(null);
        setMessages([]);
        setLoadingHistory(false);
      }
    });
    return () => unsubscribeAuth();
  }, []);

  const sendMessage = async (newMessageText) => {
    if (!newMessageText.trim()) return;

    const userMessage = { type: "self", text: newMessageText };
    setMessages((prevMessages) => [...prevMessages, userMessage]);

    if (textInputRef.current) {
      textInputRef.current.textContent = "";
    }

    try {
      const user = auth.currentUser;
      if (user) {
        const userMessagesRef = collection(
          db,
          "userChats",
          user.uid,
          "messages"
        );
        await addDoc(userMessagesRef, {
          role: "user",
          text: newMessageText,
          timestamp: serverTimestamp(),
        });
      }

      // *** Gemini API Integration STARTS HERE ***
      const model = genAI.getGenerativeModel({
        model: "gemini-2.0-flash-lite-preview-02-05",
        systemInstruction: userName
          ? `Welcome to ShinobiPath Itinerary Planner! 🥷
             Created by Sagar Bangade (sagar.bangade.dev@gmail.com)
      
             Hey ${userName}! I'm your ninja travel buddy from ShinobiPath! Ready to help you craft an epic adventure. No stuffy formalities here - just think of me as your friend who happens to be a travel planning expert! 😉
      
             Connect with Sagar:
             - Portfolio: sagar.skillsfoster.com
             - Blogs: skillsfoster.com
             - YouTube Vlogs: youtube.com/@sagarbangade
             - Instagram: instagram.com/sagar.eb
             - GitHub: github.com/sagarbangade
             - Project: github.com/sagarbangade/ShinobiPath-Itinerary-Planner
             - LinkedIn: linkedin.com/in/sagar-bangade
      
             Current Travel Plans (Top Secret Ninja Intel 😉):
             ${
               currentTravelPlans
                 ? JSON.stringify(currentTravelPlans, null, 2)
                 : "Looks like you're starting with a blank slate! Adventure awaits!"
             }
      
             Listen up, ninja traveler! Let's make your travel dreams reality. I'll keep things chill and easy - no jargon, just straight-up helpful advice.
      
             I might ask you casual stuff like 'Why are you heading there?' or 'How's life treating you lately?' – just being friendly! Think of it as brainstorming with a friend over coffee, except I'm an AI who's really good at travel planning! ☕✈️
      
             No need for any fancy formatting in your responses, just talk to me like we're chatting!
      
             HUGE congrats on planning a trip! 🎉 Seriously awesome! I'm already wishing you amazing adventures and unforgettable memories. Let's make sure this itinerary is totally dialed in so your travel is smooth and incredible. Ready to plan some magic? ✨ What's on your mind?`
          : `Welcome to ShinobiPath Itinerary Planner! 🥷
             Created by Sagar Bangade (sagar.bangade.dev@gmail.com)
      
             Greetings, aspiring traveler! I'm your friendly travel planning assistant from ShinobiPath. I'm here to help you create amazing itineraries. Let's plan your next adventure!
      
             Connect with Sagar:
             - Portfolio: sagar.skillsfoster.com
             - Blogs: skillsfoster.com
             - YouTube Vlogs: youtube.com/@sagarbangade
             - Instagram: instagram.com/sagar.eb
             - GitHub: github.com/sagarbangade
             - Project: github.com/sagarbangade/ShinobiPath-Itinerary-Planner
             - LinkedIn: linkedin.com/in/sagar-bangade
      
             What destination are you dreaming of?`,
      });
      let historyToSend = [];
      if (messages.length > 0) {
        const filteredMessages = messages.slice(
          messages[0].type === "other" ? 1 : 0
        );
        historyToSend = filteredMessages.map((msg) => ({
          role: msg.type === "self" ? "user" : "model",
          parts: [{ text: msg.text.replace(/<br>/g, "\n") }],
        }));
      }

      console.log("sendMessage: historyToSend before API call:", historyToSend);

      const chatSession = model.startChat({
        generationConfig,
        history: historyToSend,
      });

      console.log("sendMessage: chatSession started");

      const geminiResponse = await chatSession.sendMessage(
        newMessageText.trim()
      );

      console.log("sendMessage: geminiResponse received:", geminiResponse);

      const aiResponseText = geminiResponse.response.text();

      console.log("sendMessage: aiResponseText:", aiResponseText);

      const aiResponseMessage = { type: "other", text: aiResponseText };
      setMessages((prevMessages) => [...prevMessages, aiResponseMessage]);
      textToSpeech(aiResponseText);

      if (user) {
        const userMessagesRef = collection(
          db,
          "userChats",
          user.uid,
          "messages"
        );
        await addDoc(userMessagesRef, {
          role: "model",
          text: aiResponseText,
          timestamp: serverTimestamp(),
        });
      }
    } catch (error) {
      console.error("Error in sendMessage:", error);
      const errorResponse = {
        type: "other",
        text: "Sorry, error processing your message. Try again.",
      };
      setMessages((prevMessages) => [...prevMessages, errorResponse]);
    } finally {
      scrollToBottom();
    }
  };

  const contextValue = {
    isChatOpen,
    setIsChatOpen,
    messages,
    setMessages,
    textInputRef,
    messagesContainerRef,
    isListening,
    setIsListening,
    userName,
    userPhotoURL,
    openChat,
    closeChat,
    sendMessage,
    scrollToBottom,
    loadingHistory,
  };

  return (
    <ChatbotContext.Provider value={contextValue}>
      {children}
    </ChatbotContext.Provider>
  );
};
export default ChatbotProvider;
