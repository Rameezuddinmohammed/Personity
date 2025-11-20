'use client';

import * as React from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StickyBannerProps extends React.HTMLAttributes<HTMLDivElement> {
  dismissible?: boolean;
  onDismiss?: () => void;
}

export function StickyBanner({
  children,
  className,
  dismissible = true,
  onDismiss,
  ...props
}: StickyBannerProps) {
  const [isVisible, setIsVisible] = React.useState(true);
  const [isSticky, setIsSticky] = React.useState(false);
  const bannerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsSticky(!entry.isIntersecting);
      },
      { threshold: [1] }
    );

    if (bannerRef.current) {
      observer.observe(bannerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    onDismiss?.();
  };

  if (!isVisible) return null;

  return (
    <>
      {/* Sentinel element for intersection observer */}
      <div ref={bannerRef} className="h-0" />

      {/* Banner */}
      <div
        className={cn(
          'sticky top-0 z-40 w-full px-6 py-3 transition-all duration-300',
          isSticky && 'shadow-md',
          className
        )}
        {...props}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <div className="flex-1 text-sm">{children}</div>

          {dismissible && (
            <button
              onClick={handleDismiss}
              className="shrink-0 rounded-md p-1 transition-colors hover:bg-white/20"
              aria-label="Dismiss banner"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </>
  );
}
