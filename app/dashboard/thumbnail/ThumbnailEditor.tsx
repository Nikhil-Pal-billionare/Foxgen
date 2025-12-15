"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  imageUrl: string;
  text?: string;
  onTextChange?: (text: string) => void;
};

export default function ThumbnailEditor({
  imageUrl,
  text: externalText,
  onTextChange,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [text, setText] = useState(externalText || "AI IS COMING");
  const [textX, setTextX] = useState(100);
  const [textY, setTextY] = useState(120);
  const [dragging, setDragging] = useState(false);
  const [fontSize, setFontSize] = useState(64);
  const [textColor, setTextColor] = useState("#ffffff");
  const [fontWeight, setFontWeight] = useState<"bold" | "normal">("bold");
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [zoom, setZoom] = useState(1);

  useEffect(() => {
    if (externalText) setText(externalText);
  }, [externalText]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = new Image();
    img.src = imageUrl;

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      ctx.filter = `brightness(${brightness}%) contrast(${contrast}%)`;

      const scaledWidth = canvas.width * zoom;
      const scaledHeight = canvas.height * zoom;
      const offsetX = (scaledWidth - canvas.width) / 2;
      const offsetY = (scaledHeight - canvas.height) / 2;

      ctx.drawImage(img, -offsetX, -offsetY, scaledWidth, scaledHeight);

      ctx.filter = "none";

      ctx.font = `${fontWeight} ${fontSize}px Arial`;
      ctx.fillStyle = textColor;
      ctx.strokeStyle = "black";
      ctx.lineWidth = 4;

      ctx.strokeText(text, textX, textY);
      ctx.fillText(text, textX, textY);
    };
  }, [
    imageUrl,
    text,
    textX,
    textY,
    fontSize,
    textColor,
    fontWeight,
    brightness,
    contrast,
    zoom,
  ]);

  const handleMouseDown = () => setDragging(true);
  const handleMouseUp = () => setDragging(false);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!dragging || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    setTextX(e.clientX - rect.left);
    setTextY(e.clientY - rect.top);
  };

  const downloadImage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = "thumbnail.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  return (
    <div className="space-y-4">
      <input
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          onTextChange?.(e.target.value);
        }}
        className="w-full p-2 rounded bg-black border border-neutral-700 text-white"
        placeholder="Thumbnail text"
      />
      <div className="flex flex-wrap gap-4 items-center">
        <div>
          <label className="text-xs text-gray-400">Text Size</label>
          <input
            type="range"
            min={20}
            max={120}
            value={fontSize}
            onChange={(e) => setFontSize(Number(e.target.value))}
          />
        </div>
        <div>
          <label className="text-xs text-gray-400">Text Color</label>
          <input
            type="color"
            value={textColor}
            onChange={(e) => setTextColor(e.target.value)}
          />
        </div>
        <button
          onClick={() =>
            setFontWeight(fontWeight === "bold" ? "normal" : "bold")
          }
          className="px-3 py-1 rounded border border-neutral-700 hover:border-red-600"
        >
          {fontWeight === "bold" ? "Bold" : "Normal"}
        </button>
      </div>
      <div className="flex flex-wrap gap-4 items-center">
        <div>
          <label className="text-xs text-gray-400">Brightness</label>
          <input
            type="range"
            min={50}
            max={150}
            value={brightness}
            onChange={(e) => setBrightness(Number(e.target.value))}
          />
        </div>
        <div>
          <label className="text-xs text-gray-400">Contrast</label>
          <input
            type="range"
            min={50}
            max={150}
            value={contrast}
            onChange={(e) => setContrast(Number(e.target.value))}
          />
        </div>
        <div>
          <label className="text-xs text-gray-400">Zoom</label>
          <input
            type="range"
            min={1}
            max={1.5}
            step={0.01}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
          />
        </div>
      </div>
      <canvas
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
        className="border border-neutral-700 rounded cursor-move max-w-full"
      />
      <button
        onClick={downloadImage}
        className="px-4 py-2 bg-red-600 rounded hover:bg-red-700 transition"
      >
        Download Thumbnail
      </button>
    </div>
  );
}
