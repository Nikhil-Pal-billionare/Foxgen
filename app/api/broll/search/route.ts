import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { query } = await req.json();

  if (!query) {
    return NextResponse.json({ error: "Query required" }, { status: 400 });
  }

  const res = await fetch(
    `https://api.pexels.com/videos/search?query=${encodeURIComponent(
      query
    )}&per_page=12`,
    {
      headers: {
        Authorization: process.env.PEXELS_API_KEY!,
      },
    }
  );

  const data = await res.json();

  return NextResponse.json({
    found: data.videos?.length > 0,
    videos: data.videos || [],
  });
}
