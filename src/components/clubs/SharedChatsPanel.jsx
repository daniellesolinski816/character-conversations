import React from 'react';
import { MessageCircle, BookOpen, User } from 'lucide-react';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import CharacterAvatar from '@/components/CharacterAvatar';

export default function SharedChatsPanel({ sharedChats, books, clubId }) {
  if (sharedChats.length === 0) {
    return (
      <div className="text-center py-16 bg-white rounded-2xl border border-slate-100">
        <MessageCircle className="w-16 h-16 text-slate-200 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-slate-900 mb-2">No shared chats yet</h3>
        <p className="text-slate-500 max-w-md mx-auto">
          Members can share their character conversations from the reader view. 
          Enable sharing in the chat panel to contribute!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-500 mb-4">
        Character conversations shared by club members
      </p>
      
      {sharedChats.map((chat, idx) => {
        const book = books.find(b => b.id === chat.book_id);
        const lastMessage = chat.messages?.[chat.messages.length - 1];
        
        return (
          <motion.div
            key={chat.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="bg-white rounded-xl p-5 border border-slate-100"
          >
            <div className="flex items-start gap-4">
              <CharacterAvatar name={chat.character_name} size="md" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-semibold text-slate-900">
                    Conversation with {chat.character_name}
                  </h3>
                </div>
                
                {book && (
                  <p className="text-xs text-amber-600 mb-2 flex items-center gap-1">
                    <BookOpen className="w-3 h-3" />
                    {book.title}
                  </p>
                )}

                <div className="bg-slate-50 rounded-lg p-3 mb-3">
                  <p className="text-sm text-slate-600">
                    {chat.messages?.length || 0} messages exchanged
                  </p>
                  {lastMessage && (
                    <p className="text-xs text-slate-400 mt-1">
                      Last: "{lastMessage.content?.slice(0, 100)}..."
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-3 text-xs text-slate-400">
                  <span className="flex items-center gap-1">
                    <User className="w-3 h-3" />
                    Shared by member
                  </span>
                </div>
              </div>
            </div>

            {/* Preview Messages */}
            {chat.messages?.slice(-3).map((msg, msgIdx) => (
              <div 
                key={msgIdx}
                className={`mt-3 p-3 rounded-lg text-sm ${
                  msg.role === 'user' 
                    ? 'bg-slate-100 ml-8' 
                    : 'bg-amber-50 border border-amber-100 mr-8'
                }`}
              >
                <p className="text-xs font-medium mb-1 text-slate-500">
                  {msg.role === 'user' ? 'Reader' : chat.character_name}
                </p>
                <p className="text-slate-700">{msg.content}</p>
              </div>
            ))}
          </motion.div>
        );
      })}
    </div>
  );
}