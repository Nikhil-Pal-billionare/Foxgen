import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const taskId = searchParams.get("taskId");

  if (!taskId) {
    return NextResponse.json({ error: "Task ID required" }, { status: 400 });
  }

  try {
    const response = await fetch(
      `https://api.kie.ai/api/v1/jobs/getTask?id=${taskId}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.KIE_API_KEY}`,
        },
      }
    );

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch status" }, { status: 500 });
  }
}
