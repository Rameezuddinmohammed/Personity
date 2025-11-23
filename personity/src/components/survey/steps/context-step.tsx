'use client';

import { useState, useRef } from 'react';
import { Mic, MicOff } from 'lucide-react';
import { useSurveyWizardStore } from '@/lib/stores/survey-wizard-store';
import { DocumentUpload } from '../document-upload';

export function ContextStep() {
  const { context, setContext, mode, suggestedContextQuestions } = useSurveyWizardStore();
  const [listeningIndex, setListeningIndex] = useState<number | null>(null);
  const recognitionRef = useRef<any>(null);

  // Use suggested questions or fallback to defaults
  const questions = suggestedContextQuestions.length > 0 
    ? suggestedContextQuestions 
    : [
        'What is your product or service?',
        'Who is your target audience?',
        'What are you hoping to learn?',
      ];

  // Voice input handler
  const startVoiceInput = (index: number, currentValue: string) => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Voice input is not supported in your browser. Please use Chrome, Edge, or Safari.');
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    let finalTranscript = currentValue;
    let hasReceivedResults = false;

    recognition.onstart = () => {
      setListeningIndex(index);
      console.log('🎤 Voice input started');
    };

    recognition.onresult = (event: any) => {
      hasReceivedResults = true;
      let interimTranscript = '';
      
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript = currentValue + (currentValue ? ' ' : '') + transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      // Update the field with interim results
      const displayValue = finalTranscript + (interimTranscript ? ' ' + interimTranscript : '');
      updateFieldValue(index, displayValue);
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      setListeningIndex(null);
      
      // Handle different error types
      switch (event.error) {
        case 'not-allowed':
          alert('Microphone access denied. Please enable microphone permissions in your browser settings.');
          break;
        case 'network':
          // Show user-friendly message for network errors
          if (!hasReceivedResults) {
            alert('Voice input failed to connect. This can happen on localhost. Try:\n\n1. Check your internet connection\n2. Try again in a few seconds\n3. Or type your answer instead');
          }
          break;
        case 'no-speech':
          console.log('No speech detected');
          break;
        case 'aborted':
          // User manually stopped - no action needed
          break;
        default:
          console.warn('Speech recognition error:', event.error);
      }
    };

    recognition.onend = () => {
      setListeningIndex(null);
      // Update with final transcript
      if (finalTranscript !== currentValue) {
        updateFieldValue(index, finalTranscript);
      }
      console.log('🎤 Voice input ended');
    };

    recognitionRef.current = recognition;
    
    try {
      recognition.start();
    } catch (err) {
      console.error('Failed to start recognition:', err);
      setListeningIndex(null);
      alert('Failed to start voice input. Please try again or type your answer.');
    }
  };

  const stopVoiceInput = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setListeningIndex(null);
    }
  };

  const updateFieldValue = (index: number, value: string) => {
    switch (index) {
      case 0: setContext({ productDescription: value }); break;
      case 1: setContext({ userInfo: value }); break;
      case 2: setContext({ knownIssues: value }); break;
      case 3: setContext({ additional: value }); break;
    }
  };

  return (
    <div>
      {/* Step Header */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-neutral-950 dark:text-neutral-50 mb-2">
          Provide additional context
        </h2>
        <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
          {mode === 'PRODUCT_DISCOVERY' && 'Help the AI understand your product and target users better.'}
          {mode === 'FEEDBACK_SATISFACTION' && 'Provide context about what you\'re evaluating and any known concerns.'}
          {mode === 'EXPLORATORY_GENERAL' && 'Share background information to help guide the conversation.'}
        </p>
      </div>

      {/* Document Upload */}
      <div className="mb-8">
        <DocumentUpload />
      </div>

      {/* Divider */}
      <div className="relative mb-8">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-neutral-200 dark:border-zinc-700"></div>
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="px-3 bg-white dark:bg-zinc-900 text-neutral-500 dark:text-neutral-400">Or answer these questions</span>
        </div>
      </div>

      {/* Dynamic Form Fields based on suggested questions */}
      <div className="flex flex-col gap-6">
        {questions.slice(0, 4).map((question, index) => {
          // Map index to context field
          const getFieldValue = () => {
            switch (index) {
              case 0: return context.productDescription || '';
              case 1: return context.userInfo || '';
              case 2: return context.knownIssues || '';
              case 3: return context.additional || '';
              default: return '';
            }
          };

          const handleChange = (value: string) => {
            switch (index) {
              case 0: setContext({ productDescription: value }); break;
              case 1: setContext({ userInfo: value }); break;
              case 2: setContext({ knownIssues: value }); break;
              case 3: setContext({ additional: value }); break;
            }
          };

          const isListening = listeningIndex === index;

          return (
            <div key={index}>
              <label
                htmlFor={`context-${index}`}
                className="block text-[13px] font-medium text-neutral-700 dark:text-neutral-300 mb-2"
              >
                {question}
              </label>
              <div className="relative">
                <textarea
                  id={`context-${index}`}
                  value={getFieldValue()}
                  onChange={(e) => handleChange(e.target.value)}
                  placeholder={isListening ? "Listening..." : "Your answer..."}
                  className="
                    w-full min-h-[100px] px-4 py-4 pr-12 text-sm text-neutral-950 dark:text-neutral-50 bg-white dark:bg-zinc-800
                    border border-neutral-300 dark:border-zinc-700 rounded-lg resize-y font-sans leading-relaxed
                    transition-all duration-150 ease-out
                    placeholder:text-neutral-400 dark:placeholder:text-neutral-500
                    hover:border-neutral-400 dark:hover:border-zinc-600
                    focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20
                    scrollbar-custom
                  "
                  rows={4}
                />
                <button
                  type="button"
                  onClick={() => isListening ? stopVoiceInput() : startVoiceInput(index, getFieldValue())}
                  className={`
                    absolute right-3 top-3 p-2.5 rounded-lg transition-all duration-150
                    ${isListening 
                      ? 'bg-red-600 hover:bg-red-700 text-white animate-pulse' 
                      : 'bg-neutral-100 dark:bg-zinc-700 hover:bg-neutral-200 dark:hover:bg-zinc-600 text-neutral-700 dark:text-neutral-300'
                    }
                  `}
                  title={isListening ? 'Stop recording' : 'Start voice input'}
                >
                  {isListening ? (
                    <MicOff className="w-5 h-5" />
                  ) : (
                    <Mic className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
