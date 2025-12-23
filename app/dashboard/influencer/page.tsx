import { createClient } from "@/lib/supabaseServer";
import { redirect } from "next/navigation";
import CopyButton from "@/components/influencer/CopyButton";


export default async function InfluencerPage() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/sign-in");

  const { data: influencer } = await supabase
    .from("influencers")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!influencer || influencer.status?.toLowerCase() !== "approved") {
    redirect("/dashboard");
  }

  const { data: usages } = await supabase
    .from("code_usages")
    .select("*")
    .eq("influencer_id", user.id)
    .order("created_at", { ascending: false });

  const totalReferrals = usages?.length ?? 0;
  const totalEarnings =
    usages?.reduce((sum, u) => sum + (u.discount_amount || 0), 0) ?? 0;

  const referralLink = `${process.env.NEXT_PUBLIC_SITE_URL}/sign-up?ref=${influencer.code}`;

  return (
    <div className="max-w-5xl space-y-8">
      <h1 className="text-2xl font-semibold">Influencer Dashboard</h1>

      {/* Referral Code */}
      <Card>
        <p className="text-sm text-gray-400">Your Referral Code</p>
        <div className="flex items-center justify-between">
          <p className="text-xl font-bold">{influencer.code}</p>
          <CopyButton value={influencer.code} />
        </div>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Stat title="Commission" value={`${influencer.commission_percent}%`} />
        <Stat title="Total Referrals" value={totalReferrals.toString()} />
        <Stat title="Total Earnings" value={`${totalEarnings} credits`} />
      </div>

      {/* Referral Link */}
      <Card>
        <p className="text-sm text-gray-400 mb-2">Your Referral Link</p>
        <div className="flex items-center justify-between">
          <p className="truncate text-sm">{referralLink}</p>
          <CopyButton value={referralLink} />
        </div>
      </Card>

      {/* Referral History */}
      <div>
        <h2 className="text-lg font-semibold mb-3">Referral History</h2>

        {usages?.length ? (
          <div className="space-y-2">
            {usages.map((u) => (
              <div
                key={u.id}
                className="bg-white/5 rounded-lg p-4 flex justify-between"
              >
                <span>User ID: {u.user_id}</span>
                <span>{u.discount_amount} credits</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-400">No referrals yet.</p>
        )}
      </div>
    </div>
  );
}

/* ---------- Components ---------- */

function Card({ children }: { children: React.ReactNode }) {
  return <div className="bg-white/5 rounded-xl p-6">{children}</div>;
}

function Stat({ title, value }: { title: string; value: string }) {
  return (
    <div className="bg-white/5 p-4 rounded-xl">
      <p className="text-sm text-gray-400">{title}</p>
      <p className="font-semibold text-lg">{value}</p>
    </div>
  );
}
