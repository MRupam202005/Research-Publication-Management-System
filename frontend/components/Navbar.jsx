import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from 'next-themes';
import { Sun, Moon, LogOut, Menu } from 'lucide-react';
import { useMobileMenu } from '@/context/MobileMenuContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { theme, setTheme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const { toggle } = useMobileMenu();

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    const currentTheme = theme === 'system' ? systemTheme : theme;
    setTheme(currentTheme === 'dark' ? 'light' : 'dark');
  };

  return (
    <header className="flex items-center justify-between px-4 md:px-6 py-3 md:py-4 border-b border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <button
          onClick={toggle}
          className="md:hidden p-2 -ml-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          aria-label="Toggle Menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <span className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-tr from-primary-500 to-primary-700 text-white text-lg font-semibold shadow-soft-lg transition-transform hover:scale-105 hover:rotate-3 duration-300">
          R
        </span>
        <div>
          <h1 className="text-sm md:text-base font-semibold text-slate-900 dark:text-slate-50 tracking-tight">
            Research Publication Management System
          </h1>
          <p className="text-[11px] md:text-xs text-slate-500 dark:text-slate-400">
            Track publications, citations, and collaborations
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3 md:gap-4">
        <button
          type="button"
          onClick={toggleTheme}
          className="inline-flex items-center justify-center w-9 h-9 rounded-full border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/80 shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105"
          aria-label="Toggle dark mode"
        >
          {mounted && (theme === 'dark' || (theme === 'system' && systemTheme === 'dark')) ? (
            <Sun className="w-5 h-5 text-amber-300 transition-transform hover:rotate-90 duration-300" />
          ) : (
            <Moon className="w-5 h-5 text-slate-700 dark:text-slate-200" />
          )}
        </button>
        {user && (
          <>
            <div className="hidden sm:block text-right">
              <p className="text-sm font-medium text-slate-900 dark:text-slate-50">
                {user.name}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {user.role}
              </p>
            </div>
            <button
              type="button"
              onClick={logout}
              className="inline-flex items-center px-3 py-1.5 md:py-2 md:px-4 text-xs md:text-sm font-medium text-white bg-primary-600 rounded-full shadow-soft-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 focus:ring-offset-slate-900/0 transition-all duration-300 hover:-translate-y-0.5"
            >
              <span className="hidden sm:inline-block mr-1.5">Logout</span>
              <LogOut className="w-4 h-4 ml-1.5" />
            </button>
          </>
        )}
      </div>
    </header>
  );
};

export default Navbar;

