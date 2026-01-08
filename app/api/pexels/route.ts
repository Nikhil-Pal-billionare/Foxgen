import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { query, perPage = 5 } = await req.json();

    if (!query) {
      return NextResponse.json(
        { error: "Query required" },
        { status: 400 }
      );
    }

    const res = await fetch(
      `https://api.pexels.com/videos/search?query=${encodeURIComponent(
        query
      )}&per_page=${perPage}`,
      {
        headers: {
          Authorization: process.env.PEXELS_API_KEY!,
        },
      }
    );

    if (!res.ok) {
      const text = await res.text();
      console.error("PEXELS ERROR:", text);
      return NextResponse.json(
        { error: "Pexels API failed" },
        { status: 500 }
      );
    }

    const data = await res.json();
    return NextResponse.json(data.videos || []);
  } catch (err) {
    console.error("PEXELS ROUTE ERROR:", err);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}
