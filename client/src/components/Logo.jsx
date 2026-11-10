import { useState } from 'react';

/** Shows an image; if the file is missing or fails to load, shows `fallback` instead. */
export default function Logo({ src, alt = '', className = '', fallback = null }) {
  const [failed, setFailed] = useState(!src);
  if (failed) return fallback;
  return (
    <img
      src={src}
      alt={alt}
      draggable={false}
      onError={() => setFailed(true)}
      className={`object-contain ${className}`}
    />
  );
}