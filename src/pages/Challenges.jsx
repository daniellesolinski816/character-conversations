import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { 
  Trophy, Star, BookOpen, MessageSquare, Users, 
  Flame, Target, Award, Lock, CheckCircle, Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

const BADGES = [
  { id: 'first_book', name: 'First Steps', description: 'Complete your first book section', icon: '📖', requirement: { type: 'sections', count: 1 } },
  { id: 'bookworm', name: 'Bookworm', description: 'Read 10 sections', icon: '🐛', requirement: { type: 'sections', count: 10 } },
  { id: 'scholar', name: 'Scholar', description: 'Read 50 sections', icon: '🎓', requirement: { type: 'sections', count: 50 } },
  { id: 'first_chat', name: 'Hello There', description: 'Have your first character chat', icon: '💬', requirement: { type: 'chats', count: 1 } },
  { id: 'social_butterfly', name: 'Social Butterfly', description: 'Chat with 10 different characters', icon: '🦋', requirement: { type: 'chats', count: 10 } },
  { id: 'discussion_starter', name: 'Discussion Starter', description: 'Start your first discussion', icon: '🗣️', requirement: { type: 'discussions', count: 1 } },
  { id: 'community_pillar', name: 'Community Pillar', description: 'Participate in 20 discussions', icon: '🏛️', requirement: { type: 'discussions', count: 20 } },
  { id: 'streak_3', name: 'On Fire', description: 'Maintain a 3-day reading streak', icon: '🔥', requirement: { type: 'streak', count: 3 } },
  { id: 'streak_7', name: 'Week Warrior', description: 'Maintain a 7-day reading streak', icon: '⚔️', requirement: { type: 'streak', count: 7 } },
  { id: 'streak_30', name: 'Dedicated Reader', description: 'Maintain a 30-day reading streak', icon: '👑', requirement: { type: 'streak', count: 30 } },
];

const WEEKLY_CHALLENGES = [
  { id: 'read_5', name: 'Weekly Reader', description: 'Read 5 sections this week', target: 5, type: 'sections' },
  { id: 'chat_3', name: 'Conversationalist', description: 'Have 3 character chats this week', target: 3, type: 'chats' },
  { id: 'discuss_1', name: 'Join the Talk', description: 'Participate in a discussion', target: 1, type: 'discussions' },
];

export default function Challenges() {
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: profiles = [] } = useQuery({
    queryKey: ['user-profile'],
    queryFn: () => base44.entities.UserProfile.list(),
    enabled: !!user,
  });

  const { data: progress = [] } = useQuery({
    queryKey: ['all-progress'],
    queryFn: () => base44.entities.ReadingProgress.list(),
  });

  const { data: chats = [] } = useQuery({
    queryKey: ['all-chats'],
    queryFn: () => base44.entities.CharacterChat.list(),
  });

  const { data: discussions = [] } = useQuery({
    queryKey: ['my-discussions'],
    queryFn: () => base44.entities.ClubDiscussion.list(),
  });

  const profile = profiles[0];

  const createProfileMutation = useMutation({
    mutationFn: (data) => base44.entities.UserProfile.create(data),
    onSuccess: () => queryClient.invalidateQueries(['user-profile']),
  });

  const updateProfileMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.UserProfile.update(id, data),
    onSuccess: () => queryClient.invalidateQueries(['user-profile']),
  });

  // Calculate stats
  const totalSectionsRead = progress.reduce((sum, p) => sum + (p.current_chapter || 0), 0);
  const totalChats = chats.length;
  const totalDiscussions = discussions.filter(d => d.author_email === user?.email).length;
  const currentStreak = profile?.current_streak || 0;

  // Check badge requirements
  const getProgress = (badge) => {
    const req = badge.requirement;
    let current = 0;
    let target = req.count;

    switch (req.type) {
      case 'sections': current = totalSectionsRead; break;
      case 'chats': current = totalChats; break;
      case 'discussions': current = totalDiscussions; break;
      case 'streak': current = currentStreak; break;
    }

    return { current, target, percentage: Math.min(100, (current / target) * 100), earned: current >= target };
  };

  const earnedBadges = profile?.badges || [];
  const earnedBadgeIds = earnedBadges.map(b => b.id);

  // Weekly progress
  const weeklyProgress = profile?.weekly_progress || { sections_read: 0, chats_completed: 0 };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50/50 via-white to-rose-50/30 py-8">
      <div className="max-w-5xl mx-auto px-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-serif font-semibold text-slate-900 mb-2">Challenges & Rewards</h1>
          <p className="text-slate-500">Complete challenges and earn badges to show your dedication</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-2xl p-5 border border-slate-100 text-center">
            <BookOpen className="w-8 h-8 text-amber-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-slate-900">{totalSectionsRead}</p>
            <p className="text-sm text-slate-500">Sections Read</p>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-slate-100 text-center">
            <MessageSquare className="w-8 h-8 text-purple-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-slate-900">{totalChats}</p>
            <p className="text-sm text-slate-500">Character Chats</p>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-slate-100 text-center">
            <Users className="w-8 h-8 text-blue-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-slate-900">{totalDiscussions}</p>
            <p className="text-sm text-slate-500">Discussions</p>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-slate-100 text-center">
            <Flame className="w-8 h-8 text-orange-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-slate-900">{currentStreak}</p>
            <p className="text-sm text-slate-500">Day Streak</p>
          </div>
        </div>

        {/* Weekly Challenges */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold text-slate-900 mb-6 flex items-center gap-2">
            <Target className="w-5 h-5 text-amber-600" />
            Weekly Challenges
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {WEEKLY_CHALLENGES.map((challenge) => {
              let current = 0;
              if (challenge.type === 'sections') current = weeklyProgress.sections_read || 0;
              if (challenge.type === 'chats') current = weeklyProgress.chats_completed || 0;
              if (challenge.type === 'discussions') current = totalDiscussions;
              
              const percentage = Math.min(100, (current / challenge.target) * 100);
              const completed = current >= challenge.target;

              return (
                <motion.div
                  key={challenge.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn(
                    "bg-white rounded-2xl p-5 border-2 transition-all",
                    completed ? "border-green-400 bg-green-50" : "border-slate-100"
                  )}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-slate-900">{challenge.name}</h3>
                      <p className="text-sm text-slate-500">{challenge.description}</p>
                    </div>
                    {completed && <CheckCircle className="w-6 h-6 text-green-500" />}
                  </div>
                  <div className="space-y-2">
                    <Progress value={percentage} className="h-2" />
                    <p className="text-xs text-slate-500 text-right">
                      {current} / {challenge.target}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* Badges */}
        <section>
          <h2 className="text-xl font-semibold text-slate-900 mb-6 flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-600" />
            Badges & Achievements
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {BADGES.map((badge, idx) => {
              const prog = getProgress(badge);
              const isEarned = earnedBadgeIds.includes(badge.id) || prog.earned;

              return (
                <motion.div
                  key={badge.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.05 }}
                  className={cn(
                    "relative bg-white rounded-2xl p-5 border-2 text-center transition-all",
                    isEarned 
                      ? "border-amber-400 shadow-lg shadow-amber-100" 
                      : "border-slate-100 opacity-70"
                  )}
                >
                  {!isEarned && (
                    <div className="absolute top-2 right-2">
                      <Lock className="w-4 h-4 text-slate-300" />
                    </div>
                  )}
                  <div className={cn(
                    "text-4xl mb-3",
                    !isEarned && "grayscale"
                  )}>
                    {badge.icon}
                  </div>
                  <h3 className="font-semibold text-slate-900 text-sm">{badge.name}</h3>
                  <p className="text-xs text-slate-500 mt-1">{badge.description}</p>
                  
                  {!isEarned && (
                    <div className="mt-3">
                      <Progress value={prog.percentage} className="h-1.5" />
                      <p className="text-[10px] text-slate-400 mt-1">
                        {prog.current} / {prog.target}
                      </p>
                    </div>
                  )}
                  
                  {isEarned && (
                    <div className="mt-2 flex items-center justify-center gap-1 text-amber-600">
                      <Sparkles className="w-3 h-3" />
                      <span className="text-xs font-medium">Earned!</span>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}