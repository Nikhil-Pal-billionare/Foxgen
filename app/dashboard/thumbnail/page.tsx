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
    <div className="p-6 bg-black min-h-screen text-white">
      <h1 className="text-2xl font-bold mb-4">Thumbnail Generator</h1>

      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="AWS tutorial thumbnail"
        className="w-full p-3 mb-4 bg-neutral-900 rounded"
      />

      <button
        onClick={generateThumbnail}
        className="px-6 py-2 bg-red-600 rounded mb-4"
      >
        {loading ? "Generating..." : "Generate Background"}
      </button>

      <div className="flex flex-wrap gap-3 mb-4 items-center">
        <button onClick={addText} className="bg-gray-700 px-3 py-1 rounded">
          Add Text
        </button>

        <select
          value={fontFamily}
          onChange={(e) => setFontFamily(e.target.value)}
          className="bg-gray-800 px-2 py-1 rounded"
        >
          {FONTS.map((f) => (
            <option key={f} value={f}>
              {f}
            </option>
          ))}
        </select>

        <button onClick={addRect} className="bg-gray-700 px-3 py-1 rounded">
          Rectangle
        </button>

        <button onClick={addCircle} className="bg-gray-700 px-3 py-1 rounded">
          Circle
        </button>

        <button onClick={addTriangle} className="bg-gray-700 px-3 py-1 rounded">
          Triangle
        </button>

        <label className="bg-gray-700 px-3 py-1 rounded cursor-pointer">
          Upload Image
          <input type="file" hidden onChange={uploadImage} />
        </label>

        <button onClick={deleteSelected} className="bg-red-700 px-3 py-1 rounded">
          Delete
        </button>

        <button onClick={download} className="bg-green-600 px-3 py-1 rounded">
          Download
        </button>
      </div>

      <canvas ref={htmlCanvasRef} className="border border-gray-700 rounded" />

      <p className="text-xs text-gray-400 mt-3">
        Tip: Hold <b>Shift</b> to select multiple objects
      </p>
    </div>
  );
}
