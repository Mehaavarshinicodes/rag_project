import React, { useState, useRef, useEffect } from 'react';
import {
  Upload,
  Send,
  FileText,
  Sparkles,
  ChevronDown,
  RotateCcw,
  BookOpen,
  Copy,
  Check,
  Cpu,
  Layers,
  ArrowUpRight,
  Loader2,
  Info
} from 'lucide-react';

interface ChatMessage {
  id: string;
  role: 'Human' | 'AI';
  content: string;
  rewritten?: string;
  sources?: Array<{ content: string; metadata: Record<string, unknown> }>;
  timestamp: string;
}

interface PlaygroundProps {
  documents: string[];
  activeDoc: string | null;
  onSelectDoc: (doc: string) => void;
  onUploadSuccess: (docName: string) => void;
  selectedModel: string;
  availableModels: string[];
  onSelectModel: (model: string) => void;
  hasKey: boolean;
  injectedPrompt?: string | null;
  onClearInjectedPrompt?: () => void;
}

const formatModelLabel = (modelId: string) => {
  if (modelId.includes('120b')) return 'GPT-OSS 120B';
  if (modelId.includes('20b')) return 'GPT-OSS 20B';
  if (modelId.includes('qwen')) return 'Qwen 27B';
  return modelId.split('/').pop() || modelId;
};

// Strips out unwanted markdown asterisks and leading dash bullets
const cleanTextOutput = (text: string): string => {
  if (!text) return '';
  // Remove asterisks
  let cleaned = text.replace(/\*{1,3}/g, '');
  // Remove leading dashes / bullets
  cleaned = cleaned.replace(/^\s*[-•–—]\s+/gm, '');
  return cleaned;
};

