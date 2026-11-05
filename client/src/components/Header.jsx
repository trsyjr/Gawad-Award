import { motion } from 'motion/react';
import Floaty from './Floaty.jsx';
import Logo from './Logo.jsx';
import { MailIcon, TrophyIcon } from '../icons.jsx';
import { LOGO_SRC } from '../theme.js';

export default function Header({ title, email, onSwitchEmail }) {
  return (
    <motion.header
      className="pointer-events-none fixed inset-x-0 top-4 z-30 flex justify-center px-4"
      initial={{ y: -70, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 140, damping: 18, delay: 0.1 }}
    >
      <Floaty amplitude={4} duration={6} className="pointer-events-auto w-full max-w-3xl">
        <div className="panel flex items-center justify-between gap-3 rounded-full py-2 pl-2 pr-2">
          <div className="flex min-w-0 items-center gap-3">
            <Logo
              src={LOGO_SRC}
              className="h-10 w-10 shrink-0"
              fallback={
                <span className="gold-surface grid h-10 w-10 shrink-0 place-items-center rounded-full">
                  <TrophyIcon className="h-5 w-5" />
                </span>
              }
            />
            <span className="truncate font-display text-lg font-bold text-gold-light">{title}</span>
          </div>

          {email && (
            <div className="flex min-w-0 items-center gap-2">
              <span className="hidden min-w-0 items-center gap-2 rounded-full bg-white/5 px-3 py-2 text-sm text-ivory/70 sm:flex">
                <MailIcon className="h-4 w-4 shrink-0 text-gold" />
                <span className="max-w-[14rem] truncate">{email}</span>
              </span>
              <button type="button" onClick={onSwitchEmail} className="btn-ghost rounded-full px-4 py-2 text-sm font-medium">
                Use another email
              </button>
            </div>
          )}
        </div>
      </Floaty>
    </motion.header>
  );
}
