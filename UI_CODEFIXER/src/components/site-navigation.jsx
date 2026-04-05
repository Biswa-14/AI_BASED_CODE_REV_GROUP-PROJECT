import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  ChevronDown,
  Cpu,
  Home,
  LogIn,
  LogOut,
  ShieldCheck,
  Sparkles,
  UserRound,
} from 'lucide-react';

import { useAuth } from '../context/auth-context';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { GlowCard } from './ui/spotlight-card';

export function SiteNavigation() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, isLoading, logout } = useAuth();

  const goHomeSection = (sectionId) => {
    if (location.pathname !== '/') {
      navigate('/');
      window.setTimeout(() => {
        document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 80);
      return;
    }

    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <header className="mx-auto w-full max-w-6xl px-6 pt-6">
      <GlowCard customSize glowColor="purple" className="nav-shell">
        <Link to="/" className="brand-lockup">
          <div className="brand-mark">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <p className="brand-lockup__title">Sentient CodeFixer</p>
            <p className="brand-lockup__subtitle">AI debugging and optimization workspace</p>
          </div>
        </Link>

        <nav className="nav-links" aria-label="Primary">
          <button type="button" onClick={() => goHomeSection('workspace')} className="nav-link">
            Workspace
          </button>
          <button type="button" onClick={() => goHomeSection('team')} className="nav-link">
            Team
          </button>
        </nav>

        <div className="nav-actions">
          <span className="header-badge">
            <Cpu className="h-4 w-4" />
            Ollama Powered
          </span>
          <span className="header-badge nav-badge--muted">
            <ShieldCheck className="h-4 w-4" />
            Final Year Project
          </span>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="nav-menu-button" disabled={isLoading}>
                {isAuthenticated ? (
                  <>
                    <UserRound className="h-4 w-4" />
                    {user.name}
                  </>
                ) : (
                  <>
                    {isLoading ? 'Loading' : 'Menu'}
                    <ChevronDown className="h-4 w-4 opacity-70" />
                  </>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="nav-dropdown">
              <DropdownMenuLabel>Navigation</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => navigate('/')}>
                <Home className="h-4 w-4 opacity-70" />
                Home
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => goHomeSection('workspace')}>
                <Sparkles className="h-4 w-4 opacity-70" />
                Workspace
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {isAuthenticated ? (
                <>
                  <DropdownMenuLabel>Signed in as</DropdownMenuLabel>
                  <DropdownMenuItem disabled>{user.email}</DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="h-4 w-4 opacity-70" />
                    Logout
                  </DropdownMenuItem>
                </>
              ) : (
                <DropdownMenuItem onClick={() => navigate('/login')}>
                  <LogIn className="h-4 w-4 opacity-70" />
                  Login / Create account
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </GlowCard>
    </header>
  );
}
