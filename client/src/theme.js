import { ShieldCheckIcon, UsersIcon, LightbulbIcon, TrendingUpIcon, TrophyIcon } from './icons.jsx';

/**
 * YOUR LOGO
 * Put your logo file in  client/public/  and set its path here (PNG with a transparent
 * background, or SVG, works best). It is used in the header, on the landing page and on every award.
 * If the file is missing, a gold trophy badge is shown instead.
 */
export const LOGO_SRC = '/MRALogo.png';

/** Soft gold glow that sits under every floating card. */
export const GOLD_SHADOW = 'rgba(212, 175, 55, 0.5)';

/**
 * Per award: the fallback icon, and the logo image.
 * To give one award its own artwork, change its `logo` (e.g. '/awards/team-player.png').
 * Keys match the award ids in server/awards.js.
 */
export const awardTheme = {
  'most-reliable': { icon: ShieldCheckIcon, logo: LOGO_SRC },
  'team-player': { icon: UsersIcon, logo: LOGO_SRC },
  'knowledge-sharer': { icon: LightbulbIcon, logo: LOGO_SRC },
  'most-improved': { icon: TrendingUpIcon, logo: LOGO_SRC },
};

export const themeFor = (awardId) => awardTheme[awardId] || { icon: TrophyIcon, logo: LOGO_SRC };
