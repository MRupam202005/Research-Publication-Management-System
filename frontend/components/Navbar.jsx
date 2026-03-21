import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from 'next-themes';
import { Sun, Moon, LogOut } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { theme, setTheme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    const currentTheme = theme === 'system' ? systemTheme : theme;
    setTheme(currentTheme === 'dark' ? 'light' : 'dark');
  };

  return (
    <header className="flex items-center justify-between px-4 md:px-6 py-3 md:py-4 border-b border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur">
      <div className="flex items-center gap-3">
        <span className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-tr from-primary-500 to-primary-700 text-white text-lg font-semibold shadow-soft-lg">
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
          className="inline-flex items-center justify-center w-9 h-9 rounded-full border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/80 shadow-sm hover:shadow-md transition-shadow"
          aria-label="Toggle dark mode"
        >
          {mounted && (theme === 'dark' || (theme === 'system' && systemTheme === 'dark')) ? (
            <Sun className="w-5 h-5 text-amber-300" />
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
              className="inline-flex items-center px-3 py-1.5 text-xs md:text-sm font-medium text-white bg-primary-600 rounded-full shadow-soft-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 focus:ring-offset-slate-900/0"
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

