import React from 'react';
import { Github, Twitter, Linkedin, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="w-full mt-auto bg-white/30 dark:bg-slate-900/40 backdrop-blur-md border-t border-slate-200 dark:border-slate-800/80 py-8 px-6 transition-colors duration-300">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex flex-col items-center md:items-start">
          <h3 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-600">
            Nexus Research
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 font-medium">
            Empowering academic discovery through beautiful design.
          </p>
        </div>

        <div className="flex items-center gap-5 text-slate-400 dark:text-slate-500">
          <a href="#" className="hover:text-slate-900 dark:hover:text-white transition-colors hover:-translate-y-1 transform"><Github className="w-5 h-5" /></a>
          <a href="#" className="hover:text-sky-500 transition-colors hover:-translate-y-1 transform"><Twitter className="w-5 h-5" /></a>
          <a href="#" className="hover:text-blue-600 transition-colors hover:-translate-y-1 transform"><Linkedin className="w-5 h-5" /></a>
        </div>
      </div>
      
      <div className="mt-8 pt-6 border-t border-slate-200/50 dark:border-slate-800/50 flex flex-col items-center justify-center text-xs text-slate-500 dark:text-slate-400">
        <p className="flex items-center gap-1.5 font-medium tracking-wide">
          Made with <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 animate-pulse" /> by <i className="text-indigo-500 font-bold font-style: italic">Rupam</i>
        </p>
        <p className="mt-2 font-medium text-[10px] uppercase tracking-widest text-slate-400/80 dark:text-slate-500/80">
          © {new Date().getFullYear()} All rights reserved.
        </p>
      </div>
    </footer>
  );
}
