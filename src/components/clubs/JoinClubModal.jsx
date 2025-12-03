import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Lock, AlertCircle, CheckCircle } from 'lucide-react';

export default function JoinClubModal({ open, onOpenChange, clubs, onJoin, userEmail }) {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [foundClub, setFoundClub] = useState(null);

  const handleCodeChange = (value) => {
    const upperCode = value.toUpperCase();
    setCode(upperCode);
    setError('');
    setFoundClub(null);

    if (upperCode.length >= 6) {
      const club = clubs.find(c => c.join_code === upperCode);
      if (club) {
        if (club.members?.some(m => m.email === userEmail)) {
          setError('You are already a member of this club');
        } else {
          setFoundClub(club);
        }
      } else {
        setError('Invalid code. Please check and try again.');
      }
    }
  };

  const handleJoin = () => {
    if (foundClub) {
      onJoin(foundClub);
      onOpenChange(false);
      setCode('');
      setFoundClub(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-amber-600" />
            Join Private Club
          </DialogTitle>
        </DialogHeader>

        <div className="py-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="code">Enter Join Code</Label>
            <Input
              id="code"
              value={code}
              onChange={(e) => handleCodeChange(e.target.value)}
              placeholder="XXXXXX"
              className="text-center text-2xl font-mono tracking-widest uppercase"
              maxLength={6}
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 text-red-600 text-sm">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}

          {foundClub && (
            <div className="p-4 bg-green-50 rounded-xl border border-green-200">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                <div>
                  <p className="font-medium text-green-800">{foundClub.name}</p>
                  <p className="text-sm text-green-600">{foundClub.members?.length || 0} members</p>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleJoin}
            disabled={!foundClub}
            className="bg-amber-600 hover:bg-amber-700"
          >
            Join Club
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}