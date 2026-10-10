import { useState } from 'react';
import { ArrowDown, Code2, History, ShieldCheck, Users } from 'lucide-react';

import { ConversationSidebar } from '../components/conversation-sidebar';
import { AnimatedAIChat } from '../components/ui/animated-ai-chat';
import { GlowCard } from '../components/ui/spotlight-card';

const teamMembers = [
  'Biswaranjan Nayak',
  'Aditya Thawaria',
  'Chirag Jagtap',
  'Shubham Patil',
];

export function HomePage() {
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [historyRevision, setHistoryRevision] = useState(0);
  const goToWorkspace = () => {
    document.getElementById('workspace')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <main className="px-6 pb-16 pt-10">
      <section className="mx-auto flex w-full max-w-6xl flex-col items-center gap-8">
        <div className="hero-stack hero-stack--home">
          <span className="hero-pill">Sentient / Code workspace</span>
          <h1 className="hero-title">A clearer way to work through difficult code.</h1>
          <p className="hero-copy">
            Bring a bug, a code review, or a rough idea. Sentient helps you inspect the details,
            choose a direction, and leave with a fix you understand.
          </p>
          <div className="hero-quick-points">
            <div className="hero-quick-point">
              <Code2 className="h-4 w-4" />
              <span>Code fixes and reviews</span>
            </div>
            <div className="hero-quick-point">
              <History className="h-4 w-4" />
              <span>Saved working threads</span>
            </div>
            <div className="hero-quick-point">
              <ShieldCheck className="h-4 w-4" />
              <span>Login-backed workspace access</span>
            </div>
          </div>
          <button type="button" className="hero-workspace-link" onClick={goToWorkspace}>
            Open workspace <ArrowDown className="h-4 w-4" />
          </button>
        </div>

        <div id="workspace" className="w-full">
          <div className="workspace-section">
            <div className="workspace-section__heading">
              <span className="hero-pill">Live Workspace</span>
              <p className="workspace-section__copy">
                Start a thread, share the relevant context, and work through the next step together.
              </p>
            </div>
            <div className="workspace-layout">
              <ConversationSidebar
                activeConversationId={activeConversationId}
                onNewConversation={() => setActiveConversationId(null)}
                onSelectConversation={setActiveConversationId}
                refreshKey={historyRevision}
              />
              <GlowCard customSize glowColor="purple" className="workspace-frame workspace-frame--chat">
                <div className="workspace-frame__inner">
                  <AnimatedAIChat
                    activeConversationId={activeConversationId}
                    onConversationCreated={(conversationId) => {
                      setActiveConversationId(conversationId);
                      setHistoryRevision((current) => current + 1);
                    }}
                    onConversationUpdated={() => setHistoryRevision((current) => current + 1)}
                  />
                </div>
              </GlowCard>
            </div>
          </div>
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
