import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Plus, Trash2, Loader2, BookOpen, Users, FileText } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

const genres = ['fiction', 'mystery', 'romance', 'fantasy', 'sci-fi', 'classic', 'thriller', 'historical'];

export default function AddBookModal({ open, onOpenChange, onBookAdded }) {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('details');
  const [book, setBook] = useState({
    title: '',
    author: '',
    description: '',
    cover_image: '',
    genre: '',
    chapters: [{ title: 'Chapter 1', content: '' }],
    characters: [{ name: '', description: '', personality: '', avatar: '' }]
  });

  const handleSave = async () => {
    if (!book.title || !book.author) return;
    
    setLoading(true);
    const cleanedBook = {
      ...book,
      chapters: book.chapters.filter(c => c.title && c.content),
      characters: book.characters.filter(c => c.name)
    };
    
    const newBook = await base44.entities.Book.create(cleanedBook);
    onBookAdded(newBook);
    setLoading(false);
    onOpenChange(false);
    setBook({
      title: '',
      author: '',
      description: '',
      cover_image: '',
      genre: '',
      chapters: [{ title: 'Chapter 1', content: '' }],
      characters: [{ name: '', description: '', personality: '', avatar: '' }]
    });
  };

  const addChapter = () => {
    setBook(prev => ({
      ...prev,
      chapters: [...prev.chapters, { title: `Chapter ${prev.chapters.length + 1}`, content: '' }]
    }));
  };

  const removeChapter = (idx) => {
    setBook(prev => ({
      ...prev,
      chapters: prev.chapters.filter((_, i) => i !== idx)
    }));
  };

  const updateChapter = (idx, field, value) => {
    setBook(prev => ({
      ...prev,
      chapters: prev.chapters.map((ch, i) => i === idx ? { ...ch, [field]: value } : ch)
    }));
  };

  const addCharacter = () => {
    setBook(prev => ({
      ...prev,
      characters: [...prev.characters, { name: '', description: '', personality: '', avatar: '' }]
    }));
  };

  const removeCharacter = (idx) => {
    setBook(prev => ({
      ...prev,
      characters: prev.characters.filter((_, i) => i !== idx)
    }));
  };

  const updateCharacter = (idx, field, value) => {
    setBook(prev => ({
      ...prev,
      characters: prev.characters.map((ch, i) => i === idx ? { ...ch, [field]: value } : ch)
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-amber-600" />
            Add New Book
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 overflow-hidden flex flex-col">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="details" className="gap-2">
              <BookOpen className="w-4 h-4" />
              Details
            </TabsTrigger>
            <TabsTrigger value="chapters" className="gap-2">
              <FileText className="w-4 h-4" />
              Chapters
            </TabsTrigger>
            <TabsTrigger value="characters" className="gap-2">
              <Users className="w-4 h-4" />
              Characters
            </TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-y-auto pr-2">
            <TabsContent value="details" className="space-y-4 mt-0">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={book.title}
                    onChange={(e) => setBook(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Book title"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="author">Author *</Label>
                  <Input
                    id="author"
                    value={book.author}
                    onChange={(e) => setBook(prev => ({ ...prev, author: e.target.value }))}
                    placeholder="Author name"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="genre">Genre</Label>
                  <Select value={book.genre} onValueChange={(v) => setBook(prev => ({ ...prev, genre: v }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select genre" />
                    </SelectTrigger>
                    <SelectContent>
                      {genres.map(g => (
                        <SelectItem key={g} value={g} className="capitalize">{g}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cover">Cover Image URL</Label>
                  <Input
                    id="cover"
                    value={book.cover_image}
                    onChange={(e) => setBook(prev => ({ ...prev, cover_image: e.target.value }))}
                    placeholder="https://..."
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={book.description}
                  onChange={(e) => setBook(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Book synopsis..."
                  rows={4}
                />
              </div>
            </TabsContent>

            <TabsContent value="chapters" className="space-y-4 mt-0">
              {book.chapters.map((chapter, idx) => (
                <div key={idx} className="p-4 border rounded-xl bg-slate-50/50 space-y-3">
                  <div className="flex items-center gap-3">
                    <Input
                      value={chapter.title}
                      onChange={(e) => updateChapter(idx, 'title', e.target.value)}
                      placeholder="Chapter title"
                      className="flex-1"
                    />
                    {book.chapters.length > 1 && (
                      <Button variant="ghost" size="icon" onClick={() => removeChapter(idx)}>
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    )}
                  </div>
                  <Textarea
                    value={chapter.content}
                    onChange={(e) => updateChapter(idx, 'content', e.target.value)}
                    placeholder="Chapter content..."
                    rows={6}
                  />
                </div>
              ))}
              <Button variant="outline" onClick={addChapter} className="w-full gap-2">
                <Plus className="w-4 h-4" />
                Add Chapter
              </Button>
            </TabsContent>

            <TabsContent value="characters" className="space-y-4 mt-0">
              <p className="text-sm text-slate-500">
                Add characters that readers can chat with while reading.
              </p>
              {book.characters.map((char, idx) => (
                <div key={idx} className="p-4 border rounded-xl bg-slate-50/50 space-y-3">
                  <div className="flex items-center gap-3">
                    <Input
                      value={char.name}
                      onChange={(e) => updateCharacter(idx, 'name', e.target.value)}
                      placeholder="Character name"
                      className="flex-1"
                    />
                    {book.characters.length > 1 && (
                      <Button variant="ghost" size="icon" onClick={() => removeCharacter(idx)}>
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    )}
                  </div>
                  <Input
                    value={char.avatar}
                    onChange={(e) => updateCharacter(idx, 'avatar', e.target.value)}
                    placeholder="Avatar image URL (optional)"
                  />
                  <Textarea
                    value={char.description}
                    onChange={(e) => updateCharacter(idx, 'description', e.target.value)}
                    placeholder="Character description (who they are in the story)"
                    rows={2}
                  />
                  <Textarea
                    value={char.personality}
                    onChange={(e) => updateCharacter(idx, 'personality', e.target.value)}
                    placeholder="Personality traits (how they speak and behave)"
                    rows={2}
                  />
                </div>
              ))}
              <Button variant="outline" onClick={addCharacter} className="w-full gap-2">
                <Plus className="w-4 h-4" />
                Add Character
              </Button>
            </TabsContent>
          </div>
        </Tabs>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={!book.title || !book.author || loading}
            className="bg-amber-600 hover:bg-amber-700"
          >
            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Add Book
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}