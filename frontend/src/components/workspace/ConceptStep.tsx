interface ConceptStepProps {
  step: number;
  title: string;
  description: string;
}

export default function ConceptStep({ step, title, description }: ConceptStepProps) {
  return (
    <li className="min-w-0 rounded-xl border border-gray-200 bg-gray-50 p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Step {step}</p>
      <h3 className="mt-1 text-sm font-semibold">{title}</h3>
      <p className="mt-1 text-sm text-gray-600">{description}</p>
    </li>
  );
}
