import { useEffect, useState } from 'react';
import { AnimatePresence } from 'motion/react';
import Background from './components/Background.jsx';
import Header from './components/Header.jsx';
import Landing from './views/Landing.jsx';
import Awards from './views/Awards.jsx';
import Employees from './views/Employees.jsx';
import { SpinnerIcon } from './icons.jsx';
import { getConfig, startSession } from './api.js';

const EMAIL_KEY = 'awards.email';
const MUSIC_PATH = '/awards/AwardingBM.mp3';

const remember = (email) => {
  try {
    if (email) sessionStorage.setItem(EMAIL_KEY, email);
    else sessionStorage.removeItem(EMAIL_KEY);
  } catch {
    /* ignore */
  }
};
const recall = () => {
  try {
    return sessionStorage.getItem(EMAIL_KEY) || '';
  } catch {
    return '';
  }
};

export default function App() {
  const [config, setConfig] = useState(null);
  const [loadError, setLoadError] = useState('');
  const [booting, setBooting] = useState(true);
  const [attempt, setAttempt] = useState(0);

  const [email, setEmail] = useState('');
  const [votes, setVotes] = useState({});
  const [view, setView] = useState('landing');
  const [award, setAward] = useState(null);
  const [category, setCategory] = useState(null);

  useEffect(() => {
    const audio = new Audio(MUSIC_PATH);
    audio.loop = true;
    audio.volume = 0.4;

    const startPlayback = () => {
      audio.play().catch(() => {});
    };

    startPlayback();

    const handleUserInteraction = () => {
      audio.play().catch(() => {});
      window.removeEventListener('click', handleUserInteraction);
      window.removeEventListener('keydown', handleUserInteraction);
    };

    window.addEventListener('click', handleUserInteraction);
    window.addEventListener('keydown', handleUserInteraction);

    return () => {
      audio.pause();
      window.removeEventListener('click', handleUserInteraction);
      window.removeEventListener('keydown', handleUserInteraction);
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    setBooting(true);
    setLoadError('');

    (async () => {
      try {
        const cfg = await getConfig();
        if (cancelled) return;
        setConfig(cfg);

        const saved = recall();
        if (saved) {
          try {
            const session = await startSession(saved);
            if (cancelled) return;
            setEmail(session.email);
            setVotes(session.votes);
            setView('awards');
          } catch {
            remember('');
          }
        }
      } catch (err) {
        if (!cancelled) setLoadError(err.message);
      } finally {
        if (!cancelled) setBooting(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [attempt]);

  async function signIn(rawEmail) {
    const session = await startSession(rawEmail);
    remember(session.email);
    setEmail(session.email);
    setVotes(session.votes);
    setView('awards');
  }

  function switchEmail() {
    remember('');
    setEmail('');
    setVotes({});
    setAward(null);
    setCategory(null);
    setView('landing');
  }

  function finishVote(updatedVotes) {
    if (updatedVotes) setVotes(updatedVotes);
    setAward(null);
    setCategory(null);
    setView('awards');
  }

  return (
    <>
      <Background />
      <div className="relative z-10 min-h-screen px-4 pb-20 pt-28 sm:px-8 sm:pt-32">
        {config && <Header title={config.eventTitle} email={email} onSwitchEmail={switchEmail} />}

        <div className="mx-auto w-full max-w-[1920px]">
          {booting && (
            <div className="flex min-h-[50vh] items-center justify-center" role="status" aria-label="Loading">
              <SpinnerIcon className="h-9 w-9 animate-spin text-gold" />
            </div>
          )}

          {!booting && loadError && (
            <div className="panel mx-auto mt-16 max-w-md rounded-[2rem] p-8 text-center" role="alert">
              <h1 className="gold-text font-display text-2xl font-bold">The voting page can't load</h1>
              <p className="mt-3 text-ivory/70">{loadError}</p>
              <button
                type="button"
                onClick={() => setAttempt((n) => n + 1)}
                className="btn-gold mt-6 h-12 rounded-full px-8"
              >
                Try again
              </button>
            </div>
          )}

          {!booting && config && (
            <AnimatePresence mode="wait">
              {view === 'landing' && <Landing key="landing" title={config.eventTitle} onSubmit={signIn} />}

              {view === 'awards' && (
                <Awards
                  key="awards"
                  awards={config.awards}
                  votes={votes}
                  onPick={(picked) => {
                    const awardId = typeof picked === 'string' ? picked : picked?.id;
                    setAward(picked);
                    setCategory(awardId);
                    setView('employees');
                  }}
                />
              )}

              {view === 'employees' && award && category && (
                <Employees
                  key="employees"
                  award={award}
                  category={category}
                  email={email}
                  onBack={() => setView('awards')}
                  onVoted={finishVote}
                />
              )}
            </AnimatePresence>
          )}
        </div>
      </div>
    </>
  );
}