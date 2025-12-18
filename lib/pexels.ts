export type PexelsVideo = {
  id: number;
  image: string;
  video_files: {
    id: number;
    quality: string;
    link: string;
  }[];
};

export async function fetchPexelsVideos(query: string): Promise<PexelsVideo[]> {
  const res = await fetch(
    `https://api.pexels.com/videos/search?query=${encodeURIComponent(
      query
    )}&per_page=6`,
    {
      headers: {
        Authorization: process.env.NEXT_PUBLIC_PEXELS_API_KEY!,
      },
    }
  );

  if (!res.ok) {
    throw new Error("Failed to fetch Pexels videos");
  }

  const data = await res.json();
  return data.videos || [];
}
