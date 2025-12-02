import React from 'react';
import { MessageCircle, Lightbulb, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import CharacterAvatar from './CharacterAvatar';

export default function DiscussionPanel({ 
  book, 
  onSelectQuestion, 
  onSelectCharacter,
  onClose 
}) {
  return (
    <motion.div
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="fixed inset-y-0 right-0 w-full md:w-[420px] bg-white shadow-2xl z-50 flex flex-col"
    >
      {/* Header */}
      <div className="border-b border-slate-100 px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center">
            <Lightbulb className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900">Discussion Ideas</h3>
            <p className="text-xs text-slate-500">Questions & conversation starters</p>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="w-5 h-5" />
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-5 space-y-6">
        {/* Character Questions */}
        {book.characters?.some(c => c.suggested_questions?.length > 0) && (
          <div>
            <h4 className="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <MessageCircle className="w-4 h-4 text-amber-600" />
              Ask the Characters
            </h4>
            <div className="space-y-4">
              {book.characters?.filter(c => c.suggested_questions?.length > 0).map((char, idx) => (
                <div key={idx} className="bg-slate-50 rounded-xl p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <CharacterAvatar name={char.name} avatar={char.avatar} size="sm" />
                    <span className="font-medium text-slate-900">{char.name}</span>
                  </div>
                  <div className="space-y-2">
                    {char.suggested_questions?.map((q, qIdx) => (
                      <button
                        key={qIdx}
                        onClick={() => {
                          onSelectCharacter(char);
                          onSelectQuestion(q);
                        }}
                        className="w-full text-left p-3 bg-white rounded-lg border border-slate-100 hover:border-amber-200 hover:bg-amber-50/50 transition-colors text-sm text-slate-700"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* General Discussion Questions */}
        {book.discussion_questions?.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-amber-600" />
              Book Club Discussion
            </h4>
            <div className="space-y-2">
              {book.discussion_questions?.map((question, idx) => (
                <div
                  key={idx}
                  className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-100"
                >
                  <p className="text-sm text-slate-700 leading-relaxed">{question}</p>
                  <div className="flex gap-2 mt-3">
                    {book.characters?.slice(0, 3).map((char, cIdx) => (
                      <button
                        key={cIdx}
                        onClick={() => {
                          onSelectCharacter(char);
                          onSelectQuestion(`Regarding this discussion question: "${question}" - What are your thoughts?`);
                        }}
                        className="text-xs bg-white px-3 py-1.5 rounded-full border border-slate-200 hover:border-amber-300 hover:bg-amber-50 transition-colors flex items-center gap-1.5"
                      >
                        <span className="w-4 h-4 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-[8px] text-white font-medium">
                          {char.name[0]}
                        </span>
                        Ask {char.name.split(' ')[0]}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {(!book.discussion_questions || book.discussion_questions.length === 0) && 
         !book.characters?.some(c => c.suggested_questions?.length > 0) && (
          <div className="text-center py-12">
            <Lightbulb className="w-12 h-12 text-slate-200 mx-auto mb-4" />
            <p className="text-slate-500">No discussion questions available for this book.</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}