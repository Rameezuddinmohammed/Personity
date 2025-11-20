"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { WobbleCard } from '@/components/ui/wobble-card';
import { TextGenerateEffect } from '@/components/ui/text-generate-effect';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';



export default function Home() {
  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link
            href="/"
            className="text-xl font-semibold text-neutral-950 hover:text-blue-600 transition-colors"
          >
            Personity
          </Link>
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              asChild
              className="hidden sm:inline-flex"
            >
              <Link href="/login">Sign in</Link>
            </Button>
            <Button
              size="sm"
              asChild
            >
              <Link href="/signup">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section - Full Screen */}
      <section className="relative min-h-screen flex items-center justify-center px-6 overflow-hidden bg-white">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <TextGenerateEffect
            words="Interview-Level Insights at Survey-Level Speed"
            className="text-5xl md:text-6xl lg:text-7xl font-semibold mb-6"
          />
          
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2, duration: 0.5 }}
            className="text-lg md:text-xl text-neutral-600 mb-8 max-w-3xl mx-auto"
          >
            AI-powered conversational research. Get deeper insights without the time or cost.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2.3, duration: 0.5 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12"
          >
            <Button
              size="lg"
              asChild
              className="group"
            >
              <Link href="/signup">
                Start Free Trial
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              asChild
            >
              <Link href="#features">See How It Works</Link>
            </Button>
          </motion.div>


        </div>
      </section>

      {/* Features - Bento Grid */}
      <section id="features" className="py-24 px-6 bg-neutral-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-semibold text-neutral-950 mb-4 tracking-tight">
              Why Personity?
            </h2>
            <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
              Four powerful features that transform how you gather insights
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 w-full">
            <WobbleCard
              containerClassName="col-span-1 lg:col-span-2 h-full bg-pink-800 min-h-[500px] lg:min-h-[300px]"
              className=""
            >
              <div className="max-w-xs">
                <h2 className="text-left text-balance text-base md:text-xl lg:text-3xl font-semibold tracking-[-0.015em] text-white">
                  Adaptive AI Conversations
                </h2>
                <p className="mt-4 text-left text-base/6 text-neutral-200">
                  Our AI interviewer adapts to each respondent in real-time, asking follow-up questions based on their answers—just like a skilled human researcher.
                </p>
              </div>
            </WobbleCard>

            <WobbleCard containerClassName="col-span-1 min-h-[300px]">
              <h2 className="max-w-80 text-left text-balance text-base md:text-xl lg:text-3xl font-semibold tracking-[-0.015em] text-white">
                Automated Analysis
              </h2>
              <p className="mt-4 max-w-[26rem] text-left text-base/6 text-neutral-200">
                AI extracts themes, sentiment, and key quotes from every conversation—no manual coding required.
              </p>
            </WobbleCard>

            <WobbleCard containerClassName="col-span-1 bg-cyan-900 min-h-[300px]">
              <h2 className="max-w-80 text-left text-balance text-base md:text-xl lg:text-3xl font-semibold tracking-[-0.015em] text-white">
                Pause & Resume Anytime
              </h2>
              <p className="mt-4 max-w-[26rem] text-left text-base/6 text-neutral-200">
                Respondents can pause and return later via unique link. Complete on their own schedule.
              </p>
            </WobbleCard>

            <WobbleCard containerClassName="col-span-1 lg:col-span-2 bg-blue-900 min-h-[500px] lg:min-h-[300px]">
              <div className="max-w-sm">
                <h2 className="max-w-sm md:max-w-lg text-left text-balance text-base md:text-xl lg:text-3xl font-semibold tracking-[-0.015em] text-white">
                  Launch in 5 Minutes
                </h2>
                <p className="mt-4 max-w-[26rem] text-left text-base/6 text-neutral-200">
                  Our guided wizard helps you create your first survey in under 5 minutes. Define your objective, add topics, and let AI handle the rest.
                </p>
              </div>
            </WobbleCard>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 bg-white border-t border-neutral-200">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-semibold text-neutral-950 mb-4 tracking-tight">
            Ready to transform your research?
          </h2>
          <p className="text-lg text-neutral-600 mb-8">
            Join product teams and founders gathering better insights, faster.
          </p>
          <Button
            size="lg"
            asChild
            className="group"
          >
            <Link href="/signup">
              Start Free Trial
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
          <p className="text-sm text-neutral-500 mt-4">
            No credit card required • 50 free responses
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-neutral-200 bg-white">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-sm text-neutral-600">
              © 2024 Personity. All rights reserved.
            </div>
            <div className="flex gap-6 text-sm text-neutral-600">
              <Link href="/signup" className="hover:text-neutral-950 transition-colors">
                Privacy
              </Link>
              <Link href="/signup" className="hover:text-neutral-950 transition-colors">
                Terms
              </Link>
              <Link href="/signup" className="hover:text-neutral-950 transition-colors">
                Contact
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
