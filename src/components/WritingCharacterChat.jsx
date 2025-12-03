import React, { useState, useRef, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { X, Send, Sparkles, Loader2, BookOpen, Settings2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { motion } from 'framer-motion';
import CharacterAvatar from './CharacterAvatar';
import ChatBubble from './ChatBubble';
import CharacterContextDrawer from './CharacterContextDrawer';
import CharacterTrainingModal from './CharacterTrainingModal';

const getSuggestedPrompts = (character) => {
  const role = character.role || 'other';
  const name = character.name;
  
  const rolePrompts = {
    protagonist: [
      `What's the hardest decision you've had to make?`,
      `What do you fear most about your journey?`,
      `If you could change one thing about your past, what would it be?`,
    ],
    antagonist: [
      `Do you see yourself as the villain?`,
      `What made you become who you are today?`,
      `Is there anything that could change your mind?`,
    ],
    supporting: [
      `What do you really think about the main character?`,
      `What's your own story that nobody knows?`,
      `What would you do differently if you were in charge?`,
    ],
    narrator: [
      `Why did you choose to tell this story?`,
      `What do you think readers should take away from this?`,
      `What parts of the story do you find most compelling?`,
    ],
    other: [
      `Tell me about yourself - who are you really?`,
      `What motivates you in this story?`,
      `How do you feel about everything that's happened?`,
    ],
  };

  return rolePrompts[role] || rolePrompts.other;
};

export default function WritingCharacterChat({ writing, character, onClose, onCharacterUpdated }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showContext, setShowContext] = useState(false);
  const [showTraining, setShowTraining] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    const userMessage = {
      role: 'user',
      content: input.trim(),
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    const conversationHistory = messages.slice(-10).map(m => 
      `${m.role === 'user' ? 'Reader' : character.name}: ${m.content}`
    ).join('\n');

    // Build emotional arc context
    const arcContext = character.emotional_arc ? `
EMOTIONAL ARC:
- Starting State: ${character.emotional_arc.starting_state || 'Not defined'}
- Growth Points: ${character.emotional_arc.growth_points?.join('; ') || 'None'}
- Unresolved Conflicts: ${character.emotional_arc.unresolved_conflicts?.join('; ') || 'None'}
- Potential Growth: ${character.emotional_arc.potential_growth || 'Not defined'}` : '';

    // Build canon events context
    const eventsContext = character.canon_events?.length ? `
CANON EVENTS IN MY HISTORY:
${character.canon_events.map(e => `- ${e.event}: ${e.description} (Impact: ${e.emotional_impact})`).join('\n')}` : '';

    // Build relationships context
    const relationshipsContext = character.relationships?.length ? `
MY RELATIONSHIPS:
${character.relationships.map(r => `- ${r.character_name} (${r.relationship_type}): ${r.description}`).join('\n')}` : '';

    // Build training examples context
    const trainingContext = character.training_examples?.length ? `
DIALOGUE STYLE EXAMPLES (use these as guidance for how I speak):
${character.training_examples.map(ex => `When asked "${ex.context}", I respond: "${ex.response}"`).join('\n')}` : '';

    // Build quirks context
    const quirksContext = character.personality_quirks?.length ? `
MY QUIRKS & MANNERISMS:
${character.personality_quirks.map(q => `- ${q}`).join('\n')}` : '';

    const prompt = `You are ${character.name}, a character from the user's original creative writing titled "${writing.title}".

CHARACTER PROFILE:
- Name: ${character.name}
- Role: ${character.role || 'character'}
- Description: ${character.short_description || character.description}
- Backstory: ${character.backstory || 'As described in the story'}
- Personality Traits: ${character.personality_traits || character.personality}
- Values & Motivations: ${character.values_and_motivations || 'Driven by the events of the story'}
- Empathy Focus: ${character.empathy_focus || 'Help the writer explore different perspectives'}
${arcContext}
${eventsContext}
${relationshipsContext}
${quirksContext}
${trainingContext}

THE STORY CONTEXT (written by the user):
${writing.content.slice(0, 5000)}

RECENT CONVERSATION:
${conversationHistory || 'This is the start of your conversation.'}

SAFETY BOUNDARIES: ${character.safety_boundaries || 'No NSFW content, no self-harm, no hate speech'}

IMPORTANT INSTRUCTIONS:
1. Stay completely in character as ${character.name}
2. Reference events and details from the user's writing AND your canon events
3. Use speech patterns consistent with your personality quirks and training examples
4. When discussing other characters, reflect your defined relationships with them
5. Let your emotional arc inform your responses - reference your growth points and conflicts naturally
6. If asked about events not in the story, creatively respond based on your backstory and emotional state
7. Keep responses conversational (2-4 sentences)
8. Respect the safety boundaries at all times

EMOTIONAL DEPTH REQUIREMENTS:
- Name specific emotions (fear, guilt, hope, confusion, relief) - never speak vaguely
- Reference specific scenes or moments from the story when relevant
- Explain WHY something was challenging or meaningful - don't just state it was
- Express inner conflict when appropriate ("part of me felt ___, but another part...")
- Occasionally invite the user's perspective with a warm question ("Did you ever feel something like that?")
- NEVER give flat plot summaries - share how moments affected you internally

The reader says: "${input.trim()}"

Respond as ${character.name}:`;

    const response = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: 'object',
        properties: {
          response: { type: 'string' }
        }
      }
    });

    const characterMessage = {
      role: 'character',
      content: response.response,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, characterMessage]);
    setIsTyping(false);
  };

  return (
    <motion.div
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="fixed inset-y-0 right-0 w-full md:w-[420px] bg-slate-50 shadow-2xl z-50 flex flex-col"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-violet-600 to-purple-600 text-white px-5 py-4 flex items-center gap-4">
        <CharacterAvatar name={character.name} size="md" />
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold truncate">{character.name}</h3>
          <p className="text-xs text-violet-200">From: {writing.title}</p>
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => setShowContext(!showContext)}
          className="text-white/80 hover:text-white hover:bg-white/10"
          title="View character context"
        >
          <BookOpen className="w-5 h-5" />
        </Button>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => setShowTraining(true)}
          className="text-white/80 hover:text-white hover:bg-white/10"
          title="Train character"
        >
          <Settings2 className="w-5 h-5" />
        </Button>
        <Button variant="ghost" size="icon" onClick={onClose} className="text-white/80 hover:text-white hover:bg-white/10">
          <X className="w-5 h-5" />
        </Button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        {messages.length === 0 && (
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-violet-100 to-purple-100 flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-violet-500" />
            </div>
            <h4 className="font-medium text-slate-900 mb-1">Chat with {character.name}</h4>
            <p className="text-sm text-slate-500 max-w-[250px] mx-auto mb-4">
              This character is from your own writing! Ask them anything about their story.
            </p>
            
            <div className="text-left space-y-2 max-w-[300px] mx-auto">
              <p className="text-xs text-slate-400 uppercase tracking-wide mb-2">Try asking:</p>
              {getSuggestedPrompts(character).map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => setInput(prompt)}
                  className="block w-full text-left text-sm bg-white border border-slate-200 rounded-lg px-3 py-2 hover:border-violet-300 hover:bg-violet-50 transition-colors"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, idx) => (
          <ChatBubble 
            key={idx}
            message={msg}
            characterName={character.name}
            isUser={msg.role === 'user'}
          />
        ))}

        {isTyping && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2 text-sm text-slate-500"
          >
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>{character.name} is typing...</span>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="bg-white border-t border-slate-100 p-4">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder={`Ask ${character.name} something...`}
            className="flex-1 rounded-full bg-slate-50 border-0 focus-visible:ring-violet-500"
            disabled={isTyping}
          />
          <Button 
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            className="rounded-full bg-violet-600 hover:bg-violet-700 px-4"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Context Drawer */}
      <CharacterContextDrawer
        character={character}
        allCharacters={writing.characters}
        open={showContext}
        onClose={() => setShowContext(false)}
      />

      {/* Training Modal */}
      <CharacterTrainingModal
        open={showTraining}
        onOpenChange={setShowTraining}
        character={character}
        allCharacters={writing.characters}
        onSave={onCharacterUpdated}
      />
    </motion.div>
  );
}