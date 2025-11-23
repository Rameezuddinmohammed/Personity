'use client';

import { Sidebar } from '@/components/dashboard/sidebar';
import { MobileNav } from '@/components/dashboard/mobile-nav';
import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarWidth, setSidebarWidth] = useState(280);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);

    // Listen for sidebar width changes
    const handleResize = () => {
      const sidebar = document.querySelector('aside');
      if (sidebar) {
        setSidebarWidth(sidebar.offsetWidth);
      }
    };

    // Initial check
    handleResize();

    // Watch for changes
    const observer = new ResizeObserver(handleResize);
    const sidebar = document.querySelector('aside');
    if (sidebar) {
      observer.observe(sidebar);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-black">
      {/* Mobile Header */}
      <header className="md:hidden sticky top-0 z-50 h-16 bg-white dark:bg-zinc-900 border-b border-neutral-200 dark:border-zinc-800 px-6 flex items-center justify-between">
        <Link
          href="/dashboard"
          className="text-xl font-bold text-neutral-950 dark:text-neutral-50"
        >
          Personity
        </Link>
        <MobileNav />
      </header>

      <div className="flex">
        {/* Desktop Sidebar */}
        <div className="hidden md:block">
          <Sidebar />
        </div>

        {/* Main Content */}
        <main
          className="flex-1 p-6 md:p-10 min-h-screen transition-all duration-300"
          style={{
            marginLeft:
              isMounted && typeof window !== 'undefined' && window.innerWidth >= 768
                ? `${sidebarWidth}px`
                : 0,
          }}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
