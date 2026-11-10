import Logo from './Logo.jsx';
import { themeFor } from '../theme.js';

/** The logo for one award. Falls back to a gold badge with the award's icon. */
export default function AwardEmblem({ awardId, className = 'h-52 w-52 sm:h-64 sm:w-64 xl:h-72 xl:w-72', iconClass = 'h-24 w-24 sm:h-32 sm:w-32 xl:h-36 xl:w-36' }) {
  const theme = themeFor(awardId);
  const Icon = theme.icon;

  return (
    <Logo
      src={theme.logo}
      className={`drop-shadow-[0_0_24px_rgba(212,175,55,0.45)] ${className}`}
      fallback={
        <span className={`gold-surface grid shrink-0 place-items-center rounded-full ${className}`}>
          <Icon className={iconClass} />
        </span>
      }
    />
  );
}