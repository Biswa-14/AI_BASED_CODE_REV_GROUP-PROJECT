"use client";

import { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowUpIcon,
  CircleUserRound,
  Command,
  FileCode2,
  FileUp,
  Globe2,
  Paperclip,
  ShieldCheck,
  Sparkles,
  WandSparkles,
  XIcon,
  Zap,
} from 'lucide-react';

import { useAuth } from '../../context/auth-context';
import { buildApiUrl, fetchJson } from '../../lib/api';
import { SENTIENT_CHAT_AVATAR } from '../../lib/branding';
import { cn } from '../../lib/utils';
import { LoadingBreadcrumb } from './animated-loading-svg-text-shimmer';
import { AiLoader } from './ai-loader';
import { MessageDock } from './message-dock';
import { ShiningText } from './shining-text';

const MAX_ATTACHMENT_BYTES = 200_000;
const MAX_SAVED_MESSAGES = 24;
const MAX_CONTEXT_MESSAGES = 40;
const MAX_CONTEXT_CHARS = 1_500;
const SUPPORTED_TEXT_FILES = /\.(txt|md|py|js|jsx|ts|tsx|json|java|c|cpp|h|hpp|css|html|sql)$/i;
const GUEST_NOTICE = 'Guest mode is active. Sign in to save history and your preferred analysis mode.';
const SEARCH_MODE_DEFAULT = 'auto';

const commandSuggestions = [
  {
    icon: <Zap className="w-4 h-4" />,
    label: 'Fix Bugs',
    description: 'Catch logic and syntax issues fast',
    prefix: '/fix',
    mode: 'fix',
  },
  {
    icon: <Sparkles className="w-4 h-4" />,
    label: 'Optimize',
    description: 'Improve structure and execution',
    prefix: '/optimize',
    mode: 'optimize',
  },
  {
    icon: <WandSparkles className="w-4 h-4" />,
    label: 'Complexity',
    description: 'Reduce time and space complexity',
    prefix: '/complexity',
    mode: 'complexity',
  },
  {
    icon: <ShieldCheck className="w-4 h-4" />,
    label: 'Review',
    description: 'Summarize risks and edge cases',
    prefix: '/review',
    mode: 'review',
  },
];

const modeMeta = {
  fix: {
    label: 'Fix Bugs',
    breadcrumb: 'Tracing the bug',
    shine: 'Sentient is cooking up a clean fix...',
    status: 'Sentient is tracing the bug right now.',
    ready: 'Fix pass ready. Want another round? 👀',
  },
  optimize: {
    label: 'Optimize',
    breadcrumb: 'Tuning the code',
    shine: 'Sentient is tightening things up...',
    status: 'Sentient is tuning the flow and trimming the fluff.',
    ready: 'Optimization pass is ready. Pretty neat ✨',
  },
  complexity: {
    label: 'Complexity',
    breadcrumb: 'Flattening complexity',
    shine: 'Sentient is simplifying the heavy bits...',
    status: 'Sentient is breaking down the expensive paths.',
    ready: 'Complexity pass is ready. Nice and cleaner now ⚡',
  },
  review: {
    label: 'Review',
    breadcrumb: 'Reviewing the edges',
    shine: 'Sentient is checking the risky corners...',
    status: 'Sentient is reviewing the edge cases and gotchas.',
    ready: 'Review notes are ready. Here is the honest cut 🛡️',
  },
};

const searchModeOptions = [
  {
    value: 'off',
    label: 'Off',
    emoji: '⛔',
    description: 'No live web search. Best for pure code-only fixes and fastest turnaround.',
  },
  {
    value: 'auto',
    label: 'Auto Wizard',
    emoji: '🧙',
    description: 'Recommended. Search is available and Sentient decides if it is actually needed.',
  },
  {
    value: 'on',
    label: 'On',
    emoji: '🌐',
    description: 'Live web help is enabled and Sentient is nudged to verify with current sources and real-time tracking.',
  },
];

function getModeMeta(mode) {
  return modeMeta[mode] ?? modeMeta.fix;
}

function useAutoResizeTextarea({ minHeight, maxHeight }) {
  const textareaRef = useRef(null);

  const adjustHeight = (reset = false) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    if (reset) {
      textarea.style.height = `${minHeight}px`;
      return;
    }

    textarea.style.height = `${minHeight}px`;
    const newHeight = Math.max(
      minHeight,
      Math.min(textarea.scrollHeight, maxHeight ?? Number.POSITIVE_INFINITY),
    );

    textarea.style.height = `${newHeight}px`;
  };

  useEffect(() => {
    adjustHeight(true);
  }, [minHeight]);

  useEffect(() => {
    const onResize = () => adjustHeight();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  });

  return { textareaRef, adjustHeight };
}

