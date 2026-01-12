"use client";

import { useEffect, useState } from "react";
import {
  Mic,
  Film,
  Image as ImageIcon,
  Scissors,
  FileText,
  CreditCard,
  ChevronDown,
} from "lucide-react";

/* =========================
   TYPES
========================= */
type CreditLog = {
  id: string;
  amount: number;
  reason: string;
  meta: Record<string, any> | null;
  created_at: string;
};

/* =========================
   REASON → ICON + LABEL
========================= */
const REASON_META: Record<
  string,
  { label: string; icon: any }
> = {
  voiceover_generation: {
    label: "Voiceover Generated",
    icon: Mic,
  },
  broll_generation: {
    label: "B-Roll Generated",
    icon: Film,
  },
  image_generation: {
    label: "Image Generated",
    icon: ImageIcon,
  },
  ai_cut_editor: {
    label: "AI Cut Editor Used",
    icon: Scissors,
  },
  script_generation: {
    label: "Script Generated",
    icon: FileText,
  },
  plan_purchase: {
    label: "Plan Purchased",
    icon: CreditCard,
  },
};

/* =========================
   PAGE
========================= */
export default function HistoryPage() {
  const [logs, setLogs] = useState<CreditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/history", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => setLogs(data.history || []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <h1 className="text-2xl font-semibold">
        Credit History
      </h1>

      {loading && (
        <p className="text-gray-400">
          Loading history...
        </p>
      )}

      {!loading && logs.length === 0 && (
        <p className="text-gray-400">
          No activity yet. Start creating 🚀
        </p>
      )}

      <div className="space-y-4">
        {logs.map((log) => {
          const metaConfig =
            REASON_META[log.reason] || {
              label: log.reason
                .replace(/_/g, " ")
                .replace(/\b\w/g, (l) =>
                  l.toUpperCase()
                ),
              icon: FileText,
            };

          const Icon = metaConfig.icon;
          const isCredit = log.amount > 0;

          return (
            <div
              key={log.id}
              className="
                rounded-xl
                border border-white/10
                bg-gradient-to-br from-white/5 to-white/2
                p-5
                transition
                hover:border-white/20
              "
            >
              {/* HEADER */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-white/10">
                    <Icon size={18} />
                  </div>

                  <div>
                    <p className="font-medium">
                      {metaConfig.label}
                    </p>
                    <p className="text-xs text-gray-400">
                      {new Date(
                        log.created_at
                      ).toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* AMOUNT */}
                <div
                  className={`text-lg font-semibold ${
                    isCredit
                      ? "text-green-400"
                      : "text-red-400"
                  }`}
                >
                  {isCredit ? "" : ""}
                  {Math.abs(log.amount)} credits
                </div>
              </div>

              {/* DETAILS TOGGLE */}
              {log.meta && Object.keys(log.meta).length > 0 && (
                <button
                  onClick={() =>
                    setOpen(
                      open === log.id ? null : log.id
                    )
                  }
                  className="mt-3 flex items-center gap-2 text-xs text-gray-400 hover:text-white"
                >
                  <ChevronDown
                    size={14}
                    className={`transition ${
                      open === log.id
                        ? "rotate-180"
                        : ""
                    }`}
                  />
                  View details
                </button>
              )}

              {/* META DETAILS */}
              {open === log.id && log.meta && (
                <div className="mt-3 bg-black/40 rounded-lg p-3 text-xs text-gray-300 space-y-1">
                  {Object.entries(log.meta).map(
                    ([key, value]) => (
                      <div
                        key={key}
                        className="flex justify-between"
                      >
                        <span className="text-gray-400">
                          {key}
                        </span>
                        <span>
                          {String(value)}
                        </span>
                      </div>
                    )
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
