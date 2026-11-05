import { useState } from 'react';
import Page from '../components/Page.jsx';
import Floaty from '../components/Floaty.jsx';
import Logo from '../components/Logo.jsx';
import { MailIcon, SpinnerIcon, TrophyIcon } from '../icons.jsx';
import { GOLD_SHADOW, LANDING_LOGO, LOGO_SRC } from '../theme.js';

export default function Landing({ title, onSubmit }) {
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function submit(event) {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setError('');
    try {
      await onSubmit(email);
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  }

  return (
    <Page className="flex min-h-[calc(100vh-9rem)] flex-col items-center justify-center text-center">
      {/* The logo floats above its own gold glow */}
      <div className="h-64 w-64 sm:h-80 sm:w-80">
        <Floaty amplitude={14} duration={6} shadow={GOLD_SHADOW}>
          <Logo
            src={LANDING_LOGO}
            alt={title}
            className="h-full w-full drop-shadow-[0_0_34px_rgba(212,175,55,0.5)]"
            fallback={
              <span className="gold-surface grid h-full w-full place-items-center rounded-full shadow-[0_0_50px_-6px_rgba(212,175,55,0.7)]">
                <TrophyIcon className="h-1/2 w-1/2" />
              </span>
            }
          />
        </Floaty>
      </div>

      <h1 className="gold-text max-w-3xl font-display text-5xl font-bold leading-[1.05] tracking-tight sm:text-7xl">
        Vote for the people who make work better.
      </h1>
      <p className="mt-6 max-w-xl text-lg text-ivory/70">
        There are four awards and you get one vote for each. Enter your email to start.
      </p>

      <div className="mt-10 w-full max-w-xl">
        <Floaty amplitude={9} duration={6} shadow={GOLD_SHADOW}>
          <form onSubmit={submit} noValidate className="panel rounded-[2rem] p-3">
            <label htmlFor="email" className="sr-only">
              Email address
            </label>
            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="relative flex-1">
                <MailIcon className="pointer-events-none absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-gold" />
                <input
                  id="email"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  aria-invalid={Boolean(error)}
                  aria-describedby={error ? 'email-error' : undefined}
                  className="field h-14 w-full rounded-full pl-12 pr-4 text-base"
                />
              </div>
              <button
                type="submit"
                disabled={busy || !email.trim()}
                className="btn-gold inline-flex h-14 items-center justify-center gap-2 rounded-full px-8"
              >
                {busy && <SpinnerIcon className="h-4 w-4 animate-spin" />}
                Start voting
              </button>
            </div>
          </form>
        </Floaty>

        {error && (
          <p
            id="email-error"
            role="alert"
            className="mt-8 inline-block rounded-2xl border border-red-400/30 bg-red-950/60 px-4 py-2 text-sm font-medium text-red-200"
          >
            {error}
          </p>
        )}
      </div>

      <p className="mt-10 max-w-md text-sm text-ivory/50">
        Your email is only used to make sure each person votes once per award.
      </p>
    </Page>
  );
}
