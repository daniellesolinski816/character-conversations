import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import { ArrowLeft, BookOpen, Send, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { format } from 'date-fns';

export default function Discussion() {
  const urlParams = new URLSearchParams(window.location.search);
  const discussionId = urlParams.get('id');
  const queryClient = useQueryClient();
  const [reply, setReply] = useState('');

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: discussion, isLoading } = useQuery({
    queryKey: ['discussion', discussionId],
    queryFn: () => base44.entities.ClubDiscussion.filter({ id: discussionId }).then(res => res[0]),
    enabled: !!discussionId,
  });

  const { data: book } = useQuery({
    queryKey: ['book', discussion?.book_id],
    queryFn: () => base44.entities.Book.filter({ id: discussion.book_id }).then(res => res[0]),
    enabled: !!discussion?.book_id,
  });

  const addReplyMutation = useMutation({
    mutationFn: async (content) => {
      const newReply = {
        content,
        author_name: user?.full_name,
        author_email: user?.email,
        created_at: new Date().toISOString()
      };
      await base44.entities.ClubDiscussion.update(discussionId, {
        replies: [...(discussion.replies || []), newReply]
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['discussion', discussionId]);
      setReply('');
    },
  });

  const handleSubmitReply = () => {
    if (!reply.trim()) return;
    addReplyMutation.mutate(reply.trim());
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50/50 via-white to-rose-50/30 flex items-center justify-center">
        <div className="animate-pulse">Loading...</div>
      </div>
    );
  }

  if (!discussion) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50/50 via-white to-rose-50/30 flex items-center justify-center">
        <p className="text-slate-500">Discussion not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50/50 via-white to-rose-50/30 py-8">
      <div className="max-w-3xl mx-auto px-6">
        <Link to={createPageUrl(`ClubDetail?id=${discussion.club_id}`)}>
          <Button variant="ghost" size="sm" className="mb-6 -ml-2 gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Club
          </Button>
        </Link>

        {/* Main Post */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6 mb-8">
          {book && (
            <div className="flex items-center gap-3 mb-4 pb-4 border-b border-slate-100">
              {book.cover_image && (
                <img src={book.cover_image} alt={book.title} className="w-10 h-14 object-cover rounded-lg" />
              )}
              <div>
                <p className="text-xs text-slate-500">Discussing</p>
                <p className="font-medium text-slate-900">{book.title}</p>
              </div>
            </div>
          )}

          <h1 className="text-2xl font-serif font-semibold text-slate-900 mb-4">{discussion.title}</h1>
          <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">{discussion.content}</p>

          <div className="flex items-center gap-3 mt-6 pt-4 border-t border-slate-100">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center text-amber-700 font-medium text-sm">
              {discussion.author_name?.[0] || 'U'}
            </div>
            <div>
              <p className="text-sm font-medium text-slate-900">{discussion.author_name}</p>
              <p className="text-xs text-slate-500">
                {format(new Date(discussion.created_date), 'MMM d, yyyy')}
              </p>
            </div>
          </div>
        </div>

        {/* Replies */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">
            Replies ({discussion.replies?.length || 0})
          </h2>

          {discussion.replies?.length > 0 ? (
            <div className="space-y-4">
              {discussion.replies.map((r, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="bg-white rounded-xl border border-slate-100 p-5"
                >
                  <p className="text-slate-600 leading-relaxed mb-4">{r.content}</p>
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 text-xs font-medium">
                      {r.author_name?.[0] || 'U'}
                    </div>
                    <p className="text-sm text-slate-500">
                      {r.author_name} • {format(new Date(r.created_at), 'MMM d')}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 bg-white rounded-xl border border-slate-100">
              <p className="text-slate-500">No replies yet. Be the first to respond!</p>
            </div>
          )}
        </div>

        {/* Add Reply */}
        <div className="bg-white rounded-2xl border border-slate-100 p-5">
          <h3 className="font-semibold text-slate-900 mb-3">Add your reply</h3>
          <Textarea
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            placeholder="Share your thoughts..."
            rows={4}
            className="mb-3"
          />
          <div className="flex justify-end">
            <Button 
              onClick={handleSubmitReply}
              disabled={!reply.trim() || addReplyMutation.isPending}
              className="bg-amber-600 hover:bg-amber-700 gap-2"
            >
              <Send className="w-4 h-4" />
              Post Reply
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}