'use client';

import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DiamondLoader } from '@/components/DiamondLoader';
import { aiService } from '@/services/api';
import { useAuthStore } from '@/stores/auth.store';
import { isManagerRole } from '@/lib/permissions';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const SUGGESTIONS = [
  "What did the team accomplish this week?",
  "Who has not submitted reports?",
  "What are the most common blockers?",
  "Summarize all reports",
];

// Component to render AI responses with proper formatting
function FormattedAIResponse({ content }: { content: string }) {
  const lines = content.split('\n');
  
  return (
    <div className="space-y-2">
      {lines.map((line, index) => {
        // Empty line
        if (line.trim() === '') {
          return <div key={index} className="h-1" />;
        }
        
        // Bold headers (lines with **)
        if (line.includes('**')) {
          const formattedLine = line.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-gray-900">$1</strong>');
          return (
            <div key={index} dangerouslySetInnerHTML={{ __html: formattedLine }} className="text-sm" />
          );
        }
        
        // Bullet points
        if (line.trim().startsWith('•') || line.trim().startsWith('-')) {
          const text = line.trim().substring(1).trim();
          return (
            <div key={index} className="flex gap-2 text-sm">
              <span className="text-blue-600 flex-shrink-0 mt-0.5">•</span>
              <span>{text}</span>
            </div>
          );
        }
        
        // Numbered lists
        const numberedMatch = line.match(/^(\d+)\.\s+(.+)/);
        if (numberedMatch) {
          return (
            <div key={index} className="flex gap-2 text-sm">
              <span className="text-blue-600 flex-shrink-0 font-medium">{numberedMatch[1]}.</span>
              <span>{numberedMatch[2]}</span>
            </div>
          );
        }
        
        // Regular text
        return <p key={index} className="text-sm">{line}</p>;
      })}
    </div>
  );
}

export function AiChatWidget() {
  const { user } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);
  const [isEnabled, setIsEnabled] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize welcome message on client only to avoid hydration mismatch
  useEffect(() => {
    setMessages([{
      role: 'assistant',
      content: "Hi! I'm your AI assistant. I can help you analyze team reports, identify blockers, and provide insights. What would you like to know?",
      timestamp: new Date(),
    }]);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isManagerRole(user?.role)) {
      aiService.getStatus()
        .then(res => setIsEnabled(res.enabled))
        .catch(() => setIsEnabled(false))
        .finally(() => setIsChecking(false));
    } else {
      setIsChecking(false);
    }
  }, [user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  // Derived flag — never return early after hooks
  const shouldRender = isManagerRole(user?.role) && !isChecking && isEnabled;

  if (!shouldRender) return null;

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      content: text,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const history = messages.map(m => ({ role: m.role, content: m.content }));
      const response = await aiService.chat(text, history);

      const assistantMessage: Message = {
        role: 'assistant',
        content: response,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch {
      const errorMessage: Message = {
        role: 'assistant',
        content: "Sorry, I encountered an error. Please try again.",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  return (
    <>
      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsOpen(v => !v)}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full bg-blue-600 text-white shadow-lg hover:bg-blue-700 transition-all duration-200 flex items-center justify-center z-50 hover:scale-110"
        aria-label="Toggle AI Assistant"
      >
        {isOpen ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </button>

      {/* Backdrop Blur */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Chat Window */}
      {isOpen && (
        <div 
          className="fixed bottom-0 right-0 md:bottom-24 md:right-6 w-full h-full md:w-96 md:h-auto bg-white md:rounded-2xl shadow-2xl border-0 md:border border-gray-100 flex flex-col z-50 overflow-hidden md:max-h-[calc(100vh-8rem)]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-blue-600 px-4 py-4 md:py-3 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center">
                <Bot className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="text-white font-semibold text-sm">AI Assistant</h3>
                <p className="text-blue-200 text-xs">Powered by Gemini</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-white/70 hover:text-white transition-colors">
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
            {messages.map((msg, i) => (
              <div key={i} className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role === 'assistant' && (
                  <div className="h-7 w-7 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Bot className="h-4 w-4 text-blue-600" />
                  </div>
                )}
                <div className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm ${
                  msg.role === 'user'
                    ? 'bg-blue-600 text-white rounded-tr-sm'
                    : 'bg-gray-100 text-gray-900 rounded-tl-sm'
                }`}>
                  {msg.role === 'assistant' ? (
                    <FormattedAIResponse content={msg.content} />
                  ) : (
                    msg.content
                  )}
                </div>
                {msg.role === 'user' && (
                  <div className="h-7 w-7 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <User className="h-4 w-4 text-white" />
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-2 justify-start">
                <div className="h-7 w-7 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <Bot className="h-4 w-4 text-blue-600" />
                </div>
                <div className="bg-gray-100 rounded-2xl rounded-tl-sm px-4 py-3">
                  <DiamondLoader size="sm" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Suggestions */}
          {messages.length === 1 && (
            <div className="px-4 py-2 border-t border-gray-100 flex-shrink-0">
              <p className="text-xs text-gray-400 mb-2">Try asking:</p>
              <div className="flex flex-wrap gap-1.5">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => sendMessage(s)}
                    className="text-xs bg-blue-50 text-blue-700 rounded-full px-2.5 py-1 hover:bg-blue-100 transition-colors"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <form onSubmit={handleSubmit} className="p-3 md:p-3 border-t border-gray-100 flex items-center gap-2 flex-shrink-0 bg-white">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Ask anything about your team..."
              className="flex-1 text-sm border border-gray-200 rounded-full px-4 py-2.5 md:py-2 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 bg-gray-50"
              disabled={isLoading}
            />
            <Button
              type="submit"
              size="icon"
              disabled={!input.trim() || isLoading}
              className="h-10 w-10 md:h-9 md:w-9 rounded-full bg-blue-600 hover:bg-blue-700 text-white flex-shrink-0"
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      )}
    </>
  );
}
