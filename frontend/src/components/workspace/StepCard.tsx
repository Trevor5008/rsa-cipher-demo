import { useId, type ReactNode } from "react";

interface StepCardProps {
  step: number;
  title: string;
  description?: ReactNode;
  children: ReactNode;
}

export default function StepCard({ step, title, description, children }: StepCardProps) {
  const titleId = useId();

  return (
    <section
      aria-labelledby={titleId}
      className="flex min-w-0 flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm md:p-5"
    >
      <div>
        <div className="flex items-center gap-2">
          <span
            aria-hidden="true"
            className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gray-900 text-xs font-semibold text-white"
          >
            {step}
          </span>
          <h2 id={titleId} className="text-base font-semibold">
            <span className="sr-only">{`Step ${step}:`}</span> {title}
          </h2>
        </div>
        {description && <div className="mt-1 text-sm text-gray-600">{description}</div>}
      </div>
      {children}
    </section>
  );
}
