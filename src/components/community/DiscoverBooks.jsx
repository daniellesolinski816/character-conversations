import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { TrendingUp, Star, Users, Sparkles, BookMarked } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import BookCard from '@/components/BookCard';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function DiscoverBooks() {
  const { data: books = [] } = useQuery({
    queryKey: ['books'],
    queryFn: () => base44.entities.Book.list('-created_date'),
  });

  const { data: allProgress = [] } = useQuery({
    queryKey: ['all-progress'],
    queryFn: () => base44.entities.ReadingProgress.list('-updated_date'),
  });

  const { data: userProfile } = useQuery({
    queryKey: ['user-profile'],
    queryFn: async () => {
      const profiles = await base44.entities.UserProfile.list();
      return profiles[0];
    },
  });

  // Calculate trending books based on recent progress updates
  const trendingBooks = books
    .map(book => {
      const recentReads = allProgress.filter(p => 
        p.book_id === book.id && 
        new Date(p.updated_date) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      ).length;
      return { ...book, recentReads };
    })
    .sort((a, b) => b.recentReads - a.recentReads)
    .slice(0, 6);

  // Recommend based on user's favorite genres
  const recommendedBooks = books
    .filter(book => userProfile?.favorite_genres?.includes(book.genre))
    .slice(0, 6);

  // Recently added books
  const newBooks = [...books].slice(0, 6);

  const curatedCollections = [
    {
      title: "Character-Driven Stories",
      description: "Books with deep character development and emotional arcs",
      books: books.filter(b => b.characters?.length >= 3).slice(0, 4),
      icon: Users
    },
    {
      title: "Quick Reads",
      description: "Engaging stories you can finish in one sitting",
      books: books.filter(b => b.chapters?.length <= 5).slice(0, 4),
      icon: Sparkles
    },
    {
      title: "Epic Journeys",
      description: "Long-form adventures with complex plots",
      books: books.filter(b => b.chapters?.length > 10).slice(0, 4),
      icon: BookMarked
    }
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-serif font-semibold text-slate-900 mb-2">Discover Books</h2>
        <p className="text-slate-600">Find your next great read</p>
      </div>

      <Tabs defaultValue="trending" className="w-full">
        <TabsList className="grid w-full grid-cols-3 max-w-md">
          <TabsTrigger value="trending">
            <TrendingUp className="w-4 h-4 mr-2" />
            Trending
          </TabsTrigger>
          <TabsTrigger value="recommended">
            <Star className="w-4 h-4 mr-2" />
            For You
          </TabsTrigger>
          <TabsTrigger value="collections">
            <BookMarked className="w-4 h-4 mr-2" />
            Collections
          </TabsTrigger>
        </TabsList>

        <TabsContent value="trending" className="mt-6">
          <p className="text-sm text-slate-500 mb-4">Books being read this week</p>
          {trendingBooks.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {trendingBooks.map((book, idx) => (
                <motion.div
                  key={book.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <BookCard book={book} />
                  {book.recentReads > 0 && (
                    <div className="mt-2 flex items-center gap-1 text-xs text-amber-600">
                      <TrendingUp className="w-3 h-3" />
                      {book.recentReads} reading
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          ) : (
            <p className="text-slate-400 text-sm">No trending books yet</p>
          )}
        </TabsContent>

        <TabsContent value="recommended" className="mt-6">
          <p className="text-sm text-slate-500 mb-4">
            Based on your favorite genres: {userProfile?.favorite_genres?.join(', ') || 'Not set yet'}
          </p>
          {recommendedBooks.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {recommendedBooks.map((book, idx) => (
                <motion.div
                  key={book.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <BookCard book={book} />
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-slate-400 text-sm mb-4">Start reading to get personalized recommendations</p>
              <Link to={createPageUrl('Home')}>
                <Button variant="outline">Browse Books</Button>
              </Link>
            </div>
          )}
        </TabsContent>

        <TabsContent value="collections" className="mt-6 space-y-8">
          {curatedCollections.map((collection, idx) => {
            const Icon = collection.icon;
            return collection.books.length > 0 ? (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">{collection.title}</h3>
                    <p className="text-xs text-slate-500">{collection.description}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {collection.books.map((book) => (
                    <BookCard key={book.id} book={book} />
                  ))}
                </div>
              </motion.div>
            ) : null;
          })}
        </TabsContent>
      </Tabs>
    </div>
  );
}