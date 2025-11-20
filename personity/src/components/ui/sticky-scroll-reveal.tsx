"use client";
import React, { useRef } from "react";
import { useMotionValueEvent, useScroll } from "framer-motion";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export const StickyScroll = ({
  content,
  contentClassName,
}: {
  content: {
    title: string;
    description: string;
    content?: React.ReactNode | any;
  }[];
  contentClassName?: string;
}) => {
  const [activeCard, setActiveCard] = React.useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: scrollRef,
    offset: ["start start", "end end"],
  });

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    const cardsBreakpoints = content.map((_, index) => index / content.length);
    const closestBreakpointIndex = cardsBreakpoints.reduce(
      (acc, breakpoint, index) => {
        const distance = Math.abs(latest - breakpoint);
        if (distance < Math.abs(latest - cardsBreakpoints[acc])) {
          return index;
        }
        return acc;
      },
      0
    );
    setActiveCard(closestBreakpointIndex);
  });

  return (
    <div ref={scrollRef} className="relative">
      <div className="flex gap-16 max-w-7xl mx-auto">
        {/* Left side - scrollable content */}
        <div className="flex-1 max-w-2xl">
          {content.map((item, index) => (
            <div key={item.title + index} className="min-h-[500px] flex flex-col justify-center py-16 first:pt-0 last:pb-0">
              <motion.h2
                initial={{ opacity: 0 }}
                animate={{
                  opacity: activeCard === index ? 1 : 0.3,
                }}
                transition={{ duration: 0.2 }}
                className="text-3xl font-semibold text-neutral-950 mb-4 tracking-tight"
              >
                {item.title}
              </motion.h2>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{
                  opacity: activeCard === index ? 1 : 0.3,
                }}
                transition={{ duration: 0.2 }}
                className="text-base text-neutral-600 leading-relaxed"
              >
                {item.description}
              </motion.p>
            </div>
          ))}
        </div>

        {/* Right side - sticky visual */}
        <div className="hidden lg:block flex-1 max-w-md">
          <div className="sticky top-32 h-[500px]">
            <motion.div
              key={activeCard}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={cn(
                "h-full w-full rounded-xl bg-white border border-neutral-200 overflow-hidden shadow-sm",
                contentClassName
              )}
            >
              {content[activeCard].content ?? null}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};
