import Link from "next/link";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-black text-white">
      
      {/* Sidebar */}
      <aside className="w-64 border-r border-neutral-800 bg-neutral-950 p-6">
        <h1 className="text-2xl font-bold text-red-600 mb-10">
          Foxgen
        </h1>

        <nav className="space-y-4 text-sm">
          <Link href="/dashboard" className="block text-gray-300 hover:text-white">
            Dashboard
          </Link>
          <Link href="/dashboard/thumbnail" className="block text-gray-300 hover:text-white">
            Thumbnail Generator
          </Link>
          <Link href="/dashboard/video" className="block text-gray-300 hover:text-white">
            AI Video Creator
          </Link>
          <Link href="/dashboard/results" className="block text-gray-300 hover:text-white">
            Results
          </Link>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 bg-black p-10 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
