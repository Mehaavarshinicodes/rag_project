import React from 'react';
import { UploadCloud, Scissors, Hash, Server, Sparkles, MessageSquareText } from 'lucide-react';

export const Architecture: React.FC = () => {
  const steps = [
    {
      icon: UploadCloud,
      title: '1. Ingestion',
      desc: 'PDF documents loaded via PyPDFLoader with metadata extraction.',
    },
    {
      icon: Scissors,
      title: '2. Chunking',
      desc: 'Recursive character text splitting with 500-char chunks and 100-char overlap.',
    },
    {
      icon: Hash,
      title: '3. Vector Index',
      desc: 'Dense embeddings persisted into ChromaDB with HNSW index.',
    },
    {
      icon: Sparkles,
      title: '4. Memory Rewriting',
      desc: 'LangChain prompt pipeline transforms follow-up questions into standalone queries.',
    },
    {
      icon: Server,
      title: '5. Groq LPU Synthesis',
      desc: 'LLaMA 3.3 70B synthesizes grounded answer at 500+ tokens/sec.',
    },
    {
      icon: MessageSquareText,
      title: '6. Grounded Output',
      desc: 'Instant streaming to React frontend with full chunk attribution.',
    },
  ];

  return (
    <section id="architecture" className="py-24 md:py-32 relative border-t border-white/[0.06]">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-mono tracking-widest text-white/40 uppercase">
            End-To-End Pipeline
          </span>
          <h2 className="text-3xl sm:text-5xl font-semibold tracking-tight text-white mt-2">
            Engineered from silicon to pixel.
          </h2>
          <p className="text-sm text-white/50 mt-3">
            How documents travel through our high-performance retrieval and generation loop.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div
                key={idx}
                className="rounded-3xl border border-white/[0.08] bg-white/[0.02] p-7 backdrop-blur-xl relative overflow-hidden group hover:border-white/20 transition-all"
              >
                <div className="flex items-center space-x-3 mb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/[0.05] border border-white/10 group-hover:border-cyan-500/40 transition-colors">
                    <Icon className="h-5 w-5 text-cyan-400" />
                  </div>
                  <h4 className="text-sm font-semibold text-white tracking-tight">{step.title}</h4>
                </div>
                <p className="text-xs text-white/50 leading-relaxed font-normal">{step.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
