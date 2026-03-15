import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import ChatInput from "./ChatInput";
import ChatConversation from "./ChatConversation";
import "./App.css";

const MAX_EXCHANGES = 4; // Keep only last 4 user-bot pairs
const TYPING_DELAY = 1500; // 1.5 seconds typing indicator
const CHAR_ANIMATION_SPEED = 30; // Speed of text animation (ms per character)

function App() {
  const [level, setLevel] = useState("A2");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showTyping, setShowTyping] = useState(false);
  const [theme, setTheme] = useState("light");
  const [animatingMessageIndex, setAnimatingMessageIndex] = useState(null);
  const typeWriterRef = useRef(null);

  // Initialize theme
  useEffect(() => {
    const stored = localStorage.getItem("theme");
    const prefersDark =
      window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
    const initialTheme = stored || (prefersDark ? "dark" : "light");
    setTheme(initialTheme);
    document.documentElement.setAttribute("data-theme", initialTheme);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
  };

  /**
   * Update a specific message in the messages array
   * Used to update the animating bot message
   */
  const updateMessage = (index, updatedContent) => {
    setMessages((prev) => {
      const newMessages = [...prev];
      newMessages[index].content = updatedContent;
      return newMessages;
    });
  };

  /**
   * Start typing animation for a bot message
   */
  const startTypingAnimation = (fullText, messageIndex) => {
    // Stop any existing animation
    if (typeWriterRef.current) {
      typeWriterRef.current.stop();
    }

    // Create new typewriter instance
    const typeWriter = new TypeWriter({
      speed: CHAR_ANIMATION_SPEED,
      onUpdate: (displayedText) => {
        // Update the message with partially typed text
        updateMessage(messageIndex, displayedText);
      },
      onComplete: () => {
        // Animation finished
        setAnimatingMessageIndex(null);
      },
    });

    typeWriterRef.current = typeWriter;
    setAnimatingMessageIndex(messageIndex);
    typeWriter.start(fullText);
  };

  /**
   * Enforce limited memory: keep only last MAX_EXCHANGES user-bot pairs
   */
  const enforceLimitedMemory = (msgArray) => {
    let userCount = 0;
    let removeUpToIndex = -1;

    for (let i = 0; i < msgArray.length; i++) {
      if (msgArray[i].role === "user") {
        userCount++;
        if (userCount > MAX_EXCHANGES) {
          removeUpToIndex = i;
        }
      }
    }

    if (removeUpToIndex > -1) {
      return msgArray.slice(removeUpToIndex);
    }
    return msgArray;
  };

  const handleSend = async (text) => {
    if (!text.trim()) return;

    // Stop any active animation
    if (typeWriterRef.current) {
      typeWriterRef.current.stop();
    }

    // Add user message
    const userMsg = {
      role: "user",
      content: text,
      timestamp: new Date(),
    };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);

    // Show typing indicator
    setLoading(true);
    setShowTyping(true);

    // Simulate typing delay before response
    setTimeout(async () => {
      setShowTyping(false);

      try {
        const res = await axios.post("/api/chat", {
          message: text,
          level,
        });

        const fullBotResponse = res.data.reply || "";

        // Add empty bot message first
        const botMsg = {
          role: "bot",
          content: "", // Start with empty content
          timestamp: new Date(),
        };

        let newMessages = [...updatedMessages, botMsg];
        newMessages = enforceLimitedMemory(newMessages);
        setMessages(newMessages);

        // Start typing animation on the newly added message
        const botMessageIndex = newMessages.length - 1;
        startTypingAnimation(fullBotResponse, botMessageIndex);
      } catch (err) {
        const errorMsg = {
          role: "bot",
          content: "Error: " + (err.response?.data?.error || err.message),
          timestamp: new Date(),
        };

        let newMessages = [...updatedMessages, errorMsg];
        newMessages = enforceLimitedMemory(newMessages);
        setMessages(newMessages);
        console.error(err);
      } finally {
        setLoading(false);
      }
    }, TYPING_DELAY);
  };

  return (
    <div className="app-container">
      <div className="topbar">
        <button className="theme-toggle" onClick={toggleTheme} title="Toggle theme" aria-label="Toggle theme">
          {theme === "dark" ? (
            <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 3v2"></path>
              <path d="M12 19v2"></path>
              <path d="M4.2 4.2l1.4 1.4"></path>
              <path d="M18.4 18.4l1.4 1.4"></path>
              <path d="M1 12h2"></path>
              <path d="M21 12h2"></path>
              <path d="M4.2 19.8l1.4-1.4"></path>
              <path d="M18.4 5.6l1.4-1.4"></path>
              <circle cx="12" cy="12" r="4"></circle>
            </svg>
          ) : (
            <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"></path>
            </svg>
          )}
        </button>
      </div>

      <h1>AI Speaking Partner</h1>

      <label className="level-selector">
        Level:
        <select value={level} onChange={(e) => setLevel(e.target.value)}>
          <option value="A1">A1</option>
          <option value="A2">A2</option>
          <option value="B1">B1</option>
          <option value="B2">B2</option>
          <option value="C1">C1</option>
        </select>
      </label>

      <ChatConversation
        messages={messages}
        showTyping={showTyping}
        animatingMessageIndex={animatingMessageIndex}
      />

      <ChatInput onSend={handleSend} loading={loading || showTyping} />
    </div>
  );
}

/**
 * TypeWriter Effect Class
 * Handles character-by-character animation of text
 */
class TypeWriter {
  constructor(options = {}) {
    this.speed = options.speed || 30;
    this.isAnimating = false;
    this.currentIndex = 0;
    this.fullText = '';
    this.displayedText = '';
    this.animationId = null;
    this.onUpdate = options.onUpdate || (() => {});
    this.onComplete = options.onComplete || (() => {});
  }

  start(text) {
    if (this.isAnimating) this.stop();
    this.fullText = text;
    this.displayedText = '';
    this.currentIndex = 0;
    this.isAnimating = true;
    this.animate();
  }

  animate = () => {
    if (this.currentIndex < this.fullText.length && this.isAnimating) {
      this.displayedText += this.fullText[this.currentIndex];
      this.currentIndex++;
      this.onUpdate(this.displayedText);
      this.animationId = setTimeout(this.animate, this.speed);
    } else if (this.currentIndex >= this.fullText.length) {
      this.isAnimating = false;
      this.onComplete();
    }
  };

  stop() {
    this.isAnimating = false;
    if (this.animationId) {
      clearTimeout(this.animationId);
    }
  }

  pause() {
    if (this.animationId) {
      clearTimeout(this.animationId);
    }
  }

  resume() {
    if (this.isAnimating && !this.animationId) {
      this.animate();
    }
  }
}

export default App;

