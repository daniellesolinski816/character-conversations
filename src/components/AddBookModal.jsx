import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Loader2, BookOpen, Sparkles, Search } from 'lucide-react';

export default function AddBookModal({ open, onOpenChange, onBookAdded }) {
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [step, setStep] = useState('search'); // search, generating, preview
  const [generatedBook, setGeneratedBook] = useState(null);
  const [loadingMessage, setLoadingMessage] = useState('');

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setLoading(true);
    setStep('generating');
    setLoadingMessage('Finding book information...');

    const bookInfoResponse = await base44.integrations.Core.InvokeLLM({
      prompt: `Find information about the book "${searchQuery}". Provide accurate details about this real book.
      
Return the book's title, author, a compelling description/synopsis, genre, and generate a cover image description.`,
      add_context_from_internet: true,
      response_json_schema: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          author: { type: 'string' },
          description: { type: 'string', description: 'A compelling 2-3 sentence synopsis' },
          genre: { type: 'string', enum: ['fiction', 'mystery', 'romance', 'fantasy', 'sci-fi', 'classic', 'thriller', 'historical'] },
          cover_description: { type: 'string', description: 'Description for generating a book cover image' }
        }
      }
    });

    setLoadingMessage('Generating book cover...');
    
    const coverResponse = await base44.integrations.Core.GenerateImage({
      prompt: `Create a portrait 2:3 book cover ART ONLY for:
Title: ${bookInfoResponse.title}
Author: ${bookInfoResponse.author}
Genre: ${bookInfoResponse.genre}
Description: ${bookInfoResponse.description}

Style: high-quality illustration or cinematic cover art; visually compelling; professional; no borders required.

IMPORTANT RULES:
- Do NOT include any text, letters, words, numbers, logos, watermarks, or typography anywhere on the image.
- Leave a clean, darker, low-detail area near the bottom (about the bottom 25%) for an external title overlay.
- Avoid any shapes that resemble writing.

NEGATIVE PROMPT (if supported):
text, letters, words, typography, title, author name, logo, watermark, signature, random glyphs, symbols, scribbles`
    });

    setLoadingMessage('Extracting main characters...');

    const charactersResponse = await base44.integrations.Core.InvokeLLM({
      prompt: `For the book "${bookInfoResponse.title}" by ${bookInfoResponse.author}, identify the main characters that readers would want to chat with.

For each character provide:
- Their name
- A brief description of who they are in the story
- Their personality traits and how they speak/behave
- 3 suggested conversation starters or discussion questions a reader might ask them

Focus on the most interesting and central characters (3-5 characters).`,
      add_context_from_internet: true,
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
                personality: { type: 'string' },
                suggested_questions: { 
                  type: 'array', 
                  items: { type: 'string' },
                  description: 'Questions readers might ask this character'
                }
              }
            }
          }
        }
      }
    });

    setLoadingMessage('Creating story sections...');

    const chaptersResponse = await base44.integrations.Core.InvokeLLM({
      prompt: `For the book "${bookInfoResponse.title}" by ${bookInfoResponse.author}, create a reading guide with key scenes and story sections.

    Create 5-8 sections that cover the major parts of the story. For each section:
    - Give it a title that captures that part of the story
    - Write 2-3 paragraphs summarizing the key events, character developments, and themes
    - Include enough detail that a reader can discuss the story with characters

    Note: These are AI-generated story summaries, not the full book text. They help readers explore the narrative and have meaningful conversations with AI characters.`,
      add_context_from_internet: true,
      response_json_schema: {
        type: 'object',
        properties: {
          chapters: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                title: { type: 'string' },
                content: { type: 'string' }
              }
            }
          }
        }
      }
    });

    setLoadingMessage('Generating discussion ideas...');

    const discussionResponse = await base44.integrations.Core.InvokeLLM({
      prompt: `For the book "${bookInfoResponse.title}" by ${bookInfoResponse.author}, create thoughtful discussion questions and conversation ideas for a book club.

Include:
- Questions about themes and symbolism
- Character analysis questions
- Questions that compare characters' perspectives
- Thought-provoking "what if" scenarios
- Questions about the author's choices

Generate 8-10 diverse discussion questions.`,
      add_context_from_internet: true,
      response_json_schema: {
        type: 'object',
        properties: {
          discussion_questions: {
            type: 'array',
            items: { type: 'string' }
          }
        }
      }
    });

    const fullBook = {
      title: bookInfoResponse.title,
      author: bookInfoResponse.author,
      description: bookInfoResponse.description,
      genre: bookInfoResponse.genre,
      cover_image: coverResponse.url,
      chapters: chaptersResponse.chapters,
      characters: charactersResponse.characters,
      discussion_questions: discussionResponse.discussion_questions
    };

    setGeneratedBook(fullBook);
    setStep('preview');
    setLoading(false);
  };

  const handleSave = async () => {
    setLoading(true);
    const newBook = await base44.entities.Book.create(generatedBook);
    onBookAdded(newBook);
    setLoading(false);
    onOpenChange(false);
    resetModal();
  };

  const resetModal = () => {
    setSearchQuery('');
    setStep('search');
    setGeneratedBook(null);
    setLoadingMessage('');
  };

  const handleClose = () => {
    onOpenChange(false);
    resetModal();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-600" />
            Add Book with AI
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto">
          {step === 'search' && (
            <div className="py-8 px-4">
              <div className="text-center mb-8">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center">
                  <Search className="w-8 h-8 text-amber-500" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">Search for a Book</h3>
                <p className="text-sm text-slate-500 max-w-md mx-auto">
                  Enter a book title and we'll automatically generate chapters, characters, and discussion questions
                </p>
              </div>

              <div className="max-w-md mx-auto space-y-4">
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder="e.g., To Kill a Mockingbird, 1984, Harry Potter..."
                  className="text-center"
                />
                <Button 
                  onClick={handleSearch}
                  disabled={!searchQuery.trim() || loading}
                  className="w-full bg-amber-600 hover:bg-amber-700"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate Book Content
                </Button>
              </div>
            </div>
          )}

          {step === 'generating' && (
            <div className="py-16 text-center">
              <Loader2 className="w-12 h-12 animate-spin text-amber-500 mx-auto mb-4" />
              <p className="text-slate-600 font-medium">{loadingMessage}</p>
              <p className="text-sm text-slate-400 mt-2">This may take a minute...</p>
            </div>
          )}

          {step === 'preview' && generatedBook && (
            <div className="space-y-6 p-2">
              {/* Book Header */}
              <div className="flex gap-4">
                {generatedBook.cover_image && (
                  <img 
                    src={generatedBook.cover_image} 
                    alt={generatedBook.title}
                    className="w-24 h-36 object-cover rounded-lg shadow-md"
                  />
                )}
                <div className="flex-1">
                  <span className="text-xs font-medium uppercase text-amber-600">{generatedBook.genre}</span>
                  <h3 className="text-xl font-semibold text-slate-900">{generatedBook.title}</h3>
                  <p className="text-sm text-slate-500 mb-2">by {generatedBook.author}</p>
                  <p className="text-sm text-slate-600">{generatedBook.description}</p>
                </div>
              </div>

              {/* Characters */}
              <div>
                <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  Characters ({generatedBook.characters?.length})
                </h4>
                <div className="space-y-3">
                  {generatedBook.characters?.map((char, idx) => (
                    <div key={idx} className="bg-slate-50 rounded-lg p-3">
                      <p className="font-medium text-slate-900">{char.name}</p>
                      <p className="text-xs text-slate-500 mt-1">{char.description}</p>
                      {char.suggested_questions && (
                        <div className="mt-2 space-y-1">
                          {char.suggested_questions.slice(0, 2).map((q, qIdx) => (
                            <p key={qIdx} className="text-xs text-amber-700 bg-amber-50 px-2 py-1 rounded">
                              💬 {q}
                            </p>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Sections */}
              <div>
                <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  Story Sections ({generatedBook.chapters?.length})
                </h4>
                <p className="text-xs text-slate-500 mb-2">AI-generated summaries for exploration</p>
                <div className="space-y-2">
                  {generatedBook.chapters?.map((ch, idx) => (
                    <div key={idx} className="flex items-center gap-3 text-sm">
                      <span className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-xs font-medium text-slate-500">
                        {idx + 1}
                      </span>
                      <span className="text-slate-700">{ch.title}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Discussion Questions */}
              {generatedBook.discussion_questions && (
                <div>
                  <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                    Discussion Questions ({generatedBook.discussion_questions.length})
                  </h4>
                  <div className="space-y-2">
                    {generatedBook.discussion_questions.slice(0, 4).map((q, idx) => (
                      <p key={idx} className="text-sm text-slate-600 bg-slate-50 rounded-lg p-3">
                        {q}
                      </p>
                    ))}
                    {generatedBook.discussion_questions.length > 4 && (
                      <p className="text-xs text-slate-400 text-center">
                        +{generatedBook.discussion_questions.length - 4} more questions
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter className="mt-4">
          {step === 'preview' && (
            <>
              <Button variant="outline" onClick={resetModal}>
                Search Another
              </Button>
              <Button 
                onClick={handleSave}
                disabled={loading}
                className="bg-amber-600 hover:bg-amber-700"
              >
                {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Add to Library
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}