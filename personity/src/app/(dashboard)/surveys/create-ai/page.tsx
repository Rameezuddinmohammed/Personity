'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Send, Sparkles, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Message {
  role: 'ai' | 'user';
  content: string;
}

interface SurveyData {
  objective?: string;
  topics?: string[];
  context?: {
    productDescription?: string;
    userInfo?: string;
    knownIssues?: string;
  };
  settings?: {
    length: 'quick' | 'standard' | 'deep';
    tone: 'professional' | 'friendly' | 'casual';
  };
  mode?: 'PRODUCT_DISCOVERY' | 'FEEDBACK_SATISFACTION' | 'EXPLORATORY_GENERAL';
}

const STEPS = [
  { key: 'objective', label: 'Research Goal', weight: 25 },
  { key: 'topics', label: 'Topics to Cover', weight: 25 },
  { key: 'context', label: 'Context & Details', weight: 25 },
  { key: 'settings', label: 'Survey Settings', weight: 25 },
];

export default function AICreateSurveyPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'ai',
      content: "Hi! I'll help you create a research survey. Tell me - what do you want to learn from your users?",
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [surveyData, setSurveyData] = useState<SurveyData>({});
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const progress = completedSteps.reduce((acc, step) => {
    const stepConfig = STEPS.find(s => s.key === step);
    return acc + (stepConfig?.weight || 0);
  }, 0);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await fetch('/api/surveys/create-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          surveyData,
          completedSteps,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setMessages(prev => [...prev, { role: 'ai', content: data.aiResponse }]);
        setSurveyData(data.surveyData);
        setCompletedSteps(data.completedSteps);

        // If survey is complete, redirect
        if (data.surveyComplete) {
          setTimeout(() => {
            router.push(`/surveys/${data.surveyId}`);
          }, 1500);
        }
      }
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [
        ...prev,
        { role: 'ai', content: "Sorry, something went wrong. Can you try again?" },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <div className="bg-white border-b border-neutral-200">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <button
            onClick={() => router.push('/surveys')}
            className="flex items-center gap-2 text-sm text-neutral-600 hover:text-neutral-950 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Surveys
          </button>

          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-blue-600/10 rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-neutral-950">Create with AI</h1>
              <p className="text-sm text-neutral-600">Chat to design your survey</p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-neutral-600">
              <span>Progress</span>
              <span>{progress}%</span>
            </div>
            <div className="h-2 bg-neutral-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-600 transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="flex gap-4 text-xs">
              {STEPS.map(step => (
                <div
                  key={step.key}
                  className={`flex items-center gap-1.5 ${
                    completedSteps.includes(step.key)
                      ? 'text-green-600'
                      : 'text-neutral-400'
                  }`}
                >
                  {completedSteps.includes(step.key) ? (
                    <Check className="w-3.5 h-3.5" />
                  ) : (
                    <div className="w-3.5 h-3.5 rounded-full border-2 border-current" />
                  )}
                  {step.label}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="bg-white border border-neutral-200 rounded-xl shadow-sm">
          {/* Messages */}
          <div className="h-[500px] overflow-y-auto p-6 space-y-4">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg px-4 py-3 ${
                    msg.role === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-neutral-100 text-neutral-950'
                  }`}
                >
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-neutral-100 rounded-lg px-4 py-3">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce delay-100" />
                    <div className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce delay-200" />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t border-neutral-200 p-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Type your message..."
                disabled={isLoading}
                className="flex-1 px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent disabled:opacity-50"
              />
              <Button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className="px-6"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
