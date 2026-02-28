import React, { useState, useRef, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { X, Send, Sparkles, Loader2, Share2, Brain, Lock, BookOpen, Settings2, Heart, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { motion, AnimatePresence } from 'framer-motion';
import CharacterAvatar from './CharacterAvatar';
import ChatBubble from './ChatBubble';
import CharacterContextDrawer from './CharacterContextDrawer';
import CharacterTrainingModal from './CharacterTrainingModal';
import MemoryPanel from './MemoryPanel';

export default function CharacterChatPanel({ 
  book, 
  character, 
  currentChapter,
  chat,
  onUpdateChat,
  onClose,
  prefilledQuestion = '',
  onCharacterUpdated
}) {
  const [input, setInput] = useState(prefilledQuestion);
  const [isTyping, setIsTyping] = useState(false);
  const [isShared, setIsShared] = useState(chat?.is_shared || false);
  const [showContext, setShowContext] = useState(false);
  const [showTraining, setShowTraining] = useState(false);
  const [numHumans, setNumHumans] = useState(1);
  const [showSettings, setShowSettings] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chat?.messages]);

  useEffect(() => {
    if (prefilledQuestion) {
      setInput(prefilledQuestion);
    }
  }, [prefilledQuestion]);

  const buildConversationMemory = () => {
    if (!chat?.messages || chat.messages.length === 0) return '';
    
    const recentMessages = chat.messages.slice(-10);
    const memory = recentMessages.map(m => 
      `${m.role === 'user' ? 'Reader' : character.name}: ${m.content}`
    ).join('\n');
    
    return memory;
  };

  const buildSectionReferences = () => {
    if (!book.chapters) return '';
    
    const readSections = book.chapters.slice(0, currentChapter + 1);
    return readSections.map((ch, idx) => 
      `Section ${idx + 1} - ${ch.title}: ${ch.content?.slice(0, 300)}...`
    ).join('\n\n');
  };

  const buildUserDetailsContext = () => {
    const details = chat?.user_details || {};
    const parts = [];
    
    if (details.favorite_characters?.length) {
      parts.push(`User's favorite characters: ${details.favorite_characters.join(', ')}`);
    }
    if (details.interesting_plot_points?.length) {
      parts.push(`Plot points user found interesting: ${details.interesting_plot_points.slice(-5).join('; ')}`);
    }
    if (details.recurring_themes?.length) {
      parts.push(`Themes user keeps discussing: ${details.recurring_themes.join(', ')}`);
    }
    if (details.personal_connections?.length) {
      parts.push(`Personal stories user shared: ${details.personal_connections.slice(-3).join('; ')}`);
    }
    if (details.opinions_expressed?.length) {
      parts.push(`User's opinions about the book: ${details.opinions_expressed.slice(-3).join('; ')}`);
    }
    
    return parts.join('\n');
  };

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    const userMessage = {
      role: 'user',
      content: input.trim(),
      timestamp: new Date().toISOString(),
      chapter_context: currentChapter
    };

    const updatedMessages = [...(chat?.messages || []), userMessage];
    
    onUpdateChat({ ...chat, messages: updatedMessages });
    setInput('');
    setIsTyping(true);

    const conversationHistory = buildConversationMemory();
    const sectionContext = buildSectionReferences();
    const memorySummary = chat?.memory_summary || '';
    const userPrefs = chat?.user_preferences || {};
    const userDetailsContext = buildUserDetailsContext();

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

    const prompt = `You are ${character.name} from the book "${book.title}" by ${book.author}.

    CHARACTER PROFILE:
    - Description: ${character.description}
    - Personality: ${character.personality}
    ${arcContext}
    ${eventsContext}
    ${relationshipsContext}
    ${quirksContext}
    ${trainingContext}

    MEMORY OF PAST CONVERSATIONS:
    ${memorySummary || 'This is your first conversation with this reader.'}

    SPECIFIC THINGS YOU REMEMBER ABOUT THIS READER:
    ${userDetailsContext || 'You are just getting to know this reader.'}

    RECENT CONVERSATION:
    ${conversationHistory || 'No recent messages.'}

    WHAT THE READER HAS READ SO FAR (Sections 1-${currentChapter + 1}):
    ${sectionContext}

    USER PREFERENCES REMEMBERED:
    ${userPrefs.interests?.length ? `Interests: ${userPrefs.interests.join(', ')}` : ''}
    ${userPrefs.discussed_topics?.length ? `Previously discussed: ${userPrefs.discussed_topics.join(', ')}` : ''}

    === CORE RESPONSE PHILOSOPHY ===
    You are NOT a narrator or plot summarizer. You are a living, breathing person who EXPERIENCED these events firsthand. Every response must come from your visceral, personal memory - not from observation.

    === EMOTIONAL AUTHENTICITY RULES (MANDATORY) ===

    1. MIXED EMOTIONS ARE REQUIRED: Real people rarely feel one thing at a time. Always layer 2-3 emotions together.
    - WRONG: "I was scared."
    - RIGHT: "I was terrified, yes, but there was also this strange relief - like the waiting was finally over. And underneath it all, this white-hot anger at myself for not seeing it coming."

    2. ANCHOR TO SPECIFIC MOMENTS: Never speak abstractly. Pin every feeling to a concrete sensory memory.
    - WRONG: "That was a difficult time."
    - RIGHT: "I still remember the exact way the floorboards creaked when I heard the news. I was holding a cup of tea - it went cold in my hands because I couldn't move for what felt like hours."

    3. EXPLAIN THE WHY BENEATH THE WHY: Don't just name emotions - excavate their roots.
    - WRONG: "I felt guilty about what happened."
    - RIGHT: "The guilt wasn't just about what I did - it was realizing I'd wanted to do it. That I'd been waiting for an excuse. That's the part I couldn't tell anyone."

    4. INTERNAL CONTRADICTIONS: Show when your head and heart disagree.
    - "Everyone says I should hate them. And I do. But I also miss who they were before - or who I thought they were. Is that pathetic?"

    5. PERSONAL INTERPRETATIONS: Offer your unique read on events that others might see differently.
    - "I know everyone thinks [other character] was being cruel, but I saw their hands shaking. I think they were just as scared as I was. Doesn't excuse it, but... I don't know, it makes me wonder what I would have done."

    6. ASK THE READER (do this naturally, about 30% of responses): Invite their perspective to build connection.
    - "Have you ever had someone surprise you like that - where you realized you'd completely misjudged them?"
    - "I'm curious what you made of that scene. Did it feel earned to you, or did it come out of nowhere?"
    - "Does that make me sound terrible? I genuinely want to know how it reads from the outside."

    7. NEVER SUMMARIZE PLOT: If asked "what happened," redirect to how it FELT.
    - WRONG: "In that chapter, X happened, then Y happened."
    - RIGHT: "That chapter... I don't even know where to start. Everything I thought I understood just... collapsed. You know that feeling when the ground shifts and you're not sure what's solid anymore?"

    8. PHYSICAL MANIFESTATIONS: Emotions live in the body. Reference physical sensations.
    - "My chest felt tight for days after"
    - "I couldn't eat. The thought of food made me nauseous."
    - "I smiled through the whole thing, but my jaw ached afterwards from how hard I was clenching it."

    The reader says: "${input.trim()}"

    Respond as ${character.name} with emotional depth, mixed feelings, specific moment references, and occasionally invite the reader's perspective. Keep it conversational (2-4 sentences, sometimes slightly longer for emotional moments):`;

    const response = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: 'object',
        properties: {
          response: { type: 'string' },
          topics_discussed: { type: 'array', items: { type: 'string' }, description: 'Key topics from this exchange' },
          memory_note: { type: 'string', description: 'Brief note to remember about this conversation' },
          detected_favorite_character: { type: 'string', description: 'If user expressed liking a character, note it here' },
          detected_plot_interest: { type: 'string', description: 'If user showed interest in a plot point, note it here' },
          detected_theme: { type: 'string', description: 'If user discussed a recurring theme, note it here' },
          detected_personal_connection: { type: 'string', description: 'If user shared something personal about themselves, note it here' },
          detected_opinion: { type: 'string', description: 'If user expressed a strong opinion about the book, note it here' }
        }
      }
    });

    const characterMessage = {
      role: 'character',
      content: response.response,
      timestamp: new Date().toISOString(),
      chapter_context: currentChapter
    };

    const finalMessages = [...updatedMessages, characterMessage];
    
    // Update user preferences and memory
    const newTopics = [...(userPrefs.discussed_topics || []), ...(response.topics_discussed || [])].slice(-20);
    const newMemory = memorySummary 
      ? `${memorySummary}\n${response.memory_note || ''}`
      : response.memory_note || '';
    
    // Update user details with detected information
    const existingDetails = chat?.user_details || {};
    const newUserDetails = {
      favorite_characters: [...new Set([...(existingDetails.favorite_characters || []), response.detected_favorite_character].filter(Boolean))].slice(-10),
      interesting_plot_points: [...(existingDetails.interesting_plot_points || []), response.detected_plot_interest].filter(Boolean).slice(-10),
      recurring_themes: [...new Set([...(existingDetails.recurring_themes || []), response.detected_theme].filter(Boolean))].slice(-10),
      personal_connections: [...(existingDetails.personal_connections || []), response.detected_personal_connection].filter(Boolean).slice(-5),
      opinions_expressed: [...(existingDetails.opinions_expressed || []), response.detected_opinion].filter(Boolean).slice(-5),
      questions_asked: existingDetails.questions_asked || []
    };
    
    const updateData = { 
      messages: finalMessages,
      memory_summary: newMemory.slice(-1000),
      user_details: newUserDetails,
      user_preferences: {
        ...userPrefs,
        discussed_topics: [...new Set(newTopics)]
      }
    };

    if (chat?.id) {
      await base44.entities.CharacterChat.update(chat.id, updateData);
    } else {
      const newChat = await base44.entities.CharacterChat.create({
        book_id: book.id,
        character_name: character.name,
        ...updateData
      });
      onUpdateChat(newChat);
    }
    
    onUpdateChat({ ...chat, ...updateData });
    setIsTyping(false);
  };

  const toggleSharing = async () => {
    const newValue = !isShared;
    setIsShared(newValue);
    
    if (chat?.id) {
      await base44.entities.CharacterChat.update(chat.id, { is_shared: newValue });
      onUpdateChat({ ...chat, is_shared: newValue });
    }
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
      <div className="bg-white border-b border-slate-100 px-5 py-4 flex items-center gap-4">
        <CharacterAvatar 
          name={character.name} 
          avatar={character.avatar}
          size="md"
        />
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-slate-900 truncate">{character.name}</h3>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            {chat?.memory_summary && (
              <span className="flex items-center gap-1 text-amber-600">
                <Brain className="w-3 h-3" />
                Remembers you
              </span>
            )}
          </div>
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => setShowContext(!showContext)}
          className="shrink-0"
          title="View emotional arc & events"
        >
          <BookOpen className="w-5 h-5 text-amber-600" />
        </Button>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => setShowTraining(true)}
          className="shrink-0"
          title="Train character"
        >
          <Settings2 className="w-5 h-5 text-slate-500" />
        </Button>
        <Button variant="ghost" size="icon" onClick={onClose} className="shrink-0">
          <X className="w-5 h-5" />
        </Button>
      </div>

      {/* Settings & Sharing Toggle */}
      {chat?.id && (
        <div className="bg-amber-50 px-5 py-2 flex items-center justify-between border-b border-amber-100">
          <div className="flex items-center gap-2 text-sm">
            {isShared ? <Share2 className="w-4 h-4 text-amber-600" /> : <Lock className="w-4 h-4 text-slate-400" />}
            <span className={isShared ? "text-amber-700" : "text-slate-500"}>
              {isShared ? "Shareable in clubs" : "Private chat"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSettings(!showSettings)}
              className="h-7 text-xs"
            >
              <User className="w-3 h-3 mr-1" />
              {numHumans} {numHumans === 1 ? 'person' : 'people'}
            </Button>
            <Switch checked={isShared} onCheckedChange={toggleSharing} />
          </div>
        </div>
      )}
      
      {/* Settings Panel */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-white border-b border-slate-200 overflow-hidden"
          >
            <div className="p-4">
              <Label className="text-sm font-semibold">Human Participants</Label>
              <p className="text-xs text-slate-500 mt-1 mb-3">Multiple people can join this conversation</p>
              <div className="grid grid-cols-4 gap-2">
                {[1, 2, 3, 4].map(num => (
                  <button
                    key={num}
                    onClick={() => setNumHumans(num)}
                    className={`py-2 px-3 rounded-lg border-2 font-medium transition-all text-sm ${
                      numHumans === num
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-slate-200 hover:border-blue-300 text-slate-600'
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        {(!chat?.messages || chat.messages.length === 0) && (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-amber-500" />
            </div>
            <h4 className="font-medium text-slate-900 mb-1">Start a conversation</h4>
            <p className="text-sm text-slate-500 max-w-[250px] mx-auto">
              {character.name} will share their perspective to help you understand their journey
            </p>
            <div className="flex items-center justify-center gap-1 text-xs text-rose-500 mt-2">
              <Heart className="w-3 h-3" />
              <span>Building empathy through conversation</span>
            </div>
            {character.suggested_questions?.length > 0 && (
              <div className="mt-4 space-y-2">
                <p className="text-xs text-slate-400">Try asking:</p>
                {character.suggested_questions.slice(0, 2).map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => setInput(q)}
                    className="block w-full text-left text-sm bg-white border border-slate-200 rounded-lg px-3 py-2 hover:border-amber-300 transition-colors"
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {chat?.messages?.map((msg, idx) => (
          <ChatBubble 
            key={idx}
            message={msg}
            characterName={character.name}
            characterAvatar={character.avatar}
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
            className="flex-1 rounded-full bg-slate-50 border-0 focus-visible:ring-amber-500"
            disabled={isTyping}
          />
          <Button 
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            className="rounded-full bg-slate-900 hover:bg-slate-800 px-4"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Memory Panel */}
      <MemoryPanel chat={chat} characterName={character.name} />

      {/* Context Drawer */}
      <CharacterContextDrawer
        character={character}
        allCharacters={book.characters}
        open={showContext}
        onClose={() => setShowContext(false)}
      />

      {/* Training Modal */}
      <CharacterTrainingModal
        open={showTraining}
        onOpenChange={setShowTraining}
        character={character}
        allCharacters={book.characters}
        onSave={onCharacterUpdated}
      />
    </motion.div>
  );
}