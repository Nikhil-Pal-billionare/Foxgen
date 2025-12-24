export default function StatCard({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
      <p className="text-gray-400">{label}</p>
      <p className="text-2xl font-bold mt-2">{value}</p>
    </div>
  );
}
