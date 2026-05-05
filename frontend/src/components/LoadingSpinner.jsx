export default function LoadingSpinner() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className="bg-white rounded-2xl overflow-hidden shadow-sm border border-border animate-pulse"
        >
          {/* Image skeleton */}
          <div className="w-full h-52 bg-surface-dark" />

          {/* Content skeleton */}
          <div className="p-5 space-y-3">
            <div className="h-5 bg-surface-dark rounded-lg w-3/4" />
            <div className="h-6 bg-surface-dark rounded-lg w-1/2" />
            <div className="space-y-2">
              <div className="h-3 bg-surface-dark rounded w-full" />
              <div className="h-3 bg-surface-dark rounded w-5/6" />
            </div>
            <div className="h-10 bg-surface-dark rounded-xl w-full mt-4" />
          </div>
        </div>
      ))}
    </div>
  );
}
