import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { AnimatePresence } from 'framer-motion';
import { ArrowLeft, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ReaderView from '@/components/ReaderView';
import CharacterChatPanel from '@/components/CharacterChatPanel';

export default function Reader() {
  const urlParams = new URLSearchParams(window.location.search);
  const bookId = urlParams.get('id');
  const queryClient = useQueryClient();

  const [selectedCharacter, setSelectedCharacter] = useState(null);
  const [currentChat, setCurrentChat] = useState(null);

  const { data: book, isLoading: bookLoading } = useQuery({
    queryKey: ['book', bookId],
    queryFn: () => base44.entities.Book.filter({ id: bookId }).then(res => res[0]),
    enabled: !!bookId,
  });

  const { data: progressList = [], isLoading: progressLoading } = useQuery({
    queryKey: ['reading-progress', bookId],
    queryFn: () => base44.entities.ReadingProgress.filter({ book_id: bookId }),
    enabled: !!bookId,
  });

  const { data: chats = [] } = useQuery({
    queryKey: ['character-chats', bookId],
    queryFn: () => base44.entities.CharacterChat.filter({ book_id: bookId }),
    enabled: !!bookId,
  });

  const progress = progressList[0];

  const updateProgressMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.ReadingProgress.update(id, data),
    onSuccess: () => queryClient.invalidateQueries(['reading-progress', bookId]),
  });

  const createProgressMutation = useMutation({
    mutationFn: (data) => base44.entities.ReadingProgress.create(data),
    onSuccess: () => queryClient.invalidateQueries(['reading-progress', bookId]),
  });

  const handleChapterChange = async (newChapter) => {
    if (newChapter < 0 || newChapter >= (book?.chapters?.length || 0)) return;

    if (progress?.id) {
      await updateProgressMutation.mutateAsync({
        id: progress.id,
        data: {
          current_chapter: newChapter,
          last_read: new Date().toISOString(),
          completed: newChapter === book.chapters.length - 1
        }
      });
    } else {
      await createProgressMutation.mutateAsync({
        book_id: bookId,
        current_chapter: newChapter,
        last_read: new Date().toISOString()
      });
    }
  };

  const handleOpenChat = (character) => {
    setSelectedCharacter(character);
    const existingChat = chats.find(c => c.character_name === character.name);
    setCurrentChat(existingChat || { book_id: bookId, character_name: character.name, messages: [] });
  };

  const handleCloseChat = () => {
    setSelectedCharacter(null);
    setCurrentChat(null);
  };

  const handleUpdateChat = (updatedChat) => {
    setCurrentChat(updatedChat);
    queryClient.invalidateQueries(['character-chats', bookId]);
  };

  if (bookLoading || progressLoading) {
    return (
      <div className="min-h-screen bg-amber-50/30 flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <BookOpen className="w-12 h-12 text-amber-300" />
          <p className="text-slate-500">Loading book...</p>
        </div>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="min-h-screen bg-amber-50/30 flex items-center justify-center">
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

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-amber-50/30 to-white">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-lg border-b border-slate-100">
        <div className="max-w-5xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to={createPageUrl(`BookDetail?id=${bookId}`)}>
              <Button variant="ghost" size="icon" className="shrink-0">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div className="min-w-0">
              <h1 className="font-semibold text-slate-900 truncate">{book.title}</h1>
              <p className="text-xs text-slate-500">{book.author}</p>
            </div>
          </div>
        </div>
      </header>

      {/* Reader */}
      <ReaderView
        book={book}
        currentChapter={currentChapter}
        onChapterChange={handleChapterChange}
        onOpenChat={handleOpenChat}
        characters={book.characters}
      />

      {/* Chat Panel */}
      <AnimatePresence>
        {selectedCharacter && (
          <CharacterChatPanel
            book={book}
            character={selectedCharacter}
            currentChapter={currentChapter}
            chat={currentChat}
            onUpdateChat={handleUpdateChat}
            onClose={handleCloseChat}
          />
        )}
      </AnimatePresence>
    </div>
  );
}