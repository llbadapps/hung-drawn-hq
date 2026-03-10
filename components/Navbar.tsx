'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { logOut } from '@/lib/firebase/auth';
import { useRouter, usePathname } from 'next/navigation';
import Logo from './Logo';

export default function Navbar() {
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = async () => {
    await logOut();
    router.push('/login');
  };

  if (!user) return null;

  const navLinks = [
    { href: '/', label: 'Timeline' },
    { href: '/clients', label: 'Clients' },
    { href: '/jobs', label: 'Jobs' },
  ];

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-sm border-b-2 border-gray-100 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo + Nav Links */}
          <div className="flex items-center space-x-8">
            <Link href="/" className="flex-shrink-0">
              <Logo />
            </Link>
            <div className="flex space-x-6">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`inline-flex items-center px-1 pt-1 text-sm font-semibold transition-colors relative ${
                      isActive
                        ? 'text-gray-900 dark:text-white'
                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                    }`}
                  >
                    {link.label}
                    {isActive && (
                      <span className="absolute bottom-0 left-0 right-0 h-0.5" style={{ backgroundColor: '#96c5b0' }}></span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* User Actions */}
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600 dark:text-gray-400">{user.email}</span>
            <button
              onClick={handleLogout}
              className="text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              Sign out
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
