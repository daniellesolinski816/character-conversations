import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import { PenLine, Users } from 'lucide-react';

export default function WritingCard({ writing }) {
  const characterCount = writing.characters?.length || 0;

  return (
    <motion.div
      whileHover={{ y: -8, scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <Link to={createPageUrl(`WritingDetail?id=${writing.id}`)}>
        <div className="group overflow-hidden rounded-2xl bg-white shadow-sm border border-slate-100 hover:shadow-xl transition-shadow duration-500">
          <div className="relative aspect-[3/4] bg-gradient-to-br from-violet-100 to-purple-100">
            {writing.cover_image ? (
              <img 
                src={writing.cover_image} 
                alt={`Cover for ${writing.title}`}
                className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <PenLine className="w-12 h-12 text-violet-300" />
              </div>
            )}

            {/* Genre Badge */}
            {writing.genre && (
              <span className="absolute top-3 left-3 px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider bg-white/90 backdrop-blur-sm rounded-full text-violet-600">
                {writing.genre}
              </span>
            )}

            {/* Your Writing Badge */}
            <span className="absolute top-3 right-3 px-2.5 py-1 text-[10px] font-medium bg-violet-500 rounded-full text-white">
              Your Writing
            </span>

            {/* Gradient + title overlay at bottom */}
            <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-violet-900/80 via-violet-900/40 to-transparent p-3">
              <div className="text-xs font-semibold text-white line-clamp-2">
                {writing.title}
              </div>
              {characterCount > 0 && (
                <div className="flex items-center gap-1 text-[11px] text-violet-200 mt-1">
                  <Users className="w-3 h-3" />
                  {characterCount} character{characterCount !== 1 ? 's' : ''}
                </div>
              )}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}