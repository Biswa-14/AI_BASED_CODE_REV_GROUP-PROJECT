import { ShieldCheck, Sparkles, Users, WandSparkles } from 'lucide-react';

import { ContainerScroll } from '../components/ui/container-scroll-animation';
import { AnimatedAIChat } from '../components/ui/animated-ai-chat';
import { SparklesCore } from '../components/ui/sparkles';
import { GlowCard } from '../components/ui/spotlight-card';

const teamMembers = [
  'Biswaranjan Nayak',
  'Aditya Thawaria',
  'Chirag Jagtap',
  'Shubham Patil',
];

export function HomePage() {
  return (
    <main className="px-6 pb-16 pt-10">
      <section className="mx-auto flex w-full max-w-6xl flex-col items-center gap-8">
        <div className="hero-stack hero-stack--home">
          <span className="hero-pill">Intelligent code workspace</span>
          <div className="hero-title-shell">
            <div className="hero-title-sparkles">
              <SparklesCore
                background="transparent"
                minSize={0.3}
                maxSize={1.1}
                particleDensity={70}
                className="h-full w-full"
                particleColor="#d8b4fe"
                speed={0.8}
              />
            </div>
            <div className="hero-title-mask" />
            <h1 className="hero-title hero-title--with-sparkles">
              Fix bugs, optimize code, and reduce complexity in one focused workspace.
            </h1>
          </div>
          <p className="hero-copy">
            A polished final-year project interface for multi-language code fixing, optimization,
            review, and attachment-assisted analysis powered by Ollama today and ready for stronger
            hosted models later.
          </p>
          <div className="hero-quick-points">
            <div className="hero-quick-point">
              <Sparkles className="h-4 w-4" />
              <span>Live AI-assisted bug fixing</span>
            </div>
            <div className="hero-quick-point">
              <WandSparkles className="h-4 w-4" />
              <span>Optimization and complexity guidance</span>
            </div>
            <div className="hero-quick-point">
              <ShieldCheck className="h-4 w-4" />
              <span>Login-backed workspace access</span>
            </div>
          </div>
        </div>

        <div id="workspace" className="w-full">
          <ContainerScroll
            compact
            containerClassName="home-scroll-shell"
            titleClassName="home-scroll-title"
            titleComponent={
              <div className="home-scroll-heading">
                <span className="hero-pill">Live Workspace</span>
                <p className="home-scroll-copy">
                  Drop code, attach files, and let Sentient walk through the fix with you.
                </p>
              </div>
            }
            cardClassName="home-scroll-card"
            contentClassName="home-scroll-content"
          >
            <GlowCard customSize glowColor="purple" className="workspace-frame workspace-frame--scroll">
              <div className="workspace-frame__inner">
                <AnimatedAIChat />
              </div>
            </GlowCard>
          </ContainerScroll>
        </div>

        <GlowCard
          customSize
          glowColor="blue"
          className="project-footer-card"
        >
          <footer id="team" className="project-footer">
            <div className="project-footer__team">
              <Users className="h-4 w-4" />
              <span>{teamMembers.join(' | ')}</span>
            </div>
            <p className="project-footer__copy">
              A final-year group project focused on multi-language bug fixing, code optimization,
              and cleaner complexity analysis through an AI-assisted workflow.
            </p>
          </footer>
        </GlowCard>
      </section>
    </main>
  );
}
