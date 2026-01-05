import axios from "axios";

const ASSEMBLY_API = "https://api.assemblyai.com/v2";

export async function transcribeAudio(audioUrl: string) {
  const { data } = await axios.post(
    `${ASSEMBLY_API}/transcript`,
    {
      audio_url: audioUrl,
      punctuate: true,
      disfluencies: true,
      auto_chapters: false,
      speaker_labels: false,
    },
    {
      headers: {
        Authorization: process.env.ASSEMBLY_API_KEY!,
        "Content-Type": "application/json",
      },
    }
  );

  return data.id;
}

export async function pollTranscript(id: string) {
  while (true) {
    const { data } = await axios.get(
      `${ASSEMBLY_API}/transcript/${id}`,
      {
        headers: { Authorization: process.env.ASSEMBLY_API_KEY! },
      }
    );

    if (data.status === "completed") return data;
    if (data.status === "error") throw new Error(data.error);

    await new Promise((r) => setTimeout(r, 3000));
  }
}
