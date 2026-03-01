import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { User, Bell, BookOpen, Palette, Target, Save, CheckCircle, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';

const GENRES = ['fiction', 'mystery', 'romance', 'fantasy', 'sci-fi', 'classic', 'thriller', 'historical'];

const SECTIONS = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'reading', label: 'Reading Preferences', icon: BookOpen },
  { id: 'goals', label: 'Reading Goals', icon: Target },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'appearance', label: 'Appearance', icon: Palette },
];

export default function Settings() {
  const [activeSection, setActiveSection] = useState('profile');
  const [saved, setSaved] = useState(false);
  const queryClient = useQueryClient();

  // User profile state
  const [displayName, setDisplayName] = useState('');

  // Reading prefs state
  const [favoriteGenres, setFavoriteGenres] = useState([]);
  const [defaultTheme, setDefaultTheme] = useState('light');
  const [defaultFontSize, setDefaultFontSize] = useState('medium');

  // Goals state
  const [weeklySections, setWeeklySections] = useState(5);
  const [weeklyChats, setWeeklyChats] = useState(3);

  // Notification prefs state
  const [notifyClubActivity, setNotifyClubActivity] = useState(true);
  const [notifyNewBooks, setNotifyNewBooks] = useState(true);
  const [notifyStreaks, setNotifyStreaks] = useState(true);

  // Appearance state
  const [compactCards, setCompactCards] = useState(false);
  const [showProgress, setShowProgress] = useState(true);

  const { data: user } = useQuery({
    queryKey: ['me'],
    queryFn: () => base44.auth.me(),
  });

  const { data: profiles = [] } = useQuery({
    queryKey: ['user-profile'],
    queryFn: () => base44.entities.UserProfile.list(),
  });

  const profile = profiles[0];

  useEffect(() => {
    if (user) setDisplayName(user.full_name || '');
  }, [user]);

  useEffect(() => {
    if (profile) {
      setFavoriteGenres(profile.favorite_genres || []);
      setWeeklySections(profile.reading_goals?.weekly_sections ?? 5);
      setWeeklyChats(profile.reading_goals?.weekly_chats ?? 3);
      // Load persisted prefs if stored
      const prefs = profile.app_preferences || {};
      if (prefs.default_theme) setDefaultTheme(prefs.default_theme);
      if (prefs.default_font_size) setDefaultFontSize(prefs.default_font_size);
      if (prefs.notify_club_activity !== undefined) setNotifyClubActivity(prefs.notify_club_activity);
      if (prefs.notify_new_books !== undefined) setNotifyNewBooks(prefs.notify_new_books);
      if (prefs.notify_streaks !== undefined) setNotifyStreaks(prefs.notify_streaks);
      if (prefs.compact_cards !== undefined) setCompactCards(prefs.compact_cards);
      if (prefs.show_progress !== undefined) setShowProgress(prefs.show_progress);
    }
  }, [profile]);

  const handleSave = async () => {
    const updates = {
      favorite_genres: favoriteGenres,
      reading_goals: { weekly_sections: weeklySections, weekly_chats: weeklyChats },
      app_preferences: {
        default_theme: defaultTheme,
        default_font_size: defaultFontSize,
        notify_club_activity: notifyClubActivity,
        notify_new_books: notifyNewBooks,
        notify_streaks: notifyStreaks,
        compact_cards: compactCards,
        show_progress: showProgress,
      },
    };

    if (profile) {
      await base44.entities.UserProfile.update(profile.id, updates);
    } else {
      await base44.entities.UserProfile.create(updates);
    }

    queryClient.invalidateQueries({ queryKey: ['user-profile'] });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const toggleGenre = (g) =>
    setFavoriteGenres((prev) => prev.includes(g) ? prev.filter(x => x !== g) : [...prev, g]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50/30 via-white to-slate-50">
      <div className="max-w-5xl mx-auto px-6 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-serif font-semibold text-slate-900">Settings</h1>
          <p className="text-slate-500 mt-1">Manage your profile and customize your reading experience.</p>
        </div>

        <div className="flex gap-6">
          {/* Sidebar */}
          <aside className="w-52 shrink-0 space-y-1">
            {SECTIONS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveSection(id)}
                className={cn(
                  'w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors text-left',
                  activeSection === id
                    ? 'bg-amber-100 text-amber-800'
                    : 'text-slate-600 hover:bg-slate-100'
                )}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </aside>

          {/* Content */}
          <div className="flex-1 bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">

            {/* Profile */}
            {activeSection === 'profile' && (
              <Section title="Profile" icon={User}>
                <div className="space-y-5">
                  <div className="flex items-center gap-5">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white text-2xl font-semibold">
                      {(user?.full_name || '?')[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">{user?.full_name}</p>
                      <p className="text-sm text-slate-500">{user?.email}</p>
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-slate-700 mb-1.5 block">Display Name</Label>
                    <Input
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="max-w-sm"
                      placeholder="Your name"
                    />
                    <p className="text-xs text-slate-400 mt-1">This is how others see you in clubs and discussions.</p>
                  </div>

                  <div className="bg-slate-50 rounded-xl p-4 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                    {[
                      { label: 'Books Read', value: profile?.total_books_read ?? 0 },
                      { label: 'Chats', value: profile?.total_chats ?? 0 },
                      { label: 'Discussions', value: profile?.total_discussions ?? 0 },
                      { label: 'Day Streak', value: profile?.current_streak ?? 0 },
                    ].map(({ label, value }) => (
                      <div key={label}>
                        <p className="text-2xl font-bold text-amber-600">{value}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </Section>
            )}

            {/* Reading Preferences */}
            {activeSection === 'reading' && (
              <Section title="Reading Preferences" icon={BookOpen}>
                <div className="space-y-6">
                  <div>
                    <Label className="text-sm font-medium text-slate-700 mb-2 block">Favorite Genres</Label>
                    <p className="text-xs text-slate-400 mb-3">These help us recommend books you'll love.</p>
                    <div className="flex flex-wrap gap-2">
                      {GENRES.map((g) => (
                        <button
                          key={g}
                          onClick={() => toggleGenre(g)}
                          className={cn(
                            'px-3 py-1.5 rounded-full text-sm font-medium capitalize border transition-colors',
                            favoriteGenres.includes(g)
                              ? 'bg-amber-500 text-white border-amber-500'
                              : 'bg-white text-slate-600 border-slate-200 hover:border-amber-300'
                          )}
                        >
                          {g}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-slate-700 mb-2 block">Default Reader Theme</Label>
                    <div className="flex gap-3">
                      {[
                        { value: 'light', label: 'Light', bg: 'bg-white', border: 'border-slate-200', text: 'text-slate-900' },
                        { value: 'sepia', label: 'Sepia', bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-900' },
                        { value: 'dark', label: 'Dark', bg: 'bg-slate-900', border: 'border-slate-700', text: 'text-white' },
                      ].map(({ value, label, bg, border, text }) => (
                        <button
                          key={value}
                          onClick={() => setDefaultTheme(value)}
                          className={cn(
                            'flex-1 py-3 rounded-xl border-2 text-sm font-medium transition-all',
                            bg, border, text,
                            defaultTheme === value ? 'ring-2 ring-amber-500 ring-offset-2' : 'opacity-70 hover:opacity-100'
                          )}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-slate-700 mb-2 block">Default Font Size</Label>
                    <div className="flex gap-2">
                      {['small', 'medium', 'large', 'xlarge'].map((size) => (
                        <button
                          key={size}
                          onClick={() => setDefaultFontSize(size)}
                          className={cn(
                            'px-4 py-2 rounded-lg border text-sm font-medium capitalize transition-colors',
                            defaultFontSize === size
                              ? 'bg-amber-500 text-white border-amber-500'
                              : 'bg-white text-slate-600 border-slate-200 hover:border-amber-300'
                          )}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </Section>
            )}

            {/* Goals */}
            {activeSection === 'goals' && (
              <Section title="Reading Goals" icon={Target}>
                <div className="space-y-6">
                  <p className="text-sm text-slate-500">Set weekly targets to build a consistent reading habit.</p>

                  <GoalSlider
                    label="Sections per week"
                    value={weeklySections}
                    onChange={setWeeklySections}
                    min={1} max={30}
                    description="How many book sections you aim to read each week."
                  />
                  <GoalSlider
                    label="Character chats per week"
                    value={weeklyChats}
                    onChange={setWeeklyChats}
                    min={1} max={20}
                    description="How many character conversations you aim to have."
                  />

                  <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 text-sm text-amber-800">
                    <p className="font-medium mb-1">This week's progress</p>
                    <p>{profile?.weekly_progress?.sections_read ?? 0} / {weeklySections} sections</p>
                    <p>{profile?.weekly_progress?.chats_completed ?? 0} / {weeklyChats} chats</p>
                  </div>
                </div>
              </Section>
            )}

            {/* Notifications */}
            {activeSection === 'notifications' && (
              <Section title="Notifications" icon={Bell}>
                <div className="space-y-4">
                  <NotifToggle
                    label="Club activity"
                    description="New posts and replies in your book clubs"
                    value={notifyClubActivity}
                    onChange={setNotifyClubActivity}
                  />
                  <NotifToggle
                    label="New books added"
                    description="When new books appear in the community"
                    value={notifyNewBooks}
                    onChange={setNotifyNewBooks}
                  />
                  <NotifToggle
                    label="Streak reminders"
                    description="Daily nudge to keep your reading streak alive"
                    value={notifyStreaks}
                    onChange={setNotifyStreaks}
                  />
                </div>
              </Section>
            )}

            {/* Appearance */}
            {activeSection === 'appearance' && (
              <Section title="Appearance" icon={Palette}>
                <div className="space-y-4">
                  <NotifToggle
                    label="Compact book cards"
                    description="Show smaller book cards in your library view"
                    value={compactCards}
                    onChange={setCompactCards}
                  />
                  <NotifToggle
                    label="Show reading progress bars"
                    description="Display progress on book cards"
                    value={showProgress}
                    onChange={setShowProgress}
                  />
                </div>
              </Section>
            )}

            {/* Save button (not shown on profile since it's read-only stats) */}
            {activeSection !== 'profile' && (
              <div className="mt-8 pt-6 border-t border-slate-100 flex items-center gap-3">
                <Button onClick={handleSave} className="bg-amber-600 hover:bg-amber-700 rounded-full px-6 gap-2">
                  {saved ? <CheckCircle className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                  {saved ? 'Saved!' : 'Save Changes'}
                </Button>
                {saved && <p className="text-sm text-green-600">Your preferences have been updated.</p>}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Section({ title, icon: Icon, children }) {
  return (
    <div>
      <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2 mb-6">
        <Icon className="w-5 h-5 text-amber-600" />
        {title}
      </h2>
      {children}
    </div>
  );
}

function NotifToggle({ label, description, value, onChange }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0">
      <div>
        <p className="text-sm font-medium text-slate-800">{label}</p>
        <p className="text-xs text-slate-400 mt-0.5">{description}</p>
      </div>
      <Switch checked={value} onCheckedChange={onChange} />
    </div>
  );
}

function GoalSlider({ label, value, onChange, min, max, description }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <Label className="text-sm font-medium text-slate-700">{label}</Label>
        <span className="text-lg font-bold text-amber-600">{value}</span>
      </div>
      <p className="text-xs text-slate-400 mb-2">{description}</p>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-amber-500"
      />
      <div className="flex justify-between text-xs text-slate-400 mt-1">
        <span>{min}</span><span>{max}</span>
      </div>
    </div>
  );
}