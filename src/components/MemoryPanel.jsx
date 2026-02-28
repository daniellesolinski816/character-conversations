import React, { useState } from 'react';
import { Brain, ChevronDown, ChevronUp, Heart, Lightbulb, MessageSquare, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function MemoryPanel({ chat, characterName }) {
  const [open, setOpen] = useState(false);

  const details = chat?.user_details || {};
  const summary = chat?.memory_summary || '';
  const discussed = chat?.user_preferences?.discussed_topics || [];

  const hasAnything =
    summary ||
    details.favorite_characters?.length ||
    details.recurring_themes?.length ||
    details.personal_connections?.length ||
    details.opinions_expressed?.length ||
    discussed.length;

  if (!hasAnything) return null;

  return (
    <div className="border-t border-slate-100">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-2.5 text-xs text-slate-500 hover:bg-slate-50 transition-colors"
      >
        <span className="flex items-center gap-2">
          <Brain className="w-3.5 h-3.5 text-amber-500" />
          <span className="font-medium text-amber-700">What {characterName} remembers about you</span>
        </span>
        {open ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-4 space-y-3 bg-amber-50/50">
              {summary && (
                <div>
                  <p className="text-[10px] font-semibold text-amber-700 uppercase tracking-wide mb-1 flex items-center gap-1">
                    <Lightbulb className="w-3 h-3" /> Conversation summary
                  </p>
                  <p className="text-xs text-slate-600 leading-relaxed">{summary}</p>
                </div>
              )}

              {details.favorite_characters?.length > 0 && (
                <div>
                  <p className="text-[10px] font-semibold text-amber-700 uppercase tracking-wide mb-1 flex items-center gap-1">
                    <Star className="w-3 h-3" /> Characters you like
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {details.favorite_characters.map((c, i) => (
                      <span key={i} className="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">{c}</span>
                    ))}
                  </div>
                </div>
              )}

              {details.recurring_themes?.length > 0 && (
                <div>
                  <p className="text-[10px] font-semibold text-amber-700 uppercase tracking-wide mb-1 flex items-center gap-1">
                    <MessageSquare className="w-3 h-3" /> Themes you keep exploring
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {details.recurring_themes.map((t, i) => (
                      <span key={i} className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full">{t}</span>
                    ))}
                  </div>
                </div>
              )}

              {details.personal_connections?.length > 0 && (
                <div>
                  <p className="text-[10px] font-semibold text-amber-700 uppercase tracking-wide mb-1 flex items-center gap-1">
                    <Heart className="w-3 h-3" /> Things you've shared
                  </p>
                  <ul className="space-y-1">
                    {details.personal_connections.slice(0, 3).map((c, i) => (
                      <li key={i} className="text-xs text-slate-600 pl-2 border-l-2 border-amber-200">{c}</li>
                    ))}
                  </ul>
                </div>
              )}

              {details.opinions_expressed?.length > 0 && (
                <div>
                  <p className="text-[10px] font-semibold text-amber-700 uppercase tracking-wide mb-1">Your opinions</p>
                  <ul className="space-y-1">
                    {details.opinions_expressed.slice(0, 3).map((o, i) => (
                      <li key={i} className="text-xs text-slate-600 pl-2 border-l-2 border-violet-200">{o}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}