import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Loader2, MessageSquare } from 'lucide-react';

export default function CreateDiscussionModal({ 
  open, 
  onOpenChange, 
  clubId, 
  books,
  userName,
  userEmail,
  onCreated 
}) {
  const [loading, setLoading] = useState(false);
  const [discussion, setDiscussion] = useState({
    title: '',
    content: '',
    book_id: ''
  });

  const handleCreate = async () => {
    if (!discussion.title.trim() || !discussion.content.trim()) return;
    
    setLoading(true);
    
    await base44.entities.ClubDiscussion.create({
      ...discussion,
      club_id: clubId,
      author_name: userName,
      author_email: userEmail,
      replies: []
    });
    
    setLoading(false);
    onCreated();
    onOpenChange(false);
    setDiscussion({ title: '', content: '', book_id: '' });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-amber-600" />
            Start Discussion
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="book">Related Book (optional)</Label>
            <Select 
              value={discussion.book_id} 
              onValueChange={(v) => setDiscussion(prev => ({ ...prev, book_id: v }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a book" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={null}>General Discussion</SelectItem>
                {books.map(book => (
                  <SelectItem key={book.id} value={book.id}>{book.title}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={discussion.title}
              onChange={(e) => setDiscussion(prev => ({ ...prev, title: e.target.value }))}
              placeholder="e.g., What do you think about the ending?"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Your thoughts *</Label>
            <Textarea
              id="content"
              value={discussion.content}
              onChange={(e) => setDiscussion(prev => ({ ...prev, content: e.target.value }))}
              placeholder="Share your insights, questions, or observations..."
              rows={5}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleCreate}
            disabled={!discussion.title.trim() || !discussion.content.trim() || loading}
            className="bg-amber-600 hover:bg-amber-700"
          >
            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Post Discussion
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}