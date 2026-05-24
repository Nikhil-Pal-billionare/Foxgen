"use client";

import { useRouter } from "next/navigation";

const products = [
  {
    title: "Generate Script",
    desc: "Generate creative AI scripts",
    cost: "Cost: 10",
    path: "/dashboard/script-generator",
  },
  {
    title: "Text to speech",
    desc: "Convert text into realistic voice",
    cost: "Cost: 16 / minute",
    path: "/dashboard/voiceover",
  },
  {
    title: "Generate image from prompt",
    desc: "Create high-quality AI images",
    cost: "Cost: 20",
    path: "/dashboard/image-generator",
  },
  {
    title: "Image to Video",
    desc: "Turn images into AI videos",
    cost: "Cost: 52",
    path: "/dashboard/image-to-video",
  },
  {
    title: "Generate thumbnails",
    desc: "Generate YouTube thumbnails",
    cost: "Cost: 40",
    path: "/dashboard/thumbnail-generator",
  },
  {
    title: "Create AI Ads ",
    desc: "Generate AI-powered video ads",
    cost: "Cost: 52",
    path: "/dashboard/ads-generator",
  },
];

export default function ProductsSection() {
  const router = useRouter();

  return (
    <section className="space-y-6">
      <h2 className="text-2xl font-semibold">Create using AI</h2>

      <div className="grid md:grid-cols-2 gap-6">
        {products.map((p) => (
          <div
            key={p.title}
            onClick={() => router.push(p.path)}
            className="
              cursor-pointer
              rounded-3xl
              bg-white/5
              border border-white/10
              p-6
              backdrop-blur-xl
              hover:bg-white/10
              transition
              flex
              justify-between
              items-end
            "
          >
            <div>
              <h3 className="text-lg font-semibold mb-1">{p.title}</h3>
              <p className="text-sm text-gray-400 mb-6">{p.desc}</p>
              <span className="text-sm text-gray-400">{p.cost}</span>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                router.push(p.path);
              }}
              className="
                px-6 py-2
                rounded-lg
                bg-blue-600
                hover:bg-blue-500
                transition
                text-sm
                font-medium
              "
            >
              Generate
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
