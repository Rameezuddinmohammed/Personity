'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Send, Pause } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export default function ConversationPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const shortUrl = params.shortUrl as string;
  const resumeToken = searchParams.get('resume');
  
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [isPausing, setIsPausing] = useState(false);
  const [pauseUrl, setPauseUrl] = useState<string | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [completionSummary, setCompletionSummary] = useState<string | null>(null);
  const [isCompletingConversation, setIsCompletingConversation] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  // Auto-grow textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px';
    }
  }, [inputValue]);
  
  // Initialize conversation session
  useEffect(() => {
    async function initializeSession() {
      try {
        // Check if resuming
        if (resumeToken) {
          const response = await fetch(`/api/conversations/${resumeToken}/resume`, {
            method: 'POST',
          });
          
          if (!response.ok) {
            throw new Error('Failed to resume conversation');
          }
          
          const data = await response.json();
          
          if (data.success) {
            setSessionToken(data.data.sessionToken);
            
            // Restore message history
            const exchanges = data.data.exchanges as Array<{
              role: string;
              content: string;
              timestamp: string;
            }>;
            
            setMessages(
              exchanges.map((ex) => ({
                role: ex.role as 'user' | 'assistant',
                content: ex.content,
                timestamp: ex.timestamp,
              }))
            );
          } else {
            throw new Error(data.error || 'Failed to resume conversation');
          }
        } else {
          // Start new conversation
          const response = await fetch(`/api/public/surveys/${shortUrl}/start`, {
            method: 'POST',
          });
          
          if (!response.ok) {
            throw new Error('Failed to start conversation');
          }
          
          const data = await response.json();
          
          if (data.success) {
            setSessionToken(data.data.sessionToken);
            setMessages([
              {
                role: 'assistant',
                content: data.data.initialMessage,
                timestamp: new Date().toISOString(),
              },
            ]);
          } else {
            throw new Error(data.error || 'Failed to start conversation');
          }
        }
      } catch (err) {
        console.error('Initialization error:', err);
        setError('Failed to start conversation. Please try again.');
      } finally {
        setIsInitializing(false);
      }
    }
    
    initializeSession();
  }, [shortUrl, resumeToken]);
  
  const handleSendMessage = async () => {
    if (!inputValue.trim() || !sessionToken || isLoading) return;
    
    const userMessage = inputValue.trim();
    setInputValue('');
    
    // Add user message to UI
    const newUserMessage: Message = {
      role: 'user',
      content: userMessage,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, newUserMessage]);
    setIsLoading(true);
    
    try {
      const response = await fetch(`/api/conversations/${sessionToken}/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: userMessage }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to send message');
      }
      
      const data = await response.json();
      
      if (data.success) {
        // Add AI response to UI
        const aiMessage: Message = {
          role: 'assistant',
          content: data.data.aiResponse,
          timestamp: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, aiMessage]);
        
        // Update progress
        if (data.data.progress !== undefined) {
          setProgress(data.data.progress);
        }
        
        // Check if conversation should end
        if (data.data.shouldEnd) {
          // Show completion summary (use AI's final message as summary)
          setCompletionSummary(data.data.summary || data.data.aiResponse || 'Thank you for sharing your thoughts with us!');
        }
      } else {
        throw new Error(data.error || 'Failed to get response');
      }
    } catch (err) {
      console.error('Send message error:', err);
      setError('Failed to send message. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  const handlePause = async () => {
    if (!sessionToken || isPausing) return;
    
    setIsPausing(true);
    
    try {
      const response = await fetch(`/api/conversations/${sessionToken}/pause`, {
        method: 'POST',
      });
      
      if (!response.ok) {
        throw new Error('Failed to pause conversation');
      }
      
      const data = await response.json();
      
      if (data.success) {
        setPauseUrl(data.data.resumeUrl);
      } else {
        throw new Error(data.error || 'Failed to pause conversation');
      }
    } catch (err) {
      console.error('Pause error:', err);
      setError('Failed to pause conversation. Please try again.');
    } finally {
      setIsPausing(false);
    }
  };
  
  const handleCompleteConversation = async (confirmed: boolean) => {
    if (!sessionToken || isCompletingConversation) return;
    
    setIsCompletingConversation(true);
    
    try {
      const response = await fetch(`/api/conversations/${sessionToken}/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ confirmed }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to complete conversation');
      }
      
      const data = await response.json();
      
      if (data.success) {
        if (confirmed) {
          setIsCompleted(true);
        } else {
          // Continue conversation
          setCompletionSummary(null);
        }
      } else {
        throw new Error(data.error || 'Failed to complete conversation');
      }
    } catch (err) {
      console.error('Complete conversation error:', err);
      setError('Failed to complete conversation. Please try again.');
    } finally {
      setIsCompletingConversation(false);
    }
  };
  
  if (isInitializing) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
        <div className="text-[14px] text-[#71717A]">Starting conversation...</div>
      </div>
    );
  }
  
  if (error && !sessionToken) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center px-6">
        <div className="text-center">
          <p className="text-[14px] text-[#DC2626] mb-4">{error}</p>
          <Link
            href={`/s/${shortUrl}`}
            className="text-[14px] text-[#2563EB] hover:text-[#1D4ED8]"
          >
            Go back
          </Link>
        </div>
      </div>
    );
  }
  
  // Completion screen
  if (isCompleted) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center px-6">
        <div className="w-full max-w-[640px]">
          <div className="bg-white border border-[#E4E4E7] rounded-[12px] p-12 text-center">
            <div className="w-16 h-16 bg-[#059669]/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg
                className="w-8 h-8 text-[#059669]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            
            <h1 className="text-[24px] leading-[32px] font-semibold text-[#0A0A0B] tracking-[-0.01em] mb-4">
              Thank You!
            </h1>
            
            <p className="text-[14px] leading-[20px] text-[#3F3F46] mb-8">
              Your insights have been recorded. We appreciate you taking the time to share your thoughts with us.
            </p>
            
            <div className="bg-[#F4F4F5] border border-[#E4E4E7] rounded-[8px] p-6 mb-8">
              <p className="text-[13px] text-[#71717A] mb-3">
                Like how we interact?
              </p>
              <Link
                href="/"
                className="inline-flex items-center justify-center bg-[#2563EB] text-white text-[14px] font-medium px-6 py-3 rounded-[8px] hover:bg-[#1D4ED8] transition-colors duration-150"
              >
                Build your own for free with Personity
              </Link>
            </div>
          </div>
          
          <div className="mt-6 text-center">
            <Link
              href="/"
              className="text-[13px] text-[#71717A] hover:text-[#3F3F46] transition-colors duration-150"
            >
              Powered by <span className="font-medium">Personity</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white border-b border-neutral-200">
        <div className="px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="text-sm sm:text-base font-semibold text-neutral-950">Personity</div>
            <div className="h-4 sm:h-5 w-px bg-neutral-200" />
            <div className="flex items-center gap-1.5 sm:gap-2">
              <div className="h-2 sm:h-2.5 w-2 sm:w-2.5 rounded-full bg-green-600" />
              <span className="text-xs sm:text-sm text-neutral-600">Active</span>
            </div>
          </div>
          
          {/* 3-dot menu */}
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5 text-neutral-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
              </svg>
            </button>
            
            {showMenu && (
              <>
                <div className="fixed inset-0 z-20" onClick={() => setShowMenu(false)} />
                <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-neutral-200 rounded-lg shadow-lg z-30 py-1">
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      handlePause();
                    }}
                    disabled={isPausing}
                    className="w-full px-4 py-2 text-left text-sm text-neutral-700 hover:bg-neutral-50 flex items-center gap-2"
                  >
                    <Pause className="w-4 h-4" />
                    Pause & Save
                  </button>
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      window.close();
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-neutral-700 hover:bg-neutral-50 flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Exit
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center overflow-hidden">
        <div className="w-full max-w-[800px] flex-1 flex flex-col">
          {/* Pause Modal */}
          {pauseUrl && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4 sm:px-6">
              <div className="bg-white rounded-[16px] p-6 sm:p-8 max-w-[480px] w-full">
                <h2 className="text-[18px] sm:text-[20px] font-semibold text-[#0A0A0B] mb-3 sm:mb-4">
                  Conversation Paused
                </h2>
                <p className="text-[13px] sm:text-[14px] text-[#3F3F46] mb-4 sm:mb-6">
                  Save this link to resume your conversation later:
                </p>
                <div className="bg-[#F4F4F5] border border-[#E4E4E7] rounded-[8px] p-3 sm:p-4 mb-4 sm:mb-6">
                  <p className="text-[12px] sm:text-[13px] text-[#0A0A0B] break-all font-mono">
                    {pauseUrl}
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(pauseUrl);
                    }}
                    className="flex-1 bg-[#2563EB] text-white text-[13px] sm:text-[14px] font-medium px-4 sm:px-6 py-2.5 sm:py-3 rounded-[8px] hover:bg-[#1D4ED8] transition-colors duration-150"
                  >
                    Copy Link
                  </button>
                  <Link
                    href={`/s/${shortUrl}`}
                    className="flex-1 bg-white border border-[#D4D4D8] text-[#0A0A0B] text-[13px] sm:text-[14px] font-medium px-4 sm:px-6 py-2.5 sm:py-3 rounded-[8px] hover:bg-[#F4F4F5] transition-colors duration-150 text-center"
                  >
                    Close
                  </Link>
                </div>
              </div>
            </div>
          )}
          
          {/* Completion Summary Modal */}
          {completionSummary && !isCompleted && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4 sm:px-6">
              <div className="bg-white rounded-[16px] p-6 sm:p-8 max-w-[560px] w-full max-h-[90vh] overflow-y-auto">
                <h2 className="text-[18px] sm:text-[20px] font-semibold text-[#0A0A0B] mb-3 sm:mb-4">
                  Summary of Our Conversation
                </h2>
                <p className="text-[13px] sm:text-[14px] text-[#3F3F46] mb-4 sm:mb-6">
                  {completionSummary}
                </p>
                <p className="text-[12px] sm:text-[13px] text-[#71717A] mb-4 sm:mb-6">
                  Does this accurately capture what you shared?
                </p>
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                  <button
                    onClick={() => handleCompleteConversation(true)}
                    disabled={isCompletingConversation}
                    className="flex-1 bg-[#2563EB] text-white text-[13px] sm:text-[14px] font-medium px-4 sm:px-6 py-2.5 sm:py-3 rounded-[8px] hover:bg-[#1D4ED8] disabled:bg-[#D4D4D8] disabled:cursor-not-allowed transition-colors duration-150"
                  >
                    Yes, looks good
                  </button>
                  <button
                    onClick={() => handleCompleteConversation(false)}
                    disabled={isCompletingConversation}
                    className="flex-1 bg-white border border-[#D4D4D8] text-[#0A0A0B] text-[13px] sm:text-[14px] font-medium px-4 sm:px-6 py-2.5 sm:py-3 rounded-[8px] hover:bg-[#F4F4F5] disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150"
                  >
                    Let me add more
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {/* Messages Container */}
          <div className="flex-1 p-3 sm:p-4 overflow-y-auto">
            <div className="space-y-3 sm:space-y-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] sm:max-w-[80%] px-3 sm:px-4 py-2.5 sm:py-3 rounded-[12px] ${
                      message.role === 'user'
                        ? 'bg-[#2563EB]/10 text-[#0A0A0B]'
                        : 'bg-[#F4F4F5] text-[#0A0A0B]'
                    }`}
                  >
                    <p className="text-[14px] sm:text-[15px] leading-relaxed whitespace-pre-wrap">
                      {message.content}
                    </p>
                  </div>
                </div>
              ))}
              
              {/* Typing Indicator */}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-[#F4F4F5] px-4 py-3 rounded-[12px]">
                    <div className="flex space-x-2">
                      <div className="w-2 h-2 bg-[#71717A] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 bg-[#71717A] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2 h-2 bg-[#71717A] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          </div>
          
          {/* Input Area */}
          <div className="sticky bottom-0 bg-white border-t border-neutral-200 p-3 sm:p-4">
            {error && sessionToken && (
              <div className="mb-2 sm:mb-3 text-xs sm:text-sm text-red-600">{error}</div>
            )}
            
            <div className="flex items-end gap-2 sm:gap-3">
              <textarea
                ref={textareaRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your response..."
                disabled={isLoading}
                className="flex-1 resize-none px-3 sm:px-4 py-2.5 sm:py-3 border border-[#D4D4D8] rounded-[8px] text-[13px] sm:text-[14px] text-[#0A0A0B] placeholder:text-[#71717A] focus:outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20 disabled:bg-[#F4F4F5] disabled:cursor-not-allowed"
                rows={1}
                style={{ maxHeight: '120px' }}
              />
              
              <button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isLoading}
                className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center bg-[#2563EB] text-white rounded-[8px] hover:bg-[#1D4ED8] disabled:bg-[#D4D4D8] disabled:cursor-not-allowed transition-colors duration-150"
              >
                <Send className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>
          </div>
        </div>
        
      </main>
    </div>
  );
}
