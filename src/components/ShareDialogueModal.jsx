import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Loader2, Share2, BookOpen } from 'lucide-react';
import { toast } from 'sonner';

export default function ShareDialogueModal({ open, onOpenChange, dialogueText, title }) {
  const [selectedClub, setSelectedClub] = useState('');
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);

  const { data: clubs = [] } = useQuery({
    queryKey: ['my-clubs'],
    queryFn: () => base44.entities.BookClub.list(),
    enabled: open,
  });

  const handleShare = async () => {
    if (!selectedClub) return;
    setSaving(true);
    const user = await base44.auth.me();
    await base44.entities.ClubDiscussion.create({
      club_id: selectedClub,
      title: title || 'Cross-character dialogue',
      content: note
        ? `${note}\n\n---\n\n${dialogueText}`
        : dialogueText,
      author_name: user?.full_name || 'Reader',
      author_email: user?.email || '',
    });
    setSaving(false);
    toast.success('Shared to club discussion!');
    onOpenChange(false);
    setNote('');
    setSelectedClub('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="w-5 h-5 text-violet-600" />
            Save & Share to Club
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div>
            <Label>Select a Book Club</Label>
            <Select value={selectedClub} onValueChange={setSelectedClub}>
              <SelectTrigger className="mt-2">
                <SelectValue placeholder="Choose a club..." />
              </SelectTrigger>
              <SelectContent>
                {clubs.map(club => (
                  <SelectItem key={club.id} value={club.id}>
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-3 h-3" />
                      {club.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {clubs.length === 0 && (
              <p className="text-xs text-slate-500 mt-2">You're not a member of any clubs yet. Join or create a club first.</p>
            )}
          </div>

          <div>
            <Label>Add your reflection <span className="text-slate-400 font-normal">(optional)</span></Label>
            <Textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="What insights did this dialogue spark for you? What would you discuss with your club?"
              className="mt-2 text-sm"
              rows={3}
            />
          </div>

          <div className="bg-slate-50 rounded-lg p-3 text-xs text-slate-500 border border-slate-200">
            The full dialogue will be posted as a club discussion thread for your members to read and reply to.
          </div>

          <Button
            onClick={handleShare}
            disabled={!selectedClub || saving || clubs.length === 0}
            className="w-full bg-violet-600 hover:bg-violet-700"
          >
            {saving
              ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Sharing...</>
              : <><Share2 className="w-4 h-4 mr-2" />Post to Club Discussion</>
            }
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}