import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { X, Send, Pencil, Check, BookMarked, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import ReactMarkdown from 'react-markdown';
import { LITERARY_COMPANION_SYSTEM_PROMPT, buildSessionContext } from '@/lib/literaryCompanionPrompt';

// ─── Sub-components ──────────────────────────────────────────────────────────

function PageEditor({ currentPage, onSave }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(currentPage || '');
  const inputRef = useRef(null);

  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  const commit = () => {
    const num = parseInt(draft, 10);
    if (!isNaN(num) && num > 0) onSave(num);
    setEditing(false);
  };

  if (editing) {
    return (
      <span className="inline-flex items-center gap-1">
        <input
          ref={inputRef}
          type="number"
          value={draft}
          onChange={e => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={e => { if (e.key === 'Enter') commit(); if (e.key === 'Escape') setEditing(false); }}
          className="w-16 text-xs border border-indigo-300 rounded px-1 py-0.5 text-indigo-700 bg-white focus:outline-none"
        />
        <button onClick={commit} className="text-indigo-500 hover:text-indigo-700">
          <Check className="w-3 h-3" />
        </button>
      </span>
    );
  }

  return (
    <button
      onClick={() => { setDraft(currentPage || ''); setEditing(true); }}
      className="inline-flex items-center gap-1 text-xs text-indigo-200 hover:text-white transition-colors"
    >
      <span>{currentPage ? `Page ${currentPage}` : 'Set page'}</span>
      <Pencil className="w-3 h-3" />
    </button>
  );
}

function ThinkingIndicator() {
  return (
    <div className="flex items-start gap-3 mb-4">
      <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center shrink-0 mt-0.5">
        <BookMarked className="w-4 h-4 text-indigo-600" />
      </div>
      <div className="bg-indigo-50 border border-indigo-100 rounded-2xl rounded-tl-sm px-4 py-3">
        <div className="flex gap-1 items-center h-4">
          <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function LiteraryCompanionPanel({
  book,
  currentChapter,
  currentPage,
  onClose,
  onPositionUpdate,
  prefillMessage = '',
}) {
  const [chat, setChat] = useState(null);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const prefillSentRef = useRef(false);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });

  useEffect(() => { scrollToBottom(); }, [chat?.messages?.length, isLoading]);

  // Load or create the companion chat for this book
  useEffect(() => {
    let cancelled = false;
    async function init() {
      setIsInitializing(true);
      const user = await base44.auth.me();
      const existing = await base44.entities.CompanionChat.filter({ book_id: book.id, user_email: user.email });
      if (cancelled) return;
      if (existing.length > 0) {
        setChat(existing[0]);
      } else {
        const created = await base44.entities.CompanionChat.create({
          book_id: book.id,
          user_email: user.email,
          messages: [],
          themes_surfaced: [],
          last_message_at: new Date().toISOString(),
        });
        setChat(created);
      }
      setIsInitializing(false);
    }
    init();
    return () => { cancelled = true; };
  }, [book.id]);

  // Pre-fill textarea with the discussion question once ready
  useEffect(() => {
    if (!isInitializing && chat && prefillMessage && !prefillSentRef.current) {
      prefillSentRef.current = true;
      setInput(prefillMessage);
      setTimeout(() => textareaRef.current?.focus(), 100);
    }
  }, [isInitializing, chat, prefillMessage]);

  const handleSend = async () => {
    if (!input.trim() || isLoading || !chat) return;

    const userInput = input.trim();

    const userMessage = {
      role: 'user',
      content: userInput,
      position_at_message: { page: currentPage, chapter: currentChapter, chapter_name: book?.chapters?.[currentChapter]?.title },
      created_at: new Date().toISOString(),
    };

    const updatedMessages = [...(chat.messages || []), userMessage];
    const optimisticChat = { ...chat, messages: updatedMessages };
    setChat(optimisticChat);
    setInput('');
    setIsLoading(true);

    // Build system prompt from imported constant + session context
    const sessionContext = buildSessionContext({
      book,
      currentPage,
      currentChapter,
      themesSurfaced: chat.themes_surfaced,
      recentMessages: updatedMessages.slice(-10),
    });

    const systemPrompt = LITERARY_COMPANION_SYSTEM_PROMPT + sessionContext;

    // Build conversation history for the LLM call
    const historyWindow = updatedMessages.slice(-30);
    const conversationLines = historyWindow.slice(0, -1).map(
      m => `${m.role === 'user' ? 'READER' : 'COMPANION'}: ${m.content}`
    );

    const fullPrompt = [
      `SYSTEM INSTRUCTIONS:\n${systemPrompt}`,
      '',
      '--- CONVERSATION SO FAR ---',
      ...conversationLines,
      `READER: ${userInput}`,
      '',
      'COMPANION:',
    ].join('\n');

    const fullResponse = await base44.integrations.Core.InvokeLLM({
      prompt: fullPrompt,
      model: 'claude_sonnet_4_6',
    });

    const assistantContent = typeof fullResponse === 'string' ? fullResponse : (fullResponse?.text || '');

    const assistantMessage = {
      role: 'assistant',
      content: assistantContent,
      position_at_message: { page: currentPage, chapter: currentChapter, chapter_name: book?.chapters?.[currentChapter]?.title },
      created_at: new Date().toISOString(),
    };

    const finalMessages = [...updatedMessages, assistantMessage];
    const now = new Date().toISOString();

    await base44.entities.CompanionChat.update(chat.id, {
      messages: finalMessages,
      last_message_at: now,
    });

    setChat({ ...optimisticChat, messages: finalMessages, last_message_at: now });
    setIsLoading(false);

    // Best-effort theme extraction (non-blocking)
    extractThemes(userInput, assistantContent, chat.themes_surfaced || [], chat.id);
  };

  const extractThemes = async (userMsg, assistantMsg, existingThemes, chatId) => {
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Extract 1-3 thematic tags from this literary exchange. Use specific, novel-relevant categories (e.g. "intergenerational trauma transmission" not "family"; "religion-as-container-and-verdict" not "faith"). Return only a JSON array of strings.

Reader: ${userMsg}
Companion: ${assistantMsg}`,
        response_json_schema: {
          type: 'object',
          properties: { themes: { type: 'array', items: { type: 'string' } } },
        },
      });
      const newThemes = result?.themes || [];
      const merged = [...new Set([...existingThemes, ...newThemes])];
      if (newThemes.length > 0) {
        await base44.entities.CompanionChat.update(chatId, { themes_surfaced: merged });
        setChat(prev => prev ? { ...prev, themes_surfaced: merged } : prev);
      }
    } catch {
      // silent failure — does not block main flow
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const messages = chat?.messages || [];

  const currentPosition = currentPage
    ? `Page ${currentPage}`
    : `Chapter ${currentChapter}${book.chapters?.[currentChapter]?.title ? ': ' + book.chapters[currentChapter].title : ''}`;

  return (
    <motion.div
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', damping: 28, stiffness: 250 }}
      className="fixed right-0 top-0 h-full w-full sm:w-[420px] bg-white shadow-2xl z-50 flex flex-col border-l border-indigo-100"
    >
      {/* Header */}
      <div className="bg-indigo-600 text-white px-5 py-4 flex items-start justify-between shrink-0">
        <div className="min-w-0 flex-1 pr-3">
          <div className="flex items-center gap-2 mb-0.5">
            <BookMarked className="w-4 h-4 shrink-0" />
            <span className="text-xs font-medium uppercase tracking-wide opacity-80">Literary Companion</span>
          </div>
          <p className="font-semibold text-sm truncate">{book.title}</p>
          <p className="text-xs opacity-70">{book.author}{book.translation ? ` · tr. ${book.translation}` : ''}</p>
          <div className="mt-2 flex items-center gap-2">
            <PageEditor currentPage={currentPage} onSave={onPositionUpdate} />
            {!currentPage && (
              <span className="text-xs opacity-60">· {currentPosition}</span>
            )}
          </div>
        </div>
        <button
          onClick={onClose}
          className="text-white/70 hover:text-white transition-colors shrink-0 mt-1"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Themes strip */}
      {chat?.themes_surfaced?.length > 0 && (
        <div className="bg-indigo-50 border-b border-indigo-100 px-5 py-2 flex gap-1.5 flex-wrap">
          {chat.themes_surfaced.slice(0, 5).map((t, i) => (
            <span key={i} className="text-[10px] bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">
              {t}
            </span>
          ))}
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-5 py-5 space-y-1">
        {isInitializing ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="w-6 h-6 text-indigo-300 animate-spin" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center max-w-xs">
              <div className="w-14 h-14 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookMarked className="w-7 h-7 text-indigo-400" />
              </div>
              <p className="text-slate-600 text-sm leading-relaxed italic">
                What are you noticing? What's staying with you? What pattern is starting to form?
              </p>
            </div>
          </div>
        ) : (
          messages.map((msg, idx) => (
            <div
              key={idx}
              className={cn('flex mb-4', msg.role === 'user' ? 'justify-end' : 'justify-start items-start gap-3')}
            >
              {msg.role === 'assistant' && (
                <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center shrink-0 mt-0.5">
                  <BookMarked className="w-4 h-4 text-indigo-600" />
                </div>
              )}
              <div
                className={cn(
                  'max-w-[82%] rounded-2xl px-4 py-3 text-sm',
                  msg.role === 'user'
                    ? 'bg-indigo-600 text-white rounded-tr-sm'
                    : 'bg-indigo-50 text-slate-800 border border-indigo-100 rounded-tl-sm'
                )}
              >
                {msg.role === 'assistant' ? (
                  <div className="prose prose-sm max-w-none prose-p:my-1 prose-p:leading-relaxed prose-strong:text-slate-900 prose-em:text-slate-700">
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                ) : (
                  <p className="leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                )}
              </div>
            </div>
          ))
        )}

        {isLoading && <ThinkingIndicator />}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-slate-100 px-4 py-4 bg-white shrink-0">
        <div className="flex gap-2 items-end">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Share an observation, ask a question, or just think out loud..."
            rows={3}
            className="flex-1 resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-transparent transition-all leading-relaxed"
            disabled={isLoading || isInitializing}
          />
          <Button
            onClick={handleSend}
            disabled={!input.trim() || isLoading || isInitializing}
            className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl h-10 w-10 p-0 shrink-0"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
        <p className="text-[10px] text-slate-400 mt-1.5 pl-1">Enter to send · Shift+Enter for new line</p>
      </div>
    </motion.div>
  );
}