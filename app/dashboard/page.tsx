import Image from "next/image";

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-black text-white p-8">
      
      {/* Header */}
      <div className="flex items-center gap-4 mb-10">
        <Image
          src="/foxgen-logo.png"
          alt="Foxgen"
          width={56}
          height={56}
          className="rounded"
        />
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-gray-400 text-sm">
            Create AI-powered content in seconds
          </p>
        </div>
      </div>

      {/* Stats / Quick Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <DashboardCard title="Credits Left" value="—" />
        <DashboardCard title="Images Generated" value="0" />
        <DashboardCard title="Videos Generated" value="0" />
      </div>

      {/* Main Actions */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Start Creating</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <ActionCard
            title="Thumbnail Generator"
            desc="Generate high-click thumbnails using AI"
            href="/dashboard/thumbnail"
          />
          <ActionCard
            title="AI Video Creator"
            desc="Create full videos from text prompts"
            href="/dashboard/video"
          />
          <ActionCard
            title="Results"
            desc="View & download your generated content"
            href="/dashboard/results"
          />
        </div>
      </div>
    </div>
  );
}

/* ---------------- Components ---------------- */

function DashboardCard({
  title,
  value,
}: {
  title: string;
  value: string;
}) {
  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
      <p className="text-gray-400 text-sm">{title}</p>
      <h3 className="text-2xl font-bold mt-2">{value}</h3>
    </div>
  );
}

function ActionCard({
  title,
  desc,
  href,
}: {
  title: string;
  desc: string;
  href: string;
}) {
  return (
    <a
      href={href}
      className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 hover:border-red-600 transition"
    >
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-gray-400 text-sm">{desc}</p>
      <span className="inline-block mt-4 text-red-500 text-sm">
        Open →
      </span>
    </a>
  );
}
