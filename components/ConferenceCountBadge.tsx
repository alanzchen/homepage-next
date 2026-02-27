interface ConferenceCountBadgeProps {
  count: number;
}

export default function ConferenceCountBadge({ count }: ConferenceCountBadgeProps) {
  return (
    <span className="inline-flex min-w-[2.5rem] items-center justify-center rounded-full bg-secondaryA px-2 py-0.5 text-xs font-semibold tabular-nums text-primary ring-1 ring-gray-400 ring-opacity-20">
      x{count}
    </span>
  );
}
