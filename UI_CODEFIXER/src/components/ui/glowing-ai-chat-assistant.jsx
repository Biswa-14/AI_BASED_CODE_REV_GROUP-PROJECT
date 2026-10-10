import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Bot,
  Code2,
  Globe2,
  Info,
  Paperclip,
  Send,
  Sparkles,
  X,
} from 'lucide-react';

import { cn } from '../../lib/utils';

const MAX_CHARS = 2000;
const MODE_OPTIONS = ['fix', 'optimize', 'review'];
const MODE_LABELS = {
  fix: 'Fix',
  optimize: 'Optimize',
  review: 'Review',
};

export function FloatingAiAssistant({ onSendPrompt, onJumpToWorkspace }) {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [mode, setMode] = useState('fix');
  const [searchMode, setSearchMode] = useState('auto');
  const panelRef = useRef(null);
  const textareaRef = useRef(null);

  const charCount = message.length;
  const canSend = message.trim().length > 0;
  const searchLabel = searchMode === 'on' ? 'Live web' : 'Auto web';
  const helperCopy = useMemo(() => {
    if (searchMode === 'on') {
      return 'Live web mode is armed for current facts, docs, and rates.';
    }
    return 'Auto mode lets Sentient decide when live web context is worth using.';
  }, [searchMode]);

  useEffect(() => {
    if (!isOpen) return undefined;

    const handleClickOutside = (event) => {
      if (panelRef.current && !panelRef.current.contains(event.target)) {
        if (!event.target.closest('.floating-sentient-button')) {
          setIsOpen(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      textareaRef.current?.focus();
    }
  }, [isOpen]);

  const handleSend = () => {
    if (!canSend) return;

    onSendPrompt?.(message.trim(), { mode, searchMode });
    setMessage('');
    setIsOpen(false);
  };

  const handleModeCycle = () => {
    const currentIndex = MODE_OPTIONS.indexOf(mode);
    const nextIndex = currentIndex === MODE_OPTIONS.length - 1 ? 0 : currentIndex + 1;
    setMode(MODE_OPTIONS[nextIndex]);
  };

  const handleSearchToggle = () => {
    setSearchMode((current) => (current === 'auto' ? 'on' : 'auto'));
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-end justify-end">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={panelRef}
            initial={{ opacity: 0, y: 20, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 18, scale: 0.94 }}
            transition={{ type: 'spring', stiffness: 260, damping: 24 }}
            className="mb-4 w-[min(92vw,27rem)] overflow-hidden rounded-[1.9rem] border border-white/10 bg-[linear-gradient(180deg,rgba(22,20,31,0.92),rgba(11,11,18,0.96))] shadow-[0_24px_80px_rgba(0,0,0,0.45)] backdrop-blur-3xl"
          >
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(168,85,247,0.18),transparent_38%),radial-gradient(circle_at_bottom_right,rgba(59,130,246,0.16),transparent_28%)]" />

            <div className="relative z-10 border-b border-white/8 px-5 pb-3 pt-4">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.8)]" />
                  <div>
                    <p className="text-sm font-semibold text-white/92">Sentient Assistant</p>
                    <p className="text-xs text-white/45">Quick launcher into the main workspace</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="rounded-full border border-white/10 bg-white/6 px-2.5 py-1 text-[11px] font-semibold text-white/70">
                    {MODE_LABELS[mode]}
                  </span>
                  <span
                    className={cn(
                      'rounded-full border px-2.5 py-1 text-[11px] font-semibold',
                      searchMode === 'on'
                        ? 'border-cyan-400/25 bg-cyan-400/10 text-cyan-200'
                        : 'border-fuchsia-400/20 bg-fuchsia-400/10 text-fuchsia-200',
                    )}
                  >
                    {searchLabel}
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="rounded-full p-2 text-white/45 transition hover:bg-white/8 hover:text-white"
                    aria-label="Close Sentient quick launcher"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            <div className="relative z-10 px-5 py-4">
              <textarea
                ref={textareaRef}
                value={message}
                onChange={(event) => setMessage(event.target.value.slice(0, MAX_CHARS))}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' && !event.shiftKey) {
                    event.preventDefault();
                    handleSend();
                  }
                }}
                rows={4}
                className="min-h-[7.5rem] w-full resize-none bg-transparent text-[1rem] leading-7 text-white/92 outline-none placeholder:text-white/28"
                placeholder="Drop a quick prompt here and Sentient will send it to the main workspace..."
              />

              <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={onJumpToWorkspace}
                    className="inline-flex items-center gap-2 rounded-2xl border border-white/8 bg-white/5 px-3 py-2 text-xs font-medium text-white/62 transition hover:-translate-y-0.5 hover:bg-white/8 hover:text-white"
                  >
                    <Paperclip className="h-3.5 w-3.5" />
                    Workspace
                  </button>
                  <button
                    type="button"
                    onClick={handleSearchToggle}
                    className="inline-flex items-center gap-2 rounded-2xl border border-white/8 bg-white/5 px-3 py-2 text-xs font-medium text-white/62 transition hover:-translate-y-0.5 hover:bg-white/8 hover:text-white"
                  >
                    <Globe2 className="h-3.5 w-3.5" />
                    {searchLabel}
                  </button>
                  <button
                    type="button"
                    onClick={handleModeCycle}
                    className="inline-flex items-center gap-2 rounded-2xl border border-white/8 bg-white/5 px-3 py-2 text-xs font-medium text-white/62 transition hover:-translate-y-0.5 hover:bg-white/8 hover:text-white"
                  >
                    <Code2 className="h-3.5 w-3.5" />
                    {MODE_LABELS[mode]}
                  </button>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs font-medium text-white/36">
                    {charCount}/{MAX_CHARS}
                  </span>
                  <button
                    type="button"
                    onClick={handleSend}
                    disabled={!canSend}
                    className={cn(
                      'group relative inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-white/12 text-white shadow-[0_10px_30px_rgba(124,58,237,0.38)] transition',
                      canSend
                        ? 'bg-[linear-gradient(135deg,#7c3aed,#a855f7)] hover:-translate-y-0.5 hover:scale-[1.04]'
                        : 'cursor-not-allowed bg-white/8 text-white/32 shadow-none',
                    )}
                    aria-label="Send quick prompt to workspace"
                  >
                    <Send className="h-[18px] w-[18px] transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    {canSend && (
                      <span className="absolute inset-0 rounded-2xl bg-[radial-gradient(circle,rgba(255,255,255,0.32),transparent_60%)] opacity-0 transition group-hover:opacity-100" />
                    )}
                  </button>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-white/8 pt-3 text-xs text-white/38">
                <div className="flex items-center gap-2">
                  <Info className="h-3.5 w-3.5" />
                  <span>Press Shift + Enter for a new line</span>
                </div>
                <div className="flex items-center gap-2">
                  <Sparkles className="h-3.5 w-3.5 text-fuchsia-300/80" />
                  <span>{helperCopy}</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        type="button"
        className="floating-sentient-button relative flex h-16 w-16 items-center justify-center rounded-full border border-white/16 text-white"
        onClick={() => setIsOpen((current) => !current)}
        whileHover={{ scale: 1.06, rotate: isOpen ? 0 : 6 }}
        whileTap={{ scale: 0.96 }}
        animate={{ rotate: isOpen ? 90 : 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 18 }}
        style={{
          background:
            'linear-gradient(135deg, rgba(124,58,237,0.95) 0%, rgba(168,85,247,0.92) 45%, rgba(99,102,241,0.88) 100%)',
          boxShadow:
            '0 0 24px rgba(139,92,246,0.72), 0 0 44px rgba(124,58,237,0.48), 0 0 76px rgba(99,102,241,0.28)',
        }}
        aria-label={isOpen ? 'Close Sentient quick launcher' : 'Open Sentient quick launcher'}
      >
        <span className="absolute inset-[3px] rounded-full border border-white/10" />
        <span className="absolute inset-0 rounded-full bg-[linear-gradient(180deg,rgba(255,255,255,0.24),transparent_48%)] opacity-65" />
        <motion.span
          className="absolute inset-0 rounded-full bg-fuchsia-400/25 blur-xl"
          animate={{ scale: [1, 1.14, 1], opacity: [0.45, 0.18, 0.45] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
        />
        <span className="relative z-10">
          {isOpen ? <X className="h-8 w-8" /> : <Bot className="h-8 w-8" />}
        </span>
      </motion.button>
    </div>
  );
}
