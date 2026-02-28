import React, { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sparkles, ArrowLeft, Loader2, Share2 } from 'lucide-react';
import CharacterAvatar from '@/components/CharacterAvatar';
import ShareDialogueModal from '@/components/ShareDialogueModal';

const SYSTEM_PROMPT = `
You are running a structured dialogue between two fictional characters.

Your task:
- Take two characters created by the user, each with their own backstory, worldview, emotional wounds, values, and personality traits.
- Facilitate a turn-based dialogue between them on the topic the user provides.
- Keep each character's voice, tone, and internal logic consistent with their profile.
- Encourage empathy, emotional honesty, and curiosity between the characters.

Format:
Respond ONLY in alternating turns using this exact structure:

[CharacterA]: their message in first person
[CharacterB]: their message in first person

Content Guidelines:
- Stay grounded in each character's personal history and emotional truth as provided by the user.
- Show perspective-taking: characters should acknowledge or interpret each other's feelings and reasoning.
- Disagree respectfully, focusing on values, fears, motivations, or interpretations—not insults.
- Keep responses emotionally rich but concise (2–5 sentences per turn).
- Ask thoughtful follow-up questions, but never interrogate or judge.

Safety Rules (non-negotiable):
- No explicit sexual content or erotic roleplay.
- No hate, harassment, or demeaning content.
- No detailed self-harm methods, suicide instructions, or promotion of harm.
- No graphic violence.

Tone:
- Empathic. Reflective. Introspective. Curious.
- Characters can be flawed or upset, but not abusive or cruel.
- Encourage mutual understanding even when values differ.

Generate 4-6 turns of dialogue.
`.trim();

function parseDialogue(raw) {
  const lines = raw
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);

  const turns = [];
  let current = {};

  for (const line of lines) {
    if (line.startsWith('[CharacterA]:')) {
      const text = line.replace('[CharacterA]:', '').trim();
      if (current.a || current.b) {
        if (current.a && current.b) {
          turns.push({ a: current.a, b: current.b });
        }
        current = {};
      }
      current.a = text;
    } else if (line.startsWith('[CharacterB]:')) {
      const text = line.replace('[CharacterB]:', '').trim();
      current.b = text;
      if (current.a && current.b) {
        turns.push({ a: current.a, b: current.b });
        current = {};
      }
    }
  }

  if (current.a && current.b) {
    turns.push({ a: current.a, b: current.b });
  }

  return turns;
}

