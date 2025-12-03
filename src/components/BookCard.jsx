import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';

export default function BookCard({ book, progress }) {
  const progressPercent = progress && book.chapters?.length 
    ? Math.round((progress.current_chapter / book.chapters.length) * 100) 
    : 0;

  return (
    <motion.div
      whileHover={{ y: -8, scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <Link to={createPageUrl(`BookDetail?id=${book.id}`)}>
        <div className="group overflow-hidden rounded-2xl bg-white shadow-sm border border-slate-100 hover:shadow-xl transition-shadow duration-500">
          <div className="relative aspect-[3/4] bg-slate-100">
            {book.cover_image ? (
              <img 
                src={book.cover_image} 
                alt={`Cover art for ${book.title}`}
                className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-slate-400 text-xs px-4 text-center">
                No cover yet
              </div>
            )}

            {/* Genre Badge */}
            {book.genre && (
              <span className="absolute top-3 left-3 px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider bg-white/90 backdrop-blur-sm rounded-full text-slate-600">
                {book.genre}
              </span>
            )}

            {/* Progress bar */}
            {progress && progressPercent > 0 && (
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/20">
                <div 
                  className="h-full bg-amber-500 transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            )}

            {/* Gradient + title overlay at bottom */}
            <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent p-3">
              <div className="text-xs font-semibold text-white line-clamp-2">
                {book.title}
              </div>
              {book.author && (
                <div className="text-[11px] text-slate-200 line-clamp-1">
                  {book.author}
                </div>
              )}
            </div>
          </div>
        </div>
        
        {progress && progressPercent > 0 && (
          <p className="text-xs text-amber-600 mt-2 text-center">
            {progressPercent}% • Section {progress.current_chapter + 1}
          </p>
        )}
      </Link>
    </motion.div>
  );
}