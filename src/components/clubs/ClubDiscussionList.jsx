import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { MessageSquare, BookOpen, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { motion } from 'framer-motion';

export default function ClubDiscussionList({ discussions, books, clubId }) {
  if (discussions.length === 0) {
    return (
      <div className="text-center py-16 bg-white rounded-2xl border border-slate-100">
        <MessageSquare className="w-16 h-16 text-slate-200 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-slate-900 mb-2">No discussions yet</h3>
        <p className="text-slate-500">Start a conversation about your current read!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {discussions.map((discussion, idx) => {
        const book = books.find(b => b.id === discussion.book_id);
        
        return (
          <motion.div
            key={discussion.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
          >
            <Link to={createPageUrl(`Discussion?id=${discussion.id}`)}>
              <div className="bg-white rounded-xl p-5 border border-slate-100 hover:shadow-md transition-shadow">
                <div className="flex items-start gap-4">
                  {book?.cover_image && (
                    <img 
                      src={book.cover_image} 
                      alt={book.title}
                      className="w-12 h-16 object-cover rounded-lg shrink-0"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-slate-900 mb-1">{discussion.title}</h3>
                    <p className="text-sm text-slate-500 line-clamp-2 mb-3">{discussion.content}</p>
                    <div className="flex items-center gap-4 text-xs text-slate-400">
                      <span className="flex items-center gap-1">
                        <BookOpen className="w-3 h-3" />
                        {book?.title || 'General'}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageSquare className="w-3 h-3" />
                        {discussion.replies?.length || 0} replies
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {format(new Date(discussion.created_date), 'MMM d')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>
        );
      })}
    </div>
  );
}