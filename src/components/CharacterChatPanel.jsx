import React, { useState, useRef, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { X, Send, Sparkles, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { motion, AnimatePresence } from 'framer-motion';
import CharacterAvatar from './CharacterAvatar';
import ChatBubble from './ChatBubble';

export default function CharacterChatPanel({ 
  book, 
  character, 
  currentChapter,
  chat,
  onUpdateChat,
  onClose 
}) {
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chat?.messages]);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    const userMessage = {
      role: 'user',
      content: input.trim(),
      timestamp: new Date().toISOString()
    };

    const updatedMessages = [...(chat?.messages || []), userMessage];
    
    // Optimistic update
    onUpdateChat({ ...chat, messages: updatedMessages });
    setInput('');
    setIsTyping(true);

    // Build context from current chapter
    const chapterContext = book.chapters?.[currentChapter]?.content?.slice(0, 2000) || '';

    const prompt = `You are ${character.name} from the book "${book.title}" by ${book.author}.

Character description: ${character.description}
Personality: ${character.personality}

Current chapter context the reader is on:
${chapterContext}

Stay completely in character. Respond as ${character.name} would, using their speech patterns and personality. Keep responses conversational and engaging, around 2-3 sentences. Don't break character or mention being an AI.

The reader asks: "${input.trim()}"

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

    const finalMessages = [...updatedMessages, characterMessage];
    
    if (chat?.id) {
      await base44.entities.CharacterChat.update(chat.id, { messages: finalMessages });
    } else {
      const newChat = await base44.entities.CharacterChat.create({
        book_id: book.id,
        character_name: character.name,
        messages: finalMessages
      });
      onUpdateChat(newChat);
    }
    
    onUpdateChat({ ...chat, messages: finalMessages });
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
      <div className="bg-white border-b border-slate-100 px-5 py-4 flex items-center gap-4">
        <CharacterAvatar 
          name={character.name} 
          avatar={character.avatar}
          size="md"
        />
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-slate-900 truncate">{character.name}</h3>
          <p className="text-xs text-slate-500 truncate">{character.description?.slice(0, 50)}...</p>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} className="shrink-0">
          <X className="w-5 h-5" />
        </Button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        {(!chat?.messages || chat.messages.length === 0) && (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-amber-500" />
            </div>
            <h4 className="font-medium text-slate-900 mb-1">Start a conversation</h4>
            <p className="text-sm text-slate-500 max-w-[250px] mx-auto">
              Ask {character.name} about their thoughts, motivations, or anything from the story
            </p>
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
    </motion.div>
  );
}