import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, BookOpen, MessageCircle, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import CharacterAvatar from './CharacterAvatar';

export default function ReaderView({ 
  book, 
  currentChapter, 
  onChapterChange,
  onOpenChat,
  characters 
}) {
  const [showCharacters, setShowCharacters] = useState(false);
  const chapter = book.chapters?.[currentChapter];
  const totalChapters = book.chapters?.length || 0;

  if (!chapter) {
    return (
      <div className="flex-1 flex items-center justify-center bg-amber-50/30">
        <div className="text-center">
          <BookOpen className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500">No chapters available yet</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col relative bg-gradient-to-b from-amber-50/30 to-white">
      {/* Floating Character Bar */}
      <AnimatePresence>
        {characters && characters.length > 0 && (
          <motion.div 
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="sticky top-0 z-10 bg-white/80 backdrop-blur-lg border-b border-slate-100"
          >
            <div className="max-w-3xl mx-auto px-6 py-3">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setShowCharacters(!showCharacters)}
                  className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
                >
                  <Users className="w-4 h-4" />
                  <span>Characters</span>
                  <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                    {characters.length}
                  </span>
                </button>
                
                <div className="flex-1 flex items-center gap-2 overflow-x-auto scrollbar-hide">
                  {characters.map((char, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: idx * 0.1 }}
                    >
                      <CharacterAvatar
                        name={char.name}
                        avatar={char.avatar}
                        size="sm"
                        onClick={() => onOpenChat(char)}
                      />
                    </motion.div>
                  ))}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onOpenChat(characters[0])}
                  className="shrink-0 rounded-full border-amber-200 text-amber-700 hover:bg-amber-50"
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Chat
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reader Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-6 py-12 md:py-16">
          {/* Chapter Title */}
          <div className="mb-12 text-center">
            <span className="text-xs font-medium text-amber-600 uppercase tracking-widest">
              Chapter {currentChapter + 1} of {totalChapters}
            </span>
            <h2 className="text-2xl md:text-3xl font-serif font-semibold text-slate-900 mt-2">
              {chapter.title}
            </h2>
          </div>

          {/* Chapter Content */}
          <article className="prose prose-slate prose-lg max-w-none">
            {chapter.content?.split('\n').map((paragraph, idx) => (
              paragraph.trim() && (
                <p key={idx} className="text-slate-700 leading-relaxed font-serif">
                  {paragraph}
                </p>
              )
            ))}
          </article>
        </div>
      </div>

      {/* Navigation */}
      <div className="sticky bottom-0 bg-white/80 backdrop-blur-lg border-t border-slate-100">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => onChapterChange(currentChapter - 1)}
            disabled={currentChapter === 0}
            className="gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Previous</span>
          </Button>

          <div className="flex items-center gap-2">
            {Array.from({ length: Math.min(totalChapters, 5) }).map((_, idx) => {
              const chapterIdx = totalChapters <= 5 
                ? idx 
                : Math.max(0, Math.min(currentChapter - 2, totalChapters - 5)) + idx;
              
              return (
                <button
                  key={idx}
                  onClick={() => onChapterChange(chapterIdx)}
                  className={cn(
                    "w-2 h-2 rounded-full transition-all",
                    chapterIdx === currentChapter 
                      ? "bg-amber-500 w-6" 
                      : "bg-slate-200 hover:bg-slate-300"
                  )}
                />
              );
            })}
          </div>

          <Button
            variant="ghost"
            onClick={() => onChapterChange(currentChapter + 1)}
            disabled={currentChapter >= totalChapters - 1}
            className="gap-2"
          >
            <span className="hidden sm:inline">Next</span>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}