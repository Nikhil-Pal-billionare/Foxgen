"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import FoxgenLogo from "@/components/branding/FoxgenLogo";
import { createClient } from "@/lib/supabaseClient";

export default function Home() {
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setIsLoggedIn(!!data.user);
      setLoading(false);
    });
  }, [supabase]);

  const handleStartCreating = () => {
    if (isLoggedIn) {
      router.push("/sign-in");
    } else {
      router.push("/sign-in");
    }
  };

  if (loading) return null;

  return (
    <main className="min-h-screen bg-[#0D0D0D] text-white">

      {/* Hero Section */}
      <section className="text-center py-24 px-6 space-y-8 max-w-4xl mx-auto">

        <div className="mb-4">
          <FoxgenLogo size={140} />
        </div>

        <h1 className="text-5xl font-extrabold leading-tight">
          Stop Creating Content Manually.<br />Let AI Do It for You.
          Stop Creating Content Manually.<br />
          Let AI Do It for You.
        </h1>

        <p className="text-gray-300 text-lg leading-relaxed max-w-2xl mx-auto">
          Foxgen automates 100% of your content creation — from idea to image, video,
          voice, and final output. Just enter an idea. Foxgen handles the rest.
        </p>

        <button
          onClick={handleStartCreating}
          className="inline-block mt-6 px-10 py-3 bg-[#C1272D] hover:bg-[#A02025]
                    rounded-xl text-lg font-semibold transition"
        >
          Start Creating
        </button>
    </section>

    {/* Sample Images Section */ }
    <section className="max-w-6xl mx-auto px-6 py-16">
      <h2 className="text-3xl font-bold mb-6 text-center">AI Image Samples</h2>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <img src="/demo/car.png" className="rounded-xl" alt="Sample 1" />
        <img src="/demo/cat.png" className="rounded-xl" alt="Sample 2" />
        <img src="/demo/dance.png" className="rounded-xl" alt="Sample 3" />
        <img src="/demo/run.png" className="rounded-xl" alt="Sample 4" />
        <img src="/demo/dog.png" className="rounded-xl" alt="Sample 5" />
        <img src="/demo/man.png" className="rounded-xl" alt="Sample 6" />
      </div>

      <div className="text-center mt-8">
        <button
          onClick={handleStartCreating}
          className="px-8 py-3 bg-[#C1272D] rounded-lg hover:bg-[#A02025] text-lg font-medium"
        >
          Generate Your Own
        </button>
      </div>
    </section>
  </main>
  );
}