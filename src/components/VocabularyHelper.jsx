import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { BookMarked, Loader2, Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { motion, AnimatePresence } from 'framer-motion';

export default function VocabularyHelper({ 
  selectedText, 
  bookTitle,
  chapterContext,
  currentChapter,
  onSaveWord,
  onClose 
}) {
  const [definition, setDefinition] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  const lookupWord = async () => {
    if (!selectedText || loading) return;
    setLoading(true);

    const response = await base44.integrations.Core.InvokeLLM({
      prompt: `Define the word or phrase "${selectedText}" as it's used in the context of the book "${bookTitle}".

Context from the chapter: "${chapterContext?.slice(0, 500)}..."

Provide:
1. A clear, simple definition
2. How it's specifically used in this literary context
3. An example sentence
4. Any literary significance or symbolism if relevant`,
      response_json_schema: {
        type: 'object',
        properties: {
          definition: { type: 'string', description: 'Clear simple definition' },
          literary_context: { type: 'string', description: 'How its used in this book' },
          example: { type: 'string', description: 'Example sentence' },
          significance: { type: 'string', description: 'Literary significance if any' }
        }
      }
    });

    setDefinition(response);
    setLoading(false);
  };

  React.useEffect(() => {
    if (selectedText) {
      lookupWord();
    }
  }, [selectedText]);

  const handleSave = () => {
    onSaveWord({
      word: selectedText,
      definition: definition?.definition,
      context: definition?.literary_context,
      chapter: currentChapter
    });
    setSaved(true);
  };

  const handleOpenChange = (open) => {
    if (!open) {
      onClose();
    }
  };

  return (
    <Dialog open={!!selectedText} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BookMarked className="w-5 h-5 text-amber-600" />
            Vocabulary Helper
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-amber-50 rounded-lg p-4 text-center">
            <p className="text-2xl font-serif text-amber-900">{selectedText}</p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-amber-500" />
            </div>
          ) : definition ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div>
                <h4 className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">Definition</h4>
                <p className="text-slate-700">{definition.definition}</p>
              </div>

              {definition.literary_context && (
                <div>
                  <h4 className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">In This Book</h4>
                  <p className="text-sm text-slate-600">{definition.literary_context}</p>
                </div>
              )}

              {definition.example && (
                <div>
                  <h4 className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">Example</h4>
                  <p className="text-sm text-slate-600 italic">"{definition.example}"</p>
                </div>
              )}

              {definition.significance && (
                <div className="bg-slate-50 rounded-lg p-3">
                  <h4 className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">Literary Note</h4>
                  <p className="text-sm text-slate-600">{definition.significance}</p>
                </div>
              )}

              <Button
                onClick={handleSave}
                disabled={saved}
                className="w-full bg-amber-600 hover:bg-amber-700"
              >
                {saved ? (
                  <>Saved to Your Words</>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    Save to My Words
                  </>
                )}
              </Button>
            </motion.div>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}