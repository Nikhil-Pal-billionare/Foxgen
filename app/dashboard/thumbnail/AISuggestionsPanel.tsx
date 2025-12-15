"use client";

type Props = {
  onSelectText: (text: string) => void;
};

export default function AISuggestionsPanel({ onSelectText }: Props) {

  const suggestions = {
    hook: "Fear + urgency",
    texts: ["AI IS COMING", "JOBS AT RISK", "FUTURE SHOCK"],
    placement: "Right side",
    style: "Dramatic, high contrast",
  };

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 space-y-4">
      <h3 className="text-lg font-semibold">AI Suggestions</h3>

      <div>
        <p className="text-sm text-gray-400 mb-1">Hook</p>
        <p className="font-medium">{suggestions.hook}</p>
      </div>

      <div>
        <p className="text-sm text-gray-400 mb-2">Text Ideas</p>
        <div className="flex flex-wrap gap-2">
          {suggestions.texts.map((text) => (
            <button
              key={text}
              onClick={() => onSelectText(text)}
              className="px-3 py-1 text-sm rounded bg-black border border-neutral-700 hover:border-red-600 transition"
            >
              {text}
            </button>
          ))}
        </div>
      </div>

      <div className="text-sm text-gray-300">
        <p>
          <span className="text-gray-400">Placement:</span>{" "}
          {suggestions.placement}
        </p>
        <p>
          <span className="text-gray-400">Style:</span>{" "}
          {suggestions.style}
        </p>
      </div>
    </div>
  );
}
