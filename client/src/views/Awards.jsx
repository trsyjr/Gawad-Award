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
      {/* Header section */}
      <div className="pt-6 mb-16 text-center">
        <h1 className="gold-text font-display text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
          {allDone ? 'All votes are in' : 'Choose an award'}
        </h1>
        <p className="mt-4 text-xl text-ivory/70">
          {allDone
            ? 'Thank you for voting. You can close this page.'
            : `You have cast ${done} of ${awards.length} votes.`}
        </p>
        <div className="mt-6 flex justify-center gap-2" role="img" aria-label={`${done} of ${awards.length} votes cast`}>
          {awards.map((award) => (
            <span
              key={award.id}
              className={`h-2 w-12 rounded-full transition-colors duration-500 ${
                votes[award.id] ? 'gold-surface' : 'bg-white/10'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Full width container: 4 large columns on desktop, centered leftover items on bottom row */}
      <div className="flex flex-wrap justify-center gap-y-16 gap-x-6 xl:gap-x-8 w-full px-4 sm:px-8 xl:px-12 pb-24">
        {awards.map((award, i) => {
          const vote = votes[award.id];

          return (
            <motion.div
              key={award.id}
              initial={{ opacity: 0, y: 60 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08 * i, type: 'spring', stiffness: 90, damping: 16 }}
              className="w-full sm:w-[calc(50%-1.5rem)] xl:w-[calc(25%-2rem)] max-w-[420px] shrink-0 flex flex-col"
            >
              <Floaty amplitude={12} duration={5.2 + i * 0.5} delay={i * 0.6} shadow={GOLD_SHADOW} className="w-full h-full">
                <motion.article
                  whileHover={{ scale: 1.04 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  className="flex h-full flex-col items-center text-center p-6 lg:p-8"
                >
                  <AwardEmblem
                    awardId={award.id}
                    className="h-56 w-56 sm:h-64 sm:w-64 xl:h-72 xl:w-72 shrink-0"
                    iconClass="h-28 w-28 sm:h-32 sm:w-32 xl:h-36 xl:w-36"
                  />

                  <h2 className="mt-8 font-display text-2xl sm:text-3xl xl:text-4xl font-bold leading-tight text-gold-light">
                    {award.title}
                  </h2>
                  <p className="mt-4 text-base sm:text-lg xl:text-xl leading-relaxed text-ivory/70">
                    {award.description}
                  </p>

                  <div className="mt-auto pt-10 w-full flex justify-center">
                    {vote ? (
                      <div
                        className="flex w-full items-center justify-center gap-3 rounded-full border border-gold/40 bg-gold/10 py-3.5 px-4 overflow-hidden"
                        role="status"
                      >
                        <span className="gold-surface grid h-9 w-9 shrink-0 place-items-center rounded-full">
                          <CheckIcon className="h-6 w-6" strokeWidth={3} />
                        </span>
                        <span className="truncate text-sm sm:text-base xl:text-lg font-medium text-gold-light">
                          You voted for {vote.name}
                        </span>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => onPick(award)}
                        aria-label={`Vote for ${award.title}`}
                        className="btn-gold h-14 sm:h-16 w-full rounded-full px-8 text-lg sm:text-xl font-semibold"
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