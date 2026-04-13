import React, { useState, useEffect, useRef } from 'react';
import { Send, Sparkles, BrainCircuit, Loader2, UploadCloud } from 'lucide-react';

const AIPlanner = ({ externalQuery, user }) => {
  const [messages, setMessages] = useState([
    { id: 1, text: `Hi ${user?.name || 'there'}! I'm your AI Study Planner. What would you like to study today?`, isAi: true }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const [isUploading, setIsUploading] = useState(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (externalQuery) {
      setInput(externalQuery);
      // Auto submit logic could go here if desired
    }
  }, [externalQuery]);

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('http://localhost:8000/api/upload-pdf', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      setMessages(prev => [...prev, { id: Date.now(), text: data.message || "PDF uploaded successfully!", isAi: true }]);
    } catch (error) {
      setMessages(prev => [...prev, { id: Date.now(), text: "Error uploading PDF.", isAi: true }]);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSend = async (textToSubmit = input) => {
    if (!textToSubmit.trim()) return;

    const userMsg = { id: Date.now(), text: textToSubmit, isAi: false };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:8000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: textToSubmit, history: messages, user_name: user?.name || "User" })
      });

      const data = await response.json();

      const aiMsg = { id: Date.now() + 1, text: data.reply || "I'm having trouble connecting to my brain. Please check the backend!", isAi: true };
      setMessages(prev => [...prev, aiMsg]);
    } catch (error) {
      const errorMsg = { id: Date.now() + 1, text: "Error connecting to the AI server. Is the backend running on port 8000?", isAi: true };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') handleSend();
  };

  const quickChips = [
    "Create a 3-day study plan",
    "Quiz me on a topic",
    "How should I prioritize my tasks?",
    ""
  ];

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div className="page-header" style={{ marginBottom: '16px' }}>
        <h1 className="page-title flex items-center gap-2">
          <BrainCircuit className="text-primary" /> AI Planner
        </h1>
        <p className="page-subtitle">Your personal AI tutor, powered by advanced models.</p>
      </div>

      <div className="quick-chips">
        {quickChips.map((chip, index) => (
          <div key={index} className="chip" onClick={() => handleSend(chip)}>
            <Sparkles size={14} style={{ display: 'inline', marginRight: '6px' }} />
            {chip}
          </div>
        ))}
      </div>

      <div className="chat-container">
        <div className="chat-messages">
          {messages.map((msg) => (
            <div key={msg.id} className={`message ${msg.isAi ? 'ai' : 'user'}`}>
              {msg.text}
            </div>
          ))}
          {isLoading && (
            <div className="message ai flex items-center gap-2 text-muted">
              <Loader2 className="loader" size={16} /> Thinking processing context...
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="chat-input-area">
          <input
            type="file"
            accept=".pdf"
            ref={fileInputRef}
            onChange={handleFileUpload}
            style={{ display: 'none' }}
          />
          <button
            className="chat-submit"
            style={{ padding: '0 16px', backgroundColor: 'var(--surface-hover)', border: '1px solid var(--border)' }}
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            title="Upload PDF for context"
          >
            {isUploading ? <Loader2 className="loader" size={20} /> : <UploadCloud size={20} color="white" />}
          </button>
          <input
            type="text"
            className="chat-input"
            placeholder="Ask me anything about your studies or uploaded PDF..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
          />
          <button className="chat-submit" onClick={() => handleSend()}>
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIPlanner;
