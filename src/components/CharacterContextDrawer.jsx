import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, TrendingUp, Calendar, Users, Heart, AlertCircle, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function CharacterContextDrawer({ character, allCharacters, open, onClose }) {
  if (!open || !character) return null;

  const arc = character.emotional_arc;
  const events = character.canon_events || [];
  const relationships = character.relationships || [];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ x: '-100%' }}
        animate={{ x: 0 }}
        exit={{ x: '-100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="fixed inset-y-0 left-0 w-80 bg-white shadow-2xl z-40 flex flex-col border-r border-slate-200"
      >
        <div className="bg-gradient-to-r from-violet-600 to-purple-600 text-white px-4 py-3 flex items-center justify-between">
          <h3 className="font-semibold text-sm">Character Context</h3>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 text-white/80 hover:text-white hover:bg-white/10">
            <X className="w-4 h-4" />
          </Button>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-4 space-y-4">
            {/* Emotional Arc */}
            {arc && (
              <div className="space-y-3">
                <h4 className="font-medium text-slate-900 flex items-center gap-2 text-sm">
                  <TrendingUp className="w-4 h-4 text-green-600" />
                  Emotional Arc
                </h4>
                
                <div className="bg-rose-50 rounded-lg p-3">
                  <p className="text-xs font-medium text-rose-700 mb-1">Starting State</p>
                  <p className="text-xs text-slate-600">{arc.starting_state || 'Not defined'}</p>
                </div>

                {arc.growth_points?.length > 0 && (
                  <div className="bg-green-50 rounded-lg p-3">
                    <p className="text-xs font-medium text-green-700 mb-1">Growth Points</p>
                    <ul className="space-y-1">
                      {arc.growth_points.map((point, idx) => (
                        <li key={idx} className="text-xs text-slate-600 flex items-start gap-1">
                          <span className="text-green-500 mt-0.5">•</span>
                          {point}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {arc.unresolved_conflicts?.length > 0 && (
                  <div className="bg-amber-50 rounded-lg p-3">
                    <p className="text-xs font-medium text-amber-700 mb-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      Unresolved Conflicts
                    </p>
                    <ul className="space-y-1">
                      {arc.unresolved_conflicts.map((conflict, idx) => (
                        <li key={idx} className="text-xs text-slate-600 flex items-start gap-1">
                          <span className="text-amber-500 mt-0.5">•</span>
                          {conflict}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {arc.potential_growth && (
                  <div className="bg-violet-50 rounded-lg p-3">
                    <p className="text-xs font-medium text-violet-700 mb-1 flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      Potential Growth
                    </p>
                    <p className="text-xs text-slate-600">{arc.potential_growth}</p>
                  </div>
                )}
              </div>
            )}

            {/* Canon Events */}
            {events.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium text-slate-900 flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-amber-600" />
                  Canon Events
                </h4>
                <div className="space-y-2">
                  {events.map((ev, idx) => (
                    <div key={idx} className="bg-slate-50 rounded-lg p-3">
                      <p className="text-xs font-medium text-slate-900">{ev.event}</p>
                      <p className="text-xs text-slate-500 mt-1">{ev.description}</p>
                      {ev.emotional_impact && (
                        <p className="text-xs text-violet-600 mt-1 flex items-center gap-1">
                          <Heart className="w-3 h-3" />
                          {ev.emotional_impact}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Relationships */}
            {relationships.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium text-slate-900 flex items-center gap-2 text-sm">
                  <Users className="w-4 h-4 text-blue-600" />
                  Relationships
                </h4>
                <div className="space-y-2">
                  {relationships.map((rel, idx) => (
                    <div key={idx} className="bg-slate-50 rounded-lg p-3 flex items-start gap-2">
                      <Badge variant="outline" className="text-[10px] capitalize shrink-0">
                        {rel.relationship_type}
                      </Badge>
                      <div>
                        <p className="text-xs font-medium text-slate-900">{rel.character_name}</p>
                        <p className="text-xs text-slate-500">{rel.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Personality Quirks */}
            {character.personality_quirks?.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium text-slate-900 text-sm">Quirks & Mannerisms</h4>
                <div className="flex flex-wrap gap-1">
                  {character.personality_quirks.map((quirk, idx) => (
                    <Badge key={idx} variant="secondary" className="text-[10px]">
                      {quirk}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {!arc && events.length === 0 && relationships.length === 0 && (
              <div className="text-center py-8 text-slate-400">
                <TrendingUp className="w-10 h-10 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No context defined yet</p>
                <p className="text-xs">Add arc & events from the character detail page</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </motion.div>
    </AnimatePresence>
  );
}