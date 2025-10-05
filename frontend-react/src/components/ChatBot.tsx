import React, { useState } from 'react';
import '../styles/ChatBot.css';

interface ChatBotProps {
  context?: {
    brief?: {
      consensus?: string;
      contradictions?: string;
      knowledge_gaps?: string;
      confidence?: string;
    };
    evidence?: Array<any>;  // Allow any evidence format
  };
  initialMessage?: string;
  searchQuery?: string;
}

interface ChatMessage {
  type: 'user' | 'bot';
  text: string;
  timestamp: Date;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const ChatBot: React.FC<ChatBotProps> = ({ context, initialMessage, searchQuery }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  // Create initial message based on props
  const getInitialMessage = () => {
    if (initialMessage) {
      return initialMessage;
    }
    if (searchQuery) {
      return `👋 Hi! How can I help you with "${searchQuery}"?`;
    }
    return "👋 Hi! I can help you understand the research findings. Ask me about the consensus, contradictions, evidence, or how to interpret the results!";
  };

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      type: 'bot',
      text: getInitialMessage(),
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: ChatMessage = {
      type: 'user',
      text: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: inputValue,
          context: context
        })
      });

      const data = await response.json();

      const botMessage: ChatMessage = {
        type: 'bot',
        text: data.response || "I'm sorry, I couldn't process that request.",
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: ChatMessage = {
        type: 'bot',
        text: "Sorry, I encountered an error. Please try again.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const quickQuestions = [
    "What does the consensus mean?",
    "Explain the contradictions",
    "How confident is this analysis?",
    "How do I export these results?"
  ];

  const handleQuickQuestion = (question: string) => {
    setInputValue(question);
  };

  return (
    <>
      {/* Floating Chat Button */}
      <button
        className={`chatbot-toggle ${isOpen ? 'open' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle chat"
      >
        {isOpen ? '✕' : '✨'}
        {!isOpen && <span className="chat-badge">Ask me anything</span>}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="chatbot-window">
          <div className="chatbot-header">
            <div className="chatbot-header-info">
              <span className="chatbot-icon">✨</span>
              <div>
                <h3>Research Assistant</h3>
                <p>Ask questions about your results</p>
              </div>
            </div>
            <button
              className="chatbot-close"
              onClick={() => setIsOpen(false)}
              aria-label="Close chat"
            >
              ✕
            </button>
          </div>

          <div className="chatbot-messages">
            {messages.map((message, index) => (
              <div key={index} className={`chat-message ${message.type}`}>
                <div className="message-avatar">
                  {message.type === 'bot' ? '✨' : '👤'}
                </div>
                <div className="message-content">
                  <div className="message-text">{message.text}</div>
                  <div className="message-time">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="chat-message bot">
                <div className="message-avatar">✨</div>
                <div className="message-content">
                  <div className="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Quick Questions */}
          {messages.length <= 2 && (
            <div className="quick-questions">
              <p className="quick-questions-label">Quick questions:</p>
              <div className="quick-questions-grid">
                {quickQuestions.map((question, index) => (
                  <button
                    key={index}
                    className="quick-question-btn"
                    onClick={() => handleQuickQuestion(question)}
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="chatbot-input">
            <input
              type="text"
              placeholder="Ask a question..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isLoading}
            />
            <button
              onClick={sendMessage}
              disabled={isLoading || !inputValue.trim()}
              aria-label="Send message"
            >
              ➤
            </button>
          </div>
        </div>
      )}
    </>
  );
};
