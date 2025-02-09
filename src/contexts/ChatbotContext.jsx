import React, { createContext, useState, useEffect, useRef, useContext } from 'react';
import { db, auth } from '../firebase/firebaseConfig';
import { collection, doc, onSnapshot, addDoc, serverTimestamp, query, orderBy } from 'firebase/firestore';
import { GoogleGenerativeAI } from "@google/generative-ai";

const ChatbotContext = createContext();

const apiKey = 'AIzaSyBYCyPObqcCeOHxrtWf8kfFYkhOnmHxWOI'; // **Replace with your actual API key!**
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
    const [loadingHistory, setLoadingHistory] = useState(false);

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


    useEffect(() => {
        setLoadingHistory(true);
        const unsubscribeAuth = auth.onAuthStateChanged(user => {
            if (user) {
                setUserName(user.displayName);
                const userChatRef = collection(db, 'userChats', user.uid, 'messages');
                const orderedQuery = query(userChatRef, orderBy('timestamp', 'asc'));

                const unsubscribeMessages = onSnapshot(orderedQuery, (snapshot) => {
                    const fetchedMessages = snapshot.docs.map(doc => {
                        const data = doc.data();
                        return {
                            type: data.role === 'user' ? 'self' : 'other',
                            text: data.text,
                            timestamp: data.timestamp?.toDate() || null,
                        };
                    });
                    setMessages(fetchedMessages);
                    setLoadingHistory(false);
                    scrollToBottom();
                }, (error) => {
                    console.error("Error fetching chat messages from Firestore:", error);
                    setLoadingHistory(false);
                });
                return () => { unsubscribeMessages(); };

            } else {
                setUserName(null);
                setMessages([]);
                setLoadingHistory(false);
            }
        });
        return () => unsubscribeAuth();
    }, []);


    const sendMessage = async (newMessageText) => {
        if (!newMessageText.trim()) return;

        const userMessage = { type: 'self', text: newMessageText };
        setMessages(prevMessages => [...prevMessages, userMessage]);

        if (textInputRef.current) {
            textInputRef.current.textContent = '';
        }

        try {
            const user = auth.currentUser;
            if (user) {
                const userMessagesRef = collection(db, 'userChats', user.uid, 'messages');
                await addDoc(userMessagesRef, {
                    role: 'user',
                    text: newMessageText,
                    timestamp: serverTimestamp(),
                });
            }

            // *** Gemini API Integration STARTS HERE ***
            const model = genAI.getGenerativeModel({
                model: "gemini-2.0-flash-lite-preview-02-05",
                systemInstruction: userName
                    ? `You are a helpful and friendly AI assistant specialized in travel planning. Your name is TravelAI. You are assisting ${userName} with planning their itinerary. Please address the user by their name, ${userName}, in your responses to make the conversation more personal and engaging for their travel planning needs.`
                    : `You are a helpful and friendly AI assistant specialized in travel planning. Your name is TravelAI. You are assisting users with planning their itineraries. Please provide helpful and informative responses related to travel planning.`,
            });

            let historyToSend = []; // Initialize as empty array
            if (messages.length > 0) {
                // Filter out the initial greeting message if it exists as the first message
                const filteredMessages = messages.slice(messages[0].type === 'other' ? 1 : 0);
                historyToSend = filteredMessages.map(msg => ({
                    role: msg.type === 'self' ? 'user' : 'model',
                    parts: [{ text: msg.text.replace(/<br>/g, '\n') }],
                }));
            }


            console.log("sendMessage: historyToSend before API call:", historyToSend);

            const chatSession = model.startChat({
                generationConfig,
                history: historyToSend,
            });

            console.log("sendMessage: chatSession started");

            const geminiResponse = await chatSession.sendMessage(newMessageText.trim());

            console.log("sendMessage: geminiResponse received:", geminiResponse);

            const aiResponseText = geminiResponse.response.text();

            console.log("sendMessage: aiResponseText:", aiResponseText);


            const aiResponseMessage = { type: 'other', text: aiResponseText };
            setMessages(prevMessages => [...prevMessages, aiResponseMessage]);
            textToSpeech(aiResponseText);

            if (user) {
                const userMessagesRef = collection(db, 'userChats', user.uid, 'messages');
                await addDoc(userMessagesRef, {
                    role: 'model',
                    text: aiResponseText,
                    timestamp: serverTimestamp(),
                });
            }


        } catch (error) {
            console.error("Error in sendMessage:", error);
            const errorResponse = { type: 'other', text: "Sorry, error processing your message. Try again." };
            setMessages(prevMessages => [...prevMessages, errorResponse]);
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
        openChat,
        closeChat,
        sendMessage,
        scrollToBottom,
        loadingHistory
    };

    return (
        <ChatbotContext.Provider value={contextValue}>
            {children}
        </ChatbotContext.Provider>
    );
};
export default ChatbotProvider;