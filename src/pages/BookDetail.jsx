import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, BookOpen, Clock, Users, Play, Lightbulb, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import CharacterAvatar from '@/components/CharacterAvatar';

export default function BookDetail() {
  const urlParams = new URLSearchParams(window.location.search);
  const bookId = urlParams.get('id');
  const queryClient = useQueryClient();

  const { data: book, isLoading } = useQuery({
    queryKey: ['book', bookId],
    queryFn: () => base44.entities.Book.filter({ id: bookId }).then(res => res[0]),
    enabled: !!bookId,
  });

  const { data: progressList = [] } = useQuery({
    queryKey: ['reading-progress', bookId],
    queryFn: () => base44.entities.ReadingProgress.filter({ book_id: bookId }),
    enabled: !!bookId,
  });

  const progress = progressList[0];

  const createProgressMutation = useMutation({
    mutationFn: (data) => base44.entities.ReadingProgress.create(data),
    onSuccess: () => queryClient.invalidateQueries(['reading-progress', bookId]),
  });

  const handleStartReading = async () => {
    if (!progress) {
      await createProgressMutation.mutateAsync({
        book_id: bookId,
        current_chapter: 0,
        last_read: new Date().toISOString()
      });
    }
    window.location.href = createPageUrl(`Reader?id=${bookId}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50/50 via-white to-rose-50/30 flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-32 h-48 bg-slate-200 rounded-xl" />
          <div className="h-4 w-48 bg-slate-200 rounded" />
        </div>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50/50 via-white to-rose-50/30 flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500">Book not found</p>
          <Link to={createPageUrl('Home')}>
            <Button variant="link" className="mt-4">Go back home</Button>
          </Link>
        </div>
      </div>
    );
  }

  const currentChapter = progress?.current_chapter || 0;
  const progressPercent = book.chapters?.length 
    ? Math.round((currentChapter / book.chapters.length) * 100) 
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50/50 via-white to-rose-50/30">
      {/* Hero */}
      <div className="relative">
        {/* Background blur from cover */}
        {book.cover_image && (
          <div 
            className="absolute inset-0 h-96 opacity-20 blur-3xl"
            style={{ backgroundImage: `url(${book.cover_image})`, backgroundSize: 'cover' }}
          />
        )}
        
        <div className="relative max-w-5xl mx-auto px-6 py-8">
          <Link to={createPageUrl('Home')}>
            <Button variant="ghost" size="sm" className="mb-6 gap-2 -ml-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Library
            </Button>
          </Link>

          <div className="flex flex-col md:flex-row gap-8 md:gap-12">
            {/* Cover */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="shrink-0 mx-auto md:mx-0"
            >
              <div className="w-48 md:w-56 aspect-[2/3] rounded-2xl overflow-hidden shadow-2xl shadow-slate-900/20">
                {book.cover_image ? (
                  <img 
                    src={book.cover_image} 
                    alt={book.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
                    <BookOpen className="w-16 h-16 text-slate-300" />
                  </div>
                )}
              </div>
            </motion.div>

            {/* Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="flex-1 text-center md:text-left"
            >
              {book.genre && (
                <span className="inline-block px-3 py-1 text-xs font-medium uppercase tracking-wider bg-amber-100 text-amber-700 rounded-full mb-4">
                  {book.genre}
                </span>
              )}
              
              <h1 className="text-3xl md:text-4xl font-serif font-semibold text-slate-900 mb-2">
                {book.title}
              </h1>
              
              <p className="text-lg text-slate-600 mb-6">by {book.author}</p>

              {book.description && (
                <p className="text-slate-600 leading-relaxed mb-8 max-w-xl">
                  {book.description}
                </p>
              )}

              {/* Stats */}
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-6 mb-8">
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <BookOpen className="w-4 h-4" />
                  <span>{book.chapters?.length || 0} chapters</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <Users className="w-4 h-4" />
                  <span>{book.characters?.length || 0} characters</span>
                </div>
                {progress && (
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <Clock className="w-4 h-4" />
                    <span>{progressPercent}% complete</span>
                  </div>
                )}
              </div>

              {/* CTA */}
              <Button 
                onClick={handleStartReading}
                size="lg"
                className="bg-slate-900 hover:bg-slate-800 rounded-full px-8 gap-2"
              >
                <Play className="w-4 h-4" />
                {progress ? 'Continue Reading' : 'Start Reading'}
              </Button>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Characters Section */}
      {book.characters && book.characters.length > 0 && (
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="max-w-5xl mx-auto px-6 py-12"
        >
          <h2 className="text-xl font-semibold text-slate-900 mb-6 flex items-center gap-3">
            <Users className="w-5 h-5 text-amber-600" />
            Characters You Can Chat With
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {book.characters.map((char, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + idx * 0.1 }}
                className="bg-white rounded-2xl p-5 border border-slate-100 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start gap-4">
                  <CharacterAvatar 
                    name={char.name} 
                    avatar={char.avatar}
                    size="lg"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-slate-900 truncate">{char.name}</h3>
                    <p className="text-sm text-slate-500 mt-1 line-clamp-2">
                      {char.description}
                    </p>
                    {char.suggested_questions && char.suggested_questions.length > 0 && (
                      <div className="mt-3 space-y-1">
                        <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wide flex items-center gap-1">
                          <MessageCircle className="w-3 h-3" />
                          Try asking:
                        </p>
                        <p className="text-xs text-amber-700 bg-amber-50 px-2 py-1.5 rounded-lg line-clamp-2">
                          "{char.suggested_questions[0]}"
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>
      )}

      {/* Discussion Questions */}
      {book.discussion_questions && book.discussion_questions.length > 0 && (
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="max-w-5xl mx-auto px-6 py-12"
        >
          <h2 className="text-xl font-semibold text-slate-900 mb-6 flex items-center gap-3">
            <Lightbulb className="w-5 h-5 text-amber-600" />
            Discussion Questions
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {book.discussion_questions.slice(0, 6).map((question, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + idx * 0.1 }}
                className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-5 border border-amber-100"
              >
                <p className="text-sm text-slate-700 leading-relaxed">{question}</p>
              </motion.div>
            ))}
          </div>
          
          {book.discussion_questions.length > 6 && (
            <p className="text-center text-sm text-slate-400 mt-4">
              +{book.discussion_questions.length - 6} more questions available while reading
            </p>
          )}
        </motion.section>
      )}

      {/* Chapters Preview */}
      {book.chapters && book.chapters.length > 0 && (
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="max-w-5xl mx-auto px-6 py-12"
        >
          <h2 className="text-xl font-semibold text-slate-900 mb-6 flex items-center gap-3">
            <BookOpen className="w-5 h-5 text-amber-600" />
            Chapters
          </h2>

          <div className="space-y-2">
            {book.chapters.map((chapter, idx) => (
              <div
                key={idx}
                className={`flex items-center gap-4 p-4 rounded-xl transition-colors ${
                  idx < currentChapter 
                    ? 'bg-green-50 border border-green-100' 
                    : idx === currentChapter && progress
                      ? 'bg-amber-50 border border-amber-200'
                      : 'bg-white border border-slate-100'
                }`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  idx < currentChapter 
                    ? 'bg-green-500 text-white' 
                    : idx === currentChapter && progress
                      ? 'bg-amber-500 text-white'
                      : 'bg-slate-100 text-slate-500'
                }`}>
                  {idx + 1}
                </div>
                <span className={`font-medium ${
                  idx <= currentChapter ? 'text-slate-900' : 'text-slate-500'
                }`}>
                  {chapter.title}
                </span>
              </div>
            ))}
          </div>
        </motion.section>
      )}
    </div>
  );
}