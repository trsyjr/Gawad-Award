import { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import Avatar from './Avatar.jsx';
import { CheckIcon, SpinnerIcon } from '../icons.jsx';
import { castVote } from '../api.js';

/**
 * Floating confirmation dialog. A vote cannot be changed, so we ask once before sending it.
 * Must be rendered directly inside <AnimatePresence> so it can animate out.
 */
export default function ConfirmVote({ employee, award, email, onClose, onVoted }) {
  const [status, setStatus] = useState('idle'); // idle | loading | done
  const [error, setError] = useState(null);
  const timer = useRef(null);

  useEffect(() => () => clearTimeout(timer.current), []);

  useEffect(() => {
    const onKey = (event) => {
      if (event.key === 'Escape' && status !== 'loading') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [status, onClose]);

  async function confirm() {
    setStatus('loading');
    setError(null);
    try {
      const result = await castVote({ email, awardId: award.id, employeeId: employee.id });
      setStatus('done');
      timer.current = setTimeout(() => onVoted(result.votes), 1600);
    } catch (err) {
      setStatus('idle');
      setError({ message: err.message, code: err.code, votes: err.data?.votes });
    }
  }

  const alreadyVoted = error?.code === 'already_voted';

  return (
    <motion.div
      className="fixed inset-0 z-50 grid place-items-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={status === 'loading' || status === 'done' ? undefined : onClose}
      />

      <motion.div
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        className="panel-solid relative w-full max-w-md rounded-[2rem] p-8 text-center"
        initial={{ opacity: 0, y: 60, scale: 0.92 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 40, scale: 0.95 }}
        transition={{ type: 'spring', stiffness: 220, damping: 22 }}
      >
        {status === 'done' ? (
          <div className="py-4" role="status">
            <motion.div
              className="gold-surface mx-auto grid h-20 w-20 place-items-center rounded-full shadow-[0_0_50px_-6px_rgba(212,175,55,0.8)]"
              initial={{ scale: 0, rotate: -30 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 260, damping: 14 }}
            >
              <CheckIcon className="h-10 w-10" strokeWidth={3} />
            </motion.div>
            <h2 id="confirm-title" className="gold-text mt-6 font-display text-3xl font-bold">
              Vote recorded
            </h2>
            <p className="mt-2 text-ivory/70">
              You voted for {employee.name} for {award.title}.
            </p>
          </div>
        ) : (
          <>
            <div className="flex justify-center">
              <Avatar name={employee.name} src={employee.photo} className="h-24 w-24" textClass="text-2xl" />
            </div>
            <h2 id="confirm-title" className="gold-text mt-5 font-display text-3xl font-bold">
              Vote for {employee.name}?
            </h2>
            <p className="mt-2 text-ivory/70">{award.title}. You can't change this vote after you confirm.</p>

            {error && (
              <p
                role="alert"
                className="mt-4 rounded-2xl border border-red-400/30 bg-red-950/60 px-4 py-3 text-sm font-medium text-red-200"
              >
                {error.message}
              </p>
            )}

            <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-center">
              {alreadyVoted ? (
                <button type="button" onClick={() => onVoted(error.votes)} className="btn-gold h-12 rounded-full px-8">
                  Back to awards
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    autoFocus
                    onClick={onClose}
                    disabled={status === 'loading'}
                    className="btn-ghost h-12 rounded-full px-8 font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={confirm}
                    disabled={status === 'loading'}
                    className="btn-gold inline-flex h-12 items-center justify-center gap-2 rounded-full px-8"
                  >
                    {status === 'loading' && <SpinnerIcon className="h-4 w-4 animate-spin" />}
                    {status === 'loading' ? 'Saving vote' : error ? 'Try again' : 'Confirm vote'}
                  </button>
                </>
              )}
            </div>
          </>
        )}
      </motion.div>
    </motion.div>
  );
}
