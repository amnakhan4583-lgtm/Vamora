 import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import './TalkToCompanion.css';

export default function TalkToCompanion() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const messagesEndRef = useRef(null);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    fetchHistory();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchHistory = async () => {
    try {
      const { data } = await api.get('/companion/history');
      if (data.length === 0) {
        setMessages([{
          role: 'assistant',
          content: `Hello ${user.name || 'there'}! 😊 I am your memory companion. I am here to chat, listen, and help you remember your beautiful memories. How are you feeling today?`
        }]);
      } else {
        setMessages(data.map(m => ({ role: m.role, content: m.content })));
      }
    } catch (err) {
      console.error('Error fetching history:', err);
      setMessages([{
        role: 'assistant',
        content: `Hello ${user.name || 'there'}! 😊 I am your memory companion. How are you feeling today?`
      }]);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      const { data } = await api.post('/companion/chat', { message: userMessage });
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
    } catch (err) {
      console.error('Error sending message:', err);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'I am sorry, I could not respond right now. Please try again.'
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (loadingHistory) {
    return (
      <div className="companion-container">
        <div className="companion-loading">
          <div className="loading-spinner"></div>
          <p>Loading your companion...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="companion-container">

      <div className="companion-header">
        <div className="companion-avatar">🤖</div>
        <div className="companion-info">
          <h1 className="companion-title">Talk to Companion</h1>
          <p className="companion-status">✅ Online — here for you</p>
        </div>
      </div>

      <div className="messages-container">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`message-wrapper ${msg.role === 'user' ? 'user-wrapper' : 'ai-wrapper'}`}
          >
            {msg.role === 'assistant' && (
              <div className="ai-avatar">🤖</div>
            )}
            <div className={`message-bubble ${msg.role === 'user' ? 'user-bubble' : 'ai-bubble'}`}>
              <p>{msg.content}</p>
            </div>
            {msg.role === 'user' && (
              <div className="user-avatar">
                {user.name ? user.name.charAt(0).toUpperCase() : '👤'}
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="message-wrapper ai-wrapper">
            <div className="ai-avatar">🤖</div>
            <div className="message-bubble ai-bubble typing-bubble">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="input-area">
        <textarea
          className="message-input"
          placeholder="Type a message..."
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={2}
          disabled={loading}
        />
        <button
          className="send-btn"
          onClick={handleSend}
          disabled={loading || !input.trim()}
        >
          ➤
        </button>
      </div>

      <p className="input-hint">Press Enter to send</p>

    </div>
  );
}