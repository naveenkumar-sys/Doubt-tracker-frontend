import { Search } from 'lucide-react';

const SuggestionBar = ({ suggestion, onSearchCorrected }) => {
  if (!suggestion) return null;

  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 text-sm text-amber-800">
          <Search size={16} className="shrink-0 text-amber-500" />
          <span>
            Showing results for{' '}
            <strong className="font-semibold">{suggestion.corrected}</strong>
          </span>
        </div>
        <button
          type="button"
          onClick={() => onSearchCorrected(suggestion.corrected)}
          className="text-left text-xs text-amber-600 underline transition hover:text-amber-800 sm:text-right"
        >
          Search instead for &ldquo;{suggestion.original}&rdquo;
        </button>
      </div>
    </div>
  );
};

export default SuggestionBar;
