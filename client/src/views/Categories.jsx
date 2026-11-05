import { motion } from 'motion/react';
import Page from '../components/Page.jsx';
import Floaty from '../components/Floaty.jsx';
import BackButton from '../components/BackButton.jsx';
import AwardEmblem from '../components/AwardEmblem.jsx';
import { GOLD_SHADOW } from '../theme.js';

export default function Categories({ award, categories, onPick, onBack }) {
  // Only show CBD (or categories that have nominees)
  const activeCategories = categories.filter(
    (category) => category.id.toUpperCase() === 'CBD' || category.count > 0
  );

  return (
    <Page>
      <BackButton onClick={onBack}>All awards</BackButton>

      <div className="mb-14 flex flex-col items-center text-center">
        <AwardEmblem awardId={award.id} className="h-24 w-24" iconClass="h-11 w-11" />
        <h1 className="gold-text mt-6 font-display text-4xl font-bold tracking-tight sm:text-5xl">Pick a category</h1>
        <p className="mt-3 text-lg text-ivory/70">Voting for {award.title}</p>
      </div>

      <div className="mx-auto flex justify-center max-w-4xl gap-8">
        {activeCategories.map((category, i) => (
          <motion.div
            key={category.id}
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * i, type: 'spring', stiffness: 90, damping: 16 }}
            className="w-full max-w-xs"
          >
            <Floaty amplitude={10} duration={5 + i * 0.6} delay={i * 0.5} shadow={GOLD_SHADOW}>
              <motion.button
                type="button"
                onClick={() => onPick(category.id)}
                disabled={category.count === 0}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
                transition={{ type: 'spring', stiffness: 300, damping: 18 }}
                className="panel flex h-full w-full flex-col items-center rounded-[2rem] px-6 py-10 disabled:opacity-50"
              >
                <span className="gold-text font-display text-5xl font-bold tracking-tight">{category.id}</span>
                <span className="mt-4 rounded-full border border-gold/40 bg-gold/10 px-4 py-1.5 text-sm font-medium text-gold-light">
                  {category.count} {category.count === 1 ? 'nominee' : 'nominees'}
                </span>
              </motion.button>
            </Floaty>
          </motion.div>
        ))}
      </div>
    </Page>
  );
}