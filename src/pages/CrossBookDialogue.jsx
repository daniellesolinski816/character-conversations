import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import { ArrowLeft, Sparkles, Loader2, BookOpen, MessageSquare, Brain, User, Send, Heart, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import CharacterAvatar from '@/components/CharacterAvatar';
import ShareDialogueModal from '@/components/ShareDialogueModal';

const SYSTEM_PROMPT = `You are facilitating a conversation between two characters from DIFFERENT books/stories.

CRITICAL RULES:
1. Stay true to each character's voice, personality, and emotional state from their respective stories
2. Characters should be aware they're from different worlds/stories and react authentically
3. Use specific details from each character's backstory, canon events, and relationships
4. Show how their different experiences and perspectives create interesting dialogue
5. Include emotional reactions - how does meeting someone from another story affect them?
6. Reference their quirks, speech patterns, and personality traits
7. Make it feel like a genuine interaction between two fully-realized people
8. Include stage directions in [brackets] for tone, body language, emotions

FORMAT:
[Character 1 Name]: dialogue
[Character 2 Name]: dialogue

Keep exchanges natural - 6-10 back-and-forth exchanges total.`;

function parseDialogue(rawText) {
  const lines = rawText.split('\n').filter(line => line.trim());
  const turns = [];
  
  for (const line of lines) {
    const match = line.match(/^\[?([^\]]+?)\]?:\s*(.+)$/);
    if (match) {
      const [, speaker, text] = match;
      turns.push({ speaker: speaker.trim(), text: text.trim() });
    }
  }
  
  return turns;
}

function DialogueSkeleton() {
  return (
    <div className="space-y-4 h-[400px] overflow-hidden">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className={`flex gap-3 ${i % 2 === 0 ? 'flex-row-reverse' : ''}`}>
          <div className="w-8 h-8 rounded-full bg-slate-200 animate-pulse shrink-0" />
          <div className={`flex-1 ${i % 2 === 0 ? 'flex flex-col items-end' : ''}`}>
            <div className="h-3 bg-slate-200 animate-pulse rounded w-24 mb-2" />
            <div className="h-14 bg-slate-100 animate-pulse rounded-2xl max-w-[75%]" />
          </div>
        </div>
      ))}
    </div>
  );
}

