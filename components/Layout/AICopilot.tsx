import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, X, Send, Sparkles, Loader2, User } from 'lucide-react';
import { useSystem } from '../../context/SystemContext';

interface Message {
  role: 'user' | 'ai';
  text: string;
}

const AICopilot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'ai', text: "Hello! I am Issa's AI Assistant. How can I help you explore his portfolio today?" }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { themeMode } = useSystem();

  const isDark = themeMode === 'dark';

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setIsTyping(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: userMessage,
          history: messages.map(m => ({ role: m.role === 'ai' ? 'model' : 'user', text: m.text }))
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        setMessages(prev => [...prev, { role: 'ai', text: data.error || "I'm having trouble connecting right now." }]);
      } else {
        setMessages(prev => [...prev, { role: 'ai', text: data.reply || "I'm having trouble connecting right now." }]);
      }
    } catch (error) {
      setMessages(prev => [...prev, { role: 'ai', text: "Systems are currently experiencing interference." }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full flex items-center justify-center bg-gradient-to-tr from-blue-600 to-purple-600 text-white shadow-2xl hover:scale-110 active:scale-95 transition-transform z-50 group"
      >
        <Sparkles className="absolute inset-0 w-full h-full p-3 opacity-0 group-hover:opacity-100 transition-opacity animate-pulse" />
        <Bot size={24} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.95 }}
            className={`fixed bottom-24 right-6 w-[360px] h-[500px] max-h-[80vh] flex flex-col rounded-2xl shadow-2xl z-50 overflow-hidden border ${isDark ? 'bg-[#0f0f11] border-white/10' : 'bg-white border-gray-200'}`}
          >
            {/* Header */}
            <div className={`p-4 border-b flex items-center justify-between ${isDark ? 'border-white/10 bg-[#151518]' : 'border-gray-100 bg-gray-50'}`}>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center text-white">
                  <Bot size={16} />
                </div>
                <div>
                  <h3 className={`font-semibold text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>Issa AI Copilot</h3>
                  <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Online & Ready</p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className={`p-1.5 rounded-md hover:bg-gray-500/20 transition-colors ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                <X size={18} />
              </button>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg, i) => (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={i} 
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${
                    msg.role === 'user' 
                      ? 'bg-blue-600 text-white rounded-br-none' 
                      : isDark ? 'bg-white/10 text-gray-200 rounded-bl-none' : 'bg-gray-100 text-gray-800 rounded-bl-none'
                  }`}>
                    {msg.text}
                  </div>
                </motion.div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className={`rounded-2xl rounded-bl-none px-4 py-3 flex items-center gap-1 ${isDark ? 'bg-white/10' : 'bg-gray-100'}`}>
                    <div className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" />
                    <div className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0.15s' }} />
                    <div className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0.3s' }} />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className={`p-3 border-t ${isDark ? 'border-white/10 bg-[#151518]' : 'border-gray-100 bg-gray-50'}`}>
              <form 
                onSubmit={e => { e.preventDefault(); handleSend(); }}
                className={`flex items-center gap-2 pr-1 pl-3 py-1 rounded-full border ${isDark ? 'bg-[#0f0f11] border-white/20 focus-within:border-blue-500' : 'bg-white border-gray-300 focus-within:border-blue-500'}`}
              >
                <input 
                  type="text" 
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  placeholder="Ask me anything..."
                  className={`flex-1 bg-transparent text-sm outline-none py-2 ${isDark ? 'text-white placeholder:text-gray-600' : 'text-gray-900 placeholder:text-gray-400'}`}
                />
                <button 
                  type="submit"
                  disabled={!input.trim() || isTyping}
                  className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center disabled:opacity-50 transition-opacity"
                >
                  <Send size={14} />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AICopilot;
