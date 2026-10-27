import React, { useState } from 'react';
import { X, Key, ShieldCheck, Check, Sparkles, ExternalLink } from 'lucide-react';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentKey: string;
  onSaveKey: (key: string) => Promise<boolean>;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({
  isOpen,
  onClose,
  currentKey,
  onSaveKey,
}) => {
  const [apiKey, setApiKey] = useState(currentKey);
  const [isSaving, setIsSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKey.trim()) return;
    setIsSaving(true);
    const ok = await onSaveKey(apiKey.trim());
    setIsSaving(false);
    if (ok) {
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 1000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl bg-[#0d0d11] border border-white/10 p-6 shadow-2xl transition-all">
        {/* Glow corner */}
        <div className="absolute -top-24 -right-24 h-48 w-48 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />

        <div className="flex items-center justify-between pb-4 border-b border-white/[0.06]">
          <div className="flex items-center space-x-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 text-white">
              <Key className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Groq API Configuration</h3>
              <p className="text-[11px] text-white/50">High-speed inference on LPU silicon</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-white/40 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSave} className="mt-5 space-y-4">
          <div>
            <label className="block text-xs font-medium text-white/80 mb-1.5">
              Groq API Key
            </label>
            <div className="relative">
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="gsk_..."
                className="w-full rounded-xl bg-white/[0.04] border border-white/[0.12] px-3.5 py-2.5 text-sm font-mono text-white placeholder-white/20 focus:outline-none focus:border-white/40 focus:ring-1 focus:ring-white/40 transition-colors"
                autoFocus
              />
            </div>
            <p className="mt-2 text-[11px] text-white/40 flex items-center justify-between">
              <span>Your key is stored locally and securely.</span>
              <a
                href="https://console.groq.com/keys"
                target="_blank"
                rel="noreferrer"
                className="text-cyan-400 hover:underline flex items-center gap-0.5"
              >
                Get a key <ExternalLink className="h-2.5 w-2.5 inline" />
              </a>
            </p>
          </div>

          <div className="rounded-2xl bg-white/[0.02] border border-white/[0.05] p-3 text-xs text-white/60 space-y-1.5">
            <div className="flex items-center gap-2 text-white/80 font-medium">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
              <span>Direct Hardware Acceleration</span>
            </div>
            <p className="text-[11px] leading-relaxed text-white/50">
              By connecting your Groq key, inference runs at 500+ tokens/sec using LLaMA 3.3 70B Versatile.
            </p>
          </div>

          <div className="flex items-center justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-white/60 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving || !apiKey.trim()}
              className="flex items-center space-x-2 rounded-xl bg-white px-5 py-2 text-xs font-semibold text-black hover:bg-white/90 disabled:opacity-50 transition-all shadow-sm"
            >
              {success ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-600" />
                  <span>Saved!</span>
                </>
              ) : isSaving ? (
                <span>Verifying...</span>
              ) : (
                <>
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Activate Engine</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
