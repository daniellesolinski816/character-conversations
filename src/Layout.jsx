import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { BookOpen, Users, Home, MessageSquare, Brain, Settings, Sparkles, Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Layout({ children, currentPageName }) {
  const isReaderPage = currentPageName === 'Reader';
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { name: 'Home',           icon: Home,          page: 'Home' },
    { name: 'Community',      icon: Users,          page: 'Community' },
    { name: 'Clubs',          icon: BookOpen,       page: 'BookClubs' },
    { name: 'Cross-Book',     icon: MessageSquare,  page: 'CrossBookDialogue' },
    { name: 'My Characters',  icon: Sparkles,       page: 'CrossCharacterDialogue' },
    { name: 'The Science',    icon: Brain,          page: 'EmpathyScience' },
    { name: 'Settings',       icon: Settings,       page: 'Settings' },
  ];

  if (isReaderPage) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Desktop + Tablet Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">

            {/* Logo */}
            <Link
              to={createPageUrl('Home')}
              className="flex items-center gap-2 shrink-0"
              onClick={() => setMobileMenuOpen(false)}
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-sm">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <div className="flex flex-col leading-none">
                <span className="font-serif font-semibold text-slate-900 text-base">Character Conversations</span>
                <span className="text-[10px] text-amber-600 font-medium tracking-wide uppercase">by Empathy Enigma</span>
              </div>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden lg:flex items-center gap-0.5">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentPageName === item.page;
                return (
                  <Link
                    key={item.page}
                    to={createPageUrl(item.page)}
                    className={cn(
                      'flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap',
                      isActive
                        ? 'bg-amber-100 text-amber-700'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    {item.name}
                  </Link>
                );
              })}
            </div>

            {/* Mobile hamburger */}
            <button
              className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
              onClick={() => setMobileMenuOpen(prev => !prev)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile dropdown menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-100 bg-white/95 backdrop-blur-lg">
            <div className="max-w-7xl mx-auto px-4 py-3 grid grid-cols-2 gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentPageName === item.page;
                return (
                  <Link
                    key={item.page}
                    to={createPageUrl(item.page)}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      'flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-amber-100 text-amber-700'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    )}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </nav>

      {/* Bottom tab bar for small mobile */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-lg border-t border-slate-100 safe-area-inset-bottom">
        <div className="grid grid-cols-5 h-16">
          {navItems.slice(0, 5).map((item) => {
            const Icon = item.icon;
            const isActive = currentPageName === item.page;
            return (
              <Link
                key={item.page}
                to={createPageUrl(item.page)}
                className={cn(
                  'flex flex-col items-center justify-center gap-1 text-[10px] font-medium transition-colors',
                  isActive ? 'text-amber-600' : 'text-slate-400 hover:text-slate-700'
                )}
              >
                <Icon className={cn('w-5 h-5', isActive && 'scale-110 transition-transform')} />
                <span className="leading-none">{item.name}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Main Content — bottom padding on mobile so content clears the tab bar */}
      <main className="pb-16 sm:pb-0">{children}</main>
    </div>
  );
}