import { useState } from 'react';

/** Employee photo in a gold ring. Falls back to gold initials when there is no photo or it fails to load. */
export default function Avatar({ name, src, className = 'h-28 w-28', textClass = 'text-3xl' }) {
  const [failed, setFailed] = useState(!src);
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('');

  return (
    <span
      className={`relative inline-flex shrink-0 overflow-hidden rounded-full ring-2 ring-gold shadow-[0_0_28px_-4px_rgba(212,175,55,0.55)] ${className}`}
    >
      {failed ? (
        <span className={`gold-surface flex h-full w-full items-center justify-center font-display font-bold ${textClass}`}>
          {initials}
        </span>
      ) : (
        <img src={src} alt={name} loading="lazy" onError={() => setFailed(true)} className="h-full w-full object-cover" />
      )}
    </span>
  );
}
