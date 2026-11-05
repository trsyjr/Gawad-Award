// Small inline icon set (stroke icons that inherit the current text colour).

const make = (paths) =>
  function Icon({ className = '', ...rest }) {
    return (
      <svg
        viewBox="0 0 24 24"
        width="24"
        height="24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        className={className}
        {...rest}
      >
        {paths}
      </svg>
    );
  };

export const ShieldCheckIcon = make(
  <>
    <path d="M12 3l7 3v5c0 4.5-3 8.2-7 10-4-1.8-7-5.5-7-10V6l7-3z" />
    <path d="M9 12l2 2 4-4" />
  </>
);

export const UsersIcon = make(
  <>
    <circle cx="9" cy="8" r="3.2" />
    <path d="M3 20c0-3.3 2.7-5.5 6-5.5s6 2.2 6 5.5" />
    <circle cx="17" cy="9" r="2.4" />
    <path d="M16.5 14.6c2.6.1 4.5 1.9 4.5 4.4" />
  </>
);

export const LightbulbIcon = make(
  <>
    <path d="M9 18h6M10 21h4" />
    <path d="M12 3a6 6 0 00-3.5 10.9c.6.5 1 1.2 1 2.1h5c0-.9.4-1.6 1-2.1A6 6 0 0012 3z" />
  </>
);

export const TrendingUpIcon = make(
  <>
    <path d="M3 17l6-6 4 4 8-8" />
    <path d="M15 7h6v6" />
  </>
);

export const MailIcon = make(
  <>
    <rect x="3" y="5" width="18" height="14" rx="3" />
    <path d="M3.5 7.5l8.5 6 8.5-6" />
  </>
);

export const ArrowLeftIcon = make(<path d="M19 12H5M11 6l-6 6 6 6" />);

export const CheckIcon = make(<path d="M5 12.5l4.5 4.5L19 7.5" />);

export const SearchIcon = make(
  <>
    <circle cx="11" cy="11" r="6.5" />
    <path d="M20 20l-4-4" />
  </>
);

export const TrophyIcon = make(
  <>
    <path d="M8 4h8v5a4 4 0 01-8 0V4z" />
    <path d="M8 6H5a3 3 0 003 4M16 6h3a3 3 0 01-3 4" />
    <path d="M12 13v4M9 20h6M10 17h4" />
  </>
);

export const SpinnerIcon = make(<path d="M21 12a9 9 0 11-6.2-8.55" />);
