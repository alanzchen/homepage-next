import LaurelIcon from "./LaurelIcon";

interface AwardProps {
  award: string;
  className?: string;
}

export default function Award({ award, className = "" }: AwardProps) {
  const venueSeparator = award.lastIndexOf(" @ ");
  const title = venueSeparator === -1 ? award : award.slice(0, venueSeparator);
  const venue = venueSeparator === -1 ? null : award.slice(venueSeparator + 3);

  return (
    <span
      className={`inline-flex w-72 max-w-full items-center gap-2 py-1 align-middle sm:w-auto sm:gap-1 sm:py-0 ${className}`}
    >
      <span className="relative w-[1.125em] shrink-0 self-stretch sm:h-[1em] sm:w-[0.475em] sm:self-center">
        <LaurelIcon className="absolute left-1/2 top-[10%] h-[80%] w-auto -translate-x-1/2 select-none opacity-60 sm:top-0 sm:h-full sm:opacity-100" />
      </span>
      <span className="min-w-0 flex-1 break-words text-center text-sm leading-5 sm:flex-initial sm:text-left sm:text-base sm:leading-6">
        <span className="text-primary sm:text-inherit">{title}</span>
        {venue && (
          <>
            {" "}
            <span className="block max-w-full text-xs font-normal leading-5 text-secondary sm:inline-block sm:text-base sm:font-medium sm:leading-6">
              <span className="hidden sm:inline">@ </span>{venue}
            </span>
          </>
        )}
      </span>
      <span className="relative w-[1.125em] shrink-0 self-stretch sm:h-[1em] sm:w-[0.475em] sm:self-center">
        <LaurelIcon className="absolute left-1/2 top-[10%] h-[80%] w-auto -translate-x-1/2 select-none -scale-x-100 opacity-60 sm:top-0 sm:h-full sm:opacity-100" />
      </span>
    </span>
  );
}
