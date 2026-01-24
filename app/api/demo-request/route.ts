import { NextResponse } from "next/server";
import { google } from "googleapis";

export async function POST(req: Request) {
  try {
    const data = await req.json();


  const auth = new google.auth.JWT({
  email: process.env.GOOGLE_CLIENT_EMAIL,
  key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});


    const sheets = google.sheets({ version: "v4", auth });

    await sheets.spreadsheets.values.append({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: "Sheet1!A:F",
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [[
          data.name,
          data.phone,
          data.email,
          data.useCase,
          data.reason,
          new Date().toLocaleString("en-IN"),
        ]],
      },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DEMO REQUEST ERROR:", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
