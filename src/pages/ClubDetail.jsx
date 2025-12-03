import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Users, BookOpen, MessageSquare, Plus, Lock, Globe, Settings, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import ClubDiscussionList from '@/components/clubs/ClubDiscussionList';
import CreateDiscussionModal from '@/components/clubs/CreateDiscussionModal';
import SharedChatsPanel from '@/components/clubs/SharedChatsPanel';

export default function ClubDetail() {
  const urlParams = new URLSearchParams(window.location.search);
  const clubId = urlParams.get('id');
  const queryClient = useQueryClient();
  const [showCreateDiscussion, setShowCreateDiscussion] = useState(false);
  const [copied, setCopied] = useState(false);

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: club, isLoading } = useQuery({
    queryKey: ['book-club', clubId],
    queryFn: () => base44.entities.BookClub.filter({ id: clubId }).then(res => res[0]),
    enabled: !!clubId,
  });

  const { data: discussions = [] } = useQuery({
    queryKey: ['club-discussions', clubId],
    queryFn: () => base44.entities.ClubDiscussion.filter({ club_id: clubId }, '-created_date'),
    enabled: !!clubId,
  });

  const { data: books = [] } = useQuery({
    queryKey: ['books'],
    queryFn: () => base44.entities.Book.list(),
  });

  const { data: sharedChats = [] } = useQuery({
    queryKey: ['shared-chats', clubId],
    queryFn: async () => {
      const allChats = await base44.entities.CharacterChat.filter({ is_shared: true });
      return allChats.filter(chat => chat.shared_with_clubs?.includes(clubId));
    },
    enabled: !!clubId,
  });

  const isAdmin = club?.members?.find(m => m.email === user?.email)?.role === 'admin';
  const currentBook = books.find(b => b.id === club?.current_book_id);

  const copyJoinCode = () => {
    if (club?.join_code) {
      navigator.clipboard.writeText(club.join_code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50/50 via-white to-rose-50/30 flex items-center justify-center">
        <div className="animate-pulse">Loading...</div>
      </div>
    );
  }

  if (!club) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50/50 via-white to-rose-50/30 flex items-center justify-center">
        <div className="text-center">
          <Users className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500">Club not found</p>
          <Link to={createPageUrl('BookClubs')}>
            <Button variant="link" className="mt-4">Back to Clubs</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50/50 via-white to-rose-50/30">
      {/* Header */}
      <div className="bg-white border-b border-slate-100">
        <div className="max-w-5xl mx-auto px-6 py-6">
          <Link to={createPageUrl('BookClubs')}>
            <Button variant="ghost" size="sm" className="mb-4 -ml-2 gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Clubs
            </Button>
          </Link>

          <div className="flex flex-col md:flex-row md:items-center gap-6">
            {club.cover_image ? (
              <img src={club.cover_image} alt={club.name} className="w-24 h-24 rounded-2xl object-cover" />
            ) : (
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center">
                <BookOpen className="w-10 h-10 text-amber-400" />
              </div>
            )}

            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                {club.is_private ? (
                  <Lock className="w-4 h-4 text-amber-600" />
                ) : (
                  <Globe className="w-4 h-4 text-green-600" />
                )}
                <h1 className="text-2xl font-serif font-semibold text-slate-900">{club.name}</h1>
              </div>
              <p className="text-slate-500 mb-3">{club.description}</p>
              <div className="flex items-center gap-4 text-sm text-slate-500">
                <span className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  {club.members?.length || 0} members
                </span>
                <span className="flex items-center gap-1">
                  <MessageSquare className="w-4 h-4" />
                  {discussions.length} discussions
                </span>
              </div>
            </div>

            {club.is_private && isAdmin && (
              <div className="bg-amber-50 rounded-xl p-4 border border-amber-200">
                <p className="text-xs text-amber-600 mb-2">Join Code</p>
                <div className="flex items-center gap-2">
                  <code className="font-mono font-bold text-lg tracking-wider">{club.join_code}</code>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={copyJoinCode}>
                    {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-6 py-8">
        <Tabs defaultValue="discussions">
          <TabsList className="mb-6">
            <TabsTrigger value="discussions" className="gap-2">
              <MessageSquare className="w-4 h-4" />
              Discussions
            </TabsTrigger>
            <TabsTrigger value="shared" className="gap-2">
              <BookOpen className="w-4 h-4" />
              Shared Chats
            </TabsTrigger>
            <TabsTrigger value="members" className="gap-2">
              <Users className="w-4 h-4" />
              Members
            </TabsTrigger>
          </TabsList>

          <TabsContent value="discussions">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold text-slate-900">Club Discussions</h2>
              <Button onClick={() => setShowCreateDiscussion(true)} className="bg-amber-600 hover:bg-amber-700 gap-2">
                <Plus className="w-4 h-4" />
                Start Discussion
              </Button>
            </div>
            <ClubDiscussionList 
              discussions={discussions} 
              books={books}
              clubId={clubId}
            />
          </TabsContent>

          <TabsContent value="shared">
            <SharedChatsPanel 
              sharedChats={sharedChats}
              books={books}
              clubId={clubId}
            />
          </TabsContent>

          <TabsContent value="members">
            <div className="bg-white rounded-2xl border border-slate-100 divide-y divide-slate-100">
              {club.members?.map((member, idx) => (
                <div key={idx} className="p-4 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center font-medium text-amber-700">
                    {member.name?.[0] || member.email[0].toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-slate-900">{member.name || member.email}</p>
                    <p className="text-sm text-slate-500">{member.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <CreateDiscussionModal
        open={showCreateDiscussion}
        onOpenChange={setShowCreateDiscussion}
        clubId={clubId}
        books={books}
        userName={user?.full_name}
        userEmail={user?.email}
        onCreated={() => queryClient.invalidateQueries(['club-discussions', clubId])}
      />
    </div>
  );
}