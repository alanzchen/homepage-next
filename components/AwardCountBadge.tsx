import LaurelIcon from "./LaurelIcon";

interface AwardCountBadgeProps {
  count: number;
  className?: string;
}

export default function AwardCountBadge({ count, className = "" }: AwardCountBadgeProps) {
  return (
    <span
      className={`inline-flex h-7 w-7 items-center justify-center rounded-md text-primary ${className}`}
      aria-label={`${count} award${count === 1 ? "" : "s"}`}
      title={`${count} award${count === 1 ? "" : "s"}`}
    >
      <span className="flex items-center gap-px leading-none">
        <LaurelIcon className="h-[0.5rem] w-auto select-none text-secondary" />
        <span className="text-[0.66rem] font-semibold tabular-nums">{count}</span>
        <LaurelIcon className="h-[0.5rem] w-auto select-none -scale-x-100 text-secondary" />
      </span>
    </span>
  );
}
