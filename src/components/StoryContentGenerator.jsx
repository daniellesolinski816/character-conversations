import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sparkles, Loader2, Copy, BookOpen, MessageSquare, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { toast } from 'sonner';

export default function StoryContentGenerator({ open, onOpenChange, book, onContentGenerated }) {
  const [activeTab, setActiveTab] = useState('summary');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState('');
  
  // Summary/Outline inputs
  const [focusArea, setFocusArea] = useState('');
  
  // Dialogue inputs
  const [selectedCharacter, setSelectedCharacter] = useState('');
  const [dialogueContext, setDialogueContext] = useState('');
  
  // Canon events inputs
  const [eventType, setEventType] = useState('');

  const buildCharacterContext = (character) => {
    if (!character) return '';
    
    return `
CHARACTER: ${character.name}
- Personality: ${character.personality || 'Not specified'}
- Emotional Arc: ${character.emotional_arc ? `
  Starting State: ${character.emotional_arc.starting_state}
  Growth Points: ${character.emotional_arc.growth_points?.join('; ')}
  Conflicts: ${character.emotional_arc.unresolved_conflicts?.join('; ')}
` : 'Not defined'}
- Canon Events: ${character.canon_events?.map(e => e.event).join(', ') || 'None'}
- Quirks: ${character.personality_quirks?.join(', ') || 'None'}
- Relationships: ${character.relationships?.map(r => `${r.character_name} (${r.relationship_type})`).join(', ') || 'None'}`;
  };

  const generateSummary = async () => {
    setIsGenerating(true);
    try {
      const chaptersContext = book.chapters?.slice(0, 3).map((ch, i) => 
        `Section ${i + 1} - ${ch.title}: ${ch.content?.slice(0, 500)}...`
      ).join('\n\n');

      const charactersContext = book.characters?.map(c => 
        `${c.name}: ${c.description}`
      ).join('\n');

      const prompt = `You are a creative writing assistant helping to develop "${book.title}" by ${book.author}.

EXISTING CONTENT:
${chaptersContext}

CHARACTERS:
${charactersContext}

USER REQUEST: Generate ${focusArea || 'a comprehensive plot outline for the next chapters'}

INSTRUCTIONS:
- Build on the existing story naturally
- Consider character arcs and relationships
- Create compelling plot progression
- Include specific scene suggestions
- Format as markdown with headers and bullet points

Generate creative, detailed content:`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: 'object',
          properties: {
            content: { type: 'string', description: 'The generated outline/summary in markdown format' }
          }
        }
      });

      setGeneratedContent(response.content);
      toast.success('Content generated!');
    } catch (error) {
      toast.error('Failed to generate content');
    } finally {
      setIsGenerating(false);
    }
  };

  const generateDialogue = async () => {
    setIsGenerating(true);
    try {
      const character = book.characters?.find(c => c.name === selectedCharacter);
      if (!character) {
        toast.error('Please select a character');
        setIsGenerating(false);
        return;
      }

      const characterContext = buildCharacterContext(character);
      const otherCharacters = book.characters?.filter(c => c.name !== character.name)
        .map(c => `${c.name}: ${c.description}`).join('\n');

      const prompt = `Generate dialogue for a scene in "${book.title}".

${characterContext}

OTHER CHARACTERS:
${otherCharacters}

SCENE CONTEXT: ${dialogueContext || 'A meaningful interaction that develops character relationships'}

INSTRUCTIONS:
- Use ${character.name}'s established personality quirks and speech patterns
- Reference their emotional state and canon events naturally
- Show mixed emotions and internal conflict
- Include specific sensory details and body language
- Make it feel authentic to their character arc
- Format as screenplay-style dialogue with character names and actions

Generate the scene:`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: 'object',
          properties: {
            dialogue: { type: 'string', description: 'The generated dialogue scene' }
          }
        }
      });

      setGeneratedContent(response.dialogue);
      toast.success('Dialogue generated!');
    } catch (error) {
      toast.error('Failed to generate dialogue');
    } finally {
      setIsGenerating(false);
    }
  };

  const generateCanonEvent = async () => {
    setIsGenerating(true);
    try {
      const charactersContext = book.characters?.map(c => {
        const events = c.canon_events?.map(e => e.event).join(', ') || 'None';
        const relationships = c.relationships?.map(r => 
          `${r.character_name} (${r.relationship_type})`
        ).join(', ') || 'None';
        return `${c.name}: Events: ${events}. Relationships: ${relationships}`;
      }).join('\n');

      const prompt = `Suggest new canon events for "${book.title}".

CURRENT STORY STATE:
${book.description}

CHARACTERS & THEIR HISTORIES:
${charactersContext}

EVENT TYPE: ${eventType || 'A pivotal moment that impacts character relationships and growth'}

INSTRUCTIONS:
- Create events that naturally emerge from existing character arcs
- Consider how relationships would evolve
- Suggest emotional impacts for each character involved
- Provide multiple event options with different tones (dramatic, subtle, transformative)
- For each event, explain:
  * What happens
  * Which characters are involved
  * Emotional impact on each character
  * How it affects relationships
  * Potential for future growth

Generate 3-5 canon event suggestions:`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: 'object',
          properties: {
            events: { 
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  title: { type: 'string' },
                  description: { type: 'string' },
                  characters_involved: { type: 'array', items: { type: 'string' } },
                  emotional_impacts: { type: 'string' },
                  relationship_changes: { type: 'string' }
                }
              }
            }
          }
        }
      });

      const formatted = response.events.map((event, i) => `
### ${i + 1}. ${event.title}

**What Happens:**
${event.description}

**Characters Involved:** ${event.characters_involved?.join(', ')}

**Emotional Impacts:**
${event.emotional_impacts}

**Relationship Changes:**
${event.relationship_changes}

---
`).join('\n');

      setGeneratedContent(formatted);
      toast.success('Canon events generated!');
    } catch (error) {
      toast.error('Failed to generate events');
    } finally {
      setIsGenerating(false);
    }
  };

  const copyContent = () => {
    navigator.clipboard.writeText(generatedContent);
    toast.success('Copied to clipboard!');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-violet-600" />
            AI Story Content Generator
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="summary" className="gap-2">
              <BookOpen className="w-4 h-4" />
              Outlines
            </TabsTrigger>
            <TabsTrigger value="dialogue" className="gap-2">
              <MessageSquare className="w-4 h-4" />
              Dialogue
            </TabsTrigger>
            <TabsTrigger value="events" className="gap-2">
              <Zap className="w-4 h-4" />
              Canon Events
            </TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-y-auto mt-4">
            <TabsContent value="summary" className="space-y-4">
              <div>
                <Label>What would you like to generate?</Label>
                <Textarea
                  value={focusArea}
                  onChange={(e) => setFocusArea(e.target.value)}
                  placeholder="E.g., 'Plot outline for next 3 chapters focusing on conflict resolution' or 'Summary of key themes and character development so far'"
                  className="mt-2"
                  rows={3}
                />
              </div>
              <Button 
                onClick={generateSummary} 
                disabled={isGenerating}
                className="w-full bg-violet-600 hover:bg-violet-700"
              >
                {isGenerating ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Generating...</>
                ) : (
                  <><Sparkles className="w-4 h-4 mr-2" /> Generate Outline</>
                )}
              </Button>
            </TabsContent>

            <TabsContent value="dialogue" className="space-y-4">
              <div>
                <Label>Select Character</Label>
                <Select value={selectedCharacter} onValueChange={setSelectedCharacter}>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Choose a character" />
                  </SelectTrigger>
                  <SelectContent>
                    {book.characters?.map((char) => (
                      <SelectItem key={char.name} value={char.name}>
                        {char.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Scene Context</Label>
                <Textarea
                  value={dialogueContext}
                  onChange={(e) => setDialogueContext(e.target.value)}
                  placeholder="E.g., 'A confrontation with another character about a betrayal' or 'A quiet moment reflecting on recent events'"
                  className="mt-2"
                  rows={3}
                />
              </div>
              <Button 
                onClick={generateDialogue} 
                disabled={isGenerating || !selectedCharacter}
                className="w-full bg-violet-600 hover:bg-violet-700"
              >
                {isGenerating ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Generating...</>
                ) : (
                  <><Sparkles className="w-4 h-4 mr-2" /> Generate Dialogue</>
                )}
              </Button>
            </TabsContent>

            <TabsContent value="events" className="space-y-4">
              <div>
                <Label>Event Type or Focus</Label>
                <Textarea
                  value={eventType}
                  onChange={(e) => setEventType(e.target.value)}
                  placeholder="E.g., 'A dramatic revelation that changes relationships' or 'A quiet moment of growth for the protagonist'"
                  className="mt-2"
                  rows={3}
                />
              </div>
              <Button 
                onClick={generateCanonEvent} 
                disabled={isGenerating}
                className="w-full bg-violet-600 hover:bg-violet-700"
              >
                {isGenerating ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Generating...</>
                ) : (
                  <><Sparkles className="w-4 h-4 mr-2" /> Generate Canon Events</>
                )}
              </Button>
            </TabsContent>

            {/* Generated Content Display */}
            {generatedContent && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 p-6 bg-slate-50 rounded-lg border border-slate-200"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-slate-900">Generated Content</h3>
                  <Button variant="outline" size="sm" onClick={copyContent}>
                    <Copy className="w-4 h-4 mr-2" />
                    Copy
                  </Button>
                </div>
                <div className="prose prose-sm prose-slate max-w-none">
                  <ReactMarkdown>{generatedContent}</ReactMarkdown>
                </div>
              </motion.div>
            )}
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}