function createId() {
  return Math.random().toString(36).slice(2, 10);
}

async function normalizeAttachments(fileList) {
  const files = Array.from(fileList);
  const normalized = await Promise.all(
    files.map(async (file) => {
      const isSupported = SUPPORTED_TEXT_FILES.test(file.name);
      const isWithinSize = file.size <= MAX_ATTACHMENT_BYTES;

      if (!isSupported) {
        return {
          id: createId(),
          name: file.name,
          size: file.size,
          supported: false,
          status: 'Only text/code files are supported in this prototype.',
          content: '',
        };
      }

      if (!isWithinSize) {
        return {
          id: createId(),
          name: file.name,
          size: file.size,
          supported: false,
          status: 'File is too large for live demo parsing.',
          content: '',
        };
      }

      const text = await file.text();
      const trimmed = text.slice(0, 12000);

      return {
        id: createId(),
        name: file.name,
        size: file.size,
        supported: true,
        status: text.length > trimmed.length ? 'Trimmed for faster analysis.' : 'Ready',
        content: trimmed,
      };
    }),
  );

  return normalized;
}

function buildRequest({ value, attachments, mode, messages }) {
  const modeLabel =
    commandSuggestions.find((suggestion) => suggestion.mode === mode)?.label ?? 'Fix Bugs';
  const cleanedValue = value.replace(/^\/[a-z-]+\s*/i, '').trim();
  const conversationContext = buildConversationContext(messages);

  const sections = [
    `Requested task: ${modeLabel}.`,
    conversationContext ? `Recent conversation context:\n${conversationContext}` : '',
    cleanedValue ? `User prompt:\n${cleanedValue}` : '',
  ];

  const supportedAttachments = attachments.filter((file) => file.supported && file.content);
  const unsupportedAttachments = attachments.filter((file) => !file.supported);

  if (supportedAttachments.length > 0) {
    sections.push(
      supportedAttachments
        .map(
          (file) =>
            `Attachment: ${file.name}\n\`\`\`\n${file.content}\n\`\`\`${file.status ? `\nNote: ${file.status}` : ''}`,
        )
        .join('\n\n'),
    );
  }

  if (unsupportedAttachments.length > 0) {
    sections.push(
      `Attachment notes:\n${unsupportedAttachments
        .map((file) => `- ${file.name}: ${file.status}`)
        .join('\n')}`,
    );
  }

  return sections.filter(Boolean).join('\n\n');
}

function buildConversationContext(messages) {
  if (!Array.isArray(messages) || messages.length === 0) return '';

  const recentMessages = messages
    .filter((message) => message && typeof message.content === 'string' && message.content.trim())
    .filter((message) => message.status !== 'error')
    .slice(-MAX_CONTEXT_MESSAGES);

  if (recentMessages.length === 0) return '';

  return recentMessages
    .map((message) => {
      const speaker = message.role === 'assistant' ? 'Sentient' : 'User';
      const trimmedContent = message.content.trim().slice(0, MAX_CONTEXT_CHARS);
      return `${speaker}: ${trimmedContent}`;
    })
    .join('\n');
}

