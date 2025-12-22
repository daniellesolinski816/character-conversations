import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import { ArrowLeft, Sparkles, Loader2, BookOpen, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import CharacterAvatar from '@/components/CharacterAvatar';

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

function DialogueView({ turns, char1, char2 }) {
  return (
    <ScrollArea className="h-[400px] pr-4">
      <div className="space-y-4">
        {turns.map((turn, idx) => {
          const isChar1 = turn.speaker.toLowerCase().includes(char1.name.toLowerCase());
          const character = isChar1 ? char1 : char2;
          
          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: isChar1 ? -20 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className={`flex gap-3 ${isChar1 ? '' : 'flex-row-reverse'}`}
            >
              <CharacterAvatar 
                name={character.name} 
                avatar={character.avatar}
                size="sm"
              />
              <div className={`flex-1 ${isChar1 ? 'text-left' : 'text-right'}`}>
                <p className="text-xs font-medium text-slate-500 mb-1">{turn.speaker}</p>
                <div className={`inline-block p-3 rounded-2xl ${
                  isChar1 
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

  const { data: books = [] } = useQuery({
    queryKey: ['books'],
    queryFn: () => base44.entities.Book.list('-created_date'),
  });

  const book1 = books.find(b => b.id === selectedBook1);
  const book2 = books.find(b => b.id === selectedBook2);
  const char1 = book1?.characters?.find(c => c.name === selectedChar1);
  const char2 = book2?.characters?.find(c => c.name === selectedChar2);

  const buildCharacterContext = (character, book) => {
    return `
CHARACTER: ${character.name} from "${book.title}" by ${book.author}
- Personality: ${character.personality || character.description}
- Emotional State: ${character.emotional_arc?.starting_state || 'Complex'}
- Key Events: ${character.canon_events?.map(e => e.event).join('; ') || 'See story'}
- Quirks: ${character.personality_quirks?.join(', ') || 'Unique speech patterns'}
- Relationships: ${character.relationships?.map(r => `${r.character_name} (${r.relationship_type})`).join(', ') || 'Various'}`;
  };

  const generateDialogue = async () => {
    if (!char1 || !char2) return;
    
    setIsGenerating(true);
    setDialogue([]);

    try {
      const char1Context = buildCharacterContext(char1, book1);
      const char2Context = buildCharacterContext(char2, book2);

      const prompt = `${SYSTEM_PROMPT}

${char1Context}

${char2Context}

CONVERSATION TOPIC: ${topic || 'These two characters meet and discover they\'re from different stories. They discuss their experiences, challenges, and what defines them.'}

SPECIAL CONSIDERATION:
- ${char1.name} comes from ${book1.genre || 'their story'} - bring that sensibility
- ${char2.name} comes from ${book2.genre || 'their story'} - contrast with the above
- Both should be curious but true to themselves
- Explore how different story worlds shape different perspectives

Generate the dialogue:`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: 'object',
          properties: {
            dialogue: { type: 'string', description: 'The full dialogue exchange' }
          }
        }
      });

      const turns = parseDialogue(response.dialogue);
      setDialogue(turns);
    } catch (error) {
      console.error('Failed to generate dialogue:', error);
    } finally {
      setIsGenerating(false);
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

            {/* Topic Input */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <Label>Conversation Topic (optional)</Label>
              <Textarea
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="E.g., 'They discuss what it means to be a hero' or 'They compare their different worlds and challenges'"
                className="mt-2"
                rows={3}
              />
              
              <Button
                onClick={generateDialogue}
                disabled={!canGenerate || isGenerating}
                className="w-full mt-4 bg-violet-600 hover:bg-violet-700"
              >
                {isGenerating ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Generating Dialogue...</>
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
              <DialogueView turns={dialogue} char1={char1} char2={char2} />
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