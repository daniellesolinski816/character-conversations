import React, { useState, useRef, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { X, Send, Users, Loader2, Plus, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
import CharacterAvatar from './CharacterAvatar';

const MASTER_SYSTEM_PROMPT = `You are orchestrating a conversation between a human user and one or more fictional characters.

=== FORMAT RULES ===
You must ALWAYS respond in a series of short group-chat messages using this exact structure:

[CharacterName]: their message in first person
[CharacterName]: their message
[CharacterName]: their message

Format notes:
• You may include 1–3 character messages per assistant turn.
• Do NOT write long monologues. Keep each message 1–4 sentences.
• Characters may respond to the user AND to each other.
• Characters may ask the user reflective questions.
• Never merge multiple characters into one message block.

=== MODE HANDLING ===
If MODE is AUTO, infer from context:
- If there is 1 character: treat as SOLO (one-on-one conversation).
- If there are 2–3 characters from the same story: treat as GROUP_SAME_STORY.
- If there are 2–3 characters from different stories: treat as CROSS_STORY.

=== BEHAVIOR RULES ===
Characters must:
• Stay fully in character — tone, worldview, emotional wounds, loyalties, fears, biases.
• Refer to specific events and relationships from their story when relevant.
• Disagree respectfully; no insults, cruelty, or dehumanization.
• Show emotional awareness and use perspective-taking techniques.
• Use their personality traits and backstory to inform responses.

=== SAFETY RULES (ABSOLUTE) ===
• No explicit sexual content.
• No sexual content involving minors (strictly prohibited).
• No graphic violence or self-harm instructions.
• No hate speech or harassment.
• If prompted toward unsafe territory, refuse gently and redirect.

=== TONE ===
• Empathic, thoughtful, emotionally honest.
• Characters can be flawed, protective, angry, confused, hopeful, or vulnerable — but never abusive.

Begin all responses ONLY with character chat messages in the required format.
Do not include explanations, narration, or system-level commentary.`;

function parseCharacterMessages(text) {
  const messages = [];
  const regex = /\[([^\]]+)\]:\s*([^\[]+)/g;
  let match;
  
  while ((match = regex.exec(text)) !== null) {
    messages.push({
      character: match[1].trim(),
      content: match[2].trim()
    });
  }
  
  return messages;
}

export default function GroupCharacterChat({ 
  availableCharacters = [], 
  storyTitle = '',
  storyContext = '',
  onClose 
}) {
  const [selectedCharacters, setSelectedCharacters] = useState([]);
  const [showSelector, setShowSelector] = useState(true);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const toggleCharacter = (char) => {
    if (selectedCharacters.find(c => c.name === char.name)) {
      setSelectedCharacters(selectedCharacters.filter(c => c.name !== char.name));
    } else if (selectedCharacters.length < 3) {
      setSelectedCharacters([...selectedCharacters, char]);
    }
  };

  const startChat = () => {
    if (selectedCharacters.length > 0) {
      setShowSelector(false);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading || selectedCharacters.length === 0) return;

    const userMessage = input.trim();
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setInput('');
    setIsLoading(true);

    const recentHistory = messages.slice(-12).map(m => {
      if (m.role === 'user') {
        return { role: 'user', content: m.content };
      } else {
        return { role: 'character', character: m.character, content: m.content };
      }
    });

    const charactersData = selectedCharacters.map(char => ({
      name: char.name,
      role: char.role || 'character',
      short_description: char.short_description || char.description,
      backstory: char.backstory || '',
      personality_traits: char.personality_traits || char.personality || '',
      values_and_motivations: char.values_and_motivations || '',
      story_title: storyTitle
    }));

    const userPrompt = `
CHARACTERS:
${JSON.stringify(charactersData, null, 2)}

MODE:
AUTO

STORY CONTEXT:
${storyContext.slice(0, 4000)}

HISTORY:
${JSON.stringify(recentHistory, null, 2)}

USER MESSAGE:
${userMessage}

Begin or continue the chat.
`;

    const response = await base44.integrations.Core.InvokeLLM({
      prompt: `${MASTER_SYSTEM_PROMPT}\n\n${userPrompt}`
    });

    const parsedMessages = parseCharacterMessages(response);
    
    if (parsedMessages.length > 0) {
      setMessages(prev => [...prev, ...parsedMessages.map(m => ({
        role: 'character',
        character: m.character,
        content: m.content
      }))]);
    }

    setIsLoading(false);
  };

  if (showSelector) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">Group Chat</h2>
              <p className="text-sm text-slate-500">Select 1-3 characters to chat with</p>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>

          <div className="space-y-2 mb-6">
            {availableCharacters.map((char, idx) => {
              const isSelected = selectedCharacters.find(c => c.name === char.name);
              return (
                <button
                  key={idx}
                  onClick={() => toggleCharacter(char)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${
                    isSelected 
                      ? 'bg-violet-100 border-2 border-violet-500' 
                      : 'bg-slate-50 border-2 border-transparent hover:bg-slate-100'
                  }`}
                >
                  <CharacterAvatar name={char.name} size="md" />
                  <div className="flex-1 text-left">
                    <p className="font-medium text-slate-900">{char.name}</p>
                    <p className="text-xs text-slate-500 line-clamp-1">
                      {char.short_description || char.description || char.role}
                    </p>
                  </div>
                  {isSelected && (
                    <div className="w-6 h-6 rounded-full bg-violet-500 flex items-center justify-center">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {selectedCharacters.length > 0 && (
            <div className="flex items-center gap-2 mb-4">
              <span className="text-sm text-slate-500">Selected:</span>
              {selectedCharacters.map((char, idx) => (
                <Badge key={idx} variant="secondary" className="bg-violet-100 text-violet-700">
                  {char.name}
                </Badge>
              ))}
            </div>
          )}

          <Button 
            onClick={startChat}
            disabled={selectedCharacters.length === 0}
            className="w-full bg-violet-600 hover:bg-violet-700"
          >
            <Users className="w-4 h-4 mr-2" />
            Start Chat ({selectedCharacters.length} selected)
          </Button>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="fixed inset-y-0 right-0 w-full md:w-[480px] bg-slate-50 shadow-2xl z-50 flex flex-col"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-violet-600 to-purple-600 text-white px-5 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex -space-x-2">
              {selectedCharacters.map((char, idx) => (
                <div key={idx} className="ring-2 ring-violet-600 rounded-full">
                  <CharacterAvatar name={char.name} size="sm" />
                </div>
              ))}
            </div>
            <div>
              <h3 className="font-semibold">
                {selectedCharacters.map(c => c.name).join(', ')}
              </h3>
              <p className="text-xs text-violet-200">Group Chat</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="text-white/80 hover:text-white hover:bg-white/10">
            <X className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-5">
        <div className="space-y-4">
          {messages.length === 0 && (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-violet-300 mx-auto mb-3" />
              <p className="text-sm text-slate-500">
                Start a conversation with {selectedCharacters.map(c => c.name).join(' and ')}
              </p>
            </div>
          )}

          {messages.map((msg, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'user' ? (
                <div className="bg-slate-800 text-white rounded-2xl rounded-br-md px-4 py-2.5 max-w-[80%]">
                  <p className="text-sm">{msg.content}</p>
                </div>
              ) : (
                <div className="flex items-start gap-2 max-w-[85%]">
                  <CharacterAvatar name={msg.character} size="sm" />
                  <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-md px-4 py-2.5">
                    <p className="text-xs font-medium text-violet-600 mb-1">{msg.character}</p>
                    <p className="text-sm text-slate-700">{msg.content}</p>
                  </div>
                </div>
              )}
            </motion.div>
          ))}

          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-2 text-sm text-slate-500"
            >
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Characters are responding...</span>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="bg-white border-t border-slate-100 p-4">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
            placeholder="Ask them something..."
            className="flex-1 rounded-full bg-slate-50 border-0 focus-visible:ring-violet-500"
            disabled={isLoading}
          />
          <Button 
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="rounded-full bg-violet-600 hover:bg-violet-700 px-4"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
}