export type PexelsVideo = {
  id: number;
  video_files: {
    id: number;
    quality: string;
    file_type: string;
    link: string;
  }[];
};

const PEXELS_API = "https://api.pexels.com/videos/search";

export async function fetchPexelsVideos(
  query: string,
  perPage = 5
): Promise<PexelsVideo[]> {
  if (!process.env.PEXELS_API_KEY) {
    throw new Error("PEXELS_API_KEY missing");
  }

  const res = await fetch(
    `${PEXELS_API}?query=${encodeURIComponent(query)}&per_page=${perPage}`,
    {
      headers: {
        Authorization: process.env.PEXELS_API_KEY, // ✅ THIS IS REQUIRED
      },
    }
  );

  if (!res.ok) {
    const text = await res.text();
    console.error("PEXELS ERROR:", text);
    throw new Error("Pexels API failed");
  }

  const data = await res.json();
  return data.videos || [];
}