function CharacterBadge({ character, bookTitle, onClick, isSelected }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${
        isSelected 
          ? 'border-violet-500 bg-violet-50' 
          : 'border-slate-200 hover:border-violet-300 bg-white'
      }`}
    >
      <CharacterAvatar name={character.name} avatar={character.avatar} size="md" />
      <div className="flex-1 text-left min-w-0">
        <p className="font-semibold text-slate-900 truncate">{character.name}</p>
        <p className="text-xs text-slate-500 truncate">from {bookTitle}</p>
      </div>
    </button>
  );
}

function DialogueView({ turns, char1, char2, empathyInsights }) {
  return (
    <div className="space-y-4">
      <ScrollArea className="h-[400px] pr-4">
        <div className="space-y-4">
          {turns.map((turn, idx) => {
            const isChar1 = turn.speaker.toLowerCase().includes(char1.name.toLowerCase());
            const isHuman = turn.speaker.toLowerCase() === 'you';
            const character = isHuman ? null : (isChar1 ? char1 : char2);
            
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: isChar1 ? -20 : 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className={`flex gap-3 ${isChar1 || isHuman ? '' : 'flex-row-reverse'}`}
              >
                {isHuman ? (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center shrink-0">
                    <User className="w-4 h-4 text-white" />
                  </div>
                ) : (
                  <CharacterAvatar 
                    name={character.name} 
                    avatar={character.avatar}
                    size="sm"
                  />
                )}
                <div className={`flex-1 ${isChar1 || isHuman ? 'text-left' : 'text-right'}`}>
                  <p className="text-xs font-medium text-slate-500 mb-1">{turn.speaker}</p>
                  <div className={`inline-block p-3 rounded-2xl ${
                    isHuman 
                      ? 'bg-blue-50 border border-blue-200'
                      : isChar1 
                        ? 'bg-white border border-slate-200' 
                        : 'bg-violet-100 border border-violet-200'
                  }`}>
                    <p className="text-sm text-slate-700">{turn.text}</p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </ScrollArea>

      {empathyInsights && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-rose-50 to-pink-50 border border-rose-200 rounded-2xl p-5"
        >
          <div className="flex items-center gap-2 mb-3">
            <Heart className="w-5 h-5 text-rose-600" />
            <h3 className="font-semibold text-slate-900">Empathy Insights</h3>
          </div>
          <div className="space-y-3 text-sm text-slate-700">
            {empathyInsights.perspective_shifts?.length > 0 && (
              <div>
                <p className="font-medium text-rose-700 mb-1">Perspective Shifts:</p>
                <ul className="list-disc list-inside space-y-1 text-slate-600">
                  {empathyInsights.perspective_shifts.map((shift, idx) => (
                    <li key={idx}>{shift}</li>
                  ))}
                </ul>
              </div>
            )}
            {empathyInsights.emotional_connections?.length > 0 && (
              <div>
                <p className="font-medium text-rose-700 mb-1">Emotional Connections:</p>
                <ul className="list-disc list-inside space-y-1 text-slate-600">
                  {empathyInsights.emotional_connections.map((conn, idx) => (
                    <li key={idx}>{conn}</li>
                  ))}
                </ul>
              </div>
            )}
            {empathyInsights.key_learnings?.length > 0 && (
              <div>
                <p className="font-medium text-rose-700 mb-1">Key Learnings:</p>
                <ul className="list-disc list-inside space-y-1 text-slate-600">
                  {empathyInsights.key_learnings.map((learning, idx) => (
                    <li key={idx}>{learning}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
}

export default function CrossBookDialogue() {
  const [selectedBook1, setSelectedBook1] = useState(null);
  const [selectedChar1, setSelectedChar1] = useState(null);
  const [selectedBook2, setSelectedBook2] = useState(null);
  const [selectedChar2, setSelectedChar2] = useState(null);
  const [topic, setTopic] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [dialogue, setDialogue] = useState([]);
  const [empathyInsights, setEmpathyInsights] = useState(null);
  const [numHumans, setNumHumans] = useState(0);
  const [conversationLength, setConversationLength] = useState('medium');
  const [humanInput, setHumanInput] = useState('');
  const [isHumanTurn, setIsHumanTurn] = useState(false);

  const { data: books = [] } = useQuery({
    queryKey: ['books'],
    queryFn: () => base44.entities.Book.list('-created_date'),
  });

  const book1 = books.find(b => b.id === selectedBook1);
  const book2 = books.find(b => b.id === selectedBook2);
  const char1 = book1?.characters?.find(c => c.name === selectedChar1);
  const char2 = book2?.characters?.find(c => c.name === selectedChar2);

  const lengthMap = {
    short: '4-6',
    medium: '8-12',
    long: '14-18'
  };

  const buildCharacterContext = (character, book) => {
    return `
CHARACTER: ${character.name} from "${book.title}" by ${book.author}
- Personality: ${character.personality || character.description}
- Emotional State: ${character.emotional_arc?.starting_state || 'Complex'}
- Key Events: ${character.canon_events?.map(e => e.event).join('; ') || 'See story'}
- Quirks: ${character.personality_quirks?.join(', ') || 'Unique speech patterns'}
- Relationships: ${character.relationships?.map(r => `${r.character_name} (${r.relationship_type})`).join(', ') || 'Various'}`;
  };

  const generateAITopic = async () => {
    if (!char1 || !char2) return;
    
    setIsGenerating(true);
    try {
      const prompt = `You have two characters from different books:
- ${char1.name} from "${book1.title}" (${book1.genre})
- ${char2.name} from "${book2.title}" (${book2.genre})

Generate a compelling conversation topic that would:
1. Highlight their different perspectives and experiences
2. Create opportunities for empathy and understanding
3. Explore meaningful themes like courage, loss, identity, justice, or relationships

Respond with just the topic/question (1-2 sentences).`;

      const response = await base44.integrations.Core.InvokeLLM({ prompt });
      setTopic(response);
    } catch (error) {
      console.error('Failed to generate topic:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const generateDialogue = async () => {
    if (!char1 || !char2) return;
    
    setIsGenerating(true);
    setDialogue([]);
    setEmpathyInsights(null);
    setIsHumanTurn(false);

    try {
      const char1Context = buildCharacterContext(char1, book1);
      const char2Context = buildCharacterContext(char2, book2);
      const numTurns = lengthMap[conversationLength];

      const humanParticipation = numHumans > 0
        ? `\n\nIMPORTANT: This conversation will include ${numHumans} human participant${numHumans > 1 ? 's' : ''}. Leave space for their input by occasionally having characters ask direct questions or invite perspectives from the human participants.`
        : '';

      const prompt = `${SYSTEM_PROMPT}${humanParticipation}

${char1Context}

${char2Context}

CONVERSATION TOPIC: ${topic || 'These two characters meet and discover they\'re from different stories. They discuss their experiences, challenges, and what defines them.'}

CONVERSATION LENGTH: Generate ${numTurns} total speaking turns

SPECIAL CONSIDERATION:
- ${char1.name} comes from ${book1.genre || 'their story'} - bring that sensibility
- ${char2.name} comes from ${book2.genre || 'their story'} - contrast with the above
- Both should be curious but true to themselves
- Explore how different story worlds shape different perspectives
${numHumans > 0 ? `- Occasionally invite the human participant${numHumans > 1 ? 's' : ''} into the conversation with direct questions` : ''}

After the dialogue, provide empathy analysis.`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: 'object',
          properties: {
            dialogue: { type: 'string', description: 'The full dialogue exchange' },
            empathy_insights: {
              type: 'object',
              properties: {
                perspective_shifts: { type: 'array', items: { type: 'string' }, description: 'Moments where characters saw from another perspective' },
                emotional_connections: { type: 'array', items: { type: 'string' }, description: 'Points of emotional resonance or understanding' },
                key_learnings: { type: 'array', items: { type: 'string' }, description: 'What each character learned from the other' }
              }
            }
          }
        }
      });

      const turns = parseDialogue(response.dialogue);
      setDialogue(turns);
      setEmpathyInsights(response.empathy_insights);

      // Check if human should participate
      if (numHumans > 0 && turns.length > 2) {
        setIsHumanTurn(true);
      }
    } catch (error) {
      console.error('Failed to generate dialogue:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleHumanResponse = async () => {
    if (!humanInput.trim()) return;

    const humanTurn = { speaker: 'You', text: humanInput.trim() };
    setDialogue(prev => [...prev, humanTurn]);
    setHumanInput('');
    setIsGenerating(true);

    try {
      const conversationSoFar = dialogue.map(t => `${t.speaker}: ${t.text}`).join('\n');
      const prompt = `Continue this conversation between ${char1.name}, ${char2.name}, and a human reader.

Previous conversation:
${conversationSoFar}

Human just said: "${humanInput.trim()}"

${char1.name} (from ${book1.title}) should respond first, then ${char2.name} (from ${book2.title}). Keep responses natural and build on the human's input. Generate 2-3 more exchanges.`;

      const response = await base44.integrations.Core.InvokeLLM({ prompt });
      const newTurns = parseDialogue(response);
      setDialogue(prev => [...prev, ...newTurns]);
    } catch (error) {
      console.error('Failed to continue dialogue:', error);
    } finally {
      setIsGenerating(false);
      setIsHumanTurn(false);
    }
  };

  const canGenerate = char1 && char2 && selectedBook1 !== selectedBook2;

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50/50 via-white to-purple-50/30">
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Link to={createPageUrl('Home')}>
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-3xl font-serif font-semibold text-slate-900 flex items-center gap-3">
              <BookOpen className="w-8 h-8 text-violet-600" />
              Cross-Book Character Dialogue
            </h1>
            <p className="text-slate-600 mt-1">
              Watch characters from different books meet and interact
            </p>
          </div>
        </div>


            <div className="grid lg:grid-cols-2 gap-8">
              {/* Left: Setup */}
              <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <h2 className="font-semibold text-slate-900 mb-4">Select Characters</h2>
              
              {/* Character 1 */}
              <div className="space-y-3 mb-6">
                <Label>First Character</Label>
                <Select value={selectedBook1} onValueChange={(val) => { setSelectedBook1(val); setSelectedChar1(null); }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a book..." />
                  </SelectTrigger>
                  <SelectContent>
                    {books.filter(b => b.characters?.length > 0).map(book => (
                      <SelectItem key={book.id} value={book.id}>
                        {book.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {book1?.characters && (
                  <div className="grid gap-2">
                    {book1.characters.map(char => (
                      <CharacterBadge
                        key={char.name}
                        character={char}
                        bookTitle={book1.title}
                        isSelected={char.name === selectedChar1}
                        onClick={() => setSelectedChar1(char.name)}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Character 2 */}
              <div className="space-y-3">
                <Label>Second Character</Label>
                <Select value={selectedBook2} onValueChange={(val) => { setSelectedBook2(val); setSelectedChar2(null); }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a different book..." />
                  </SelectTrigger>
                  <SelectContent>
                    {books.filter(b => b.characters?.length > 0 && b.id !== selectedBook1).map(book => (
                      <SelectItem key={book.id} value={book.id}>
                        {book.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {book2?.characters && (
                  <div className="grid gap-2">
                    {book2.characters.map(char => (
                      <CharacterBadge
                        key={char.name}
                        character={char}
                        bookTitle={book2.title}
                        isSelected={char.name === selectedChar2}
                        onClick={() => setSelectedChar2(char.name)}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Conversation Settings */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5">
              <div>
                <Label>Conversation Length</Label>
                <Select value={conversationLength} onValueChange={setConversationLength}>
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="short">Short (4-6 exchanges)</SelectItem>
                    <SelectItem value="medium">Medium (8-12 exchanges)</SelectItem>
                    <SelectItem value="long">Long (14-18 exchanges)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="border-t pt-4">
                <Label className="text-base font-semibold">Human Participants</Label>
                <p className="text-xs text-slate-500 mt-1 mb-3">Add yourself or multiple people to join the conversation</p>
                <div className="grid grid-cols-4 gap-2">
                  {[0, 1, 2, 3].map(num => (
                    <button
                      key={num}
                      onClick={() => setNumHumans(num)}
                      className={`py-2.5 px-3 rounded-lg border-2 font-medium transition-all ${
                        numHumans === num
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-slate-200 hover:border-blue-300 text-slate-600'
                      }`}
                    >
                      {num === 0 ? 'None' : num}
                    </button>
                  ))}
                </div>
                {numHumans > 0 && (
                  <div className="mt-3 p-3 bg-blue-50 rounded-lg flex items-start gap-2">
                    <User className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                    <p className="text-xs text-blue-700">
                      {numHumans === 1 ? 'You' : `${numHumans} people`} will be able to respond during the conversation
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Topic Input */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <div className="flex items-center justify-between mb-2">
                <Label>Conversation Topic</Label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={generateAITopic}
                  disabled={!canGenerate || isGenerating}
                  className="text-xs"
                >
                  <Sparkles className="w-3 h-3 mr-1" />
                  AI Suggest
                </Button>
              </div>
              <Textarea
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="E.g., 'They discuss what it means to be a hero' or leave empty for AI to choose"
                className="mt-2"
                rows={3}
              />
              
              <Button
                onClick={generateDialogue}
                disabled={!canGenerate || isGenerating}
                className="w-full mt-4 bg-violet-600 hover:bg-violet-700"
              >
                {isGenerating ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Generating...</>
                ) : (
                  <><Sparkles className="w-4 h-4 mr-2" /> Generate Dialogue</>
                )}
              </Button>
            </div>
          </div>

          {/* Right: Dialogue Display */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <h2 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-violet-600" />
              Conversation
            </h2>

            {dialogue.length > 0 ? (
              <div className="space-y-4">
                <DialogueView turns={dialogue} char1={char1} char2={char2} empathyInsights={empathyInsights} />
                
                {numHumans > 0 && isHumanTurn && !isGenerating && (
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-300 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <User className="w-5 h-5 text-blue-600" />
                      <p className="text-sm font-semibold text-blue-900">Your turn to respond:</p>
                    </div>
                    <div className="flex gap-2">
                      <Input
                        value={humanInput}
                        onChange={(e) => setHumanInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleHumanResponse()}
                        placeholder="Share your thoughts..."
                        className="flex-1"
                      />
                      <Button onClick={handleHumanResponse} size="icon" className="bg-blue-600 hover:bg-blue-700">
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-center h-[400px] text-center">
                <div>
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-violet-100 flex items-center justify-center">
                    <MessageSquare className="w-8 h-8 text-violet-400" />
                  </div>
                  <p className="text-slate-500 text-sm">
                    {!canGenerate 
                      ? 'Select two characters from different books to start'
                      : 'Click "Generate Dialogue" to see them interact'}
                  </p>
                </div>
              </div>
            )}
          </div>
            </div>
      </div>
    </div>
  );
}