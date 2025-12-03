import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Loader2, Lock, Globe, Copy, Check } from 'lucide-react';

export default function CreateClubModal({ open, onOpenChange, onCreated, userEmail, userName }) {
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [club, setClub] = useState({
    name: '',
    description: '',
    cover_image: '',
    is_private: false
  });

  const generateJoinCode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  };

  const handleCreate = async () => {
    if (!club.name.trim()) return;
    
    setLoading(true);
    
    const newClub = await base44.entities.BookClub.create({
      ...club,
      join_code: club.is_private ? generateJoinCode() : null,
      members: [{
        email: userEmail,
        name: userName,
        role: 'admin',
        joined_at: new Date().toISOString()
      }]
    });
    
    setLoading(false);
    onCreated(newClub);
    onOpenChange(false);
    setClub({ name: '', description: '', cover_image: '', is_private: false });
  };

  const copyJoinCode = () => {
    navigator.clipboard.writeText(club.join_code || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create Book Club</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Club Name *</Label>
            <Input
              id="name"
              value={club.name}
              onChange={(e) => setClub(prev => ({ ...prev, name: e.target.value }))}
              placeholder="e.g., Classic Literature Lovers"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={club.description}
              onChange={(e) => setClub(prev => ({ ...prev, description: e.target.value }))}
              placeholder="What kind of books does your club read?"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cover">Cover Image URL</Label>
            <Input
              id="cover"
              value={club.cover_image}
              onChange={(e) => setClub(prev => ({ ...prev, cover_image: e.target.value }))}
              placeholder="https://..."
            />
          </div>

          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
            <div className="flex items-center gap-3">
              {club.is_private ? (
                <Lock className="w-5 h-5 text-amber-600" />
              ) : (
                <Globe className="w-5 h-5 text-green-600" />
              )}
              <div>
                <p className="font-medium text-sm">
                  {club.is_private ? 'Private Club' : 'Public Club'}
                </p>
                <p className="text-xs text-slate-500">
                  {club.is_private 
                    ? 'Members need a code to join' 
                    : 'Anyone can find and join'}
                </p>
              </div>
            </div>
            <Switch
              checked={club.is_private}
              onCheckedChange={(checked) => setClub(prev => ({ 
                ...prev, 
                is_private: checked,
                join_code: checked ? generateJoinCode() : null
              }))}
            />
          </div>

          {club.is_private && club.join_code && (
            <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
              <p className="text-xs text-amber-600 mb-2">Share this code with members:</p>
              <div className="flex items-center gap-2">
                <code className="flex-1 bg-white px-3 py-2 rounded-lg text-lg font-mono font-bold tracking-wider">
                  {club.join_code}
                </code>
                <Button variant="outline" size="icon" onClick={copyJoinCode}>
                  {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleCreate}
            disabled={!club.name.trim() || loading}
            className="bg-amber-600 hover:bg-amber-700"
          >
            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Create Club
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}