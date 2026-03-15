import React, { useState, useEffect, useRef } from "react";
import "./ChatInput.css";

function ChatInput({ onSend, loading }) {
  const [text, setText] = useState("");
  const inputRef = useRef(null);

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;
    onSend(trimmed);
    setText("");
  };

  const handleKeyDown = (e) => {
    // Enter to send (no Shift for single-line)
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="chat-input" role="group" aria-label="Chat input">
      <div className="left-icons" aria-hidden="true">
        {/* Image icon */}
        <button type="button" title="Insert image" aria-label="Insert image">
          <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg">
            <rect x="3" y="3" width="18" height="18" rx="3"></rect>
            <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor"></circle>
            <path d="M21 15l-5-5-4 4-3-3-4 4" stroke="currentColor" fill="none"></path>
          </svg>
        </button>

        {/* Code icon */}
        <button type="button" title="Insert code" aria-label="Insert code">
          <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg">
            <polyline points="16 18 22 12 16 6"></polyline>
            <polyline points="8 6 2 12 8 18"></polyline>
          </svg>
        </button>

        {/* Microphone icon */}
        <button type="button" title="Record" aria-label="Record">
          <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 1v11"></path>
            <path d="M19 11a7 7 0 0 1-14 0"></path>
            <path d="M12 21v-4"></path>
            <path d="M8 21h8"></path>
          </svg>
        </button>
      </div>

      <div className="chat-field">
        <input
          ref={inputRef}
          id="messageInput"
          type="text"
          placeholder="What would you like to know?"
          aria-label="Message input"
          autoComplete="off"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={loading}
        />
      </div>

      <button
        id="sendBtn"
        className="send-button"
        type="button"
        title="Send message"
        aria-label="Send"
        onClick={handleSend}
        disabled={loading}
      >
        <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg">
          <path d="M22 2L11 13"></path>
          <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
        </svg>
      </button>
    </div>
  );
}

export default ChatInput;
