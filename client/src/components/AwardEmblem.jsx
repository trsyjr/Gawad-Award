import Logo from './Logo.jsx';
import { themeFor } from '../theme.js';

/** The logo for one award. Falls back to a gold badge with the award's icon. */
export default function AwardEmblem({ awardId, className = 'h-20 w-20', iconClass = 'h-9 w-9' }) {
  const theme = themeFor(awardId);
  const Icon = theme.icon;

  return (
    <Logo
      src={theme.logo}
      className={`drop-shadow-[0_0_18px_rgba(212,175,55,0.4)] ${className}`}
      fallback={
        <span className={`gold-surface grid shrink-0 place-items-center rounded-full ${className}`}>
          <Icon className={iconClass} />
        </span>
      }
    />
  );
}
