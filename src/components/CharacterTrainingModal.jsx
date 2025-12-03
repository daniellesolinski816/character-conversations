import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, X, MessageSquare, Zap, Users, Save, Loader2 } from 'lucide-react';
import CharacterAvatar from './CharacterAvatar';

const RELATIONSHIP_TYPES = ['friend', 'enemy', 'mentor', 'student', 'rival', 'family', 'lover', 'ally', 'neutral'];

export default function CharacterTrainingModal({ 
  open, 
  onOpenChange, 
  character, 
  allCharacters = [],
  onSave 
}) {
  const [trainingExamples, setTrainingExamples] = useState(character?.training_examples || []);
  const [quirks, setQuirks] = useState(character?.personality_quirks || []);
  const [relationships, setRelationships] = useState(character?.relationships || []);
  
  const [newExample, setNewExample] = useState({ context: '', response: '' });
  const [newQuirk, setNewQuirk] = useState('');
  const [newRelationship, setNewRelationship] = useState({ character_name: '', relationship_type: 'friend', description: '' });
  const [isSaving, setIsSaving] = useState(false);

  const otherCharacters = allCharacters.filter(c => c.name !== character?.name);

  const handleAddExample = () => {
    if (!newExample.context.trim() || !newExample.response.trim()) return;
    setTrainingExamples([...trainingExamples, newExample]);
    setNewExample({ context: '', response: '' });
  };

  const handleRemoveExample = (idx) => {
    setTrainingExamples(trainingExamples.filter((_, i) => i !== idx));
  };

  const handleAddQuirk = () => {
    if (!newQuirk.trim()) return;
    setQuirks([...quirks, newQuirk.trim()]);
    setNewQuirk('');
  };

  const handleRemoveQuirk = (idx) => {
    setQuirks(quirks.filter((_, i) => i !== idx));
  };

  const handleAddRelationship = () => {
    if (!newRelationship.character_name) return;
    setRelationships([...relationships, newRelationship]);
    setNewRelationship({ character_name: '', relationship_type: 'friend', description: '' });
  };

  const handleRemoveRelationship = (idx) => {
    setRelationships(relationships.filter((_, i) => i !== idx));
  };

  const handleSave = async () => {
    setIsSaving(true);
    await onSave({
      ...character,
      training_examples: trainingExamples,
      personality_quirks: quirks,
      relationships
    });
    setIsSaving(false);
    onOpenChange(false);
  };

  if (!character) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <CharacterAvatar name={character.name} size="md" />
            <div>
              <span className="font-semibold">Train {character.name}</span>
              <p className="text-xs text-slate-500 font-normal">Customize how this character responds</p>
            </div>
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="examples" className="flex-1 overflow-hidden flex flex-col">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="examples" className="gap-1 text-xs">
              <MessageSquare className="w-3 h-3" />
              Dialogue ({trainingExamples.length})
            </TabsTrigger>
            <TabsTrigger value="quirks" className="gap-1 text-xs">
              <Zap className="w-3 h-3" />
              Quirks ({quirks.length})
            </TabsTrigger>
            <TabsTrigger value="relationships" className="gap-1 text-xs">
              <Users className="w-3 h-3" />
              Relations ({relationships.length})
            </TabsTrigger>
          </TabsList>

          <ScrollArea className="flex-1 mt-4">
            {/* Training Examples Tab */}
            <TabsContent value="examples" className="mt-0 space-y-4">
              <p className="text-sm text-slate-500">
                Teach {character.name} how to respond in specific situations. These examples will guide AI responses.
              </p>

              {trainingExamples.length > 0 && (
                <div className="space-y-3">
                  {trainingExamples.map((ex, idx) => (
                    <div key={idx} className="bg-slate-50 rounded-xl p-3 relative group">
                      <button
                        onClick={() => handleRemoveExample(idx)}
                        className="absolute top-2 right-2 p-1 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      <p className="text-xs text-slate-500 mb-1">When asked:</p>
                      <p className="text-sm text-slate-700 mb-2">"{ex.context}"</p>
                      <p className="text-xs text-violet-600 mb-1">{character.name} responds:</p>
                      <p className="text-sm text-slate-900 italic">"{ex.response}"</p>
                    </div>
                  ))}
                </div>
              )}

              <div className="bg-violet-50 rounded-xl p-4 space-y-3">
                <p className="text-xs font-medium text-violet-700">Add Training Example</p>
                <Input
                  value={newExample.context}
                  onChange={(e) => setNewExample({ ...newExample, context: e.target.value })}
                  placeholder="Situation or question (e.g., 'When someone mentions their past...')"
                />
                <Textarea
                  value={newExample.response}
                  onChange={(e) => setNewExample({ ...newExample, response: e.target.value })}
                  placeholder={`How ${character.name} would respond...`}
                  className="min-h-[80px]"
                />
                <Button onClick={handleAddExample} size="sm" className="w-full">
                  <Plus className="w-4 h-4 mr-1" />
                  Add Example
                </Button>
              </div>
            </TabsContent>

            {/* Quirks Tab */}
            <TabsContent value="quirks" className="mt-0 space-y-4">
              <p className="text-sm text-slate-500">
                Add unique mannerisms, speech patterns, or habits that make {character.name} distinctive.
              </p>

              {quirks.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {quirks.map((quirk, idx) => (
                    <Badge key={idx} variant="secondary" className="gap-1 pr-1">
                      {quirk}
                      <button onClick={() => handleRemoveQuirk(idx)} className="ml-1 hover:text-red-500">
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}

              <div className="flex gap-2">
                <Input
                  value={newQuirk}
                  onChange={(e) => setNewQuirk(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddQuirk()}
                  placeholder="e.g., 'Always speaks in metaphors', 'Nervous laugh'"
                />
                <Button onClick={handleAddQuirk} size="icon">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>

              <div className="bg-slate-50 rounded-lg p-3">
                <p className="text-xs text-slate-500">Example quirks:</p>
                <div className="flex flex-wrap gap-1 mt-2">
                  {['Uses old-fashioned phrases', 'Avoids eye contact when lying', 'Hums when thinking', 'Always formal', 'Sarcastic humor'].map(q => (
                    <button
                      key={q}
                      onClick={() => setNewQuirk(q)}
                      className="text-xs bg-white border border-slate-200 rounded-full px-2 py-1 hover:border-violet-300"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            </TabsContent>

            {/* Relationships Tab */}
            <TabsContent value="relationships" className="mt-0 space-y-4">
              <p className="text-sm text-slate-500">
                Define how {character.name} relates to other characters. This affects how they talk about others.
              </p>

              {relationships.length > 0 && (
                <div className="space-y-2">
                  {relationships.map((rel, idx) => (
                    <div key={idx} className="bg-slate-50 rounded-lg p-3 flex items-center gap-3 group">
                      <Badge className="capitalize shrink-0">{rel.relationship_type}</Badge>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-slate-900">{rel.character_name}</p>
                        <p className="text-xs text-slate-500 truncate">{rel.description}</p>
                      </div>
                      <button
                        onClick={() => handleRemoveRelationship(idx)}
                        className="p-1 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="bg-blue-50 rounded-xl p-4 space-y-3">
                <p className="text-xs font-medium text-blue-700">Add Relationship</p>
                
                {otherCharacters.length > 0 ? (
                  <Select 
                    value={newRelationship.character_name} 
                    onValueChange={(v) => setNewRelationship({ ...newRelationship, character_name: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select character..." />
                    </SelectTrigger>
                    <SelectContent>
                      {otherCharacters.map(c => (
                        <SelectItem key={c.name} value={c.name}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    value={newRelationship.character_name}
                    onChange={(e) => setNewRelationship({ ...newRelationship, character_name: e.target.value })}
                    placeholder="Character name"
                  />
                )}

                <Select 
                  value={newRelationship.relationship_type} 
                  onValueChange={(v) => setNewRelationship({ ...newRelationship, relationship_type: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {RELATIONSHIP_TYPES.map(type => (
                      <SelectItem key={type} value={type} className="capitalize">{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Input
                  value={newRelationship.description}
                  onChange={(e) => setNewRelationship({ ...newRelationship, description: e.target.value })}
                  placeholder="Describe the relationship..."
                />

                <Button onClick={handleAddRelationship} size="sm" className="w-full">
                  <Plus className="w-4 h-4 mr-1" />
                  Add Relationship
                </Button>
              </div>
            </TabsContent>
          </ScrollArea>
        </Tabs>

        <div className="pt-4 border-t">
          <Button onClick={handleSave} disabled={isSaving} className="w-full bg-violet-600 hover:bg-violet-700">
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
            Save Training
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}