export function AnimatedAIChat({ activeConversationId, onConversationCreated, onConversationUpdated }) {
  const { isAuthenticated, token, user } = useAuth();
  const [value, setValue] = useState('');
  const [messages, setMessages] = useState([]);
  const [attachments, setAttachments] = useState([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [activeMode, setActiveMode] = useState('fix');
  const [searchMode, setSearchMode] = useState(SEARCH_MODE_DEFAULT);
  const [activeSuggestion, setActiveSuggestion] = useState(-1);
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [notice, setNotice] = useState(GUEST_NOTICE);

  const commandPaletteRef = useRef(null);
  const composerRef = useRef(null);
  const messagesRef = useRef(null);
  const fileInputRef = useRef(null);
  const skipNextConversationLoadRef = useRef(false);

  const { textareaRef, adjustHeight } = useAutoResizeTextarea({
    minHeight: 72,
    maxHeight: 220,
  });

  const activeModeMeta = useMemo(() => getModeMeta(activeMode), [activeMode]);
  const headerLabel = activeModeMeta.label;

  useEffect(() => {
    if (!isAuthenticated || !user?.email) {
      setMessages([]);
      setActiveMode('fix');
      setSearchMode(SEARCH_MODE_DEFAULT);
      setNotice(GUEST_NOTICE);
      return;
    }

    const savedMode = readStoredMode(user.email);
    const savedSearchMode = readStoredSearchMode(user.email);

    // Server-side conversation threads are the source of truth for signed-in users.
    // Starting on a blank thread avoids mixing an old local transcript into a new chat.
    setMessages([]);
    setActiveMode(savedMode);
    setSearchMode(savedSearchMode);
    setNotice(
      `Signed in as ${user?.name ?? 'your account'}. Your history and preferred mode will be restored automatically.`,
    );
  }, [isAuthenticated, user?.email, user?.name]);

  useEffect(() => {
    if (!isAuthenticated || !token || !activeConversationId) {
      if (activeConversationId === null) setMessages([]);
      return;
    }

    if (skipNextConversationLoadRef.current) {
      skipNextConversationLoadRef.current = false;
      return undefined;
    }

    let cancelled = false;
    setNotice('Loading saved conversation…');
    fetchJson(`/conversations/${activeConversationId}/`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((payload) => {
        if (cancelled) return;
        setMessages((payload.messages ?? []).map((message) => ({ ...message, status: 'done' })));
        setNotice('Saved conversation restored.');
      })
      .catch(() => {
        if (!cancelled) setNotice('Could not load that conversation.');
      });

    return () => {
      cancelled = true;
    };
  }, [activeConversationId, isAuthenticated, token]);

  useEffect(() => {
    if (!isAuthenticated || !user?.email) return;

    window.localStorage.setItem(getHistoryStorageKey(user.email), JSON.stringify(messages.slice(-MAX_SAVED_MESSAGES)));
    window.localStorage.setItem(
      getPreferencesStorageKey(user.email),
      JSON.stringify({ activeMode, searchMode }),
    );
  }, [activeMode, isAuthenticated, messages, searchMode, user?.email]);

  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (value.startsWith('/') && !value.includes(' ')) {
      setShowCommandPalette(true);
      const matchIndex = commandSuggestions.findIndex((suggestion) =>
        suggestion.prefix.startsWith(value),
      );
      setActiveSuggestion(matchIndex);
    } else if (document.activeElement === textareaRef.current) {
      setShowCommandPalette(false);
      setActiveSuggestion(-1);
    }
  }, [value, textareaRef]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      const target = event.target;
      if (
        commandPaletteRef.current &&
        !commandPaletteRef.current.contains(target) &&
        composerRef.current &&
        !composerRef.current.contains(target)
      ) {
        setShowCommandPalette(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectSuggestion = (suggestion) => {
    setValue(`${suggestion.prefix} `);
    setActiveMode(suggestion.mode);
    setShowCommandPalette(false);
    setNotice(`${suggestion.label} mode selected.`);
    textareaRef.current?.focus();
  };

  const removeAttachment = (attachmentId) => {
    setAttachments((current) => current.filter((file) => file.id !== attachmentId));
  };

  const onPickFiles = async (event) => {
    const picked = event.target.files;
    if (!picked?.length) return;

    const normalized = await normalizeAttachments(picked);
    setAttachments((current) => [...current, ...normalized].slice(0, 4));
    event.target.value = '';
  };

  const updateAssistantMessage = (assistantId, content, status = 'streaming') => {
    setMessages((current) =>
      current.map((message) =>
        message.id === assistantId ? { ...message, content, status } : message,
      ),
    );
  };

  const handleSendMessage = async () => {
    if (isStreaming) return;
    if (!value.trim() && attachments.length === 0) return;

    let conversationId = activeConversationId;
    if (isAuthenticated && token && !conversationId) {
      try {
        const payload = await fetchJson('/conversations/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ title: value.trim() || 'Attachment analysis' }),
        });
        conversationId = payload.conversation.id;
        skipNextConversationLoadRef.current = true;
        onConversationCreated?.(conversationId);
      } catch {
        setNotice('Could not create a saved chat. Check that the backend is running and migrations are applied.');
        return;
      }
    }

    const requestMode = activeMode;
    const requestModeMeta = getModeMeta(requestMode);
    const requestBody = buildRequest({
      value,
      attachments,
      mode: requestMode,
      messages,
    });
    const userPreview = value.trim() || `Analyze ${attachments.length} attachment(s)`;

    const userMessage = {
      id: createId(),
      role: 'user',
      content: userPreview,
      mode: requestMode,
      searchMode,
      attachments: attachments.map((file) => ({ name: file.name, status: file.status })),
    };

    const assistantId = createId();

    setMessages((current) => [
      ...current,
      userMessage,
      {
        id: assistantId,
        role: 'assistant',
        content: '',
        status: 'streaming',
        mode: requestMode,
        searchMode,
      },
    ]);

    setIsStreaming(true);
    setNotice(buildSearchNotice(requestModeMeta.status, searchMode));
    setValue('');
    setAttachments([]);
    adjustHeight(true);

    try {
      const response = await fetch(buildApiUrl('/chat-stream/'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          message: requestBody,
          mode: requestMode,
          search_mode: searchMode,
          conversation_id: conversationId,
          display_message: userPreview,
          attachments: userMessage.attachments,
        }),
      });

      if (!response.ok || !response.body) {
        const responseText = await response.text();
        let errorMessage = `Request failed with status ${response.status}`;

        if (responseText) {
          try {
            const payload = JSON.parse(responseText);
            errorMessage = payload.error || payload.message || errorMessage;
          } catch {
            errorMessage = responseText;
          }
        }

        throw new Error(errorMessage);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let result = '';

      while (true) {
        const { done, value: chunkValue } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(chunkValue, { stream: true });
        if (!chunk) continue;

        result += chunk;
        updateAssistantMessage(assistantId, result);
      }

      const finalChunk = decoder.decode();
      if (finalChunk) {
        result += finalChunk;
      }

      updateAssistantMessage(
        assistantId,
        result || 'No response was generated. Try a shorter or more specific input.',
        'done',
      );
      setNotice(buildSearchNotice(requestModeMeta.ready, searchMode));
    } catch (error) {
      console.error(error);
      updateAssistantMessage(
        assistantId,
        'Something went wrong while contacting the model. Try a smaller prompt or restart the backend.',
        'error',
      );
      setNotice('Connection issue detected. A shorter prompt should help.');
    } finally {
      setIsStreaming(false);
      if (conversationId) onConversationUpdated?.();
    }
  };

  const handleKeyDown = (event) => {
    if (showCommandPalette) {
      if (event.key === 'ArrowDown') {
        event.preventDefault();
        setActiveSuggestion((current) =>
          current < commandSuggestions.length - 1 ? current + 1 : 0,
        );
        return;
      }

      if (event.key === 'ArrowUp') {
        event.preventDefault();
        setActiveSuggestion((current) =>
          current > 0 ? current - 1 : commandSuggestions.length - 1,
        );
        return;
      }

      if ((event.key === 'Tab' || event.key === 'Enter') && activeSuggestion >= 0) {
        event.preventDefault();
        selectSuggestion(commandSuggestions[activeSuggestion]);
        return;
      }

      if (event.key === 'Escape') {
        event.preventDefault();
        setShowCommandPalette(false);
        return;
      }
    }

    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <section className="relative mx-auto w-full max-w-5xl">
      <div className="chat-shell lab-bg">
        <div className="chat-shell__header">
          <div>
            <p className="chat-shell__eyebrow">AI Workspace</p>
            <h2 className="chat-shell__title">What are we looking at?</h2>
            <p className="chat-shell__subtitle">
              Share the code or describe what feels wrong. We will work through it carefully.
            </p>
          </div>
          <div className={cn('chat-status', !isAuthenticated && 'chat-status--info', isStreaming && 'chat-status--active')}>
            <span className={cn('chat-status__dot', !isAuthenticated && 'chat-status__dot--info')} />
            {isStreaming ? (
              <ShiningText text={activeModeMeta.status} className="chat-status__shine" />
            ) : (
              <span>{notice}</span>
            )}
          </div>
        </div>

        <div ref={messagesRef} className="message-feed">
          {messages.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state__badge">
                <Sparkles className="h-4 w-4" />
                <span>Start with the part that is blocking you</span>
              </div>
              <div className="empty-state__grid">
                {commandSuggestions.map((suggestion) => (
                  <button
                    key={suggestion.prefix}
                    type="button"
                    onClick={() => selectSuggestion(suggestion)}
                    className="empty-state__card"
                  >
                    <div className="empty-state__icon">{suggestion.icon}</div>
                    <div>
                      <p className="empty-state__card-title">{suggestion.label}</p>
                      <p className="empty-state__card-copy">{suggestion.description}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <AnimatePresence initial={false}>
              {messages.map((message) => (
                <motion.article
                  key={message.id}
                  layout
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className={cn(
                    'message-card',
                    message.role === 'assistant' ? 'message-card--assistant' : 'message-card--user',
                  )}
                >
                  <div className="message-card__meta">
                    <span
                      className={cn(
                        'message-card__avatar',
                        message.role === 'assistant' && 'message-card__avatar--assistant',
                      )}
                    >
                      {message.role === 'assistant' ? (
                        <img
                          src={SENTIENT_CHAT_AVATAR}
                          alt="Sentient cat avatar"
                          className="message-card__avatar-image message-card__avatar-image--assistant"
                        />
                      ) : (
                        <CircleUserRound className="h-4 w-4" />
                      )}
                    </span>
                    <div>
                      <p className="message-card__author">
                        {message.role === 'assistant' ? 'Sentient' : 'You'}
                      </p>
                      <p className="message-card__status">
                        {message.status === 'streaming'
                          ? getModeMeta(message.mode).breadcrumb
                          : message.status === 'error'
                            ? 'Response failed'
                            : message.role === 'assistant'
                              ? 'Analysis complete'
                              : 'Prompt submitted'}
                      </p>
                      {message.role === 'user' && message.searchMode && (
                        <p className="message-card__substatus">
                          Search: {getSearchModeLabel(message.searchMode)}
                        </p>
                      )}
                    </div>
                  </div>

                  {message.role === 'assistant' && message.status === 'streaming' && !message.content.trim() ? (
                    <div className="message-card__loading">
                      <AiLoader
                        size={92}
                        text={getModeMeta(message.mode).label}
                        inline
                        className="message-card__loader"
                      />
                      <div className="message-card__loading-copy">
                        <LoadingBreadcrumb text={getModeMeta(message.mode).breadcrumb} />
                        <ShiningText
                          text={getModeMeta(message.mode).shine}
                          className="message-card__loading-shine"
                        />
                      </div>
                    </div>
                  ) : (
                    <>
                      <pre className="message-card__content">{message.content}</pre>
                      {message.role === 'assistant' && message.status === 'streaming' && (
                        <div className="message-card__streaming">
                          <LoadingBreadcrumb
                            text={getModeMeta(message.mode).breadcrumb}
                            className="message-card__streaming-breadcrumb"
                          />
                        </div>
                      )}
                    </>
                  )}

                  {message.attachments?.length > 0 && (
                    <div className="message-card__attachments">
                      {message.attachments.map((file) => (
                        <span key={`${message.id}-${file.name}`} className="attachment-chip">
                          <FileCode2 className="h-3.5 w-3.5" />
                          {file.name}
                        </span>
                      ))}
                    </div>
                  )}
                </motion.article>
              ))}
            </AnimatePresence>
          )}
        </div>

        <div ref={composerRef} className="composer-panel">
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".txt,.md,.py,.js,.jsx,.ts,.tsx,.json,.java,.c,.cpp,.h,.hpp,.html,.css,.sql"
            className="hidden"
            onChange={onPickFiles}
          />

          <AnimatePresence>
            {showCommandPalette && (
              <motion.div
                ref={commandPaletteRef}
                className="command-palette"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
              >
                {commandSuggestions.map((suggestion, index) => (
                  <button
                    key={suggestion.prefix}
                    type="button"
                    onClick={() => selectSuggestion(suggestion)}
                    className={cn(
                      'command-palette__item',
                      activeSuggestion === index && 'command-palette__item--active',
                    )}
                  >
                    <span className="command-palette__icon">{suggestion.icon}</span>
                    <span className="command-palette__copy">
                      <strong>{suggestion.label}</strong>
                      <span>{suggestion.prefix}</span>
                    </span>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="composer-panel__top">
            <div className="composer-mode">
              <Sparkles className="h-4 w-4" />
              <span>{headerLabel} mode</span>
            </div>
            <MessageDock
              items={searchModeOptions}
              value={searchMode}
              onChange={(nextMode) => {
                setSearchMode(nextMode);
                setNotice(buildSearchToggleNotice(nextMode));
              }}
              className="composer-search-dock"
              label="Web search"
            />
            <div className="composer-helper composer-helper--search">
              <Globe2 className="h-4 w-4" />
              <span>{getSearchModeLabel(searchMode)}</span>
            </div>
          </div>

          <textarea
            ref={textareaRef}
            value={value}
            onChange={(event) => {
              setValue(event.target.value);
              adjustHeight();
            }}
            onKeyDown={handleKeyDown}
            disabled={isStreaming}
            placeholder="Paste code, describe the issue, or attach a file for analysis..."
            className="composer-textarea"
          />

          <AnimatePresence>
            {attachments.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="attachments-row"
              >
                {attachments.map((attachment) => (
                  <div key={attachment.id} className="attachment-card">
                    <div className="attachment-card__copy">
                      <FileUp className="h-4 w-4" />
                      <div>
                        <p>{attachment.name}</p>
                        <span>{attachment.status}</span>
                      </div>
                    </div>
                    <button type="button" onClick={() => removeAttachment(attachment.id)}>
                      <XIcon className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="composer-panel__footer">
            <div className="composer-actions">
              <button
                type="button"
                className="icon-button"
                onClick={() => fileInputRef.current?.click()}
              >
                <Paperclip className="h-4 w-4" />
              </button>
              <button
                type="button"
                className={cn('icon-button', showCommandPalette && 'icon-button--active')}
                onClick={() => setShowCommandPalette((current) => !current)}
              >
                <Command className="h-4 w-4" />
              </button>
              <div className="mode-switcher">
                {commandSuggestions.map((suggestion) => (
                  <button
                    key={suggestion.mode}
                    type="button"
                    className={cn(
                      'mode-switcher__button',
                      activeMode === suggestion.mode && 'mode-switcher__button--active',
                    )}
                    onClick={() => setActiveMode(suggestion.mode)}
                  >
                    {suggestion.label}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={handleSendMessage}
              disabled={isStreaming || (!value.trim() && attachments.length === 0)}
              className={cn(
                'send-button',
                (value.trim() || attachments.length > 0) &&
                  !isStreaming &&
                  'send-button--ready',
              )}
            >
              <ArrowUpIcon className={cn('h-4 w-4', isStreaming && 'send-button__icon--active')} />
              <span>{isStreaming ? 'Working' : 'Send'}</span>
            </button>
          </div>
        </div>

        <div className="suggestions-row">
          {commandSuggestions.map((suggestion) => (
            <button
              key={suggestion.prefix}
              type="button"
              onClick={() => selectSuggestion(suggestion)}
              className="suggestion-pill"
            >
              {suggestion.icon}
              <span>{suggestion.label}</span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

function getHistoryStorageKey(email) {
  return `sentient-chat-history:${email.toLowerCase()}`;
}

function getPreferencesStorageKey(email) {
  return `sentient-chat-preferences:${email.toLowerCase()}`;
}

function buildSearchToggleNotice(searchMode) {
  if (searchMode === 'off') {
    return 'Web search is off. Sentient will stay focused on the prompt and attachments only.';
  }

  if (searchMode === 'on') {
    return 'Web search is on. Sentient can verify details against the live web for this run.';
  }

  return 'Web search is on auto. Sentient will decide if current web context would help.';
}

function buildSearchNotice(baseNotice, searchMode) {
  if (searchMode === 'off') {
    return `${baseNotice} Web search is off for this request.`;
  }

  if (searchMode === 'on') {
    return `${baseNotice} Live web support is enabled for this request.`;
  }

  return `${baseNotice} Search is available if the model thinks it will help.`;
}

function getSearchModeLabel(searchMode) {
  const option = searchModeOptions.find((item) => item.value === searchMode);
  return option?.label ?? 'Auto';
}

function readStoredHistory(email) {
  try {
    const raw = window.localStorage.getItem(getHistoryStorageKey(email));
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed
      .filter((message) => message && typeof message.content === 'string' && typeof message.role === 'string')
      .map((message) => ({
        ...message,
        status: message.status === 'error' ? 'error' : 'done',
      }));
  } catch {
    return [];
  }
}

function readStoredMode(email) {
  try {
    const raw = window.localStorage.getItem(getPreferencesStorageKey(email));
    if (!raw) return 'fix';

    const parsed = JSON.parse(raw);
    const mode = parsed?.activeMode;
    return commandSuggestions.some((suggestion) => suggestion.mode === mode) ? mode : 'fix';
  } catch {
    return 'fix';
  }
}

function readStoredSearchMode(email) {
  try {
    const raw = window.localStorage.getItem(getPreferencesStorageKey(email));
    if (!raw) return SEARCH_MODE_DEFAULT;

    const parsed = JSON.parse(raw);
    const searchMode = parsed?.searchMode;
    return searchModeOptions.some((item) => item.value === searchMode)
      ? searchMode
      : SEARCH_MODE_DEFAULT;
  } catch {
    return SEARCH_MODE_DEFAULT;
  }
}
