import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { Users, BookOpen, MessageCircle, UserPlus, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { toast } from 'sonner';

export default function ReadingBuddies() {
  const queryClient = useQueryClient();
  const [selectedBuddy, setSelectedBuddy] = useState(null);

  const { data: currentUser } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me(),
  });

  const { data: allProgress = [] } = useQuery({
    queryKey: ['all-user-progress'],
    queryFn: () => base44.entities.ReadingProgress.list('-updated_date'),
  });

  const { data: books = [] } = useQuery({
    queryKey: ['books'],
    queryFn: () => base44.entities.Book.list(),
  });

  const { data: myProfile } = useQuery({
    queryKey: ['my-profile'],
    queryFn: async () => {
      const profiles = await base44.entities.UserProfile.list();
      return profiles[0];
    },
  });

  // Get users reading similar books
  const myBooks = allProgress.filter(p => p.created_by === currentUser?.email).map(p => p.book_id);
  
  const potentialBuddies = allProgress
    .filter(p => p.created_by !== currentUser?.email)
    .reduce((acc, progress) => {
      if (myBooks.includes(progress.book_id)) {
        const existing = acc.find(b => b.email === progress.created_by);
        if (existing) {
          existing.sharedBooks.push(progress.book_id);
        } else {
          acc.push({
            email: progress.created_by,
            name: progress.created_by.split('@')[0],
            sharedBooks: [progress.book_id]
          });
        }
      }
      return acc;
    }, [])
    .sort((a, b) => b.sharedBooks.length - a.sharedBooks.length)
    .slice(0, 10);

  const getSharedBookTitles = (buddy) => {
    return buddy.sharedBooks
      .map(bookId => books.find(b => b.id === bookId)?.title)
      .filter(Boolean)
      .slice(0, 3);
  };

  const handleConnect = (buddy) => {
    toast.success(`Connection request sent to ${buddy.name}!`);
    // In a real implementation, this would create a connection record
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-serif font-semibold text-slate-900 mb-2">Reading Buddies</h2>
          <p className="text-slate-600">Connect with readers who share your taste</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Users className="w-4 h-4" />
          <span>{potentialBuddies.length} potential matches</span>
        </div>
      </div>

      {potentialBuddies.length > 0 ? (
        <div className="grid gap-4">
          {potentialBuddies.map((buddy, idx) => (
            <motion.div
              key={buddy.email}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start gap-4">
                <Avatar className="h-12 w-12">
                  <AvatarFallback className="bg-gradient-to-br from-violet-400 to-purple-500 text-white font-semibold">
                    {buddy.name.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-slate-900">{buddy.name}</h3>
                    <Badge variant="outline" className="text-xs">
                      {buddy.sharedBooks.length} {buddy.sharedBooks.length === 1 ? 'book' : 'books'} in common
                    </Badge>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mb-3">
                    {getSharedBookTitles(buddy).map((title, i) => (
                      <Badge key={i} className="bg-amber-100 text-amber-700 text-xs">
                        <BookOpen className="w-3 h-3 mr-1" />
                        {title}
                      </Badge>
                    ))}
                    {buddy.sharedBooks.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{buddy.sharedBooks.length - 3} more
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      onClick={() => handleConnect(buddy)}
                      className="bg-violet-600 hover:bg-violet-700"
                    >
                      <UserPlus className="w-4 h-4 mr-2" />
                      Connect
                    </Button>
                    <Button size="sm" variant="outline">
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Message
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-violet-100 flex items-center justify-center">
            <Users className="w-8 h-8 text-violet-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">No reading buddies yet</h3>
          <p className="text-slate-500 max-w-md mx-auto">
            Start reading books to find other readers with similar interests. 
            We'll match you with people reading the same books!
          </p>
        </div>
      )}
    </div>
  );
}