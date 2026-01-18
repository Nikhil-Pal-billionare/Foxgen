"use client";

import { useState } from "react";

export default function ShowYourTalentPage() {
  const [file, setFile] = useState<File | null>(null);
  const [caption, setCaption] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return alert("Please upload an image");

    setLoading(true);

    const formData = new FormData();
    formData.append("image", file);
    formData.append("caption", caption);

    const res = await fetch("/api/show-your-talent", {
      method: "POST",
      credentials: "include",
      body: formData,
    });

    setLoading(false);

    if (res.ok) {
      setSuccess(true);
      setFile(null);
      setCaption("");
    } else {
      alert("Upload failed");
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-2">🎨 Show Your Talent</h1>
      <p className="text-gray-400 mb-6">
        Upload your best image created using FoxGen Image Generator.
        Winners get rewarded!
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="block w-full text-sm"
        />

        <textarea
          placeholder="Tell us about your image (optional)"
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          className="w-full p-3 rounded-md bg-white/5 border border-white/10"
        />

        <button
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-md font-semibold"
        >
          {loading ? "Submitting..." : "Submit Entry"}
        </button>

        {success && (
          <p className="text-green-400">
            ✅ Your entry has been submitted successfully!
          </p>
        )}
      </form>
    </div>
  );
}
