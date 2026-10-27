import React from 'react';
import { Sparkles, CheckCircle2, AlertCircle, Network, MessageSquare } from 'lucide-react';

interface NavbarProps {
  hasKey: boolean;
  currentView: 'chat' | 'graph';
  onSelectView: (view: 'chat' | 'graph') => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  hasKey,
  currentView,
  onSelectView,
}) => {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/[0.08] bg-[#050507]/80 backdrop-blur-xl transition-all">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 lg:px-8">
        {/* Brand - Just AETHER */}
        <button
          onClick={() => onSelectView('chat')}
          className="flex items-center space-x-2.5 group focus:outline-none"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-white/20 to-white/5 border border-white/20 shadow-inner group-hover:border-white/40 transition-colors">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <span className="text-base font-semibold tracking-[0.2em] text-white">
            AETHER
          </span>
        </button>

        {/* View Switcher Navigation */}
        <nav className="flex items-center space-x-1 sm:space-x-2 rounded-2xl bg-white/[0.04] border border-white/[0.08] p-1">
          <button
            onClick={() => onSelectView('chat')}
            className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all ${
              currentView === 'chat'
                ? 'bg-white text-black shadow-sm font-semibold'
                : 'text-white/60 hover:text-white'
            }`}
          >
            <MessageSquare className="h-3.5 w-3.5" />
            <span>Playground</span>
          </button>
          <button
            onClick={() => onSelectView('graph')}
            className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all ${
              currentView === 'graph'
                ? 'bg-white text-black shadow-sm font-semibold'
                : 'text-white/60 hover:text-white'
            }`}
          >
            <Network className="h-3.5 w-3.5" />
            <span>Knowledge Graph</span>
          </button>
        </nav>

        {/* Right status */}
        <div className="flex items-center space-x-3">
          <div
            className={`flex items-center space-x-2 text-xs font-medium px-3.5 py-1.5 rounded-full border transition-all ${
              hasKey
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300'
                : 'bg-amber-500/10 border-amber-500/20 text-amber-300'
            }`}
          >
            {hasKey ? (
              <>
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                <span className="font-mono text-[11px] hidden sm:inline">Groq Active</span>
              </>
            ) : (
              <>
                <AlertCircle className="h-3.5 w-3.5 text-amber-400" />
                <span className="font-mono text-[11px]">Add GROQ_API_KEY</span>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
