import { ReactNode } from "react";
import cn from "clsx";

type SectionProps = {
  heading: string;
  headingAlignment?: "right" | "left";
  headingAs?: "h1" | "h2" | "p";
  children: ReactNode;
};

export default function Section({
  heading,
  headingAlignment,
  headingAs = "h2",
  children,
}: SectionProps) {
  const Heading = headingAs;

  return (
    <section className="flex flex-col md:flex-row gap-1 md:gap-9">
      <Heading
        className={cn(
          "md:w-28 text-secondary shrink-0",
          headingAlignment === "right" && "md:text-right"
        )}
        suppressHydrationWarning={true}
      >
        {heading}
      </Heading>
      {children}
    </section>
  );
}
