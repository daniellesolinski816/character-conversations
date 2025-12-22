import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Brain, Heart, BookOpen, Zap, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function EmpathyScience() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50/50 via-white to-pink-50/30 py-8">
      <div className="max-w-4xl mx-auto px-6">
        <Link to={createPageUrl('Home')}>
          <Button variant="ghost" size="icon" className="mb-6">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>

        <div className="bg-white rounded-2xl border border-slate-200 p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-rose-100 to-pink-100 flex items-center justify-center">
              <Brain className="w-6 h-6 text-rose-600" />
            </div>
            <div>
              <h1 className="text-3xl font-serif font-semibold text-slate-900">The Science of Literary Empathy</h1>
              <p className="text-slate-500">How reading fiction builds emotional intelligence</p>
            </div>
          </div>

          <div className="prose prose-slate max-w-none space-y-6">
            <section>
              <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                <Heart className="w-5 h-5 text-rose-500" />
                What is Literary Empathy?
              </h3>
              <p className="text-slate-600">
                Literary empathy is the ability to understand and share the feelings of fictional characters. 
                Research shows that engaging deeply with characters' inner lives activates the same neural 
                networks we use to understand real people's emotions and intentions.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                <Zap className="w-5 h-5 text-amber-500" />
                The Neuroscience
              </h3>
              <p className="text-slate-600">
                Brain imaging studies reveal that reading literary fiction activates:
              </p>
              <ul className="list-disc list-inside space-y-2 text-slate-600 ml-4">
                <li><strong>Mirror neurons:</strong> Help us simulate characters' experiences in our own minds</li>
                <li><strong>Theory of Mind network:</strong> Allows us to infer characters' thoughts and motivations</li>
                <li><strong>Emotional processing centers:</strong> Process characters' feelings as if they were real</li>
                <li><strong>Memory consolidation systems:</strong> Store character experiences alongside our own memories</li>
              </ul>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-slate-900">Research Findings</h3>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 space-y-3">
                <p className="text-slate-600">
                  <strong>Study 1 (Kidd & Castano, 2013):</strong> Reading literary fiction improved performance 
                  on tests of empathy and emotional intelligence compared to popular fiction or non-fiction.
                </p>
                <p className="text-slate-600">
                  <strong>Study 2 (Mar et al., 2006):</strong> Lifetime exposure to fiction (but not non-fiction) 
                  predicted better social cognition and empathy scores.
                </p>
                <p className="text-slate-600">
                  <strong>Study 3 (Bal & Veltkamp, 2013):</strong> Readers who were "transported" into stories 
                  showed increased empathy that lasted up to a week after reading.
                </p>
              </div>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-violet-500" />
                Why Character Dialogue Matters
              </h3>
              <p className="text-slate-600">
                Conversations between characters from different stories amplify empathy development because:
              </p>
              <ul className="list-disc list-inside space-y-2 text-slate-600 ml-4">
                <li><strong>Perspective contrast:</strong> Seeing different worldviews side-by-side highlights how context shapes beliefs</li>
                <li><strong>Active processing:</strong> Comparing characters requires deeper cognitive engagement</li>
                <li><strong>Reduced bias:</strong> Fiction provides "safe practice" for understanding different viewpoints</li>
                <li><strong>Emotional flexibility:</strong> Holding multiple characters' emotions simultaneously builds capacity for nuance</li>
              </ul>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-slate-900">Practical Applications</h3>
              <p className="text-slate-600">
                The interactive features in this app are designed to:
              </p>
              <ul className="list-disc list-inside space-y-2 text-slate-600 ml-4">
                <li>Make implicit character understanding explicit through conversation</li>
                <li>Create opportunities to see familiar characters through fresh perspectives</li>
                <li>Build bridges between different narrative worlds and value systems</li>
                <li>Practice perspective-taking in a low-stakes, engaging environment</li>
                <li>Develop the cognitive flexibility needed for real-world empathy</li>
              </ul>
            </section>

            <section className="bg-violet-50 border border-violet-200 rounded-lg p-5">
              <h3 className="text-lg font-semibold text-slate-900 mb-2">The Bottom Line</h3>
              <p className="text-slate-600">
                Fiction isn't just entertainment—it's a gym for your empathy muscles. By engaging with characters' 
                inner lives, especially across different stories, you're literally rewiring your brain to better 
                understand diverse human experiences. Every conversation you have with characters is practice for 
                understanding the real, complex people in your life.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-slate-900">Further Reading</h3>
              <div className="space-y-2 text-sm text-slate-600">
                <p>• Kidd, D. C., & Castano, E. (2013). Reading literary fiction improves theory of mind. <em>Science, 342</em>(6156), 377-380.</p>
                <p>• Mar, R. A., Oatley, K., Hirsh, J., dela Paz, J., & Peterson, J. B. (2006). Bookworms versus nerds: Exposure to fiction versus non-fiction, divergent associations with social ability, and the simulation of fictional social worlds. <em>Journal of Research in Personality, 40</em>(5), 694-712.</p>
                <p>• Bal, P. M., & Veltkamp, M. (2013). How does fiction reading influence empathy? An experimental investigation on the role of emotional transportation. <em>PLOS ONE, 8</em>(1), e55341.</p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}