import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Network, Database, LineChart, ChevronRight, Users, BookOpen, Globe, Github, Twitter, Linkedin } from 'lucide-react';

const FEATURES = [
  {
    icon: Database,
    title: "Discover Scientific Knowledge",
    description: "Access millions of publications, datasets, and explore cutting-edge research from around the globe.",
  },
  {
    icon: Network,
    title: "Connect with Experts",
    description: "Build your professional network, find collaborators, and map out inter-departmental synergies.",
  },
  {
    icon: LineChart,
    title: "Measure Your Impact",
    description: "Track citations, author h-index metrics, and visualize your evolving research footprint over time.",
  }
];

const SCROLL_FEATURES = [
  {
    icon: Users,
    title: "Global Collaboration",
    description: "Find researchers with complementary skills. Our bipartite graph network intelligently maps authors to specific research fields to recommend your next project partner.",
    color: "from-blue-500 to-indigo-500"
  },
  {
    icon: BookOpen,
    title: "Seamless Dataset Imports",
    description: "Instantly upload CSVs of citation networks. Administrators and Departments can effortlessly bulk-import thousands of records to keep the institutional database current.",
    color: "from-emerald-400 to-teal-500"
  },
  {
    icon: LineChart,
    title: "Deep Institutional Analytics",
    description: "Department heads gain unprecedented visibility into cross-departmental collaboration, publication output, and citation velocity with beautiful, real-time dashboards.",
    color: "from-fuchsia-500 to-purple-600"
  }
];

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  // Carousel State
  const [currentFeature, setCurrentFeature] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % FEATURES.length);
    }, 4000); 
    return () => clearInterval(timer);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await login(email, password);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to login');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950 overflow-x-hidden">
      
      {/* 1. HERO & LOGIN SECTION (100vh) */}
      <section className="relative flex flex-col lg:flex-row w-full min-h-screen shrink-0 overflow-hidden">
        {/* Full Screen Background Image */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&q=80&w=2000" 
            alt="Research Library" 
            className="w-full h-full object-cover transform scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-tr from-slate-950/95 via-slate-900/80 to-indigo-900/60 mix-blend-multiply" />
          <div className="absolute inset-0 bg-indigo-600/20 mix-blend-overlay" />
        </div>

        {/* Left Panel - Animations */}
        <div className="hidden lg:flex lg:w-1/2 relative z-10">

          <div className="relative z-10 flex flex-col justify-between w-full p-12 lg:p-16 text-white">
            <div>
              <Link href="/" className="inline-flex items-center gap-2 group">
                <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg group-hover:bg-indigo-500 transition-colors">
                  <Network className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-bold tracking-tight">ResearchNexus</span>
              </Link>
            </div>

            <div className="mb-20">
              <div className="relative h-48">
                {FEATURES.map((feat, idx) => {
                  const Icon = feat.icon;
                  const isActive = currentFeature === idx;
                  return (
                    <div 
                      key={idx}
                      className={`absolute inset-0 transition-all duration-1000 ease-in-out ${isActive ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-8 pointer-events-none'}`}
                    >
                      <Icon className="w-12 h-12 text-indigo-400 mb-6" />
                      <h1 className="text-4xl lg:text-5xl font-bold tracking-tight mb-4 leading-tight">
                        {feat.title}
                      </h1>
                      <p className="text-lg text-slate-300 max-w-md font-medium leading-relaxed">
                        {feat.description}
                      </p>
                    </div>
                  );
                })}
              </div>
              
              <div className="flex items-center gap-3 mt-8">
                {FEATURES.map((_, idx) => (
                  <button 
                    key={idx}
                    onClick={() => setCurrentFeature(idx)}
                    className={`h-1.5 rounded-full transition-all duration-500 ${currentFeature === idx ? 'w-8 bg-indigo-500' : 'w-2 bg-white/30 hover:bg-white/50'}`}
                    aria-label={`Go to slide ${idx + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Glassmorphic Login Form */}
        <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-6 sm:p-12 relative z-10">
          
          {/* Mobile Header */}
          <div className="lg:hidden flex items-center gap-2 mb-8 self-center">
            <div className="w-10 h-10 bg-indigo-600/80 backdrop-blur-md rounded-xl flex items-center justify-center shadow-lg border border-indigo-400/30">
              <Network className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-white drop-shadow-md">ResearchNexus</span>
          </div>

          <div className="w-full max-w-md bg-white/10 dark:bg-slate-950/30 backdrop-blur-xl border border-white/20 dark:border-white/10 p-8 sm:p-10 rounded-[2rem] shadow-2xl">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold text-white tracking-tight mb-3 drop-shadow-md">
                Welcome back
              </h2>
              <p className="text-indigo-100/80 dark:text-slate-300">
                Sign in to your account to manage your research publications and view analytics.
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 rounded-xl text-sm text-red-100 bg-red-600/40 backdrop-blur-md border border-red-400/30 flex items-start gap-3">
                <svg className="w-5 h-5 shrink-0 mt-0.5 text-red-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-semibold text-white/90">
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  className="w-full px-4 py-3 rounded-xl border border-white/20 bg-white/10 text-white focus:border-indigo-400 focus:bg-white/20 focus:ring-2 focus:ring-indigo-400/50 outline-none transition-all placeholder:text-white/40 shadow-inner"
                  placeholder="you@university.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label htmlFor="password" className="block text-sm font-semibold text-white/90">
                    Password
                  </label>
                  <a href="#" className="text-xs font-semibold text-indigo-300 hover:text-indigo-200 transition-colors">
                    Forgot password?
                  </a>
                </div>
                <input
                  id="password"
                  type="password"
                  className="w-full px-4 py-3 rounded-xl border border-white/20 bg-white/10 text-white focus:border-indigo-400 focus:bg-white/20 focus:ring-2 focus:ring-indigo-400/50 outline-none transition-all placeholder:text-white/40 shadow-inner"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full relative flex justify-center items-center py-3.5 px-4 border border-transparent text-sm font-bold rounded-xl text-indigo-900 bg-white hover:bg-indigo-50 hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent focus:ring-white disabled:opacity-70 disabled:cursor-not-allowed transition-all shadow-[0_0_20px_rgba(255,255,255,0.3)] duration-300"
              >
                {submitting ? (
                   <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                     <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                     <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                   </svg>
                ) : (
                  <>
                    Sign in
                    <ChevronRight className="w-4 h-4 ml-2 absolute right-4 opacity-50" />
                  </>
                )}
              </button>
            </form>

            <p className="mt-8 text-center text-sm text-indigo-100/70">
              Don't have an account?{' '}
              <Link href="/register" className="font-bold text-white hover:text-indigo-200 hover:underline transition-all">
                Create one now
              </Link>
            </p>
          </div>
          
          {/* Scroll Indicator */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center text-white/50 animate-bounce cursor-pointer hover:text-white transition-colors">
             <span className="text-[10px] uppercase font-bold tracking-widest mb-2">Scroll</span>
             <ChevronRight className="w-4 h-4 rotate-90 opacity-70" />
          </div>
        </div>
      </section>

      {/* 2. PLATFORM CAPABILITIES SECTION */}
      <section className="py-24 px-6 relative bg-white dark:bg-slate-950 border-t border-slate-100 dark:border-slate-900">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-blue-600 dark:text-blue-400 font-bold tracking-wide text-sm uppercase mb-3">
              Platform Features
            </h2>
            <h3 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white mb-4">
              Designed for modern research
            </h3>
            <p className="text-lg text-slate-600 dark:text-slate-400">
              Everything you need to manage publications, uncover collaboration insights, and track research impact across your institution.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {SCROLL_FEATURES.map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <div key={idx} className="bg-slate-50 dark:bg-slate-900/50 rounded-2xl p-8 border border-slate-100 dark:border-slate-800 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group">
                  <div className={`w-14 h-14 rounded-xl flex items-center justify-center bg-gradient-to-br ${feature.color} shadow-lg mb-6 group-hover:scale-110 transition-transform`}>
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
                    {feature.title}
                  </h4>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 3. CTA NUMBERS SECTION */}
      <section className="py-20 relative overflow-hidden bg-indigo-600 dark:bg-indigo-900">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1557683316-973673baf926?auto=format&fit=crop&q=80&w=2000')] bg-cover bg-center mix-blend-overlay opacity-20" />
        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
          <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-12">
            Accelerating Scientific Discovery
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 divide-x divide-indigo-400/30">
            {[
              { label: 'Publications', val: '15M+' },
              { label: 'Researchers', val: '2M+' },
              { label: 'Institutions', val: '5,000+' },
              { label: 'Citations Tracked', val: '120M+' },
            ].map((stat, i) => (
              <div key={i} className="flex flex-col items-center">
                <span className="text-4xl md:text-5xl font-black text-white mb-2">{stat.val}</span>
                <span className="text-indigo-200 font-medium">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. FOOTER */}
      <footer className="bg-slate-950 text-slate-400 py-12 border-t border-slate-900 mt-auto">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="inline-flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                <Network className="w-4 h-4 text-white" />
              </div>
              <span className="text-xl font-bold tracking-tight text-white">ResearchNexus</span>
            </Link>
            <p className="text-slate-500 max-w-sm mb-6 leading-relaxed">
              Empowering global research communication, data discovery, and institutional analytics through cutting-edge bipartite network mapping.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center hover:bg-indigo-600 hover:text-white transition-all">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center hover:bg-indigo-600 hover:text-white transition-all">
                <Github className="w-4 h-4" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center hover:bg-indigo-600 hover:text-white transition-all">
                <Linkedin className="w-4 h-4" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center hover:bg-indigo-600 hover:text-white transition-all">
                <Globe className="w-4 h-4" />
              </a>
            </div>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4 uppercase tracking-wider text-sm">Product</h4>
            <ul className="space-y-3">
              <li><a href="#" className="hover:text-indigo-400 transition-colors">Features</a></li>
              <li><a href="#" className="hover:text-indigo-400 transition-colors">Integrations</a></li>
              <li><a href="#" className="hover:text-indigo-400 transition-colors">Enterprise</a></li>
              <li><a href="#" className="hover:text-indigo-400 transition-colors">Pricing</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4 uppercase tracking-wider text-sm">Resources</h4>
            <ul className="space-y-3">
              <li><a href="#" className="hover:text-indigo-400 transition-colors">Documentation</a></li>
              <li><a href="#" className="hover:text-indigo-400 transition-colors">API Reference</a></li>
              <li><a href="#" className="hover:text-indigo-400 transition-colors">Blog</a></li>
              <li><a href="#" className="hover:text-indigo-400 transition-colors">Support</a></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 pt-8 border-t border-slate-900 flex flex-col md:flex-row items-center justify-between text-sm">
          <p>© {new Date().getFullYear()} ResearchNexus Inc. All rights reserved.</p>
          <div className="flex gap-6 mt-4 md:mt-0">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-white transition-colors">Cookies</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
