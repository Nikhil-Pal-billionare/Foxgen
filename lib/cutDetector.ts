type Word = {
  text: string;
  start: number; // ms
  end: number;   // ms
};

type Cut = {
  start: number;
  end: number;
  reason: string;
  confidence: number;
};

const FILLERS = ["um", "uh", "ah", "like", "you know", "so"];

export function detectCuts(words: Word[]): Cut[] {
  const cuts: Cut[] = [];

  if (!words || words.length === 0) return cuts;

  /* =========================
     1️⃣ LONG PAUSES (> 700ms)
     (REALISTIC)
  ========================= */
  for (let i = 1; i < words.length; i++) {
    const gap = words[i].start - words[i - 1].end;

    if (gap > 5000) {
      cuts.push({
        start: words[i - 1].end,
        end: words[i].start,
        reason: "Long pause",
        confidence: Math.min(gap / 2000, 1),
      });
    }
  }

  /* =========================
     2️⃣ FILLER CLUSTERS
     (≥ 2 fillers in 3s)
  ========================= */
  let fillerStart: number | null = null;
  let fillerCount = 0;

  for (const w of words) {
    if (FILLERS.includes(w.text.toLowerCase())) {
      if (fillerStart === null) fillerStart = w.start;
      fillerCount++;
    } else {
      if (fillerCount >= 2 && fillerStart !== null) {
        cuts.push({
          start: fillerStart,
          end: w.end,
          reason: "Filler-heavy speech",
          confidence: Math.min(fillerCount / 4, 1),
        });
      }
      fillerStart = null;
      fillerCount = 0;
    }
  }

  /* =========================
     3️⃣ REPETITION (same word)
  ========================= */
  for (let i = 1; i < words.length; i++) {
    if (
      words[i].text.toLowerCase() ===
      words[i - 1].text.toLowerCase()
    ) {
      cuts.push({
        start: words[i - 1].start,
        end: words[i].end,
        reason: "Repeated word",
        confidence: 0.7,
      });
    }
  }

  return cuts;
}
