import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Plus, BookOpen, Sparkles, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import BookCard from '@/components/BookCard';
import AddBookModal from '@/components/AddBookModal';

export default function Home() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const { data: books = [], refetch: refetchBooks } = useQuery({
    queryKey: ['books'],
    queryFn: () => base44.entities.Book.list('-created_date'),
  });

  const { data: progress = [] } = useQuery({
    queryKey: ['reading-progress'],
    queryFn: () => base44.entities.ReadingProgress.list(),
  });

  const getProgressForBook = (bookId) => {
    return progress.find(p => p.book_id === bookId);
  };

  const filteredBooks = books.filter(book => 
    book.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    book.author?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const currentlyReading = books.filter(book => {
    const prog = getProgressForBook(book.id);
    return prog && !prog.completed && prog.current_chapter > 0;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50/50 via-white to-rose-50/30">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(251,191,36,0.1),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(244,63,94,0.05),transparent_50%)]" />
        
        <div className="relative max-w-7xl mx-auto px-6 py-16 md:py-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-2xl mx-auto"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-100/80 text-amber-700 text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4" />
              AI-Powered Reading Experience
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-semibold text-slate-900 leading-tight mb-4">
              Step Inside
              <span className="text-amber-600"> Your Books</span>
            </h1>
            
            <p className="text-lg text-slate-600 mb-8">
              Read your favorite stories and have real conversations with the characters. 
              Ask them anything — they'll respond as themselves.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button 
                onClick={() => setShowAddModal(true)}
                className="bg-slate-900 hover:bg-slate-800 text-white px-6 py-6 rounded-full text-base gap-2"
              >
                <Plus className="w-5 h-5" />
                Add Your First Book
              </Button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 pb-20">
        {/* Continue Reading */}
        {currentlyReading.length > 0 && (
          <motion.section
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mb-16"
          >
            <h2 className="text-xl font-semibold text-slate-900 mb-6 flex items-center gap-3">
              <BookOpen className="w-5 h-5 text-amber-600" />
              Continue Reading
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
              {currentlyReading.map((book) => (
                <BookCard 
                  key={book.id} 
                  book={book} 
                  progress={getProgressForBook(book.id)}
                />
              ))}
            </div>
          </motion.section>
        )}

        {/* All Books */}
        <section>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <h2 className="text-xl font-semibold text-slate-900">
              {currentlyReading.length > 0 ? 'Your Library' : 'All Books'}
            </h2>
            
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search books..."
                  className="pl-10 w-64 rounded-full bg-white border-slate-200"
                />
              </div>
              
              <Button 
                onClick={() => setShowAddModal(true)}
                variant="outline"
                className="rounded-full gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Book
              </Button>
            </div>
          </div>

          {filteredBooks.length > 0 ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5"
            >
              {filteredBooks.map((book, idx) => (
                <motion.div
                  key={book.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <BookCard 
                    book={book} 
                    progress={getProgressForBook(book.id)}
                  />
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20"
            >
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center">
                <BookOpen className="w-10 h-10 text-amber-500" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">No books yet</h3>
              <p className="text-slate-500 mb-6 max-w-md mx-auto">
                Add your first book to start reading and chatting with characters
              </p>
              <Button 
                onClick={() => setShowAddModal(true)}
                className="bg-amber-600 hover:bg-amber-700 rounded-full px-6"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add a Book
              </Button>
            </motion.div>
          )}
        </section>
      </div>

      <AddBookModal 
        open={showAddModal} 
        onOpenChange={setShowAddModal}
        onBookAdded={() => refetchBooks()}
      />
    </div>
  );
}