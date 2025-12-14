import FoxgenLogo from "@/components/branding/FoxgenLogo";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#0D0D0D] text-white">

      {/* Hero Section */}
      <section className="text-center py-24 px-6 space-y-8 max-w-4xl mx-auto">

        <div className="mb-4">
          <FoxgenLogo size={140} />
        </div>

        <h1 className="text-5xl font-extrabold leading-tight">
          Stop Creating Content Manually.<br />Let AI Do It for You.
        </h1>

        <p className="text-gray-300 text-lg leading-relaxed max-w-2xl mx-auto">
          Foxgen automates 100% of your content creation — from idea to image, video,
          voice, and final output. Just enter an idea. Foxgen handles the rest.
        </p>

        <a
          href="/generators/image"
          className="inline-block mt-6 px-10 py-3 bg-[#C1272D] hover:bg-[#A02025]
                     rounded-xl text-lg font-semibold transition"
        >
          Start Creating
        </a>
      </section>

      {/* Sample Images Section */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold mb-6">AI Image Samples</h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <img src="/samples/img1.jpg" className="rounded-xl" />
          <img src="/samples/img2.jpg" className="rounded-xl" />
          <img src="/samples/img3.jpg" className="rounded-xl" />
          <img src="/samples/img4.jpg" className="rounded-xl" />
        </div>

        <div className="text-center mt-8">
          <a
            href="/generators/image"
            className="px-8 py-3 bg-[#C1272D] rounded-lg hover:bg-[#A02025] text-lg font-medium"
          >
            Generate Your Own
          </a>
        </div>
      </section>

      {/* Sample Videos Section */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold mb-6">AI Video Samples</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <video src="/samples/video1.mp4" controls className="rounded-xl" />
          <video src="/samples/video2.mp4" controls className="rounded-xl" />
        </div>
      </section>

    </main>
  );
}
