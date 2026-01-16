import { createClient } from "@/lib/supabaseServer";

export default async function AdminUsers() {
  const supabase = createClient();

  const { data: users } = await supabase
    .from("profiles")
    .select("id, email, role, created_at")
    .order("created_at", { ascending: false });

  return (
    <>
      <h1 className="text-3xl font-bold mb-6">Users</h1>

      <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-neutral-800 text-gray-400">
            <tr>
              <th className="p-3 text-left">Email</th>
              <th className="p-3">Role</th>
              <th className="p-3">Joined</th>
            </tr>
          </thead>
          <tbody>
            {users?.map((u) => (
              <tr key={u.id} className="border-t border-neutral-800">
                <td className="p-3">{u.email}</td>
                <td className="p-3 text-center">{u.role}</td>
                <td className="p-3 text-center">
                  {new Date(u.created_at).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
