import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, BookOpen, MessageCircle, Users, Lightbulb, Trophy, BookMarked } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import CharacterAvatar from './CharacterAvatar';
import ReadingSettings from './ReadingSettings';
import VocabularyHelper from './VocabularyHelper';
import ReadingQuiz from './ReadingQuiz';
import GroupCharacterChat from './GroupCharacterChat';

const fontSizeMap = {
  small: 'text-sm',
  medium: 'text-base',
  large: 'text-lg',
  xlarge: 'text-xl',
};

const lineHeightMap = {
  compact: 'leading-normal',
  normal: 'leading-relaxed',
  relaxed: 'leading-loose',
};

const themeMap = {
  light: 'bg-gradient-to-b from-amber-50/30 to-white text-slate-700',
  sepia: 'bg-amber-100/50 text-amber-950',
  dark: 'bg-slate-900 text-slate-200',
};

export default function ReaderView({ 
  book, 
  currentChapter, 
  onChapterChange,
  onOpenChat,
  onOpenDiscussion,
  characters,
  readingSettings,
  onSettingsChange,
  onSaveWord
}) {
  const [showCharacters, setShowCharacters] = useState(false);
  const [selectedText, setSelectedText] = useState(null);
  const [showQuiz, setShowQuiz] = useState(false);
  const [showGroupChat, setShowGroupChat] = useState(false);
  
  const chapter = book.chapters?.[currentChapter];
  const totalChapters = book.chapters?.length || 0;
  
  const settings = {
    font_size: readingSettings?.font_size || 'medium',
    line_height: readingSettings?.line_height || 'normal',
    theme: readingSettings?.theme || 'light',
  };

  const handleTextSelection = useCallback(() => {
    // Small delay to ensure selection is complete
    setTimeout(() => {
      const selection = window.getSelection();
      const text = selection?.toString().trim();
      
      // Only trigger if we have selected text within the article content area
      if (text && text.length > 0 && text.length < 50) {
        // Check if selection is within the reader content
        const anchorNode = selection.anchorNode;
        if (anchorNode) {
          const parentElement = anchorNode.parentElement;
          const isInArticle = parentElement?.closest('article');
          if (isInArticle) {
            setSelectedText(text);
          }
        }
      }
    }, 50);
  }, []);

  useEffect(() => {
    document.addEventListener('mouseup', handleTextSelection);
    return () => document.removeEventListener('mouseup', handleTextSelection);
  }, [handleTextSelection]);

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
    <div className={cn("flex-1 flex flex-col relative transition-colors duration-300", themeMap[settings.theme])}>
      {/* Floating Character Bar */}
      <AnimatePresence>
        {characters && characters.length > 0 && (
          <motion.div 
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className={cn(
              "sticky top-0 z-10 backdrop-blur-lg border-b",
              settings.theme === 'dark' 
                ? 'bg-slate-900/80 border-slate-800' 
                : 'bg-white/80 border-slate-100'
            )}
          >
            <div className="max-w-3xl mx-auto px-6 py-3">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setShowCharacters(!showCharacters)}
                  className={cn(
                    "flex items-center gap-2 text-sm font-medium transition-colors",
                    settings.theme === 'dark' ? 'text-slate-300 hover:text-white' : 'text-slate-600 hover:text-slate-900'
                  )}
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
                  onClick={() => setShowQuiz(true)}
                  className="shrink-0 rounded-full border-amber-200 text-amber-700 hover:bg-amber-50"
                >
                  <Trophy className="w-4 h-4 mr-2" />
                  Quiz
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={onOpenDiscussion}
                  className="shrink-0 rounded-full border-amber-200 text-amber-700 hover:bg-amber-50"
                >
                  <Lightbulb className="w-4 h-4 mr-2" />
                  Ideas
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="shrink-0 rounded-full border-amber-200 text-amber-700 hover:bg-amber-50"
                    >
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Chat
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {characters.map((char, idx) => (
                      <DropdownMenuItem 
                        key={idx}
                        onClick={() => onOpenChat(char)}
                        className="gap-2"
                      >
                        <CharacterAvatar name={char.name} avatar={char.avatar} size="sm" />
                        <span>{char.name}</span>
                      </DropdownMenuItem>
                    ))}
                    <DropdownMenuItem 
                      onClick={() => setShowGroupChat(true)}
                      className="gap-2 border-t mt-1 pt-2"
                    >
                      <Users className="w-4 h-4" />
                      <span>Group Chat (1-3)</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <ReadingSettings 
                  settings={settings}
                  onSettingsChange={onSettingsChange}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reader Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-6 py-12 md:py-16">
          {/* Section Title */}
          <div className="mb-12 text-center">
            <span className={cn(
              "text-xs font-medium uppercase tracking-widest",
              settings.theme === 'dark' ? 'text-amber-400' : 'text-amber-600'
            )}>
              Section {currentChapter + 1} of {totalChapters}
            </span>
            <h2 className={cn(
              "text-2xl md:text-3xl font-serif font-semibold mt-2",
              settings.theme === 'dark' ? 'text-white' : 'text-slate-900'
            )}>
              {chapter.title}
            </h2>
          </div>

          {/* Vocabulary Tip */}
          <div className={cn(
            "mb-8 p-3 rounded-lg text-center text-sm flex items-center justify-center gap-2",
            settings.theme === 'dark' ? 'bg-slate-800 text-slate-400' : 'bg-amber-50 text-amber-700'
          )}>
            <BookMarked className="w-4 h-4" />
            Select any word to look up its meaning
          </div>

          {/* Chapter Content */}
          <article className={cn(
            "prose max-w-none font-serif",
            fontSizeMap[settings.font_size],
            lineHeightMap[settings.line_height],
            settings.theme === 'dark' && 'prose-invert'
          )}>
            {chapter.content?.split('\n').map((paragraph, idx) => (
              paragraph.trim() && (
                <p key={idx} className={cn(
                  lineHeightMap[settings.line_height],
                  settings.theme === 'dark' ? 'text-slate-300' : 'text-slate-700'
                )}>
                  {paragraph}
                </p>
              )
            ))}
          </article>
        </div>
      </div>

      {/* Navigation */}
      <div className={cn(
        "sticky bottom-0 backdrop-blur-lg border-t",
        settings.theme === 'dark' 
          ? 'bg-slate-900/80 border-slate-800' 
          : 'bg-white/80 border-slate-100'
      )}>
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
                      : settings.theme === 'dark' ? "bg-slate-600 hover:bg-slate-500" : "bg-slate-200 hover:bg-slate-300"
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

      {/* Vocabulary Helper */}
      {selectedText && (
        <VocabularyHelper
          selectedText={selectedText}
          bookTitle={book.title}
          chapterContext={chapter.content}
          currentChapter={currentChapter}
          onSaveWord={onSaveWord}
          onClose={() => setSelectedText(null)}
        />
      )}

      {/* Reading Quiz */}
      <ReadingQuiz
        open={showQuiz}
        onOpenChange={setShowQuiz}
        book={book}
        currentChapter={currentChapter}
      />

      {/* Group Character Chat */}
      <AnimatePresence>
        {showGroupChat && (
          <GroupCharacterChat
            availableCharacters={characters}
            storyTitle={book.title}
            storyContext={chapter?.content || ''}
            onClose={() => setShowGroupChat(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}