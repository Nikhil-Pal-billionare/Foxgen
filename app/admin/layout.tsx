import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabaseServer";
import AdminSidebar from "@/components/admin/AdminSidebar";


export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/sign-in");

  const { data } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (data?.role !== "admin") redirect("/dashboard");

  return (
    <div className="flex min-h-screen bg-[#0d0d0d] text-white">
      <AdminSidebar />
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}
