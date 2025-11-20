'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Loader2, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface TestConversationProps {
  objective: string;
  context?: {
    productDescription?: string;
    userInfo?: string;
    knownIssues?: string;
  };
  topics: string[];
  settings: {
    length: 'quick' | 'standard' | 'deep';
    tone: 'professional' | 'friendly' | 'casual';
    stopCondition: 'questions' | 'topics_covered';
    maxQuestions?: number;
  };
}

export function TestConversation({
  objective,
  context,
  topics,
  settings,
}: TestConversationProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Initialize conversation
  useEffect(() => {
    if (!isInitialized) {
      initializeConversation();
    }
  }, [isInitialized]);

  const initializeConversation = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/surveys/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          objective,
          context,
          topics,
          settings,
          action: 'start',
        }),
      });

      const data = await response.json();
      if (data.success) {
        setMessages([
          {
            role: 'assistant',
            content: data.data.message,
            timestamp: new Date(),
          },
        ]);
        setIsInitialized(true);
      }
    } catch (error) {
      console.error('Failed to initialize conversation:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/surveys/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          objective,
          context,
          topics,
          settings,
          action: 'message',
          message: userMessage.content,
          history: messages,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: data.data.message,
            timestamp: new Date(),
          },
        ]);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setMessages([]);
    setInput('');
    setIsInitialized(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-[500px] bg-white rounded-lg border border-n-200">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-n-200">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
          <span className="text-xs font-medium text-n-700">Test Mode</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleReset}
          disabled={isLoading}
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          Reset
        </Button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${
              message.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`max-w-[80%] px-4 py-3 rounded-xl text-sm leading-relaxed ${
                message.role === 'user'
                  ? 'bg-primary/10 text-n-950 rounded-br-sm'
                  : 'bg-n-100 text-n-950 rounded-bl-sm'
              }`}
            >
              {message.content}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="max-w-[80%] px-4 py-3 rounded-xl rounded-bl-sm bg-n-100">
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  <div className="w-2 h-2 rounded-full bg-n-400 animate-bounce [animation-delay:-0.3s]" />
                  <div className="w-2 h-2 rounded-full bg-n-400 animate-bounce [animation-delay:-0.15s]" />
                  <div className="w-2 h-2 rounded-full bg-n-400 animate-bounce" />
                </div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-n-200">
        <div className="flex gap-3">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your response..."
            disabled={isLoading || !isInitialized}
            className="
              flex-1 min-h-[48px] max-h-[120px] px-4 py-3 text-sm text-n-950
              bg-white border border-n-300 rounded-xl resize-none
              transition-all duration-150 ease-out
              placeholder:text-n-400
              hover:border-n-400
              focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20
              disabled:bg-n-50 disabled:border-n-200 disabled:text-n-500
            "
            rows={1}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading || !isInitialized}
            className="
              w-12 h-12 flex items-center justify-center
              bg-primary text-white rounded-xl
              transition-all duration-150 ease-out
              hover:bg-primary-hover
              active:scale-95
              disabled:bg-n-300 disabled:cursor-not-allowed
            "
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
