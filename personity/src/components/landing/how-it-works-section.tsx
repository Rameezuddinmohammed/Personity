'use client';

import React from 'react';
import { StickyScroll } from '@/components/ui/sticky-scroll-reveal';
import { MessageSquare, Sparkles, BarChart3, CheckCircle2 } from 'lucide-react';

const content = [
  {
    title: '1. Define Your Objective',
    description:
      "Forget dragging and dropping form fields. Just tell Personity what you want to learn. Our AI analyzes your goal and constructs a 'Master Prompt'—a psychological framework for the interview—in seconds.",
    content: (
      <div className="h-full w-full bg-white rounded-xl p-8 flex flex-col justify-center space-y-6">
        <div className="space-y-3">
          <div className="h-2 w-24 bg-neutral-100 rounded-full" />
          <div className="h-2 w-full bg-neutral-100 rounded-full" />
          <div className="h-2 w-3/4 bg-neutral-100 rounded-full" />
        </div>
        <div className="p-5 bg-neutral-50 rounded-xl border border-neutral-200">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-semibold text-neutral-950">
              AI Context Detection
            </span>
          </div>
          <p className="text-sm text-neutral-600 leading-relaxed">
            "I see you want to understand user churn. I recommend we explore
            pricing sensitivity and feature gaps. Shall I add those topics?"
          </p>
        </div>
        <div className="flex gap-3">
          <div className="h-10 w-24 bg-blue-600 rounded-lg" />
          <div className="h-10 w-24 bg-neutral-100 rounded-lg" />
        </div>
      </div>
    ),
  },
  {
    title: '2. Deploy the AI Interviewer',
    description:
      "Share a single link. Personity conducts hundreds of simultaneous, adaptive interviews. Unlike static surveys, it probes deeper when users get vague ('Tell me more about that...') and respects boundaries when they disengage.",
    content: (
      <div className="h-full w-full bg-neutral-50 rounded-xl p-8 flex flex-col justify-between">
        {/* Chat UI Mockup */}
        <div className="space-y-4">
          <div className="flex justify-start">
            <div className="bg-white border border-neutral-200 p-4 rounded-2xl rounded-tl-none text-sm text-neutral-700 max-w-[85%] shadow-sm">
              How did you find the onboarding process?
            </div>
          </div>
          <div className="flex justify-end">
            <div className="bg-blue-600/10 text-blue-900 p-4 rounded-2xl rounded-tr-none text-sm max-w-[85%]">
              It was okay, kinda confusing.
            </div>
          </div>
          <div className="flex justify-start">
            <div className="bg-white border border-neutral-200 p-4 rounded-2xl rounded-tl-none text-sm text-neutral-700 max-w-[85%] shadow-sm">
              <span className="text-blue-600 font-semibold text-xs uppercase block mb-2">
                Adaptive Probe
              </span>
              Could you tell me which specific step felt confusing? That helps
              us improve.
            </div>
          </div>
        </div>
        <div className="h-12 bg-white border border-neutral-200 rounded-xl flex items-center px-4 text-neutral-400 text-sm mt-6">
          Type your response...
        </div>
      </div>
    ),
  },
  {
    title: '3. Synthesize Reality',
    description:
      'Skip the spreadsheet fatigue. Personity aggregates thousands of conversation turns into actionable intelligence: Executive Summaries, Feature Requests, and Sentiment Heatmaps.',
    content: (
      <div className="h-full w-full bg-white rounded-xl p-8 flex flex-col gap-6">
        <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-neutral-500" />
            <span className="text-base font-semibold text-neutral-950">
              Top Themes
            </span>
          </div>
          <span className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full font-medium">
            Completed
          </span>
        </div>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="font-semibold text-neutral-700">
                Pricing Friction
              </span>
              <span className="text-neutral-500">45%</span>
            </div>
            <div className="h-2 w-full bg-neutral-100 rounded-full overflow-hidden">
              <div className="h-full bg-blue-600 w-[45%]" />
            </div>
          </div>
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="font-semibold text-neutral-700">
                Mobile Experience
              </span>
              <span className="text-neutral-500">32%</span>
            </div>
            <div className="h-2 w-full bg-neutral-100 rounded-full overflow-hidden">
              <div className="h-full bg-blue-400 w-[32%]" />
            </div>
          </div>
          <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-100">
            <div className="text-xs text-neutral-400 uppercase font-bold mb-2">
              Key Insight
            </div>
            <p className="text-sm text-neutral-600 leading-relaxed">
              "Users love the feature set but are hesitating at the checkout
              page due to lack of PayPal support."
            </p>
          </div>
        </div>
      </div>
    ),
  },
];

export function HowItWorksSection() {
  return (
    <section className="py-24 bg-white dark:bg-zinc-950">
      <div className="max-w-7xl mx-auto px-6 mb-16 text-center">
        <h2 className="text-3xl md:text-4xl font-semibold text-neutral-950 dark:text-neutral-50 mb-4 tracking-tight">
          From Idea to Insight
        </h2>
        <p className="text-lg text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
          Three steps to replace weeks of manual interviews.
        </p>
      </div>
      <div className="w-full px-6">
        <StickyScroll content={content} contentClassName="overflow-hidden" />
      </div>
    </section>
  );
}
