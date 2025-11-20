'use client';

import { X, Check } from 'lucide-react';

export function ComparisonSection() {
  return (
    <section className="py-24 px-6 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-semibold text-neutral-950 mb-4 tracking-tight">
            Stop choosing between <span className="text-blue-600">Scale</span> and <span className="text-blue-600">Depth</span>
          </h2>
          <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
            Traditional tools force you to compromise. Personity gives you the best of both worlds.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Traditional Surveys */}
          <div className="p-8 rounded-xl bg-neutral-50 border border-neutral-200 opacity-75 hover:opacity-100 transition-opacity">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-neutral-900">Traditional Surveys</h3>
              <p className="text-sm text-neutral-500">Typeform, SurveyMonkey</p>
            </div>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 text-neutral-600">
                <Check className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                <span className="text-sm">High Scale (1000s of users)</span>
              </li>
              <li className="flex items-start gap-3 text-neutral-600">
                <X className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                <span className="text-sm">Shallow data (Multiple choice)</span>
              </li>
              <li className="flex items-start gap-3 text-neutral-600">
                <X className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                <span className="text-sm">Low engagement (~10% completion)</span>
              </li>
              <li className="flex items-start gap-3 text-neutral-600">
                <X className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                <span className="text-sm">Rigid, robotic experience</span>
              </li>
            </ul>
          </div>

          {/* Personity (The Hero) */}
          <div className="relative p-8 rounded-xl bg-white border-2 border-blue-600 shadow-xl transform md:-translate-y-4 z-10">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-4 py-1 rounded-full text-xs font-semibold uppercase tracking-wider">
              The New Standard
            </div>
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-neutral-900">Personity</h3>
              <p className="text-sm text-blue-600 font-medium">AI Conversational Research</p>
            </div>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 text-neutral-900">
                <div className="p-1 bg-blue-100 rounded-full shrink-0">
                  <Check className="w-4 h-4 text-blue-600" />
                </div>
                <span className="text-sm font-medium">Pause & resume anytime</span>
              </li>
              <li className="flex items-start gap-3 text-neutral-900">
                <div className="p-1 bg-blue-100 rounded-full shrink-0">
                  <Check className="w-4 h-4 text-blue-600" />
                </div>
                <span className="text-sm font-medium">Automated AI analysis</span>
              </li>
              <li className="flex items-start gap-3 text-neutral-900">
                <div className="p-1 bg-blue-100 rounded-full shrink-0">
                  <Check className="w-4 h-4 text-blue-600" />
                </div>
                <span className="text-sm font-medium">Natural conversations</span>
              </li>
              <li className="flex items-start gap-3 text-neutral-900">
                <div className="p-1 bg-blue-100 rounded-full shrink-0">
                  <Check className="w-4 h-4 text-blue-600" />
                </div>
                <span className="text-sm font-medium">5-minute setup</span>
              </li>
            </ul>
          </div>

          {/* User Interviews */}
          <div className="p-8 rounded-xl bg-neutral-50 border border-neutral-200 opacity-75 hover:opacity-100 transition-opacity">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-neutral-900">User Interviews</h3>
              <p className="text-sm text-neutral-500">Zoom, UserTesting</p>
            </div>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 text-neutral-600">
                <Check className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                <span className="text-sm">Deep Insights (The "Why")</span>
              </li>
              <li className="flex items-start gap-3 text-neutral-600">
                <X className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                <span className="text-sm">Unscalable (5-10 users max)</span>
              </li>
              <li className="flex items-start gap-3 text-neutral-600">
                <X className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                <span className="text-sm">Slow (Weeks to schedule)</span>
              </li>
              <li className="flex items-start gap-3 text-neutral-600">
                <X className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                <span className="text-sm">Expensive ($$$ per hour)</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
