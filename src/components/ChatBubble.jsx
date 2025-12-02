import React from 'react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import CharacterAvatar from './CharacterAvatar';

export default function ChatBubble({ message, characterName, characterAvatar, isUser }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "flex gap-3 max-w-[85%]",
        isUser ? "ml-auto flex-row-reverse" : ""
      )}
    >
      {!isUser && (
        <CharacterAvatar 
          name={characterName} 
          avatar={characterAvatar}
          size="sm"
        />
      )}
      
      <div className={cn(
        "rounded-2xl px-4 py-3",
        isUser 
          ? "bg-slate-900 text-white rounded-br-md" 
          : "bg-white border border-slate-100 shadow-sm rounded-bl-md"
      )}>
        {!isUser && (
          <p className="text-[10px] font-medium text-amber-600 mb-1 uppercase tracking-wide">
            {characterName}
          </p>
        )}
        <p className={cn(
          "text-sm leading-relaxed",
          isUser ? "text-white" : "text-slate-700"
        )}>
          {message.content}
        </p>
      </div>
    </motion.div>
  );
}