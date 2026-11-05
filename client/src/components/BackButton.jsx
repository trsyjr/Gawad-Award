import { ArrowLeftIcon } from '../icons.jsx';

export default function BackButton({ onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="btn-ghost mb-8 inline-flex items-center gap-2 rounded-full py-2.5 pl-4 pr-5 text-sm font-medium"
    >
      <ArrowLeftIcon className="h-4 w-4" />
      {children}
    </button>
  );
}
