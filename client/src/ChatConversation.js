import React, { useEffect, useRef } from "react";
import { marked } from "marked";
import DOMPurify from "dompurify";
import "./ChatConversation.css";

function ChatConversation({ messages, showTyping, animatingMessageIndex }) {
  const messagesEndRef = useRef(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages, showTyping]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const formatTime = (date) => {
    const hours = String(date.getHours()).padStart(2, "0");
    const mins = String(date.getMinutes()).padStart(2, "0");
    return `${hours}:${mins}`;
  };

  /**
   * Parse and render message content
   * For animating messages, render without full markdown parsing
   * (to avoid formatting glitches during animation)
   */
  const renderMessageContent = (content, index) => {
    // If message is currently animating, render as plain text
    if (index === animatingMessageIndex) {
      return <div className="bubble typing-animation">{content}</div>;
    }

    // Otherwise, render with markdown formatting
    return (
      <div
        className="bubble"
        dangerouslySetInnerHTML={{
          __html: DOMPurify.sanitize(
            marked.parse(content || "", {
              breaks: true,
              gfm: true,
              headerIds: false,
            })
          ),
        }}
      ></div>
    );
  };

  return (
    <div className="chat-messages">
      {messages.length === 0 ? (
        <div className="welcome-message">
          <h2>Welcome to AI Speaking Partner</h2>
          <p>Start a conversation below to get feedback from your tutor.</p>
        </div>
      ) : (
        messages.map((msg, idx) => (
          <div key={idx} className={`message ${msg.role}`}>
            {msg.role === "bot" && (
              <div className="sender">AI Tutor</div>
            )}
            {renderMessageContent(msg.content, idx)}
            <div className="timestamp">{formatTime(msg.timestamp)}</div>
          </div>
        ))
      )}

      {showTyping && (
        <div className="message bot" id="typingIndicator">
          <div className="sender">AI Tutor</div>
          <div className="typing-indicator">
            <div className="typing-dot"></div>
            <div className="typing-dot"></div>
            <div className="typing-dot"></div>
          </div>
          <span className="thinking-text">AI is thinking...</span>
        </div>
      )}

      <div ref={messagesEndRef} />
    </div>
  );
}

export default ChatConversation;
