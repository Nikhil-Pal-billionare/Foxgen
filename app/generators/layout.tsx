import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabaseServer";

export default async function GeneratorsLayout({ children }: any) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // User NOT logged in? Redirect to sign-in
  if (!user) redirect("/sign-in");

  return (
    <div className="min-h-screen bg-[#0D0D0D] text-white">
      {children}
    </div>
  );
}
