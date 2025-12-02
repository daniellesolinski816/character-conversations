import React from 'react';
import { Settings, Type, Sun, Moon, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

const fontSizes = [
  { value: 'small', label: 'S', size: '14px' },
  { value: 'medium', label: 'M', size: '16px' },
  { value: 'large', label: 'L', size: '18px' },
  { value: 'xlarge', label: 'XL', size: '20px' },
];

const themes = [
  { value: 'light', label: 'Light', bg: 'bg-white', icon: Sun },
  { value: 'sepia', label: 'Sepia', bg: 'bg-amber-50', icon: BookOpen },
  { value: 'dark', label: 'Dark', bg: 'bg-slate-900', icon: Moon },
];

const lineHeights = [
  { value: 'compact', label: 'Compact', height: '1.5' },
  { value: 'normal', label: 'Normal', height: '1.75' },
  { value: 'relaxed', label: 'Relaxed', height: '2' },
];

export default function ReadingSettings({ settings, onSettingsChange }) {
  const currentSettings = {
    font_size: settings?.font_size || 'medium',
    line_height: settings?.line_height || 'normal',
    theme: settings?.theme || 'light',
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon">
          <Settings className="w-5 h-5" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-4" align="end">
        <h4 className="font-semibold text-sm mb-4">Reading Settings</h4>
        
        {/* Font Size */}
        <div className="mb-4">
          <label className="text-xs text-slate-500 mb-2 block">Font Size</label>
          <div className="flex gap-1">
            {fontSizes.map((size) => (
              <button
                key={size.value}
                onClick={() => onSettingsChange({ ...currentSettings, font_size: size.value })}
                className={cn(
                  "flex-1 py-2 rounded-lg text-sm font-medium transition-colors",
                  currentSettings.font_size === size.value
                    ? "bg-amber-100 text-amber-700"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                )}
              >
                {size.label}
              </button>
            ))}
          </div>
        </div>

        {/* Line Height */}
        <div className="mb-4">
          <label className="text-xs text-slate-500 mb-2 block">Line Spacing</label>
          <div className="flex gap-1">
            {lineHeights.map((lh) => (
              <button
                key={lh.value}
                onClick={() => onSettingsChange({ ...currentSettings, line_height: lh.value })}
                className={cn(
                  "flex-1 py-2 rounded-lg text-xs font-medium transition-colors",
                  currentSettings.line_height === lh.value
                    ? "bg-amber-100 text-amber-700"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                )}
              >
                {lh.label}
              </button>
            ))}
          </div>
        </div>

        {/* Theme */}
        <div>
          <label className="text-xs text-slate-500 mb-2 block">Theme</label>
          <div className="flex gap-2">
            {themes.map((theme) => {
              const Icon = theme.icon;
              return (
                <button
                  key={theme.value}
                  onClick={() => onSettingsChange({ ...currentSettings, theme: theme.value })}
                  className={cn(
                    "flex-1 py-3 rounded-lg flex flex-col items-center gap-1 transition-all border-2",
                    currentSettings.theme === theme.value
                      ? "border-amber-500"
                      : "border-transparent",
                    theme.bg,
                    theme.value === 'dark' ? 'text-white' : 'text-slate-700'
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-xs">{theme.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}