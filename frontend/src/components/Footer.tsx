import React from 'react';
import { Sparkles } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-white/[0.08] bg-[#050507] py-12 text-xs text-white/40">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center space-x-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/10 text-white">
              <Sparkles className="h-3.5 w-3.5" />
            </div>
            <span className="font-semibold text-white tracking-[0.2em] text-sm">
              AETHER
            </span>
          </div>

          <div className="flex space-x-6 text-[11px] text-white/40">
            <a href="#overview" className="hover:text-white transition-colors">Overview</a>
            <a href="#playground" className="hover:text-white transition-colors">Playground</a>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-white/[0.04] text-center sm:text-left text-[11px] text-white/30">
          <p>© AETHER. Designed with minimal, Apple-grade aesthetic precision.</p>
        </div>
      </div>
    </footer>
  );
};
