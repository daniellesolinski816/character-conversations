import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Heart, 
  TrendingUp, 
  AlertCircle, 
  Sparkles, 
  Plus, 
  X, 
  Calendar,
  Loader2,
  Save
} from 'lucide-react';
import CharacterAvatar from './CharacterAvatar';

export default function CharacterDetailModal({ 
  open, 
  onOpenChange, 
  character, 
  writingId,
  writingContent,
  onCharacterUpdated 
}) {
  const [editedCharacter, setEditedCharacter] = useState(character);
  const [newEvent, setNewEvent] = useState({ event: '', description: '', emotional_impact: '' });
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleAnalyzeArc = async () => {
    setIsAnalyzing(true);
    
    const response = await base44.integrations.Core.InvokeLLM({
      prompt: `Analyze this character's emotional journey and suggest growth points.

CHARACTER:
Name: ${editedCharacter.name}
Role: ${editedCharacter.role}
Backstory: ${editedCharacter.backstory}
Personality: ${editedCharacter.personality_traits}
Values & Motivations: ${editedCharacter.values_and_motivations}

EXISTING CANON EVENTS:
${JSON.stringify(editedCharacter.canon_events || [], null, 2)}

STORY CONTEXT:
${writingContent?.slice(0, 5000) || 'No additional context'}

Analyze and provide:
1. Their emotional starting state
2. Key growth points (moments where they changed or could change)
3. Unresolved internal or external conflicts
4. Where this character could potentially grow next

Be specific and reference their traits, events, and story context.`,
      response_json_schema: {
        type: 'object',
        properties: {
          starting_state: { type: 'string' },
          growth_points: { type: 'array', items: { type: 'string' } },
          unresolved_conflicts: { type: 'array', items: { type: 'string' } },
          potential_growth: { type: 'string' }
        }
      }
    });

    setEditedCharacter({
      ...editedCharacter,
      emotional_arc: response
    });
    
    setIsAnalyzing(false);
  };

  const handleAddEvent = () => {
    if (!newEvent.event.trim()) return;
    
    const updatedEvents = [...(editedCharacter.canon_events || []), newEvent];
    setEditedCharacter({
      ...editedCharacter,
      canon_events: updatedEvents
    });
    setNewEvent({ event: '', description: '', emotional_impact: '' });
    setShowAddEvent(false);
  };

  const handleRemoveEvent = (idx) => {
    const updatedEvents = editedCharacter.canon_events.filter((_, i) => i !== idx);
    setEditedCharacter({
      ...editedCharacter,
      canon_events: updatedEvents
    });
  };

  const handleSave = async () => {
    setIsSaving(true);
    onCharacterUpdated?.(editedCharacter);
    setIsSaving(false);
    onOpenChange(false);
  };

  if (!character) return null;

  const arc = editedCharacter.emotional_arc;
  const events = editedCharacter.canon_events || [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <CharacterAvatar name={character.name} size="md" />
            <div>
              <span className="font-semibold">{character.name}</span>
              {character.role && (
                <Badge variant="secondary" className="ml-2 capitalize">
                  {character.role}
                </Badge>
              )}
            </div>
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="arc" className="flex-1 overflow-hidden flex flex-col">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="arc" className="gap-2">
              <TrendingUp className="w-4 h-4" />
              Emotional Arc
            </TabsTrigger>
            <TabsTrigger value="events" className="gap-2">
              <Calendar className="w-4 h-4" />
              Canon Events
            </TabsTrigger>
          </TabsList>

          <ScrollArea className="flex-1 mt-4">
            <TabsContent value="arc" className="mt-0 space-y-4">
              {/* Starting State */}
              <div className="bg-slate-50 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Heart className="w-4 h-4 text-rose-500" />
                  <h4 className="font-medium text-slate-900">Starting State</h4>
                </div>
                <p className="text-sm text-slate-600">
                  {arc?.starting_state || 'Not analyzed yet'}
                </p>
              </div>

              {/* Growth Points */}
              <div className="bg-green-50 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-green-600" />
                  <h4 className="font-medium text-slate-900">Growth Points</h4>
                </div>
                {arc?.growth_points?.length > 0 ? (
                  <ul className="space-y-2">
                    {arc.growth_points.map((point, idx) => (
                      <li key={idx} className="text-sm text-slate-600 flex items-start gap-2">
                        <span className="text-green-500 mt-1">•</span>
                        {point}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-slate-500">No growth points identified yet</p>
                )}
              </div>

              {/* Unresolved Conflicts */}
              <div className="bg-amber-50 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="w-4 h-4 text-amber-600" />
                  <h4 className="font-medium text-slate-900">Unresolved Conflicts</h4>
                </div>
                {arc?.unresolved_conflicts?.length > 0 ? (
                  <ul className="space-y-2">
                    {arc.unresolved_conflicts.map((conflict, idx) => (
                      <li key={idx} className="text-sm text-slate-600 flex items-start gap-2">
                        <span className="text-amber-500 mt-1">•</span>
                        {conflict}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-slate-500">No unresolved conflicts identified</p>
                )}
              </div>

              {/* Potential Growth */}
              <div className="bg-violet-50 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-4 h-4 text-violet-600" />
                  <h4 className="font-medium text-slate-900">Potential Growth</h4>
                </div>
                <p className="text-sm text-slate-600">
                  {arc?.potential_growth || 'Not analyzed yet'}
                </p>
              </div>

              <Button 
                onClick={handleAnalyzeArc}
                disabled={isAnalyzing}
                className="w-full bg-violet-600 hover:bg-violet-700"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    {arc ? 'Re-analyze' : 'Analyze'} Emotional Arc
                  </>
                )}
              </Button>
            </TabsContent>

            <TabsContent value="events" className="mt-0 space-y-4">
              {/* Existing Events */}
              {events.length > 0 ? (
                <div className="space-y-3">
                  {events.map((ev, idx) => (
                    <div key={idx} className="bg-white border border-slate-200 rounded-xl p-4 relative group">
                      <button
                        onClick={() => handleRemoveEvent(idx)}
                        className="absolute top-2 right-2 p-1 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      <h4 className="font-medium text-slate-900">{ev.event}</h4>
                      <p className="text-sm text-slate-600 mt-1">{ev.description}</p>
                      {ev.emotional_impact && (
                        <p className="text-xs text-violet-600 mt-2 flex items-center gap-1">
                          <Heart className="w-3 h-3" />
                          {ev.emotional_impact}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-slate-500">
                  <Calendar className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                  <p className="text-sm">No canon events added yet</p>
                </div>
              )}

              {/* Add Event Form */}
              {showAddEvent ? (
                <div className="bg-slate-50 rounded-xl p-4 space-y-3">
                  <Input
                    value={newEvent.event}
                    onChange={(e) => setNewEvent({ ...newEvent, event: e.target.value })}
                    placeholder="Event title (e.g., 'The Betrayal')"
                  />
                  <Textarea
                    value={newEvent.description}
                    onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                    placeholder="What happened?"
                    className="min-h-[80px]"
                  />
                  <Input
                    value={newEvent.emotional_impact}
                    onChange={(e) => setNewEvent({ ...newEvent, emotional_impact: e.target.value })}
                    placeholder="Emotional impact on the character"
                  />
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setShowAddEvent(false)} className="flex-1">
                      Cancel
                    </Button>
                    <Button onClick={handleAddEvent} className="flex-1 bg-violet-600 hover:bg-violet-700">
                      Add Event
                    </Button>
                  </div>
                </div>
              ) : (
                <Button 
                  variant="outline" 
                  onClick={() => setShowAddEvent(true)}
                  className="w-full"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Canon Event
                </Button>
              )}
            </TabsContent>
          </ScrollArea>
        </Tabs>

        <div className="pt-4 border-t">
          <Button onClick={handleSave} disabled={isSaving} className="w-full">
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}