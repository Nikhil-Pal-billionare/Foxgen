import { createClient } from "@/lib/supabaseServer";

function isAdmin(email?: string | null) {
  const raw = process.env.ADMIN_EMAILS || "";
  const admins = raw.split(",").map((s) => s.trim().toLowerCase()).filter(Boolean);
  return !!email && admins.includes(email.toLowerCase());
}

export default async function AdminWaitlistPage({ searchParams }: { searchParams?: { status?: string } }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!isAdmin(user?.email)) {
    return (
      <main className="min-h-screen bg-[#0D0D0D] text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Admin Only</h1>
          <p className="text-gray-400">You do not have access to this page.</p>
        </div>
      </main>
    );
  }

  const status = searchParams?.status ?? "all";
  let query = supabase.from("waitlist").select("email, status, joined_at, whatsapp, role").order("joined_at", { ascending: false });
  if (status !== "all") {
    query = query.eq("status", status);
  }
  const { data, error } = await query;

  return (
    <main className="min-h-screen bg-[#0D0D0D] text-white p-8">
      <h1 className="text-3xl font-bold mb-6">Waitlist Admin</h1>

      <div className="mb-4 text-sm text-gray-300">
        <a href="/admin/waitlist?status=all" className={`mr-3 ${status==='all'?'underline':''}`}>All</a>
        <a href="/admin/waitlist?status=waitlisted" className={`mr-3 ${status==='waitlisted'?'underline':''}`}>Waitlisted</a>
        <a href="/admin/waitlist?status=invited" className={`mr-3 ${status==='invited'?'underline':''}`}>Invited</a>
        <a href="/admin/waitlist?status=paid" className={`${status==='paid'?'underline':''}`}>Paid</a>
      </div>

      {error && (
        <p className="text-red-400">{error.message}</p>
      )}

      <div className="overflow-auto border border-gray-800 rounded-lg">
        <table className="w-full text-sm">
          <thead className="bg-[#121212]">
            <tr>
              <th className="p-3 text-left">Email</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left">Joined</th>
              <th className="p-3 text-left">WhatsApp</th>
              <th className="p-3 text-left">Role</th>
            </tr>
          </thead>
          <tbody>
            {(data ?? []).map((row, i) => (
              <tr key={i} className="border-t border-gray-800">
                <td className="p-3">{row.email}</td>
                <td className="p-3">{row.status}</td>
                <td className="p-3">{new Date(row.joined_at).toLocaleString()}</td>
                <td className="p-3">{row.whatsapp ?? '-'}</td>
                <td className="p-3">{row.role ?? '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
