import React, { useState, useRef, useEffect } from "react";
import { Send, Plus, User, Bot, Loader2 } from "lucide-react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import "./ChatArea.css";

function ChatArea({
  conversation,
  messages,
  onSendMessage,
  onNewConversation,
  isLoading,
}) {
  const [input, setInput] = useState("");
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim()) {
      onSendMessage(input.trim());
      setInput("");
    }
  };

  const parseContent = (content) => {
    const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = codeBlockRegex.exec(content)) !== null) {
      // Add text before code block
      if (match.index > lastIndex) {
        parts.push({
          type: "text",
          content: content.substring(lastIndex, match.index),
        });
      }

      // Add code block
      parts.push({
        type: "code",
        language: match[1] || "javascript",
        content: match[2],
      });

      lastIndex = codeBlockRegex.lastIndex;
    }

    // Add remaining text
    if (lastIndex < content.length) {
      parts.push({
        type: "text",
        content: content.substring(lastIndex),
      });
    }

    return parts.length > 0 ? parts : [{ type: "text", content }];
  };

  return (
    <div className="chat-area">
      {!conversation ? (
        <div className="empty-state">
          <div className="empty-state-content">
            <Bot size={48} />
            <h2>Welcome to ChatGPT Clone</h2>
            <p>Select a conversation from the sidebar or start a new chat</p>
            <button className="start-chat-btn" onClick={onNewConversation}>
              <Plus size={20} />
              Start New Chat
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="chat-header">
            <h2>{conversation.title}</h2>
          </div>

          <div className="messages-container">
            {messages.length === 0 ? (
              <div className="empty-conversation">
                <Bot size={32} />
                <p>Start a conversation by typing a message below</p>
              </div>
            ) : (
              <>
                {messages.map((message) => (
                  <div key={message.id} className={`message ${message.role}`}>
                    <div className="message-avatar">
                      {message.role === "user" ? (
                        <User size={20} />
                      ) : (
                        <Bot size={20} />
                      )}
                    </div>
                    <div className="message-content">
                      <div className="message-role">
                        {message.role === "user" ? "You" : "Assistant"}
                      </div>
                      <div className="message-text">
                        {parseContent(message.content).map((part, index) =>
                          part.type === "code" ? (
                            <div key={index} className="code-block">
                              <SyntaxHighlighter
                                language={part.language}
                                style={vscDarkPlus}
                                customStyle={{
                                  borderRadius: "8px",
                                  margin: "10px 0",
                                }}
                              >
                                {part.content}
                              </SyntaxHighlighter>
                            </div>
                          ) : (
                            <span key={index}>{part.content}</span>
                          )
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="message assistant loading">
                    <div className="message-avatar">
                      <Bot size={20} />
                    </div>
                    <div className="message-content">
                      <div className="message-role">Assistant</div>
                      <div className="message-text loading-indicator">
                        <Loader2 size={20} className="spinner" />
                        <span>Thinking...</span>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form className="input-form" onSubmit={handleSubmit}>
            <div className="input-container">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message..."
                className="message-input"
              />
              <button
                type="submit"
                className="send-button"
                disabled={!input.trim()}
              >
                <Send size={20} />
              </button>
            </div>
          </form>
        </>
      )}
    </div>
  );
}

export default ChatArea;
