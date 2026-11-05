import { useCallback, useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import Page from '../components/Page.jsx';
import Floaty from '../components/Floaty.jsx';
import Avatar from '../components/Avatar.jsx';
import BackButton from '../components/BackButton.jsx';
import ConfirmVote from '../components/ConfirmVote.jsx';
import { SearchIcon, SpinnerIcon } from '../icons.jsx';
import { getEmployees } from '../api.js';
import { GOLD_SHADOW } from '../theme.js';

// Above this many cards the idle floating loop is switched off to keep scrolling smooth.
const FLOAT_LIMIT = 24;

export default function Employees({ award, category, email, onBack, onVoted }) {
  const [employees, setEmployees] = useState(null);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [pending, setPending] = useState(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setEmployees(null);
    setError('');
    getEmployees(category)
      .then((data) => !cancelled && setEmployees(data.employees))
      .catch((err) => !cancelled && setError(err.message));
    return () => {
      cancelled = true;
    };
  }, [category, attempt]);

  const visible = useMemo(() => {
    if (!employees) return [];
    const q = query.trim().toLowerCase();
    if (!q) return employees;
    return employees.filter((e) => `${e.name} ${e.position}`.toLowerCase().includes(q));
  }, [employees, query]);

  const closeDialog = useCallback(() => setPending(null), []);

  return (
    <Page>
      <BackButton onClick={onBack}>Categories</BackButton>

      <div className="mb-16 flex flex-col items-center text-center">
        <h1 className="gold-text font-display text-4xl font-bold tracking-tight sm:text-5xl">{category} nominees</h1>
        <p className="mt-3 text-lg text-ivory/70">Voting for {award.title}</p>

        {employees && employees.length > 8 && (
          <div className="relative mt-6 w-full max-w-sm">
            <label htmlFor="search" className="sr-only">
              Search by name or position
            </label>
            <SearchIcon className="pointer-events-none absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-gold" />
            <input
              id="search"
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by name or position"
              className="field h-12 w-full rounded-full pl-12 pr-4"
            />
          </div>
        )}
      </div>

      {error && (
        <div className="mx-auto max-w-md text-center" role="alert">
          <p className="rounded-2xl border border-red-400/30 bg-red-950/60 px-4 py-3 font-medium text-red-200">{error}</p>
          <button type="button" onClick={() => setAttempt((n) => n + 1)} className="btn-gold mt-4 h-12 rounded-full px-8">
            Try again
          </button>
        </div>
      )}

      {!error && !employees && (
        <div className="flex justify-center py-16" role="status" aria-label="Loading nominees">
          <SpinnerIcon className="h-8 w-8 animate-spin text-gold" />
        </div>
      )}

      {employees && visible.length === 0 && (
        <p className="py-10 text-center text-lg text-ivory/70">
          {employees.length === 0 ? `There are no nominees in ${category} yet.` : 'No nominees match your search.'}
        </p>
      )}

      {visible.length > 0 && (
        <div className="flex flex-wrap md:flex-nowrap justify-center items-stretch gap-8 lg:gap-12 xl:gap-14 w-full px-4">
          {visible.map((employee, i) => (
            <motion.div
              key={employee.id}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i, 12) * 0.06, type: 'spring', stiffness: 90, damping: 16 }}
              className="w-full flex-1 min-w-[200px]"
            >
              <Floaty
                amplitude={8}
                duration={5 + (i % 4) * 0.55}
                delay={(i % 6) * 0.35}
                shadow={GOLD_SHADOW}
                disabled={employees.length > FLOAT_LIMIT}
              >
                <motion.article
                  whileHover={{ scale: 1.04 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  className="flex h-full flex-col items-center text-center p-2"
                >
                  <Avatar name={employee.name} src={employee.photo} className="h-28 w-28 sm:h-32 sm:w-32" />
                  
                  <h2 className="mt-6 font-display text-xl font-bold leading-tight text-gold-light">{employee.name}</h2>
                  <p className="mt-2 text-sm leading-snug text-ivory/70">{employee.position}</p>

                  {/* Pinned to the bottom of the card */}
                  <div className="mt-auto w-full pt-8 flex justify-center">
                    <button
                      type="button"
                      onClick={() => setPending(employee)}
                      aria-label={`Vote for ${employee.name}`}
                      className="btn-gold h-12 w-full max-w-[220px] rounded-full text-base font-semibold"
                    >
                      Vote
                    </button>
                  </div>
                </motion.article>
              </Floaty>
            </motion.div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {pending && (
          <ConfirmVote
            key={pending.id}
            employee={pending}
            award={award}
            email={email}
            onClose={closeDialog}
            onVoted={onVoted}
          />
        )}
      </AnimatePresence>
    </Page>
  );
}