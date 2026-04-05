import { useMemo, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import {
  CheckCircle2,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  MessageSquareText,
  RotateCcw,
  Send,
  Star,
  UserRound,
} from 'lucide-react';

import { useAuth } from '../context/auth-context';
import { Button } from '../components/ui/button';
import { SparklesCore } from '../components/ui/sparkles';
import { GlowCard } from '../components/ui/spotlight-card';

const initialForm = {
  name: '',
  email: '',
  password: '',
};

const initialFeedbackForm = {
  name: '',
  email: '',
  rating: '5',
  message: '',
  website: '',
};

const FORMSPREE_ENDPOINT = import.meta.env.VITE_FORMSPREE_ENDPOINT ?? '';

export function LoginPage() {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedbackForm, setFeedbackForm] = useState(initialFeedbackForm);
  const [submittedFeedback, setSubmittedFeedback] = useState(initialFeedbackForm);
  const [isSendingFeedback, setIsSendingFeedback] = useState(false);
  const [feedbackStatus, setFeedbackStatus] = useState({ type: '', message: '' });
  const [feedbackSucceeded, setFeedbackSucceeded] = useState(false);
  const { login, register, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  const title = useMemo(
    () => (mode === 'login' ? 'Return to your saved workspace' : 'Create your Sentient project access'),
    [mode],
  );

  const subtitle = useMemo(
    () =>
      mode === 'login'
        ? 'Sign in to restore your saved chat history and preferred analysis mode.'
        : 'Create an account to keep your code-fixing sessions, preferences, and project workspace synced.',
    [mode],
  );

  const handleChange = (key) => (event) => {
    setForm((current) => ({ ...current, [key]: event.target.value }));
  };

  const handleFeedbackChange = (key) => (event) => {
    setFeedbackForm((current) => ({ ...current, [key]: event.target.value }));
    if (feedbackStatus.message) {
      setFeedbackStatus({ type: '', message: '' });
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      if (mode === 'login') {
        await login({ email: form.email, password: form.password });
      } else {
        await register({ name: form.name, email: form.email, password: form.password });
      }

      navigate('/');
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFeedbackSubmit = async (event) => {
    event.preventDefault();
    setFeedbackStatus({ type: '', message: '' });

    if (feedbackForm.website.trim()) {
      setSubmittedFeedback(feedbackForm);
      setFeedbackForm(initialFeedbackForm);
      setFeedbackSucceeded(true);
      return;
    }

    if (!FORMSPREE_ENDPOINT) {
      setFeedbackStatus({
        type: 'info',
        message: 'Add VITE_FORMSPREE_ENDPOINT to connect this feedback form to Formspree.',
      });
      return;
    }

    setIsSendingFeedback(true);

    try {
      const response = await fetch(FORMSPREE_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          ...feedbackForm,
          source: 'Sentient CodeFixer login page',
          team: 'Biswaranjan Nayak, Aditya Thawaria, Chirag Jagtap, Shubham Patil',
        }),
      });

      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(payload?.error || payload?.message || 'Unable to send feedback right now.');
      }

      setSubmittedFeedback(feedbackForm);
      setFeedbackForm(initialFeedbackForm);
      setFeedbackSucceeded(true);
      setFeedbackStatus({
        type: 'success',
        message: 'Feedback submitted. It is ready to land in your Formspree inbox.',
      });
    } catch (submitError) {
      setFeedbackStatus({
        type: 'error',
        message: submitError.message || 'Unable to send feedback right now.',
      });
    } finally {
      setIsSendingFeedback(false);
    }
  };

  const handleFeedbackReset = () => {
    setFeedbackSucceeded(false);
    setFeedbackStatus({ type: '', message: '' });
    setFeedbackForm(initialFeedbackForm);
    setSubmittedFeedback(initialFeedbackForm);
  };

  if (isLoading) {
    return (
      <main className="px-6 pb-16 pt-10">
        <section className="mx-auto grid w-full max-w-6xl gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="login-copy">
            <span className="hero-pill">Optional project account</span>
            <h1 className="login-copy__title">Checking your current session.</h1>
            <p className="login-copy__subtitle">
              Syncing your account with the Django backend before loading the workspace.
            </p>
          </div>
          <GlowCard customSize glowColor="purple" className="auth-shell auth-shell--loading">
            <div className="auth-loading-copy">Loading account access...</div>
          </GlowCard>
        </section>
      </main>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <main className="px-6 pb-16 pt-10">
      <section className="mx-auto grid w-full max-w-6xl gap-8 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="login-copy">
          <span className="hero-pill">Optional project account</span>
          <div className="login-title-shell">
            <div className="login-title-sparkles">
              <SparklesCore
                background="transparent"
                minSize={0.35}
                maxSize={1.2}
                particleDensity={65}
                className="h-full w-full"
                particleColor="#f5d0fe"
                speed={0.7}
              />
            </div>
            <div className="hero-title-mask hero-title-mask--login" />
            <h1 className="login-copy__title">Sentient CodeFixer account access for your AI code analysis workspace.</h1>
          </div>
          <p className="login-copy__subtitle">
            Sign in to save your chat history, restore your preferred analysis mode, and keep your
            code-fixing workflow personalized across sessions.
          </p>

          <div className="feedback-panel">
            <div className="feedback-panel__header">
              <div className="feedback-panel__badge">
                <MessageSquareText className="h-4 w-4" />
                <span>Project feedback</span>
              </div>
              <h2 className="feedback-panel__title">Leave a Feedback</h2>
              <p className="feedback-panel__copy">
                Use this area for suggestions, Bugs and Feedback.
              </p>
            </div>

            {feedbackSucceeded ? (
              <div className="feedback-thankyou">
                <div className="feedback-thankyou__icon">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <div className="feedback-thankyou__content">
                  <h3>Thanks for sharing feedback.</h3>
                  <p>
                    Your note helps improve the Sentient CodeFixer experience for the presentation
                    and the next project iterations.
                  </p>
                </div>
                <div className="feedback-thankyou__meta">
                  <span>Rating: {submittedFeedback.rating}/5</span>
                </div>
                <div className="feedback-thankyou__actions">
                  <Button type="button" variant="outline" className="feedback-submit" onClick={handleFeedbackReset}>
                    <RotateCcw className="h-4 w-4" />
                    Send another response
                  </Button>
                </div>
              </div>
            ) : (
              <form className="feedback-form" onSubmit={handleFeedbackSubmit}>
                <div className="feedback-form__grid">
                  <label className="feedback-field">
                    <span>Name</span>
                    <div className="feedback-field__input">
                      <UserRound className="h-4 w-4" />
                      <input
                        type="text"
                        value={feedbackForm.name}
                        onChange={handleFeedbackChange('name')}
                        placeholder="Your name"
                      />
                    </div>
                  </label>

                  <label className="feedback-field">
                    <span>Email</span>
                    <div className="feedback-field__input">
                      <Mail className="h-4 w-4" />
                      <input
                        type="email"
                        value={feedbackForm.email}
                        onChange={handleFeedbackChange('email')}
                        placeholder="name@example.com"
                      />
                    </div>
                  </label>
                </div>

                <label className="feedback-field feedback-field--honeypot" aria-hidden="true" tabIndex={-1}>
                  <span>Website</span>
                  <div className="feedback-field__input">
                    <input
                      type="text"
                      value={feedbackForm.website}
                      onChange={handleFeedbackChange('website')}
                      autoComplete="off"
                      tabIndex={-1}
                    />
                  </div>
                </label>

                <label className="feedback-field feedback-field--rating">
                  <span>Rating</span>
                  <div className="feedback-field__input">
                    <Star className="h-4 w-4" />
                    <select value={feedbackForm.rating} onChange={handleFeedbackChange('rating')}>
                      <option value="5">5 - Excellent</option>
                      <option value="4">4 - Good</option>
                      <option value="3">3 - Fair</option>
                      <option value="2">2 - Needs work</option>
                      <option value="1">1 - Poor</option>
                    </select>
                  </div>
                </label>

                <label className="feedback-field feedback-field--textarea">
                  <span>Feedback</span>
                  <div className="feedback-field__input feedback-field__input--textarea">
                    <textarea
                      value={feedbackForm.message}
                      onChange={handleFeedbackChange('message')}
                      placeholder="Tell us what felt good, what felt off, or what we should improve next."
                    />
                  </div>
                </label>

                {feedbackStatus.message && (
                  <p className={`feedback-status feedback-status--${feedbackStatus.type || 'info'}`}>
                    {feedbackStatus.message}
                  </p>
                )}

                <div className="feedback-form__footer">
                  <p className="feedback-form__hint">
                    Contact: <a href="mailto:biswanyk14@outlook.com">biswanyk14@outlook.com</a>
                  </p>
                  <Button type="submit" variant="outline" className="feedback-submit" disabled={isSendingFeedback}>
                    <Send className="h-4 w-4" />
                    {isSendingFeedback ? 'Sending...' : 'Send feedback'}
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>

        <GlowCard customSize glowColor="purple" className="auth-shell">
          <div className="auth-shell__header">
            <div>
              <p className="chat-shell__eyebrow">Account</p>
              <h2 className="auth-shell__title">{title}</h2>
              <p className="auth-shell__subtitle">{subtitle}</p>
            </div>
            <div className="auth-mode-toggle">
              <button
                type="button"
                onClick={() => setMode('login')}
                className={mode === 'login' ? 'auth-mode-toggle__button auth-mode-toggle__button--active' : 'auth-mode-toggle__button'}
              >
                Login
              </button>
              <button
                type="button"
                onClick={() => setMode('register')}
                className={mode === 'register' ? 'auth-mode-toggle__button auth-mode-toggle__button--active' : 'auth-mode-toggle__button'}
              >
                Create account
              </button>
            </div>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            {mode === 'register' && (
              <label className="auth-field">
                <span>Full name</span>
                <div className="auth-field__input">
                  <UserRound className="h-4 w-4" />
                  <input
                    type="text"
                    value={form.name}
                    onChange={handleChange('name')}
                    placeholder="Your full name"
                  />
                </div>
              </label>
            )}

            <label className="auth-field">
              <span>Email</span>
              <div className="auth-field__input">
                <Mail className="h-4 w-4" />
                <input
                  type="email"
                  value={form.email}
                  onChange={handleChange('email')}
                  placeholder="name@example.com"
                />
              </div>
            </label>

            <label className="auth-field">
              <span>Password</span>
              <div className="auth-field__input">
                <LockKeyhole className="h-4 w-4" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={handleChange('password')}
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  className="auth-field__toggle"
                  onClick={() => setShowPassword((current) => !current)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </label>

            {error && <p className="auth-error">{error}</p>}

            <Button type="submit" className="auth-submit" disabled={isSubmitting}>
              {isSubmitting
                ? mode === 'login'
                  ? 'Signing in...'
                  : 'Creating account...'
                : mode === 'login'
                  ? 'Enter workspace'
                  : 'Create account'}
            </Button>

            <p className="auth-helper">
              Need the main workspace first? <Link to="/">Go back home</Link>
            </p>
          </form>
        </GlowCard>
      </section>
    </main>
  );
}
