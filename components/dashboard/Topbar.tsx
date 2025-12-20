import CreditChip from "./CreditChip";

export default function Topbar() {
  return (
    <header className="h-16 flex items-center justify-between px-6 border-b border-white/10 bg-white/5 backdrop-blur">
      <div className="text-sm text-gray-400">
        AI Content Studio
      </div>

      <div className="flex items-center gap-4">
        <CreditChip />
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-cyan-400" />
      </div>
    </header>
  );
}
