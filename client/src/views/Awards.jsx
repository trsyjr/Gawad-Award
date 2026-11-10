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
      {/* Header section with top padding to clear navigation bar */}
      <div className="pt-10 mb-12 text-center">
        <h1 className="gold-text font-display text-4xl font-bold tracking-tight sm:text-5xl">
          {allDone ? 'All votes are in' : 'Choose an award'}
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

      {/* Strict 4-column grid container */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 lg:gap-6 xl:gap-8 w-full max-w-[1800px] mx-auto px-2 sm:px-4 pb-20 justify-items-center">
        {awards.map((award, i) => {
          const vote = votes[award.id];

          return (
            <motion.div
              key={award.id}
              initial={{ opacity: 0, y: 60 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.12 * i, type: 'spring', stiffness: 90, damping: 16 }}
              className="w-full h-full flex flex-col"
            >
              <Floaty amplitude={12} duration={5.2 + i * 0.5} delay={i * 0.6} shadow={GOLD_SHADOW} className="w-full h-full">
                <motion.article
                  whileHover={{ scale: 1.03 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  className="flex h-full flex-col items-center text-center p-3 sm:p-4 lg:p-5"
                >
                  <AwardEmblem
                    awardId={award.id}
                    className="h-44 w-44 lg:h-52 lg:w-52 xl:h-60 xl:w-60 shrink-0"
                    iconClass="h-20 w-20 lg:h-24 lg:w-24 xl:h-28 xl:w-28"
                  />

                  <h2 className="mt-6 font-display text-xl sm:text-2xl xl:text-3xl font-bold leading-tight text-gold-light">
                    {award.title}
                  </h2>
                  <p className="mt-2.5 text-sm sm:text-base xl:text-lg leading-relaxed text-ivory/70">
                    {award.description}
                  </p>

                  <div className="mt-auto pt-8 w-full flex justify-center">
                    {vote ? (
                      <div
                        className="flex w-full items-center justify-center gap-2 rounded-full border border-gold/40 bg-gold/10 py-2.5 px-3 overflow-hidden"
                        role="status"
                      >
                        <span className="gold-surface grid h-7 w-7 shrink-0 place-items-center rounded-full">
                          <CheckIcon className="h-4 w-4" strokeWidth={3} />
                        </span>
                        <span className="truncate text-xs sm:text-sm xl:text-base font-medium text-gold-light">
                          You voted for {vote.name}
                        </span>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => onPick(award)}
                        aria-label={`Vote for ${award.title}`}
                        className="btn-gold h-12 lg:h-14 w-full rounded-full px-6 text-base lg:text-lg font-semibold"
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