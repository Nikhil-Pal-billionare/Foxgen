export default function ControlPanel() {
  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-4">
      <h3 className="font-semibold">Settings</h3>

      <div>
        <label className="text-sm text-gray-400">Aspect Ratio</label>
        <div className="flex gap-2 mt-2">
          {["1:1", "16:9", "9:16"].map(r => (
            <button
              key={r}
              className="px-3 py-1 rounded-md bg-white/10 hover:bg-white/20"
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="text-sm text-gray-400">Quality</label>
        <input type="range" className="w-full mt-2" />
      </div>
    </div>
  );
}
