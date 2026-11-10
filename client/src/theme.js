import { ShieldCheckIcon, UsersIcon, LightbulbIcon, TrendingUpIcon, TrophyIcon } from './icons.jsx';

/**
 * YOUR LOGO
 * Put your logo file in  client/public/  and set its path here (PNG with a transparent
 * background, or SVG, works best). It is used in the header, on the landing page and on every award.
 * If the file is missing, a gold trophy badge is shown instead.
 */
export const LOGO_SRC = '/awards/MRALogo.png';
export const TPA_LOGO = '/awards/TPALogo.png';
export const KSA_LOGO = '/awards/KSALogo.png';
export const MIA_LOGO = '/awards/MIALogo.png';
export const BAS_LOGO = '/awards/BASLogo.png';
export const ESA_LOGO = '/awards/ESALogo.png';
export const OTF_LOGO = '/awards/OTFLogo.png';
export const LA_LOGO = '/awards/LALogo.png';
export const BTA_LOGO = '/awards/BTALogo.png';
export const LANDING_LOGO = '/image/IconLogo.png';

/** Soft gold glow that sits under every floating card. */
export const GOLD_SHADOW = 'rgba(212, 175, 55, 0.5)';

/**
 * Per award: the fallback icon, and the logo image.
 * To give one award its own artwork, change its `logo` (e.g. '/awards/team-player.png').
 * Keys match the award ids in server/awards.js.
 */
export const awardTheme = {
  'most-reliable': {logo: LOGO_SRC },
  'team-player': {logo: TPA_LOGO },
  'knowledge-sharer': {logo: KSA_LOGO },
  'best-technical': {logo: BTA_LOGO },
  'best-administrative': {logo: BAS_LOGO },
  'excellence-service': {logo: ESA_LOGO },
  'outstanding-trainer': {logo: OTF_LOGO },
  'loyalty-award': {logo: LA_LOGO },
  'most-improved': {logo: MIA_LOGO },
};

export const themeFor = (awardId) => awardTheme[awardId] || { icon: TrophyIcon, logo: LANDING_LOGO };