export const Playground: React.FC<PlaygroundProps> = ({
  documents,
  activeDoc,
  onSelectDoc,
  onUploadSuccess,
  selectedModel,
  availableModels,
  onSelectModel,
  hasKey,
  injectedPrompt,
  onClearInjectedPrompt,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeSourcesModal, setActiveSourcesModal] = useState<Array<{ content: string; metadata: Record<string, unknown> }> | null>(null);

  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(cleanTextOutput(text));
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.pdf')) {
      alert('Please upload a PDF document.');
      return;
    }

    setIsUploading(true);
    setUploadMessage('Extracting pages & computing Chroma embeddings...');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || 'Upload failed');
      }

      const data = await res.json();
      setUploadMessage(`Indexed ${data.page_count} pages (${data.chunk_count} chunks) into Chroma vector store.`);
      onUploadSuccess(data.document_name);
      setTimeout(() => setUploadMessage(null), 4000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Upload failed';
      alert(`Error uploading document: ${msg}`);
      setUploadMessage(null);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSend = async (queryText?: string) => {
    const textToSend = queryText || input;
    if (!textToSend.trim() || isLoading) return;

    if (!hasKey) {
      alert('Please ensure GROQ_API_KEY is set in your .env file.');
      return;
    }

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'Human',
      content: textToSend.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!queryText) setInput('');
    setIsLoading(true);

    try {
      const historyPayload = messages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await fetch('/api/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: userMsg.content,
          document_name: activeDoc,
          chat_history: historyPayload,
          model: selectedModel,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || 'Query failed');
      }

      const data = await res.json();

      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'AI',
        content: cleanTextOutput(data.answer),
        rewritten: data.rewritten_question !== userMsg.content ? data.rewritten_question : undefined,
        sources: data.sources,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Query failed';
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'AI',
        content: `Error: ${msg}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  useEffect(() => {
    if (injectedPrompt) {
      handleSend(injectedPrompt);
      if (onClearInjectedPrompt) {
        onClearInjectedPrompt();
      }
    }
  }, [injectedPrompt]);

  const clearChat = () => {
    setMessages([]);
  };

  const displayModels = availableModels.length > 0
    ? availableModels
    : ['openai/gpt-oss-120b', 'openai/gpt-oss-20b', 'qwen/qwen3.8-27b'];

  return (
    <section id="playground" className="py-12 md:py-16 relative">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-8">
          <span className="text-xs font-mono tracking-widest text-white/40 uppercase">
            Workspace
          </span>
          <h2 className="text-2xl sm:text-4xl font-semibold tracking-tight text-white mt-2">
            The RAG Playground
          </h2>
          <p className="text-sm text-white/50 mt-2">
            Query your indexed documents with instantaneous Groq inference.
          </p>
        </div>

        {/* Workspace Card with Fixed Height & Stationary Bottom Search Bar */}
        <div className="rounded-3xl border border-white/[0.08] bg-[#0c0c10]/90 backdrop-blur-2xl shadow-2xl overflow-hidden flex flex-col h-[750px] relative">
          {/* Top Control Bar */}
          <div className="border-b border-white/[0.08] bg-white/[0.02] px-6 py-3.5 flex flex-wrap items-center justify-between gap-4 shrink-0">
            {/* Left: Document Selector & Upload */}
            <div className="flex items-center space-x-3">
              <div className="relative inline-flex items-center">
                <FileText className="absolute left-3 h-3.5 w-3.5 text-cyan-400 pointer-events-none" />
                <select
                  value={activeDoc || ''}
                  onChange={(e) => onSelectDoc(e.target.value)}
                  className="rounded-xl bg-white/[0.07] border border-white/[0.12] pl-8 pr-8 py-1.5 text-xs text-white appearance-none focus:outline-none focus:border-white/30 cursor-pointer font-medium"
                >
                  {documents.length === 0 ? (
                    <option value="" disabled className="bg-[#121216] text-white">
                      No documents indexed yet
                    </option>
                  ) : (
                    documents.map((doc) => (
                      <option key={doc} value={doc} className="bg-[#121216] text-white">
                        {doc}
                      </option>
                    ))
                  )}
                </select>
                <ChevronDown className="absolute right-2.5 h-3.5 w-3.5 text-white/40 pointer-events-none" />
              </div>

              {/* Upload CTA */}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept="application/pdf"
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.1] text-xs font-medium text-white transition-colors disabled:opacity-50"
              >
                {isUploading ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-cyan-400" />
                ) : (
                  <Upload className="h-3.5 w-3.5 text-white/70" />
                )}
                <span>{isUploading ? 'Indexing...' : 'Upload PDF'}</span>
              </button>
            </div>

            {/* Right: Model Selector & Reset */}
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-1 bg-white/[0.03] border border-white/[0.08] rounded-xl p-1">
                {displayModels.map((mId) => (
                  <button
                    key={mId}
                    onClick={() => onSelectModel(mId)}
                    className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                      selectedModel === mId
                        ? 'bg-white text-black shadow-sm font-semibold'
                        : 'text-white/60 hover:text-white'
                    }`}
                  >
                    {formatModelLabel(mId)}
                  </button>
                ))}
              </div>

              {/* Clear chat */}
              <button
                onClick={clearChat}
                title="Clear conversation"
                className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/[0.06] transition-colors"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Upload Status Banner */}
          {uploadMessage && (
            <div className="bg-cyan-500/10 border-b border-cyan-500/20 px-6 py-2 text-xs font-medium text-cyan-300 flex items-center gap-2 shrink-0">
              <Sparkles className="h-3.5 w-3.5 shrink-0" />
              <span>{uploadMessage}</span>
            </div>
          )}

          {/* Chat Canvas: Strictly bounded height with internal scrolling */}
          <div
            ref={messagesContainerRef}
            className="flex-1 min-h-0 overflow-y-auto p-6 space-y-6"
          >
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center max-w-md mx-auto py-12">
                <div className="h-12 w-12 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-center mb-4 text-white/80">
                  <BookOpen className="h-6 w-6 text-cyan-400" />
                </div>
                <h3 className="text-base font-semibold text-white">Ask your knowledge base</h3>
                <p className="text-xs text-white/50 mt-1.5 leading-relaxed">
                  Active document:{' '}
                  <span className="font-mono text-cyan-300">{activeDoc || 'None selected'}</span>.
                  Ask questions or pick one of the sample prompts below.
                </p>

                {/* Sample Prompt Chips */}
                <div className="mt-6 flex flex-wrap gap-2 justify-center">
                  {[
                    'What are reference types?',
                    'Explain Java memory allocation',
                    'Summarize the core takeaways',
                    'List the main rules and principles',
                  ].map((promptText) => (
                    <button
                      key={promptText}
                      onClick={() => handleSend(promptText)}
                      className="text-xs bg-white/[0.05] hover:bg-white/[0.12] border border-white/[0.1] text-white/80 hover:text-white px-3.5 py-2 rounded-xl transition-all"
                    >
                      {promptText}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${
                    msg.role === 'Human' ? 'items-end' : 'items-start'
                  }`}
                >
                  <div
                    className={`max-w-[85%] md:max-w-[75%] rounded-2xl px-5 py-4 ${
                      msg.role === 'Human'
                        ? 'bg-white text-black font-medium text-sm leading-relaxed shadow-md shadow-white/5'
                        : 'bg-white/[0.05] border border-white/[0.1] text-white/90 text-sm leading-relaxed backdrop-blur-md'
                    }`}
                  >
                    {/* Role header for AI */}
                    {msg.role === 'AI' && (
                      <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/[0.06] text-[11px] text-white/40">
                        <div className="flex items-center gap-1.5">
                          <Cpu className="h-3 w-3 text-cyan-400" />
                          <span className="font-mono text-white/60">Groq Response</span>
                        </div>
                        <button
                          onClick={() => handleCopy(msg.id, msg.content)}
                          className="flex items-center gap-1 hover:text-white transition-colors"
                        >
                          {copiedId === msg.id ? (
                            <>
                              <Check className="h-3 w-3 text-emerald-400" />
                              <span className="text-emerald-400">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="h-3 w-3" />
                              <span>Copy</span>
                            </>
                          )}
                        </button>
                      </div>
                    )}

                    <div className="whitespace-pre-wrap leading-relaxed">
                      {cleanTextOutput(msg.content)}
                    </div>

                    {/* Rewritten Standalone Query Badge */}
                    {msg.rewritten && (
                      <div className="mt-3 pt-2.5 border-t border-white/[0.06] flex items-start gap-1.5 text-[11px] text-white/50">
                        <Info className="h-3.5 w-3.5 text-cyan-400 shrink-0 mt-0.5" />
                        <div>
                          <span className="text-white/40 font-mono">Reformulated query: </span>
                          <span className="text-white/80 italic">&ldquo;{msg.rewritten}&rdquo;</span>
                        </div>
                      </div>
                    )}

                    {/* Sources Badge */}
                    {msg.sources && msg.sources.length > 0 && (
                      <div className="mt-3 flex items-center justify-between">
                        <button
                          onClick={() => setActiveSourcesModal(msg.sources || null)}
                          className="inline-flex items-center space-x-1.5 text-[11px] font-mono text-cyan-400 hover:text-cyan-300 transition-colors bg-cyan-500/10 px-2.5 py-1 rounded-lg border border-cyan-500/20"
                        >
                          <Layers className="h-3 w-3" />
                          <span>View {msg.sources.length} Context Chunks</span>
                          <ArrowUpRight className="h-3 w-3" />
                        </button>
                        <span className="text-[10px] text-white/30 font-mono">{msg.timestamp}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}

            {isLoading && (
              <div className="flex items-start space-x-3">
                <div className="rounded-2xl bg-white/[0.05] border border-white/[0.1] px-5 py-4 text-xs text-white/70 flex items-center space-x-3">
                  <Loader2 className="h-4 w-4 animate-spin text-cyan-400" />
                  <span>Searching Chroma vector index & streaming response...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} className="h-1" />
          </div>

          {/* Stationary Lighter Input Bar Anchored at Bottom */}
          <div className="p-4 border-t border-white/[0.1] bg-[#12131a] shrink-0">
            <div className="relative rounded-2xl bg-[#21222e] border border-white/20 focus-within:border-cyan-400/70 focus-within:ring-2 focus-within:ring-cyan-400/20 shadow-md transition-all p-1.5 flex items-center">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={
                  activeDoc
                    ? `Ask anything about ${activeDoc}...`
                    : 'Select or upload a document to begin asking questions...'
                }
                rows={1}
                className="w-full bg-transparent px-4 py-2.5 text-sm text-white placeholder-white/50 resize-none focus:outline-none"
              />
              <button
                onClick={() => handleSend()}
                disabled={isLoading || !input.trim()}
                className="h-9 w-9 rounded-xl bg-white text-black flex items-center justify-center hover:bg-white/90 disabled:opacity-30 disabled:hover:bg-white transition-all shrink-0 ml-2"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
            <div className="flex items-center justify-between mt-2 px-2 text-[11px] text-white/40 font-mono">
              <span>Press Enter to send, Shift+Enter for new line</span>
              <span>100% Context Grounded</span>
            </div>
          </div>
        </div>
      </div>

      {/* Sources Modal Drawer */}
      {activeSourcesModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-2xl max-h-[80vh] overflow-hidden rounded-3xl bg-[#0e0e13] border border-white/10 p-6 shadow-2xl flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
              <div className="flex items-center space-x-2">
                <Layers className="h-4 w-4 text-cyan-400" />
                <h3 className="text-sm font-semibold text-white">Chroma Retrieved Context Chunks</h3>
              </div>
              <button
                onClick={() => setActiveSourcesModal(null)}
                className="text-xs text-white/50 hover:text-white px-2.5 py-1 rounded-lg bg-white/5"
              >
                Close
              </button>
            </div>

            <div className="flex-1 overflow-y-auto mt-4 space-y-4 pr-1">
              {activeSourcesModal.map((source, idx) => (
                <div
                  key={idx}
                  className="rounded-2xl bg-white/[0.03] border border-white/[0.06] p-4 text-xs text-white/80 space-y-2"
                >
                  <div className="flex items-center justify-between text-[11px] text-white/40 font-mono">
                    <span>Chunk #{idx + 1}</span>
                    {source.metadata?.page !== undefined && (
                      <span className="bg-white/10 px-2 py-0.5 rounded text-white/70">
                        Page {String(source.metadata.page)}
                      </span>
                    )}
                  </div>
                  <p className="leading-relaxed whitespace-pre-wrap font-sans text-white/70">
                    {source.content}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
