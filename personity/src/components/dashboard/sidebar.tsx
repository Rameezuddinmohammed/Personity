'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  FileText,
  Settings,
  CreditCard,
  HelpCircle,
  LogOut,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface NavSection {
  label: string;
  items: NavItem[];
}

const navSections: NavSection[] = [
  {
    label: 'Main',
    items: [
      { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { href: '/surveys', label: 'Surveys', icon: FileText },
    ],
  },
  {
    label: 'Account',
    items: [
      { href: '/billing', label: 'Billing', icon: CreditCard },
      { href: '/settings', label: 'Settings', icon: Settings },
    ],
  },
  {
    label: 'Support',
    items: [{ href: '/help', label: 'Help', icon: HelpCircle }],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<{ name: string; email: string } | null>(
    null
  );
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      const supabase = createClient();
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();

      if (authUser) {
        const { data: userData } = await supabase
          .from('User')
          .select('name, email')
          .eq('id', authUser.id)
          .single();

        if (userData) {
          setUser(userData);
        }
      }
    };

    fetchUser();
  }, []);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <aside
      className={`fixed left-0 top-0 h-screen bg-[hsl(var(--color-card))] border-r flex flex-col transition-all duration-300 ${
        isCollapsed ? 'w-[72px]' : 'w-[280px]'
      }`}
    >
      {/* Logo & Toggle */}
      <div className="h-16 px-6 flex items-center justify-between border-b">
        {!isCollapsed && (
          <Link
            href="/dashboard"
            className="text-xl font-bold text-[hsl(var(--color-primary))] hover:opacity-80 transition-opacity"
          >
            Personity
          </Link>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 rounded-lg hover:bg-[hsl(var(--color-muted))] transition-colors"
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? (
            <ChevronRight className="w-5 h-5 text-[hsl(var(--color-muted-foreground))]" />
          ) : (
            <ChevronLeft className="w-5 h-5 text-[hsl(var(--color-muted-foreground))]" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <div className="flex-1 px-4 py-6 overflow-y-auto">
        {navSections.map((section) => (
          <div key={section.label} className="mb-6">
            {!isCollapsed && (
              <h3 className="text-xs font-semibold text-[hsl(var(--color-muted-foreground))] uppercase tracking-wider mb-2 px-3">
                {section.label}
              </h3>
            )}
            <nav className="space-y-1">
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive =
                  pathname === item.href ||
                  pathname.startsWith(item.href + '/');

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    title={isCollapsed ? item.label : undefined}
                    className={`flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                      isActive
                        ? 'bg-[hsl(var(--color-primary))]/10 text-[hsl(var(--color-primary))]'
                        : 'text-[hsl(var(--color-foreground))] hover:bg-[hsl(var(--color-muted))]'
                    } ${isCollapsed ? 'justify-center' : ''}`}
                  >
                    <Icon
                      className={`w-5 h-5 ${
                        isActive
                          ? 'text-[hsl(var(--color-primary))]'
                          : 'text-[hsl(var(--color-muted-foreground))]'
                      } ${isCollapsed ? 'shrink-0' : ''}`}
                    />
                    {!isCollapsed && <span>{item.label}</span>}
                  </Link>
                );
              })}
            </nav>
          </div>
        ))}
      </div>

      {/* User Menu */}
      <div className="border-t p-4">
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            title={isCollapsed ? user?.name || 'User' : undefined}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-[hsl(var(--color-muted))] transition-all duration-200 ${
              isCollapsed ? 'justify-center' : ''
            }`}
          >
            <div className="w-9 h-9 rounded-full bg-[hsl(var(--color-primary))]/10 flex items-center justify-center text-sm font-semibold text-[hsl(var(--color-primary))] shrink-0">
              {user ? getInitials(user.name) : 'U'}
            </div>
            {!isCollapsed && (
              <>
                <div className="flex-1 text-left min-w-0">
                  <p className="text-sm font-medium text-[hsl(var(--color-foreground))] truncate">
                    {user?.name || 'User'}
                  </p>
                  <p className="text-xs text-[hsl(var(--color-muted-foreground))] truncate">
                    {user?.email}
                  </p>
                </div>
                <ChevronDown
                  className={`w-4 h-4 text-[hsl(var(--color-muted-foreground))] transition-transform shrink-0 ${
                    showUserMenu ? 'rotate-180' : ''
                  }`}
                />
              </>
            )}
          </button>

          {/* Dropdown Menu */}
          {showUserMenu && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowUserMenu(false)}
              />
              <div
                className={`absolute bottom-full mb-2 bg-[hsl(var(--color-card))] border rounded-lg shadow-lg z-50 overflow-hidden ${
                  isCollapsed ? 'left-0 w-48' : 'left-0 right-0'
                }`}
              >
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-[hsl(var(--color-foreground))] hover:bg-[hsl(var(--color-muted))] transition-all duration-200"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </aside>
  );
}
