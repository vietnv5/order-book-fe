interface Props {
  count?: number;
}

function SkeletonCard() {
  return (
    <div className="animate-pulse rounded-2xl bg-surface p-4 shadow-card">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="h-4 w-36 rounded bg-gray-200" />
          <div className="mt-2 h-3 w-24 rounded bg-gray-100" />
          <div className="mt-3 h-3 w-20 rounded bg-gray-100" />
        </div>
        <div className="h-6 w-20 rounded-full bg-gray-200" />
      </div>
    </div>
  );
}

export default function SkeletonList({ count = 5 }: Props) {
  return (
    <div className="flex flex-col gap-3 px-4 pt-3">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}
