import React from 'react';
import { Zap, ShieldCheck, RefreshCw } from 'lucide-react';

export const Features: React.FC = () => {
  return (
    <section id="performance" className="py-24 md:py-36 relative border-t border-white/[0.06] overflow-hidden">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Editorial Section Header */}
        <div className="max-w-3xl mb-20">
          <span className="text-xs font-mono uppercase tracking-widest text-cyan-400">
            Engineered for Precision & Velocity
          </span>
          <h2 className="text-3xl sm:text-5xl font-semibold tracking-tight text-white mt-3 leading-tight">
            The architecture of instant clarity.
          </h2>
          <p className="text-base text-white/50 mt-4 leading-relaxed">
            Eliminating retrieval lag and model hallucinations with bespoke LPU compilation and strict context boundaries.
          </p>
        </div>

        {/* Feature 1: Groq LPU Speed vs GPU */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-28">
          <div className="space-y-6">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-xs font-mono text-cyan-300">
              <Zap className="h-3.5 w-3.5" />
              <span>Language Processing Units (LPUs)</span>
            </div>
            <h3 className="text-2xl sm:text-4xl font-semibold text-white tracking-tight">
              Inference at 500+ tokens per second.
            </h3>
            <p className="text-sm sm:text-base text-white/60 leading-relaxed">
              Traditional GPUs suffer from memory bandwidth bottlenecks and dynamic batching jitter.
              Groq&apos;s Tensor Streaming Processor architecture compiles matrix multiplications directly onto deterministic silicon, delivering immediate time-to-first-token.
            </p>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/[0.08]">
              <div>
                <div className="text-2xl font-mono font-semibold text-white">0.12s</div>
                <div className="text-xs text-white/40 mt-0.5">Average TTFT Latency</div>
              </div>
              <div>
                <div className="text-2xl font-mono font-semibold text-cyan-400">10x Faster</div>
                <div className="text-xs text-white/40 mt-0.5">Than Traditional GPU Clouds</div>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-white/[0.08] bg-gradient-to-b from-white/[0.04] to-white/[0.01] p-6 sm:p-8 backdrop-blur-xl relative">
            <div className="flex items-center justify-between pb-4 border-b border-white/[0.08] text-xs text-white/60 font-mono">
              <span>Benchmark Throughput</span>
              <span className="text-emerald-400">Deterministic Execution</span>
            </div>
            <div className="mt-6 space-y-5">
              <div>
                <div className="flex justify-between text-xs mb-1.5 font-mono">
                  <span className="text-white font-medium">Groq LPU (LLaMA 3.3 70B)</span>
                  <span className="text-cyan-400 font-semibold">520 tok/sec</span>
                </div>
                <div className="h-2.5 w-full bg-white/[0.05] rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-cyan-500 to-indigo-500 w-[95%] rounded-full" />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1.5 font-mono">
                  <span className="text-white/50">Standard Cloud GPU (A100)</span>
                  <span className="text-white/40">45 tok/sec</span>
                </div>
                <div className="h-2.5 w-full bg-white/[0.05] rounded-full overflow-hidden">
                  <div className="h-full bg-white/20 w-[18%] rounded-full" />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1.5 font-mono">
                  <span className="text-white/50">Local CPU Ollama</span>
                  <span className="text-white/40">12 tok/sec</span>
                </div>
                <div className="h-2.5 w-full bg-white/[0.05] rounded-full overflow-hidden">
                  <div className="h-full bg-white/10 w-[7%] rounded-full" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Feature 2: Strict Truthful Grounding & Standalone Memory */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="rounded-3xl border border-white/[0.08] bg-white/[0.02] p-8 backdrop-blur-xl hover:border-white/20 transition-all group">
            <div className="h-10 w-10 rounded-2xl bg-white/[0.05] border border-white/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <ShieldCheck className="h-5 w-5 text-emerald-400" />
            </div>
            <h4 className="text-xl font-semibold text-white tracking-tight">
              Strict Truthful Grounding
            </h4>
            <p className="text-sm text-white/50 mt-3 leading-relaxed">
              If an answer is absent from the indexed context, the model explicitly responds with &ldquo;I don&apos;t know&rdquo; rather than fabricating facts. Absolute reliability for academic, technical, and compliance documentation.
            </p>
          </div>

          <div className="rounded-3xl border border-white/[0.08] bg-white/[0.02] p-8 backdrop-blur-xl hover:border-white/20 transition-all group">
            <div className="h-10 w-10 rounded-2xl bg-white/[0.05] border border-white/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <RefreshCw className="h-5 w-5 text-indigo-400" />
            </div>
            <h4 className="text-xl font-semibold text-white tracking-tight">
              Autonomous Query Reformulation
            </h4>
            <p className="text-sm text-white/50 mt-3 leading-relaxed">
              Multi-turn dialogues naturally involve pronouns like &ldquo;tell me more about it&rdquo;. Our prompt pipeline automatically rewrites conversational queries into standalone semantic queries before querying ChromaDB.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
