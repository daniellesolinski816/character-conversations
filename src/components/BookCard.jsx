import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { BookOpen, Clock } from 'lucide-react';
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
        <div className="group relative bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-shadow duration-500">
          {/* Cover Image */}
          <div className="aspect-[2/3] relative overflow-hidden">
            {book.cover_image ? (
              <img 
                src={book.cover_image} 
                alt={book.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
                <BookOpen className="w-12 h-12 text-slate-300" />
              </div>
            )}
            
            {/* Progress Overlay */}
            {progress && progressPercent > 0 && (
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/10">
                <div 
                  className="h-full bg-amber-500 transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            )}

            {/* Genre Badge */}
            {book.genre && (
              <span className="absolute top-3 left-3 px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider bg-white/90 backdrop-blur-sm rounded-full text-slate-600">
                {book.genre}
              </span>
            )}
          </div>

          {/* Info */}
          <div className="p-4">
            <h3 className="font-semibold text-slate-900 text-sm leading-tight mb-1 line-clamp-2">
              {book.title}
            </h3>
            <p className="text-xs text-slate-500">{book.author}</p>
            
            {progress && (
              <div className="flex items-center gap-1.5 mt-3 text-[10px] text-slate-400">
                <Clock className="w-3 h-3" />
                <span>Chapter {progress.current_chapter + 1} of {book.chapters?.length || 0}</span>
              </div>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}