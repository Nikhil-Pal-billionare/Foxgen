"use client";

import { useEffect, useRef, useState } from "react";

const FONTS = [
  "Arial",
  "Helvetica",
  "Impact",
  "Georgia",
  "Times New Roman",
  "Courier New",
  "Verdana",
];

export default function ThumbnailPage() {
  const canvasRef = useRef<any>(null);
  const htmlCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const fabricRef = useRef<any>(null);

  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [fontFamily, setFontFamily] = useState("Impact");

  /* ================= INIT FABRIC ================= */
  useEffect(() => {
    let mounted = true;

    const initFabric = async () => {
      if (!htmlCanvasRef.current) return;

      const fabric = await import("fabric");
      if (!mounted) return;

      fabricRef.current = fabric;

      canvasRef.current = new fabric.Canvas(htmlCanvasRef.current, {
        width: 1080,
        height: 720,
        backgroundColor: "#000",
        preserveObjectStacking: true,
        selection: true,
      });
    };

    initFabric();

    return () => {
      mounted = false;
      canvasRef.current?.dispose();
    };
  }, []);

  /* ================= GENERATE BACKGROUND ================= */
  const generateThumbnail = async () => {
    if (!prompt || !canvasRef.current) return;

    setLoading(true);

    const res = await fetch("/api/ai/image", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt }),
    });

    const data = await res.json();
    setLoading(false);

    const imgEl = new Image();
    imgEl.src = `data:${data.mimeType};base64,${data.imageBase64}`;

    imgEl.onload = () => {
      const fabric = fabricRef.current;

      const bg = new fabric.Image(imgEl, {
        left: 0,
        top: 0,
        selectable: false,
        evented: false,
      });

      bg.scaleToWidth(1080);
      bg.scaleToHeight(720);

      canvasRef.current.clear();
      canvasRef.current.add(bg);
      canvasRef.current.sendToBack(bg);
      canvasRef.current.renderAll();
    };
  };

  /* ================= ADD TEXT ================= */
  const addText = () => {
    const fabric = fabricRef.current;

    const text = new fabric.Textbox("Your Text", {
      left: 100,
      top: 100,
      width: 600,
      fill: "#ffffff",
      fontSize: 72,
      fontWeight: "bold",
      fontFamily,
      stroke: "#000",
      strokeWidth: 4,
    });

    canvasRef.current.add(text);
    canvasRef.current.setActiveObject(text);
  };

  /* ================= SHAPES ================= */
  const addRect = () => {
    const fabric = fabricRef.current;
    canvasRef.current.add(
      new fabric.Rect({
        left: 100,
        top: 100,
        width: 300,
        height: 150,
        fill: "rgba(255,0,0,0.6)",
      })
    );
  };

  const addCircle = () => {
    const fabric = fabricRef.current;
    canvasRef.current.add(
      new fabric.Circle({
        left: 150,
        top: 150,
        radius: 80,
        fill: "rgba(0,150,255,0.6)",
      })
    );
  };

  const addTriangle = () => {
    const fabric = fabricRef.current;
    canvasRef.current.add(
      new fabric.Triangle({
        left: 200,
        top: 200,
        width: 150,
        height: 150,
        fill: "rgba(0,255,150,0.6)",
      })
    );
  };

  /* ================= UPLOAD IMAGE ================= */
  const uploadImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async () => {
      const fabric = fabricRef.current;

      fabric.Image.fromURL(reader.result as string).then((img: any) => {
        img.set({
          left: 200,
          top: 200,
          scaleX: 0.4,
          scaleY: 0.4,
        });
        canvasRef.current.add(img);
      });
    };
    reader.readAsDataURL(file);
  };

  /* ================= DELETE ================= */
  const deleteSelected = () => {
    const canvas = canvasRef.current;
    const active = canvas.getActiveObjects();

    if (!active.length) return;

    active.forEach((obj: any) => canvas.remove(obj));
    canvas.discardActiveObject();
    canvas.renderAll();
  };

  /* ================= DOWNLOAD ================= */
  const download = () => {
    const link = document.createElement("a");
    link.href = canvasRef.current.toDataURL({
      format: "png",
      quality: 1,
    });
    link.download = "thumbnail.png";
    link.click();
  };

  return (
    <main className="min-h-screen bg-[#0D0D0D] text-white px-6 py-10">
      <div className="max-w-4xl mx-auto space-y-8">

        {/* Header */}
        <div>
          <h1 className="text-3xl font-extrabold mb-2">
            Thumbnail Generator
          </h1>
          <p className="text-gray-400">
            Generate high-CTR YouTube thumbnails using AI
          </p>
        </div>

        {/* Prompt Box */}
        <div className="bg-[#121212] border border-gray-800 rounded-xl p-6 space-y-4">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="YouTube thumbnail for AWS tutorial"
            className="
              w-full min-h-[140px]
              bg-black text-white
              border border-neutral-700
              rounded p-4 resize-none
            "
          />

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={enhancePrompt}
              disabled={enhancing}
              className="
                px-4 py-2
                border border-neutral-600
                bg-gray-800 hover:bg-gray-700
                rounded font-semibold
                disabled:opacity-60
              "
            >
              {enhancing
                ? "Enhancing..."
                : "Enhance / Re-enhance Prompt ✨"}
            </button>

            <button
              onClick={generateThumbnail}
              disabled={loading}
              className="
                ml-auto px-6 py-2
                bg-blue-600 hover:bg-blue-700
                rounded font-semibold
                disabled:opacity-60
              "
            >
              {loading ? "Generating..." : "Generate Thumbnail"}
            </button>
          </div>

          {error && (
            <p className="text-blue-500 text-sm">{error}</p>
          )}
        </div>

        {/* Thumbnail Result */}
        {imageUrl && (
          <div className="bg-[#121212] border border-gray-800 rounded-xl p-6 flex justify-center">
            <img
              src={imageUrl}
              alt="Generated Thumbnail"
              className="
                w-full max-w-[720px]
                aspect-video
                object-cover
                rounded-xl
                border border-neutral-800
                bg-black
              "
            />
          </div>
        )}
      </div>

      <canvas ref={htmlCanvasRef} className="border border-gray-700 rounded" />

      <p className="text-xs text-gray-400 mt-3">
        Tip: Hold <b>Shift</b> to select multiple objects
      </p>
    </div>
  );
}
