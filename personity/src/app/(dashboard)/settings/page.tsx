'use client';

import { useState, useEffect } from 'react';
import { User, Lock, Trash2, Monitor, Sun, Moon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/lib/theme-provider';

interface UserData {
  name: string;
  email: string;
  plan: string;
  createdAt: string;
}

export default function SettingsPage() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [user, setUser] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Profile form
  const [name, setName] = useState('');
  
  // Password form
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Delete account
  const [deleteConfirm, setDeleteConfirm] = useState('');

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      const response = await fetch('/api/auth/me');
      const data = await response.json();
      if (data.user) {
        setUser(data.user);
        setName(data.user.name);
      }
    } catch (error) {
      console.error('Failed to fetch user:', error);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/users/update', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });

      if (response.ok) {
        alert('Profile updated successfully!');
        fetchUser();
      } else {
        alert('Failed to update profile');
      }
    } catch (error) {
      console.error('Update error:', error);
      alert('Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      alert('New passwords do not match');
      return;
    }

    if (newPassword.length < 8) {
      alert('Password must be at least 8 characters');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/users/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      if (response.ok) {
        alert('Password changed successfully!');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to change password');
      }
    } catch (error) {
      console.error('Password change error:', error);
      alert('Failed to change password');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirm !== 'DELETE') {
      alert('Please type DELETE to confirm');
      return;
    }

    if (!confirm('Are you absolutely sure? This action cannot be undone. All your surveys and data will be permanently deleted.')) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/users/delete', {
        method: 'DELETE',
      });

      if (response.ok) {
        alert('Account deleted successfully');
        router.push('/');
      } else {
        alert('Failed to delete account');
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete account');
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-neutral-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-neutral-950 mb-2 tracking-tight">
        Settings
      </h1>
      <p className="text-neutral-600 mb-8">
        Manage your account settings and preferences
      </p>

      <div className="space-y-6">
        {/* Profile Section */}
        <div className="bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
              <User className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-neutral-950">Profile</h2>
              <p className="text-sm text-neutral-600">Update your personal information</p>
            </div>
          </div>

          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Email
              </label>
              <input
                type="email"
                value={user.email}
                disabled
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg bg-neutral-50 text-neutral-500 cursor-not-allowed"
              />
              <p className="text-xs text-neutral-500 mt-1">
                Email cannot be changed
              </p>
            </div>

            <div className="flex items-center justify-between pt-4">
              <div className="text-sm text-neutral-600">
                Member since {new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </div>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </div>

        {/* Appearance Section */}
        <div className="bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-blue-50 dark:bg-blue-950 rounded-lg flex items-center justify-center">
              <Monitor className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-neutral-950 dark:text-neutral-50">Appearance</h2>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">Customize how Personity looks</p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-3">
              Theme
            </label>
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => setTheme('light')}
                className={`flex items-center gap-2 p-3 rounded-lg border transition-colors ${
                  theme === 'light'
                    ? 'border-neutral-950 dark:border-neutral-50 bg-neutral-50 dark:bg-zinc-800'
                    : 'border-neutral-200 dark:border-zinc-700 hover:border-neutral-300 dark:hover:border-zinc-600'
                }`}
              >
                <Sun className="w-4 h-4" />
                <span className="text-sm">Light</span>
              </button>
              <button
                onClick={() => setTheme('dark')}
                className={`flex items-center gap-2 p-3 rounded-lg border transition-colors ${
                  theme === 'dark'
                    ? 'border-neutral-950 dark:border-neutral-50 bg-neutral-50 dark:bg-zinc-800'
                    : 'border-neutral-200 dark:border-zinc-700 hover:border-neutral-300 dark:hover:border-zinc-600'
                }`}
              >
                <Moon className="w-4 h-4" />
                <span className="text-sm">Dark</span>
              </button>
              <button
                onClick={() => setTheme('system')}
                className={`flex items-center gap-2 p-3 rounded-lg border transition-colors ${
                  theme === 'system'
                    ? 'border-neutral-950 dark:border-neutral-50 bg-neutral-50 dark:bg-zinc-800'
                    : 'border-neutral-200 dark:border-zinc-700 hover:border-neutral-300 dark:hover:border-zinc-600'
                }`}
              >
                <Monitor className="w-4 h-4" />
                <span className="text-sm">System</span>
              </button>
            </div>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-2">
              {theme === 'system' 
                ? 'Automatically matches your device settings'
                : `Always use ${theme} mode`
              }
            </p>
          </div>
        </div>

        {/* Plan & Billing Section */}
        <div className="bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-neutral-950">Plan & Billing</h2>
              <p className="text-sm text-neutral-600">Manage your subscription</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-lg">
              <div>
                <p className="text-sm font-medium text-neutral-950">Current Plan</p>
                <p className="text-2xl font-bold text-blue-600 mt-1">{user.plan}</p>
              </div>
              <Button
                variant="secondary"
                onClick={() => router.push('/billing')}
              >
                Manage Plan
              </Button>
            </div>
          </div>
        </div>

        {/* Notifications Section */}
        <div className="bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-blue-50 dark:bg-blue-950 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-neutral-950">Notifications</h2>
              <p className="text-sm text-neutral-600">Configure email notifications</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-neutral-200 dark:border-zinc-700">
              <div>
                <p className="text-sm font-medium text-neutral-950 dark:text-neutral-50">New Responses</p>
                <p className="text-xs text-neutral-600 dark:text-neutral-400">Get notified when someone completes a survey</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-neutral-300 dark:bg-zinc-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-600/20 rounded-full peer peer-checked:after:translate-x-[1.25rem] after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all after:shadow-sm peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between py-3 border-b border-neutral-200 dark:border-zinc-700">
              <div>
                <p className="text-sm font-medium text-neutral-950 dark:text-neutral-50">Usage Alerts</p>
                <p className="text-xs text-neutral-600 dark:text-neutral-400">Alert when reaching 80% of response limit</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-neutral-300 dark:bg-zinc-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-600/20 rounded-full peer peer-checked:after:translate-x-[1.25rem] after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all after:shadow-sm peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between py-3">
              <div>
                <p className="text-sm font-medium text-neutral-950 dark:text-neutral-50">Product Updates</p>
                <p className="text-xs text-neutral-600 dark:text-neutral-400">News about new features and improvements</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-neutral-300 dark:bg-zinc-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-600/20 rounded-full peer peer-checked:after:translate-x-[1.25rem] after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all after:shadow-sm peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Password Section */}
        <div className="bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-blue-50 dark:bg-blue-950 rounded-lg flex items-center justify-center">
              <Lock className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-neutral-950">Password</h2>
              <p className="text-sm text-neutral-600">Change your password</p>
            </div>
          </div>

          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Current Password
              </label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                New Password
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20"
                required
                minLength={8}
              />
              <p className="text-xs text-neutral-500 mt-1">
                At least 8 characters
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Confirm New Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20"
                required
                minLength={8}
              />
            </div>

            <div className="pt-4">
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Changing...' : 'Change Password'}
              </Button>
            </div>
          </form>
        </div>

        {/* Danger Zone */}
        <div className="bg-white dark:bg-zinc-900 border border-red-200 dark:border-red-800 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-red-50 dark:bg-red-950/30 rounded-lg flex items-center justify-center">
              <Trash2 className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-red-600">Danger Zone</h2>
              <p className="text-sm text-neutral-600">Permanently delete your account</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800 mb-2">
                <strong>Warning:</strong> This action cannot be undone. This will permanently delete your account, all surveys, responses, and data.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Type <strong>DELETE</strong> to confirm
              </label>
              <input
                type="text"
                value={deleteConfirm}
                onChange={(e) => setDeleteConfirm(e.target.value)}
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:border-red-600 focus:ring-2 focus:ring-red-600/20"
                placeholder="DELETE"
              />
            </div>

            <Button
              variant="default"
              className="bg-red-600 hover:bg-red-700"
              onClick={handleDeleteAccount}
              disabled={isLoading || deleteConfirm !== 'DELETE'}
            >
              {isLoading ? 'Deleting...' : 'Delete Account'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
