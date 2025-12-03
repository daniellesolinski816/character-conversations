import React, { useState, useRef, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { X, Send, Sparkles, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { motion } from 'framer-motion';
import CharacterAvatar from './CharacterAvatar';
import ChatBubble from './ChatBubble';

export default function WritingCharacterChat({ writing, character, onClose }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
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

    const prompt = `You are ${character.name}, a character from the user's original creative writing titled "${writing.title}".

CHARACTER PROFILE:
- Name: ${character.name}
- Description: ${character.description}
- Personality: ${character.personality}

THE STORY CONTEXT (written by the user):
${writing.content.slice(0, 6000)}

RECENT CONVERSATION:
${conversationHistory || 'This is the start of your conversation.'}

IMPORTANT INSTRUCTIONS:
1. Stay completely in character as ${character.name}
2. Reference events and details from the user's writing
3. Use speech patterns and personality consistent with how you appear in the story
4. Be engaging and help the user explore their own creation
5. If asked about events not in the story, creatively respond in character
6. Keep responses conversational (2-4 sentences)

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
        <Button variant="ghost" size="icon" onClick={onClose} className="text-white/80 hover:text-white hover:bg-white/10">
          <X className="w-5 h-5" />
        </Button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        {messages.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-violet-100 to-purple-100 flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-violet-500" />
            </div>
            <h4 className="font-medium text-slate-900 mb-1">Chat with {character.name}</h4>
            <p className="text-sm text-slate-500 max-w-[250px] mx-auto">
              This character is from your own writing! Ask them anything about their story.
            </p>
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
    </motion.div>
  );
}