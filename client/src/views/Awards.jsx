import { motion } from 'motion/react';
import Page from '../components/Page.jsx';
import Floaty from '../components/Floaty.jsx';
import AwardEmblem from '../components/AwardEmblem.jsx';
import { CheckIcon } from '../icons.jsx';
import { GOLD_SHADOW } from '../theme.js';

export default function Awards({ awards, votes, onPick }) {
  const done = awards.filter((award) => votes[award.id]).length;
  const allDone = done === awards.length;

  return (
    <Page>
      <div className="mb-16 text-center">
        <h1 className="gold-text font-display text-4xl font-bold tracking-tight sm:text-5xl">
          {allDone ? 'All four votes are in' : 'Choose an award'}
        </h1>
        <p className="mt-3 text-lg text-ivory/70">
          {allDone
            ? 'Thank you for voting. You can close this page.'
            : `You have cast ${done} of ${awards.length} votes.`}
        </p>
        <div className="mt-5 flex justify-center gap-2" role="img" aria-label={`${done} of ${awards.length} votes cast`}>
          {awards.map((award) => (
            <span
              key={award.id}
              className={`h-1.5 w-10 rounded-full transition-colors duration-500 ${
                votes[award.id] ? 'gold-surface' : 'bg-white/10'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Expanded full-width flex container centered horizontally */}
      <div className="flex flex-wrap justify-center gap-y-16 gap-x-8 xl:gap-x-12 w-full max-w-[1700px] mx-auto px-4">
        {awards.map((award, i) => {
          const vote = votes[award.id];

          return (
            <motion.div
              key={award.id}
              initial={{ opacity: 0, y: 60 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.12 * i, type: 'spring', stiffness: 90, damping: 16 }}
              className="w-full sm:w-[calc(50%-1rem)] lg:w-[calc(25%-1.75rem)] max-w-[360px] shrink-0 flex flex-col"
            >
              <Floaty amplitude={12} duration={5.2 + i * 0.5} delay={i * 0.6} shadow={GOLD_SHADOW} className="w-full h-full">
                <motion.article
                  whileHover={{ scale: 1.04 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  className="flex h-full flex-col items-center text-center p-4 sm:p-6"
                >
                  <AwardEmblem
                    awardId={award.id}
                    className="h-52 w-52 sm:h-60 sm:w-60"
                    iconClass="h-24 w-24 sm:h-28 sm:w-28"
                  />

                  <h2 className="mt-8 font-display text-2xl sm:text-3xl font-bold leading-tight text-gold-light">
                    {award.title}
                  </h2>
                  <p className="mt-3 text-base sm:text-lg leading-relaxed text-ivory/70">
                    {award.description}
                  </p>

                  <div className="mt-auto pt-10 w-full flex justify-center">
                    {vote ? (
                      <div
                        className="flex w-full items-center justify-center gap-2.5 rounded-full border border-gold/40 bg-gold/10 py-3 px-4 overflow-hidden"
                        role="status"
                      >
                        <span className="gold-surface grid h-8 w-8 shrink-0 place-items-center rounded-full">
                          <CheckIcon className="h-5 w-5" strokeWidth={3} />
                        </span>
                        <span className="truncate text-sm sm:text-base font-medium text-gold-light">
                          You voted for {vote.name}
                        </span>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => onPick(award)}
                        aria-label={`Vote for ${award.title}`}
                        className="btn-gold h-14 w-full rounded-full px-8 text-lg font-semibold"
                      >
                        Vote
                      </button>
                    )}
                  </div>
                </motion.article>
              </Floaty>
            </motion.div>
          );
        })}
      </div>
    </Page>
  );
}