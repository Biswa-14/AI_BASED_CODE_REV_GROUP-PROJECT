import { lazy, Suspense } from 'react';
import {
  Bot,
  Braces,
  Cpu,
  Gauge,
  ShieldCheck,
  Sparkles,
  Users,
} from 'lucide-react';

import { AnimatedAIChat } from './components/ui/animated-ai-chat';

const BackgroundPaperShaders = lazy(() =>
  import('./components/ui/background-paper-shaders').then((module) => ({
    default: module.BackgroundPaperShaders,
  })),
);

const highlights = [
  {
    icon: <Bot className="h-4 w-4" />,
    label: 'Live AI Fixes',
    copy: 'Bug fixing, optimization, and complexity hints in one workflow.',
  },
  {
    icon: <Braces className="h-4 w-4" />,
    label: 'Multi-Language',
    copy: 'Python, JavaScript, Java, C++, and C friendly prompts and outputs.',
  },
  {
    icon: <Gauge className="h-4 w-4" />,
    label: 'Demo Ready',
    copy: 'Built for clear before-and-after storytelling during your presentation.',
  },
];

const teamMembers = [
  'Biswaranjan Nayak',
  'Aditya Thawaria',
  'Chirag Jagtap',
  'Shubham Patil',
];

export default function App() {
  return (
    <div className="app-shell">
      <Suspense fallback={<div className="background-fallback" />}>
        <BackgroundPaperShaders />
      </Suspense>

      <div className="relative z-10 min-h-screen">
        <header className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-6 pt-6">
          <div className="brand-lockup">
            <div className="brand-mark">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <p className="brand-lockup__title">Sentient CodeFixer</p>
              <p className="brand-lockup__subtitle">Automated AI-based code fixing workspace</p>
            </div>
          </div>

          <div className="header-badges">
            <span className="header-badge">
              <Cpu className="h-4 w-4" />
              Ollama Prototype
            </span>
            <span className="header-badge">
              <ShieldCheck className="h-4 w-4" />
              Final Year Project
            </span>
          </div>
        </header>

        <main className="px-6 pb-16 pt-10">
          <section className="mx-auto flex w-full max-w-6xl flex-col items-center gap-10">
            <div className="text-center">
              <span className="hero-pill">Professional prototype workspace</span>
              <h1 className="hero-title">
                Clean code repair, optimization, and analysis in a single AI workflow.
              </h1>
              <p className="hero-copy">
                A polished interface for your final-year project that feels closer to modern AI
                products while still fitting your current Django and Ollama backend.
              </p>
            </div>

            <div className="highlights-grid">
              {highlights.map((item) => (
                <div key={item.label} className="highlight-card">
                  <div className="highlight-card__icon">{item.icon}</div>
                  <div>
                    <p className="highlight-card__title">{item.label}</p>
                    <p className="highlight-card__copy">{item.copy}</p>
                  </div>
                </div>
              ))}
            </div>

            <AnimatedAIChat />

            <footer className="project-footer">
              <div className="project-footer__team">
                <Users className="h-4 w-4" />
                <span>{teamMembers.join(' • ')}</span>
              </div>
              <p className="project-footer__copy">
                Built as a final-year project prototype for automated bug fixing, optimization,
                and code complexity improvement.
              </p>
            </footer>
          </section>
        </main>
      </div>
    </div>
  );
}
