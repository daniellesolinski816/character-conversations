import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Sparkles, PenLine, Users } from 'lucide-react';

const GENRES = ['fiction', 'fantasy', 'sci-fi', 'romance', 'mystery', 'thriller', 'horror', 'drama', 'comedy', 'other'];

export default function MyWritingModal({ open, onOpenChange, onWritingAdded }) {
  const [step, setStep] = useState('input'); // input, extracting, review
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [genre, setGenre] = useState('fiction');
  const [characters, setCharacters] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleExtractCharacters = async () => {
    if (!title.trim() || !content.trim()) return;
    
    setLoading(true);
    setStep('extracting');

    const response = await base44.integrations.Core.InvokeLLM({
      prompt: `Analyze this creative writing and extract the main characters. For each character, provide their name, a brief description based on the text, and their personality traits.

Title: ${title}
Genre: ${genre}

Content:
${content.slice(0, 8000)}

Extract up to 5 main characters that appear in this writing.`,
      response_json_schema: {
        type: 'object',
        properties: {
          characters: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                name: { type: 'string' },
                description: { type: 'string' },
                personality: { type: 'string' }
              }
            }
          }
        }
      }
    });

    setCharacters(response.characters || []);
    setLoading(false);
    setStep('review');
  };

  const handleSave = async () => {
    setLoading(true);
    
    await base44.entities.UserWriting.create({
      title,
      content,
      genre,
      characters
    });

    setLoading(false);
    resetForm();
    onWritingAdded?.();
    onOpenChange(false);
  };

  const resetForm = () => {
    setStep('input');
    setTitle('');
    setContent('');
    setGenre('fiction');
    setCharacters([]);
  };

  const handleClose = (isOpen) => {
    if (!isOpen) resetForm();
    onOpenChange(isOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <PenLine className="w-5 h-5 text-violet-600" />
            {step === 'input' ? 'Add Your Writing' : step === 'extracting' ? 'Analyzing...' : 'Review Characters'}
          </DialogTitle>
        </DialogHeader>

        {step === 'input' && (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1.5 block">Title</label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Give your writing a title..."
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700 mb-1.5 block">Genre</label>
              <Select value={genre} onValueChange={setGenre}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {GENRES.map(g => (
                    <SelectItem key={g} value={g} className="capitalize">{g}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700 mb-1.5 block">Your Writing</label>
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Paste or write your story, chapter, or creative writing here..."
                className="min-h-[250px] resize-y"
              />
              <p className="text-xs text-slate-400 mt-1">{content.length} characters</p>
            </div>

            <Button 
              onClick={handleExtractCharacters}
              disabled={!title.trim() || !content.trim()}
              className="w-full bg-violet-600 hover:bg-violet-700"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Extract Characters with AI
            </Button>
          </div>
        )}

        {step === 'extracting' && (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="w-10 h-10 animate-spin text-violet-500 mb-4" />
            <p className="text-slate-600">Analyzing your writing...</p>
            <p className="text-sm text-slate-400">Finding characters to chat with</p>
          </div>
        )}

        {step === 'review' && (
          <div className="space-y-4">
            <div className="bg-violet-50 rounded-xl p-4 border border-violet-100">
              <h3 className="font-semibold text-slate-900">{title}</h3>
              <p className="text-sm text-slate-500 capitalize">{genre} • {content.length} characters</p>
            </div>

            <div>
              <h4 className="text-sm font-medium text-slate-700 mb-3 flex items-center gap-2">
                <Users className="w-4 h-4" />
                Characters Found ({characters.length})
              </h4>
              
              {characters.length > 0 ? (
                <div className="space-y-3">
                  {characters.map((char, idx) => (
                    <div key={idx} className="bg-white border border-slate-200 rounded-xl p-4">
                      <p className="font-semibold text-slate-900">{char.name}</p>
                      <p className="text-sm text-slate-600 mt-1">{char.description}</p>
                      <p className="text-xs text-violet-600 mt-2">Personality: {char.personality}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500 text-center py-4">No characters detected. You can still save and add characters later.</p>
              )}
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep('input')} className="flex-1">
                Edit Writing
              </Button>
              <Button onClick={handleSave} disabled={loading} className="flex-1 bg-violet-600 hover:bg-violet-700">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save & Continue'}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}