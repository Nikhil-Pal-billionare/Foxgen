"use client";

interface GeneratorCardProps {
  title: string;
  description: string;
  credits: string;
  onGenerateAction: () => void;
  children?: React.ReactNode;
}

export default function GeneratorCard({
  title,
  description,
  credits,
  onGenerateAction,
  children,
}: GeneratorCardProps) {
  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 flex flex-col justify-between">
      <div>
        <h3 className="text-xl font-semibold text-white">{title}</h3>
        <p className="text-gray-400 mt-2">{description}</p>

        {children && <div className="mt-4">{children}</div>}
      </div>

      <div className="mt-6 flex items-center justify-between">
        <span className="text-sm text-gray-400">
          Cost: <span className="text-white">{credits}</span>
        </span>

        <button
          onClick={onGenerateAction}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded"
        >
          Generate
        </button>
      </div>
    </div>
  );
}
