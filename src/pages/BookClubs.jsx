import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Plus, Users, Lock, Globe, Search, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import CreateClubModal from '@/components/clubs/CreateClubModal';
import JoinClubModal from '@/components/clubs/JoinClubModal';

export default function BookClubs() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: clubs = [], isLoading } = useQuery({
    queryKey: ['book-clubs'],
    queryFn: () => base44.entities.BookClub.list('-created_date'),
  });

  const myClubs = clubs.filter(club => 
    club.members?.some(m => m.email === user?.email)
  );

  const publicClubs = clubs.filter(club => 
    !club.is_private && !myClubs.find(mc => mc.id === club.id)
  );

  const filteredPublicClubs = publicClubs.filter(club =>
    club.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    club.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const joinClubMutation = useMutation({
    mutationFn: async (club) => {
      const newMember = {
        email: user.email,
        name: user.full_name,
        role: 'member',
        joined_at: new Date().toISOString()
      };
      await base44.entities.BookClub.update(club.id, {
        members: [...(club.members || []), newMember]
      });
    },
    onSuccess: () => queryClient.invalidateQueries(['book-clubs']),
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50/50 via-white to-rose-50/30 py-12">
      <div className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
          <div>
            <h1 className="text-3xl font-serif font-semibold text-slate-900">Book Clubs</h1>
            <p className="text-slate-500 mt-1">Join or create clubs to discuss books together</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setShowJoinModal(true)} className="gap-2">
              <Users className="w-4 h-4" />
              Join with Code
            </Button>
            <Button onClick={() => setShowCreateModal(true)} className="bg-amber-600 hover:bg-amber-700 gap-2">
              <Plus className="w-4 h-4" />
              Create Club
            </Button>
          </div>
        </div>

        {/* My Clubs */}
        {myClubs.length > 0 && (
          <section className="mb-12">
            <h2 className="text-xl font-semibold text-slate-900 mb-6 flex items-center gap-2">
              <Users className="w-5 h-5 text-amber-600" />
              My Clubs
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myClubs.map((club, idx) => (
                <motion.div
                  key={club.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <Link to={createPageUrl(`ClubDetail?id=${club.id}`)}>
                    <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow border border-slate-100">
                      {club.cover_image ? (
                        <img src={club.cover_image} alt={club.name} className="w-full h-32 object-cover" />
                      ) : (
                        <div className="w-full h-32 bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center">
                          <BookOpen className="w-12 h-12 text-amber-300" />
                        </div>
                      )}
                      <div className="p-5">
                        <div className="flex items-center gap-2 mb-2">
                          {club.is_private ? (
                            <Lock className="w-4 h-4 text-slate-400" />
                          ) : (
                            <Globe className="w-4 h-4 text-green-500" />
                          )}
                          <h3 className="font-semibold text-slate-900">{club.name}</h3>
                        </div>
                        <p className="text-sm text-slate-500 line-clamp-2 mb-3">{club.description}</p>
                        <div className="flex items-center gap-2 text-xs text-slate-400">
                          <Users className="w-3 h-3" />
                          <span>{club.members?.length || 0} members</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </section>
        )}

        {/* Discover Public Clubs */}
        <section>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <h2 className="text-xl font-semibold text-slate-900 flex items-center gap-2">
              <Globe className="w-5 h-5 text-amber-600" />
              Discover Clubs
            </h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search clubs..."
                className="pl-10 w-64 rounded-full"
              />
            </div>
          </div>

          {filteredPublicClubs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPublicClubs.map((club, idx) => (
                <motion.div
                  key={club.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow border border-slate-100"
                >
                  {club.cover_image ? (
                    <img src={club.cover_image} alt={club.name} className="w-full h-32 object-cover" />
                  ) : (
                    <div className="w-full h-32 bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
                      <BookOpen className="w-12 h-12 text-slate-300" />
                    </div>
                  )}
                  <div className="p-5">
                    <h3 className="font-semibold text-slate-900 mb-2">{club.name}</h3>
                    <p className="text-sm text-slate-500 line-clamp-2 mb-4">{club.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-400 flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {club.members?.length || 0} members
                      </span>
                      <Button 
                        size="sm" 
                        onClick={(e) => {
                          e.preventDefault();
                          joinClubMutation.mutate(club);
                        }}
                        className="bg-amber-600 hover:bg-amber-700"
                      >
                        Join
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-2xl border border-slate-100">
              <Users className="w-16 h-16 text-slate-200 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">No clubs found</h3>
              <p className="text-slate-500 mb-6">Be the first to create a book club!</p>
              <Button onClick={() => setShowCreateModal(true)} className="bg-amber-600 hover:bg-amber-700">
                Create Club
              </Button>
            </div>
          )}
        </section>
      </div>

      <CreateClubModal 
        open={showCreateModal} 
        onOpenChange={setShowCreateModal}
        onCreated={() => queryClient.invalidateQueries(['book-clubs'])}
        userEmail={user?.email}
        userName={user?.full_name}
      />

      <JoinClubModal
        open={showJoinModal}
        onOpenChange={setShowJoinModal}
        clubs={clubs}
        onJoin={(club) => joinClubMutation.mutate(club)}
        userEmail={user?.email}
      />
    </div>
  );
}