import DashboardLayoutWrapper from "@/components/dashboard/DashboardLayoutWrapper";
import { createClient } from "@/lib/supabaseServer";
import { CreditsProvider } from "@/providers/CreditsProvider";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let isInfluencer = false;

  if (user) {
    const { data } = await supabase
      .from("influencers")
      .select("status")
      .eq("id", user.id)
      .single();

    isInfluencer = data?.status?.toLowerCase() === "approved";
  }

  return (
    <CreditsProvider>
      <DashboardLayoutWrapper isInfluencer={isInfluencer}>
        {children}
      </DashboardLayoutWrapper>
    </CreditsProvider>
  );
}
