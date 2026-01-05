type CutReason = "silence" | "repetition" | "filler";

export type CutSuggestion = {
  start: number;
  end: number;
  reason: CutReason;
  confidence: number;
};

const FILLERS = ["uh", "um", "like", "you know", "basically"];

export function detectCuts(words: any[]): CutSuggestion[] {
  const cuts: CutSuggestion[] = [];

  for (let i = 1; i < words.length; i++) {
    const prev = words[i - 1];
    const curr = words[i];

    // 🔴 Silence
    if (curr.start - prev.end > 1200) {
      cuts.push({
        start: prev.end,
        end: curr.start,
        reason: "silence",
        confidence: 0.9,
      });
    }

    // 🟡 Fillers
    if (FILLERS.includes(curr.text.toLowerCase())) {
      cuts.push({
        start: curr.start,
        end: curr.end,
        reason: "filler",
        confidence: 0.7,
      });
    }

    // 🟠 Repetition
    if (
      curr.text.toLowerCase() === prev.text.toLowerCase() &&
      curr.start - prev.start < 2000
    ) {
      cuts.push({
        start: prev.start,
        end: curr.end,
        reason: "repetition",
        confidence: 0.85,
      });
    }
  }

  return cuts;
}
