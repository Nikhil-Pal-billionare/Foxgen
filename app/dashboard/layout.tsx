import Sidebar from "@/components/dashboard/Sidebar";
import { createClient } from "@/lib/supabaseServer";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 🔍 DEBUG LOGS (TEMPORARY)
  console.log("USER ID:", user?.id);

  let isInfluencer = false;

  if (user) {
    const { data, error } = await supabase
      .from("influencers")
      .select("id, status")
      .eq("id", user.id)
      .single();

    console.log("INFLUENCER ROW:", data);
    console.log("INFLUENCER ERROR:", error);

    isInfluencer = data?.status?.toLowerCase() === "approved";

  }

  return (
    <div className="flex min-h-screen bg-[#0D0D0D] text-white">
      <Sidebar isInfluencer={isInfluencer} />
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}
