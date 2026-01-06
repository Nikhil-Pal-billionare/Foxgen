import DashboardLayoutWrapper from "@/components/dashboard/DashboardLayoutWrapper";
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
    <DashboardLayoutWrapper isInfluencer={isInfluencer}>
      {children}
    </DashboardLayoutWrapper>
  );
}
