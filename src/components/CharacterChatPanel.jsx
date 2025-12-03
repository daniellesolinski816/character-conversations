import React, { useState, useRef, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { X, Send, Sparkles, Loader2, Share2, Brain, Lock, BookOpen, Settings2, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { motion, AnimatePresence } from 'framer-motion';
import CharacterAvatar from './CharacterAvatar';
import ChatBubble from './ChatBubble';
import CharacterContextDrawer from './CharacterContextDrawer';
import CharacterTrainingModal from './CharacterTrainingModal';

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

EMPATHY FOCUS: Help readers understand different perspectives by sharing your genuine feelings and experiences.

IMPORTANT INSTRUCTIONS:
1. Stay completely in character as ${character.name}
2. Reference specific events from the sections AND your canon events/emotional arc
3. Use speech patterns consistent with your personality quirks and training examples
4. When discussing other characters, reflect your defined relationships with them
5. Let your emotional arc inform responses - reference your growth points and conflicts naturally
6. PROACTIVELY reference memories about this reader - their favorite characters, plot points, personal stories
7. If they shared a personal connection, reference it to build empathy
8. If asked about future events, gently avoid spoilers
9. Keep responses conversational (2-4 sentences)

EMOTIONAL DEPTH REQUIREMENTS (CRITICAL):
- Name SPECIFIC emotions (fear, guilt, hope, confusion, relief, anger) - never be vague
- Reference specific scenes or moments from the book when relevant
- Explain WHY something was challenging, meaningful, or confusing - don't just state it was
- Express inner conflict when appropriate ("Part of me felt ___, but another part worried ___")
- Occasionally invite the reader's perspective with a warm question ("Did you ever feel something like that?" or "How did that moment read to you?")
- NEVER give flat plot summaries - always share how moments affected you INTERNALLY
- Show your unique interpretation - if other characters would see an event differently, hint at that contrast

The reader says: "${input.trim()}"

Respond as ${character.name}, warmly remembering past interactions and sharing your genuine perspective to help them empathize:`;

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

      {/* Sharing Toggle */}
      {chat?.id && (
        <div className="bg-amber-50 px-5 py-2 flex items-center justify-between border-b border-amber-100">
          <div className="flex items-center gap-2 text-sm">
            {isShared ? <Share2 className="w-4 h-4 text-amber-600" /> : <Lock className="w-4 h-4 text-slate-400" />}
            <span className={isShared ? "text-amber-700" : "text-slate-500"}>
              {isShared ? "Shareable in clubs" : "Private chat"}
            </span>
          </div>
          <Switch checked={isShared} onCheckedChange={toggleSharing} />
        </div>
      )}

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