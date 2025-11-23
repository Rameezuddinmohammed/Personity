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
        // Handle multiple messages (intro + first question)
        const aiMessages = Array.isArray(data.data.messages) 
          ? data.data.messages 
          : [data.data.message || data.data.messages];
        
        setMessages(
          aiMessages.map((content: string) => ({
            role: 'assistant' as const,
            content,
            timestamp: new Date(),
          }))
        );
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
        // Handle multiple messages (can be array or single)
        const aiMessages = Array.isArray(data.data.messages) 
          ? data.data.messages 
          : [data.data.message || data.data.messages];
        
        setMessages((prev) => [
          ...prev,
          ...aiMessages.map((content: string) => ({
            role: 'assistant' as const,
            content,
            timestamp: new Date(),
          })),
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
    <div className="flex flex-col h-[500px] bg-white dark:bg-zinc-900 rounded-lg border border-neutral-200 dark:border-zinc-700">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-200 dark:border-zinc-700">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-600 dark:bg-green-500 animate-pulse" />
          <span className="text-xs font-medium text-neutral-700 dark:text-neutral-300">Test Mode</span>
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
                  ? 'bg-primary/10 text-neutral-950 dark:text-neutral-50 rounded-br-sm'
                  : 'bg-neutral-100 dark:bg-zinc-800 text-neutral-950 dark:text-neutral-50 rounded-bl-sm'
              }`}
            >
              {message.content}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="max-w-[80%] px-4 py-3 rounded-xl rounded-bl-sm bg-neutral-100 dark:bg-zinc-800">
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  <div className="w-2 h-2 rounded-full bg-neutral-400 dark:bg-neutral-500 animate-bounce [animation-delay:-0.3s]" />
                  <div className="w-2 h-2 rounded-full bg-neutral-400 dark:bg-neutral-500 animate-bounce [animation-delay:-0.15s]" />
                  <div className="w-2 h-2 rounded-full bg-neutral-400 dark:bg-neutral-500 animate-bounce" />
                </div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-neutral-200 dark:border-zinc-700">
        <div className="flex gap-3">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your response..."
            disabled={isLoading || !isInitialized}
            className="
              flex-1 min-h-[48px] max-h-[120px] px-4 py-3 text-sm text-neutral-950 dark:text-neutral-50
              bg-white dark:bg-zinc-800 border border-neutral-300 dark:border-zinc-700 rounded-xl resize-none
              transition-all duration-150 ease-out
              placeholder:text-neutral-400 dark:placeholder:text-neutral-500
              hover:border-neutral-400 dark:hover:border-zinc-600
              focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20
              disabled:bg-neutral-50 dark:disabled:bg-zinc-900 disabled:border-neutral-200 dark:disabled:border-zinc-800 disabled:text-neutral-500 dark:disabled:text-neutral-600
              scrollbar-hide
            "
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
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
              disabled:bg-neutral-300 dark:disabled:bg-zinc-700 disabled:cursor-not-allowed
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