function DialogueSkeleton() {
  return (
    <ScrollArea className="mt-6 h-[400px] rounded-2xl border border-slate-100 bg-white p-4">
      <div className="space-y-5">
        {[1, 2, 3].map((i) => (
          <div key={i} className="space-y-3">
            <div className="flex gap-3 items-start">
              <div className="w-8 h-8 rounded-full bg-slate-200 animate-pulse shrink-0" />
              <div className="space-y-2 flex-1">
                <div className="h-3 bg-slate-200 animate-pulse rounded w-20" />
                <div className="h-16 bg-slate-100 animate-pulse rounded-2xl max-w-[80%]" />
              </div>
            </div>
            <div className="flex gap-3 items-start justify-end">
              <div className="space-y-2 flex-1 flex flex-col items-end">
                <div className="h-3 bg-amber-100 animate-pulse rounded w-20" />
                <div className="h-16 bg-amber-50 animate-pulse rounded-2xl max-w-[80%] w-full" />
              </div>
              <div className="w-8 h-8 rounded-full bg-amber-200 animate-pulse shrink-0" />
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}

function CharacterBadge({ character }) {
  if (!character) return null;
  return (
    <div className="flex items-center gap-2 rounded-full bg-slate-50 px-3 py-1.5 border border-slate-200">
      <CharacterAvatar name={character.name} size="sm" />
      <div className="flex flex-col">
        <span className="text-xs font-semibold text-slate-900">{character.name}</span>
        {character.short_description && (
          <span className="text-[11px] text-slate-500 line-clamp-1">
            {character.short_description}
          </span>
        )}
      </div>
    </div>
  );
}

function DialogueView({ characterA, characterB, dialogue, rawFallback }) {
  if (!dialogue.length && rawFallback) {
    return (
      <div className="mt-6 rounded-2xl border border-slate-100 bg-white p-5">
        <p className="text-xs text-slate-400 mb-2 uppercase tracking-wide">Raw response</p>
        <p className="text-sm text-slate-700 whitespace-pre-wrap">{rawFallback}</p>
      </div>
    );
  }
  if (!dialogue.length) return null;

  return (
    <ScrollArea className="mt-6 h-[400px] rounded-2xl border border-slate-100 bg-white p-4">
      <div className="space-y-4">
        {dialogue.map((turn, idx) => (
          <div key={idx} className="space-y-3">
            {/* Character A */}
            <div className="flex gap-3 items-start">
              <CharacterAvatar name={characterA.name} size="sm" />
              <div className="bg-violet-50 border border-violet-100 rounded-2xl px-4 py-3 shadow-sm max-w-[80%]">
                <p className="text-[11px] text-violet-600 font-semibold mb-1">
                  {characterA.name}
                </p>
                <p className="text-sm text-slate-800 whitespace-pre-wrap">
                  {turn.a}
                </p>
              </div>
            </div>

            {/* Character B */}
            <div className="flex gap-3 items-start justify-end">
              <div className="bg-amber-50 border border-amber-100 rounded-2xl px-4 py-3 shadow-sm max-w-[80%]">
                <p className="text-[11px] text-amber-600 font-semibold text-right mb-1">
                  {characterB.name}
                </p>
                <p className="text-sm text-slate-800 whitespace-pre-wrap text-right">
                  {turn.b}
                </p>
              </div>
              <CharacterAvatar name={characterB.name} size="sm" />
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}

export default function CrossCharacterDialogue() {
  const [characterAKey, setCharacterAKey] = useState('');
  const [characterBKey, setCharacterBKey] = useState('');
  const [topic, setTopic] = useState('');
  const [dialogue, setDialogue] = useState([]);
  const [rawFallback, setRawFallback] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);
  const [showShare, setShowShare] = useState(false);

  const { data: writings = [], isLoading } = useQuery({
    queryKey: ['user-writings'],
    queryFn: () => base44.entities.UserWriting.list('-created_date'),
  });

  // Flatten all characters from all writings
  const allCharacters = useMemo(() => {
    const chars = [];
    writings.forEach(writing => {
      if (writing.characters?.length) {
        writing.characters.forEach((char, idx) => {
          chars.push({
            ...char,
            key: `${writing.id}-${idx}`,
            writingTitle: writing.title,
            writingId: writing.id
          });
        });
      }
    });
    return chars;
  }, [writings]);

  const characterA = useMemo(
    () => allCharacters.find((c) => c.key === characterAKey),
    [allCharacters, characterAKey]
  );
  const characterB = useMemo(
    () => allCharacters.find((c) => c.key === characterBKey),
    [allCharacters, characterBKey]
  );

  const canRun = !!characterA && !!characterB && characterA.key !== characterB.key && topic.trim().length > 0;

  const handleGenerate = async () => {
    if (!canRun || !characterA || !characterB) return;
    setIsGenerating(true);
    setError(null);
    setDialogue([]);
    setRawFallback('');

    try {
      const charAProfile = `Name: ${characterA.name}
Role: ${characterA.role || 'character'}
Description: ${characterA.short_description || ''}
Backstory: ${characterA.backstory || ''}
Personality: ${characterA.personality_traits || ''}
Values & Motivations: ${characterA.values_and_motivations || ''}
From story: "${characterA.writingTitle}"`;

      const charBProfile = `Name: ${characterB.name}
Role: ${characterB.role || 'character'}
Description: ${characterB.short_description || ''}
Backstory: ${characterB.backstory || ''}
Personality: ${characterB.personality_traits || ''}
Values & Motivations: ${characterB.values_and_motivations || ''}
From story: "${characterB.writingTitle}"`;

      const prompt = `${SYSTEM_PROMPT}

Here are the characters:

Character A:
${charAProfile}

Character B:
${charBProfile}

Topic for them to discuss:
${topic.trim()}

Begin the conversation now.`;

      const response = await base44.integrations.Core.InvokeLLM({ prompt });

      if (!response) {
        setError('No response from AI — please try again.');
        return;
      }

      const parsed = parseDialogue(response);
      if (parsed.length === 0) {
        setRawFallback(response);
      } else {
        setDialogue(parsed);
      }
    } catch (err) {
      setError('Something went wrong — please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const dialogueAsText = dialogue.map(t => `${characterA?.name}: ${t.a}\n${characterB?.name}: ${t.b}`).join('\n\n');

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50/50 via-white to-amber-50/40">
      <div className="max-w-4xl mx-auto px-6 py-10">
        <Link to={createPageUrl('Home')}>
          <Button variant="ghost" size="sm" className="mb-6 gap-2 -ml-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Button>
        </Link>

        <header className="mb-8">
          <div className="inline-flex items-center gap-2 rounded-full bg-violet-100/80 px-3 py-1 text-xs font-medium text-violet-700 mb-3">
            <Sparkles className="w-3 h-3" />
            Empathy Dialogue
          </div>
          <h1 className="text-2xl md:text-3xl font-serif font-semibold text-slate-900 mb-2">
            Cross-Character Conversations
          </h1>
          <p className="text-sm md:text-base text-slate-600 max-w-2xl">
            Choose two characters from your writings and let them discuss a topic.
            Explore different perspectives with empathy and curiosity.
          </p>
        </header>

        {isLoading ? (
          <div className="flex items-center gap-2 text-slate-500">
            <Loader2 className="w-4 h-4 animate-spin" />
            Loading your characters…
          </div>
        ) : allCharacters.length < 2 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center">
            <p className="text-slate-600 mb-4">
              You need at least two characters from your writings to start a conversation.
            </p>
            <Link to={createPageUrl('Home')}>
              <Button className="bg-violet-600 hover:bg-violet-700">
                Add Your Writing
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Character selection */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-700">Character A</label>
                <Select value={characterAKey} onValueChange={setCharacterAKey}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose first character" />
                  </SelectTrigger>
                  <SelectContent>
                    {allCharacters.map((c) => (
                      <SelectItem key={c.key} value={c.key}>
                        <span className="font-medium">{c.name}</span>
                        <span className="text-slate-400 ml-2">from {c.writingTitle}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {characterA && <CharacterBadge character={characterA} />}
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-700">Character B</label>
                <Select value={characterBKey} onValueChange={setCharacterBKey}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose second character" />
                  </SelectTrigger>
                  <SelectContent>
                    {allCharacters.map((c) => (
                      <SelectItem key={c.key} value={c.key}>
                        <span className="font-medium">{c.name}</span>
                        <span className="text-slate-400 ml-2">from {c.writingTitle}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {characterB && <CharacterBadge character={characterB} />}
              </div>
            </div>

            {/* Topic input */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700">
                Topic or question for them to explore
              </label>
              <Textarea
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                rows={3}
                placeholder={`Example: "What does courage mean to you?" or "Can people really change after they hurt someone?"`}
                className="text-sm"
              />
              <p className="text-[11px] text-slate-500">
                Try questions about values, fears, difficult choices, justice vs mercy, forgiveness, loyalty, or identity.
              </p>
            </div>

            {/* Generate button */}
            <div className="flex items-center gap-3">
              <Button
                onClick={handleGenerate}
                disabled={!canRun || isGenerating}
                className="px-6 bg-violet-600 hover:bg-violet-700"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Start Conversation
                  </>
                )}
              </Button>
              {!canRun && !isGenerating && (
                <span className="text-xs text-slate-500">
                  Select two different characters and add a topic to begin.
                </span>
              )}
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700">
                {error}
              </div>
            )}

            {/* Loading skeleton */}
            {isGenerating && <DialogueSkeleton />}

            {/* Dialogue */}
            {!isGenerating && characterA && characterB && (dialogue.length > 0 || rawFallback) && (
              <>
                <DialogueView
                  characterA={characterA}
                  characterB={characterB}
                  dialogue={dialogue}
                  rawFallback={rawFallback}
                />
                <div className="flex justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2 border-violet-200 text-violet-700 hover:bg-violet-50"
                    onClick={() => setShowShare(true)}
                  >
                    <Share2 className="w-4 h-4" />
                    Save & Share to Club
                  </Button>
                </div>
              </>
            )}

            <ShareDialogueModal
              open={showShare}
              onOpenChange={setShowShare}
              dialogueText={dialogueAsText || rawFallback}
              title={`${characterA?.name} & ${characterB?.name}: ${topic.slice(0, 60)}`}
            />
          </div>
        )}
      </div>
    </div>
  );
}