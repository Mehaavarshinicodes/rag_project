import React from 'react';
import { ArrowRight, Zap, Shield, Database, Sparkles } from 'lucide-react';

interface HeroProps {
  onScrollToPlayground: () => void;
  documentCount: number;
}

export const Hero: React.FC<HeroProps> = ({ onScrollToPlayground, documentCount }) => {
  return (
    <section id="overview" className="relative pt-24 pb-20 md:pt-36 md:pb-28 overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-gradient-to-b from-indigo-500/10 via-cyan-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />

      <div className="mx-auto max-w-7xl px-6 lg:px-8 relative z-10 text-center">
        {/* Editorial AETHER Title */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex items-center space-x-2 rounded-full border border-white/10 bg-white/[0.04] px-5 py-2 backdrop-blur-md shadow-inner">
            <span className="flex h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
            <span className="font-mono text-xs sm:text-sm font-semibold tracking-[0.35em] text-white uppercase">
              A E T H E R
            </span>
          </div>
        </div>

        {/* Headline */}
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-semibold tracking-tight text-white leading-[1.08]">
            Intelligence at the <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-white/90 to-white/50">
              speed of light.
            </span>
          </h1>
          <p className="mt-6 text-base sm:text-lg font-normal text-white/50 max-w-2xl mx-auto leading-relaxed">
            Instantaneous contextual intelligence with zero hallucinations.
            Transform dense PDFs into clear, verified, conversational insights.
          </p>

          {/* Single clean CTA */}
          <div className="mt-9 flex items-center justify-center">
            <button
              onClick={onScrollToPlayground}
              className="inline-flex items-center justify-center space-x-2 rounded-full bg-white px-8 py-3.5 text-sm font-semibold text-black transition-all hover:bg-white/90 hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-white/10"
            >
              <span>Launch Playground</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Metric Floating Bar */}
        <div className="mt-16 max-w-4xl mx-auto">
          <div className="rounded-3xl border border-white/[0.08] bg-gradient-to-b from-white/[0.04] to-transparent p-6 sm:p-8 backdrop-blur-2xl">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center divide-y md:divide-y-0 md:divide-x divide-white/[0.06]">
              <div className="pt-4 md:pt-0">
                <div className="flex items-center justify-center gap-1.5 text-cyan-400 mb-1">
                  <Zap className="h-4 w-4" />
                  <span className="text-[11px] font-mono uppercase tracking-wider text-white/50">Throughput</span>
                </div>
                <div className="text-2xl sm:text-3xl font-semibold tracking-tight text-white font-mono">
                  500+ <span className="text-sm font-normal text-white/40">T/s</span>
                </div>
                <div className="text-[11px] text-white/40 mt-1">High-Speed Inference</div>
              </div>

              <div className="pt-4 md:pt-0">
                <div className="flex items-center justify-center gap-1.5 text-emerald-400 mb-1">
                  <Shield className="h-4 w-4" />
                  <span className="text-[11px] font-mono uppercase tracking-wider text-white/50">Accuracy</span>
                </div>
                <div className="text-2xl sm:text-3xl font-semibold tracking-tight text-white font-mono">
                  100%
                </div>
                <div className="text-[11px] text-white/40 mt-1">Strict Context Bounds</div>
              </div>

              <div className="pt-4 md:pt-0">
                <div className="flex items-center justify-center gap-1.5 text-indigo-400 mb-1">
                  <Database className="h-4 w-4" />
                  <span className="text-[11px] font-mono uppercase tracking-wider text-white/50">Indexed</span>
                </div>
                <div className="text-2xl sm:text-3xl font-semibold tracking-tight text-white font-mono">
                  {documentCount} <span className="text-sm font-normal text-white/40">Docs</span>
                </div>
                <div className="text-[11px] text-white/40 mt-1">ChromaDB Store</div>
              </div>

              <div className="pt-4 md:pt-0">
                <div className="flex items-center justify-center gap-1.5 text-amber-400 mb-1">
                  <Sparkles className="h-4 w-4" />
                  <span className="text-[11px] font-mono uppercase tracking-wider text-white/50">Memory</span>
                </div>
                <div className="text-2xl sm:text-3xl font-semibold tracking-tight text-white font-mono">
                  Adaptive
                </div>
                <div className="text-[11px] text-white/40 mt-1">Context Reformulation</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
