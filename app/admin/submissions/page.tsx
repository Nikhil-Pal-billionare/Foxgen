import { createClient } from "@/lib/supabaseServer";
import { revalidatePath } from "next/cache";

export default async function AdminSubmissionsPage() {
  const supabase = createClient();

  // 🔐 Ensure user logged in (admin check optional)
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return <div className="p-6">Unauthorized</div>;
  }

  // 🔎 Fetch submissions
  const { data: submissions, error } = await supabase
    .from("talent_submissions")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return <div className="p-6 text-red-500">{error.message}</div>;
  }

  // 🔐 Generate signed URLs for PRIVATE bucket
  const submissionsWithUrls = await Promise.all(
    submissions.map(async (item) => {
      const { data } = await supabase.storage
        .from("user-submissions")
        .createSignedUrl(item.image_path, 60 * 60); // 1 hour

      return {
        ...item,
        signedUrl: data?.signedUrl ?? null,
      };
    })
  );

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">🎨 Talent Submissions</h1>

      {submissionsWithUrls.length === 0 && (
        <p className="text-gray-400">No submissions yet.</p>
      )}

      <div className="grid md:grid-cols-3 gap-6">
        {submissionsWithUrls.map((item) => (
          <SubmissionCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}

/* =========================
   SUBMISSION CARD
========================= */
function SubmissionCard({ item }: { item: any }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-4 flex flex-col gap-3">
      <div className="relative w-full aspect-square rounded-lg overflow-hidden bg-black/20">
        {item.signedUrl ? (
          <img
            src={item.signedUrl}
            alt="User Submission"
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-xs text-gray-400">
            Image unavailable
          </div>
        )}
      </div>

      {item.caption && (
        <p className="text-sm text-gray-300">{item.caption}</p>
      )}

      <div className="text-xs text-gray-500">
        Submitted: {new Date(item.created_at).toLocaleString()}
      </div>

      <div className="flex gap-2 mt-2">
        <form action={markWinner}>
          <input type="hidden" name="id" value={item.id} />
          <button className="flex-1 bg-green-600 hover:bg-green-700 text-sm py-2 rounded-md">
            🏆 Winner
          </button>
        </form>

        <form action={deleteSubmission}>
          <input type="hidden" name="id" value={item.id} />
          <input type="hidden" name="path" value={item.image_path} />
          <button className="flex-1 bg-red-600 hover:bg-red-700 text-sm py-2 rounded-md">
            🗑 Delete
          </button>
        </form>
      </div>
    </div>
  );
}

/* =========================
   SERVER ACTIONS
========================= */
async function markWinner(formData: FormData) {
  "use server";

  const supabase = createClient();
  const id = formData.get("id") as string;

  await supabase
    .from("talent_submissions")
    .update({ is_winner: true })
    .eq("id", id);

  revalidatePath("/admin/submissions");
}

async function deleteSubmission(formData: FormData) {
  "use server";

  const supabase = createClient();
  const id = formData.get("id") as string;
  const path = formData.get("path") as string;

  await supabase.storage.from("user-submissions").remove([path]);

  await supabase.from("talent_submissions").delete().eq("id", id);

  revalidatePath("/admin/submissions");
}
