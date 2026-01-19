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
      router.push("/dashboard");
    } else {
      router.push("/sign-in");
    }
  };

  if (loading) return null;

  return (
    <main className="min-h-screen bg-[#0D0D0D] text-white">

      {/* Hero Section */}
      <section className="text-center py-12 md:py-24 px-6 space-y-8 max-w-4xl mx-auto">

        <div className="mb-4">
          <FoxgenLogo size={140} />
        </div>

        <h2 className="text-sm uppercase tracking-widest text-gray-400">
          Infinite Imagination
        </h2>

        <h1 className="text-3xl md:text-5xl font-extrabold leading-tight">
          Socho Kam. Banao Zyada. <br />
          <span className="text-[#3B82F6]">Think Less. Create More.</span>
        </h1>

        <p className="text-gray-300 text-lg leading-relaxed max-w-2xl mx-auto">
          Infinite Imagination automates your entire content creation process —
          from idea to image, video, voice, and final output.
          Just enter an idea. We handle the rest.
        </p>

        <button
          onClick={handleStartCreating}
          className="inline-block mt-6 px-6 md:px-10 py-3 bg-[#3B82F6] hover:bg-[#2563EB]
                    rounded-xl text-lg font-semibold transition"
        >
          Start Creating
        </button>
      </section>

      {/* Product Hunt Badge */}
      <div className="flex justify-center">
        <a
          href="https://www.producthunt.com/products/foxgenai/reviews/new?utm_source=badge-product_review&utm_medium=badge&utm_source=badge-foxgenai"
          target="_blank"
          rel="noopener noreferrer"
        >
          <img
            src="https://api.producthunt.com/widgets/embed-image/v1/product_review.svg?product_id=1149926&theme=light"
            alt="FoxgenAI on Product Hunt"
            width="250"
            height="54"
          />
        </a>
      </div>

      {/* Sample Images Section */}
      <section className="max-w-6xl mx-auto px-6 py-12 md:py-16">
        <h2 className="text-2xl md:text-3xl font-bold mb-6 text-center">
          AI Image Samples
        </h2>

        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
          <img src="/demo/car.png" className="rounded-xl" alt="Car AI" />
          <img src="/demo/cat.png" className="rounded-xl" alt="Cat AI" />
          <img src="/demo/dance.png" className="rounded-xl" alt="Dance AI" />
          <img src="/demo/run.png" className="rounded-xl" alt="Run AI" />
          <img src="/demo/dog.png" className="rounded-xl" alt="Dog AI" />
          <img src="/demo/man.png" className="rounded-xl" alt="Man AI" />
        </div>

        <div className="text-center mt-8">
          <button
            onClick={handleStartCreating}
            className="px-6 md:px-8 py-3 bg-[#3B82F6] rounded-lg hover:bg-[#2563EB] text-lg font-medium"
          >
            Generate Your Own
          </button>
        </div>
      </section>
    </main>
  );
}
