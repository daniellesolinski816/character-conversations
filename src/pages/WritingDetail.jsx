import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, PenLine, MessageCircle, Users, Trash2, Lightbulb } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ReactMarkdown from 'react-markdown';
import CharacterAvatar from '@/components/CharacterAvatar';
import WritingCharacterChat from '@/components/WritingCharacterChat';
import DiscussionQuestions from '@/components/DiscussionQuestions';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function WritingDetail() {
  const urlParams = new URLSearchParams(window.location.search);
  const writingId = urlParams.get('id');

  const [selectedCharacter, setSelectedCharacter] = useState(null);

  const { data: writing, isLoading } = useQuery({
    queryKey: ['user-writing', writingId],
    queryFn: () => base44.entities.UserWriting.filter({ id: writingId }).then(res => res[0]),
    enabled: !!writingId,
  });

  const handleDelete = async () => {
    await base44.entities.UserWriting.delete(writingId);
    window.location.href = createPageUrl('Home');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50/50 via-white to-purple-50/30 flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <PenLine className="w-12 h-12 text-violet-300" />
          <p className="text-slate-500">Loading...</p>
        </div>
      </div>
    );
  }

  if (!writing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50/50 via-white to-purple-50/30 flex items-center justify-center">
        <div className="text-center">
          <PenLine className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500">Writing not found</p>
          <Link to={createPageUrl('Home')}>
            <Button variant="link" className="mt-4">Go back home</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50/50 via-white to-purple-50/30">
      {/* Header */}
      <div className="bg-gradient-to-r from-violet-600 to-purple-600 text-white">
        <div className="max-w-5xl mx-auto px-6 py-8">
          <div className="flex items-start gap-4">
            <Link to={createPageUrl('Home')}>
              <Button variant="ghost" size="icon" className="text-white/80 hover:text-white hover:bg-white/10">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2.5 py-1 text-xs font-medium bg-white/20 rounded-full capitalize">
                  {writing.genre || 'Writing'}
                </span>
                <span className="px-2.5 py-1 text-xs font-medium bg-violet-400/30 rounded-full">
                  Your Creation
                </span>
              </div>
              <h1 className="text-3xl font-serif font-semibold">{writing.title}</h1>
            </div>
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="icon" className="text-white/60 hover:text-red-300 hover:bg-white/10">
                  <Trash2 className="w-5 h-5" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete this writing?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete "{writing.title}" and all associated character chats.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Characters Section */}
        {writing.characters?.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-10"
          >
            <h2 className="text-xl font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-violet-600" />
              Chat with Your Characters
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {writing.characters.map((character, idx) => (
                <motion.button
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  onClick={() => setSelectedCharacter(character)}
                  className="bg-white rounded-2xl p-5 border border-slate-100 hover:border-violet-300 hover:shadow-lg transition-all text-left group"
                >
                  <div className="flex items-start gap-4">
                    <CharacterAvatar name={character.name} size="lg" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-slate-900 group-hover:text-violet-700 transition-colors">
                          {character.name}
                        </h3>
                        {character.role && (
                          <span className="px-2 py-0.5 text-[10px] font-medium uppercase bg-violet-100 text-violet-700 rounded-full">
                            {character.role}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-slate-500 line-clamp-2 mt-1">
                        {character.short_description || character.description}
                      </p>
                      {character.personality_traits && (
                        <p className="text-xs text-slate-400 mt-1 line-clamp-1">
                          {character.personality_traits}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-4 text-violet-600 text-sm font-medium">
                    <MessageCircle className="w-4 h-4" />
                    Start Conversation
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.section>
        )}

        {/* Writing Preview */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-xl font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <PenLine className="w-5 h-5 text-violet-600" />
            Your Writing
          </h2>
          <div className="bg-white rounded-2xl border border-slate-100 p-6 md:p-8">
            <div className="prose prose-slate max-w-none">
              <ReactMarkdown>
                {writing.content}
              </ReactMarkdown>
            </div>
          </div>
        </motion.section>

        {/* Discussion Questions */}
        {writing.discussion_questions && writing.discussion_questions.length > 0 && (
          <motion.section
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-10"
          >
            <DiscussionQuestions discussion={writing.discussion_questions} />
          </motion.section>
        )}
      </div>

      {/* Character Chat Panel */}
      <AnimatePresence>
        {selectedCharacter && (
          <WritingCharacterChat
            writing={writing}
            character={selectedCharacter}
            onClose={() => setSelectedCharacter(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}