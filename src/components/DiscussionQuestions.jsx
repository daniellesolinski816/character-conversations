import { useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import { MessageCircleQuestion } from 'lucide-react';

// Normalizes ANY discussion-questions blob into clean markdown.
export function normalizeDiscussionQuestions(raw) {
  if (!raw) return '';

  let text = Array.isArray(raw) ? raw.join('\n\n') : raw.trim();

  // 1. Convert bold section headers like **Themes:** into markdown headings ### Themes
  text = text.replace(
    /\*\*\s*([^*]+?)\s*:\s*\*\*/g,
    (_, heading) => `\n\n### ${heading.trim()}\n\n`
  );

  // 2. Force each numbered question onto a new line
  text = text.replace(/\s*(\d+)\.\s+/g, '\n$1. ');

  // 3. Remove external academic links (Litcharts/Gradesaver)
  text = text.replace(
    /\s*\[[^\]]+\]\((https?:\/\/(?:www\.)?(litcharts|gradesaver)[^)]+)\)/gi,
    ''
  );

  // 4. Collapse extra blank lines
  text = text.replace(/\n{3,}/g, '\n\n');

  return text.trim();
}

export default function DiscussionQuestions({ discussion }) {
  const content = useMemo(
    () => normalizeDiscussionQuestions(discussion),
    [discussion]
  );

  if (!content) return null;

  return (
    <section className="mt-10 rounded-2xl border border-amber-100 bg-white/70 p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <div className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-amber-100 text-amber-700">
          <MessageCircleQuestion className="w-5 h-5" />
        </div>
        <h2 className="text-lg font-semibold text-slate-900">
          Discussion & Empathy Questions
        </h2>
      </div>

      <div className="prose prose-sm sm:prose-base max-w-none prose-ol:space-y-2 prose-li:text-slate-700">
        <ReactMarkdown>
          {content}
        </ReactMarkdown>
      </div>
    </section>
  );
}