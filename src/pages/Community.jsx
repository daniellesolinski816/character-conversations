import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { 
  MessageSquare, Users, BookOpen, Trophy, Sparkles, 
  TrendingUp, Calendar, Award, Star, Clock, Compass, Heart
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { format, isToday, isYesterday } from 'date-fns';
import CharacterAvatar from '@/components/CharacterAvatar';
import DiscoverBooks from '@/components/community/DiscoverBooks';
import ReadingBuddies from '@/components/community/ReadingBuddies';

const eventIcons = {
  new_discussion: MessageSquare,
  shared_chat: BookOpen,
  book_completed: Trophy,
  badge_earned: Award,
  club_created: Users,
  member_joined: Users,
};

const eventColors = {
  new_discussion: 'bg-blue-100 text-blue-600',
  shared_chat: 'bg-purple-100 text-purple-600',
  book_completed: 'bg-green-100 text-green-600',
  badge_earned: 'bg-amber-100 text-amber-600',
  club_created: 'bg-rose-100 text-rose-600',
  member_joined: 'bg-teal-100 text-teal-600',
};

function formatEventDate(dateStr) {
  const date = new Date(dateStr);
  if (isToday(date)) return 'Today';
  if (isYesterday(date)) return 'Yesterday';
  return format(date, 'MMM d');
}

export default function Community() {
  const { data: events = [] } = useQuery({
    queryKey: ['community-events'],
    queryFn: () => base44.entities.CommunityEvent.list('-created_date', 50),
  });

  const { data: discussions = [] } = useQuery({
    queryKey: ['all-discussions'],
    queryFn: () => base44.entities.ClubDiscussion.list('-created_date', 10),
  });

  const { data: sharedChats = [] } = useQuery({
    queryKey: ['all-shared-chats'],
    queryFn: () => base44.entities.CharacterChat.filter({ is_shared: true }, '-created_date', 10),
  });

  const { data: books = [] } = useQuery({
    queryKey: ['books'],
    queryFn: () => base44.entities.Book.list(),
  });

  const { data: clubs = [] } = useQuery({
    queryKey: ['clubs'],
    queryFn: () => base44.entities.BookClub.list('-created_date', 5),
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50/50 via-white to-rose-50/30 py-8">
      <div className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-serif font-semibold text-slate-900 mb-2">Community</h1>
          <p className="text-slate-500">See what's happening in the BookChat community</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Feed */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="feed">
              <TabsList className="mb-6 grid grid-cols-2 md:grid-cols-5 w-full">
                <TabsTrigger value="feed" className="gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Activity
                </TabsTrigger>
                <TabsTrigger value="discover" className="gap-2">
                  <Compass className="w-4 h-4" />
                  Discover
                </TabsTrigger>
                <TabsTrigger value="buddies" className="gap-2">
                  <Heart className="w-4 h-4" />
                  Buddies
                </TabsTrigger>
                <TabsTrigger value="discussions" className="gap-2">
                  <MessageSquare className="w-4 h-4" />
                  Discussions
                </TabsTrigger>
                <TabsTrigger value="chats" className="gap-2">
                  <Sparkles className="w-4 h-4" />
                  Chats
                </TabsTrigger>
              </TabsList>

              <TabsContent value="feed">
                {events.length > 0 ? (
                  <div className="space-y-4">
                    {events.map((event, idx) => {
                      const Icon = eventIcons[event.type] || Star;
                      return (
                        <motion.div
                          key={event.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.05 }}
                          className="bg-white rounded-xl p-4 border border-slate-100 hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-start gap-4">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${eventColors[event.type]}`}>
                              <Icon className="w-5 h-5" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-slate-900">{event.title}</p>
                              <p className="text-sm text-slate-500 mt-1">{event.description}</p>
                              <div className="flex items-center gap-3 mt-2 text-xs text-slate-400">
                                <span>{event.user_name}</span>
                                <span>•</span>
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {formatEventDate(event.created_date)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-16 bg-white rounded-2xl border border-slate-100">
                    <TrendingUp className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">No activity yet</h3>
                    <p className="text-slate-500">Start reading and chatting to create activity!</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="discover">
                <DiscoverBooks />
              </TabsContent>

              <TabsContent value="buddies">
                <ReadingBuddies />
              </TabsContent>

              <TabsContent value="discussions">
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
                            <h3 className="font-semibold text-slate-900 mb-2">{discussion.title}</h3>
                            <p className="text-sm text-slate-500 line-clamp-2 mb-3">{discussion.content}</p>
                            <div className="flex items-center gap-4 text-xs text-slate-400">
                              {book && (
                                <span className="flex items-center gap-1">
                                  <BookOpen className="w-3 h-3" />
                                  {book.title}
                                </span>
                              )}
                              <span className="flex items-center gap-1">
                                <MessageSquare className="w-3 h-3" />
                                {discussion.replies?.length || 0} replies
                              </span>
                              <span>{discussion.author_name}</span>
                            </div>
                          </div>
                        </Link>
                      </motion.div>
                    );
                  })}
                </div>
              </TabsContent>

              <TabsContent value="chats">
                <div className="space-y-4">
                  {sharedChats.map((chat, idx) => {
                    const book = books.find(b => b.id === chat.book_id);
                    return (
                      <motion.div
                        key={chat.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="bg-white rounded-xl p-5 border border-slate-100"
                      >
                        <div className="flex items-start gap-4">
                          <CharacterAvatar name={chat.character_name} size="md" />
                          <div className="flex-1">
                            <h3 className="font-semibold text-slate-900">
                              Chat with {chat.character_name}
                            </h3>
                            {book && (
                              <p className="text-xs text-amber-600 mt-1">from {book.title}</p>
                            )}
                            <p className="text-sm text-slate-500 mt-2">
                              {chat.messages?.length || 0} messages exchanged
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Active Clubs */}
            <div className="bg-white rounded-2xl border border-slate-100 p-5">
              <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-amber-600" />
                Active Clubs
              </h3>
              <div className="space-y-3">
                {clubs.slice(0, 5).map((club) => (
                  <Link key={club.id} to={createPageUrl(`ClubDetail?id=${club.id}`)}>
                    <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 transition-colors">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center">
                        <BookOpen className="w-5 h-5 text-amber-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-slate-900 text-sm truncate">{club.name}</p>
                        <p className="text-xs text-slate-500">{club.members?.length || 0} members</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
              <Link to={createPageUrl('BookClubs')}>
                <Button variant="outline" className="w-full mt-4">
                  View All Clubs
                </Button>
              </Link>
            </div>

            {/* Challenges */}
            <div className="bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl p-5 text-white">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <Trophy className="w-5 h-5" />
                Weekly Challenges
              </h3>
              <p className="text-amber-100 text-sm mb-4">
                Complete challenges to earn badges and rewards!
              </p>
              <Link to={createPageUrl('Challenges')}>
                <Button className="w-full bg-white text-amber-600 hover:bg-amber-50">
                  View Challenges
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}