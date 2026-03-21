import Link from 'next/link';
import { useRouter } from 'next/router';
import { LayoutDashboard, BookOpen, Users, BarChart2, Globe, Briefcase, X } from 'lucide-react';
import { useMobileMenu } from '@/context/MobileMenuContext';

const navItems = [
  {
    href: '/dashboard',
    label: 'Dashboard',
    icon: <LayoutDashboard className="w-4 h-4" />
  },
  {
    href: '/publications',
    label: 'Publications',
    icon: <BookOpen className="w-4 h-4" />
  },
  {
    href: '/authors',
    label: 'Authors',
    icon: <Users className="w-4 h-4" />
  },
  {
    href: '/analytics',
    label: 'Analytics',
    icon: <BarChart2 className="w-4 h-4" />
  },
  {
    href: '/explore',
    label: 'Explore',
    icon: <Globe className="w-4 h-4" />
  },
  {
    href: '/funding',
    label: 'Funding',
    icon: <Briefcase className="w-4 h-4" />
  }
];

const Sidebar = () => {
  const router = useRouter();
  const { isOpen, close } = useMobileMenu();

  return (
    <>
      {/* Mobile Backdrop */}
      <div 
        className={`fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 md:hidden transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={close}
      />

      {/* Sidebar Content */}
      <aside 
        className={`fixed md:sticky top-0 left-0 z-50 h-[100dvh] w-64 md:w-60 lg:w-64 bg-slate-900/95 dark:bg-slate-950 text-slate-100 border-r border-slate-800/80 flex flex-col transform transition-transform duration-300 ease-in-out shadow-2xl md:shadow-none ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="px-4 py-4 md:py-5 border-b border-slate-800/80 flex items-center justify-between">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
            Navigation
          </p>
          <button 
            className="md:hidden p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            onClick={close}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      <nav className="flex-1 px-2 py-4 space-y-1">
        {navItems.map((item) => {
          const isActive = router.pathname === item.href;
          return (
              <Link
                key={item.href}
                href={item.href}
                className={`group flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 hover:scale-[1.02] ${
                  isActive
                    ? 'bg-primary-600 text-white shadow-soft-lg'
                    : 'text-slate-200/80 hover:bg-slate-800 hover:text-white'
                }`}
              >
              <span
                className={`inline-flex items-center justify-center rounded-md p-1.5 ${
                  isActive
                    ? 'bg-white/15 text-white'
                    : 'bg-slate-800 text-slate-300 group-hover:bg-slate-700 group-hover:text-white'
                }`}
              >
                {item.icon}
              </span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
      </aside>
    </>
  );
};

export default Sidebar;

