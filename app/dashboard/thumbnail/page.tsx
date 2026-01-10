"use client";

import { useEffect, useRef, useState } from "react";

const FONTS = ["Impact", "Arial", "Helvetica", "Georgia", "Times New Roman"];

type CanvasObject = {
  id: string;
  type: 'text' | 'rect' | 'circle';
  x: number;
  y: number;
  width?: number;
  height?: number;
  radius?: number;
  color: string;
  opacity: number;
  text?: string;
  fontSize?: number;
  fontFamily?: string;
  selected: boolean;
};

export default function ThumbnailPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [canvasReady, setCanvasReady] = useState(false);
  const [objects, setObjects] = useState<CanvasObject[]>([]);
  const [backgroundImage, setBackgroundImage] = useState<string | null>(null);
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);

  const [textColor, setTextColor] = useState("#ffffff");
  const [shapeColor, setShapeColor] = useState("#ff0000");
  const [fontSize, setFontSize] = useState(72);
  const [fontFamily, setFontFamily] = useState("Impact");
  const [selectedObjectId, setSelectedObjectId] = useState<string | null>(null);

  // Canvas dimensions
  const CANVAS_WIDTH = 1080;
  const CANVAS_HEIGHT = 720;

  /* ================= CANVAS INITIALIZATION ================= */
  useEffect(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      canvas.width = CANVAS_WIDTH;
      canvas.height = CANVAS_HEIGHT;
      setCanvasReady(true);
      drawCanvas();
    }
  }, []);

  /* ================= DRAW CANVAS ================= */
  const drawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw background image if exists
    if (backgroundImage) {
      const img = new Image();
      img.onload = () => {
        // Draw image first
        const scale = Math.min(
          canvas.width / img.width,
          canvas.height / img.height
        );
        const x = (canvas.width - img.width * scale) / 2;
        const y = (canvas.height - img.height * scale) / 2;
        
        ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
        
        // Then draw objects on top
        drawObjectsOnCanvas(ctx);
      };
      img.onerror = () => {
        // If image fails to load, draw black background
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        drawObjectsOnCanvas(ctx);
      };
      img.src = backgroundImage;
    } else {
      // Draw black background
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      drawObjectsOnCanvas(ctx);
    }
  };

  /* ================= DRAW OBJECTS ON CANVAS ================= */
  const drawObjectsOnCanvas = (ctx: CanvasRenderingContext2D) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Draw all objects
    objects.forEach(obj => {
      ctx.globalAlpha = obj.opacity;
      
      if (obj.type === 'rect') {
        // Draw rectangle
        ctx.fillStyle = obj.color;
        ctx.fillRect(obj.x, obj.y, obj.width || 0, obj.height || 0);
        
        // Draw selection border if selected
        if (obj.selected) {
          ctx.strokeStyle = '#00ff00';
          ctx.lineWidth = 3;
          ctx.strokeRect(obj.x - 2, obj.y - 2, (obj.width || 0) + 4, (obj.height || 0) + 4);
        }
      } 
      else if (obj.type === 'circle') {
        // Draw circle
        ctx.fillStyle = obj.color;
        ctx.beginPath();
        ctx.arc(obj.x, obj.y, obj.radius || 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw selection border if selected
        if (obj.selected) {
          ctx.strokeStyle = '#00ff00';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.arc(obj.x, obj.y, (obj.radius || 0) + 2, 0, Math.PI * 2);
          ctx.stroke();
        }
      }
      else if (obj.type === 'text') {
        // Draw text
        ctx.fillStyle = obj.color;
        ctx.font = `bold ${obj.fontSize}px ${obj.fontFamily}`;
        ctx.textBaseline = 'top';
        
        // Draw text with shadow for better visibility
        ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
        ctx.shadowBlur = 10;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;
        
        // Handle text wrapping
        const maxWidth = 800;
        const words = obj.text?.split(' ') || [];
        let line = '';
        let lineHeight = (obj.fontSize || 48) * 1.2;
        let y = obj.y;
        
        for (let n = 0; n < words.length; n++) {
          const testLine = line + words[n] + ' ';
          const metrics = ctx.measureText(testLine);
          const testWidth = metrics.width;
          
          if (testWidth > maxWidth && n > 0) {
            ctx.fillText(line, obj.x, y);
            line = words[n] + ' ';
            y += lineHeight;
          } else {
            line = testLine;
          }
        }
        ctx.fillText(line, obj.x, y);
        
        // Reset shadow
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        
        // Draw selection border if selected
        if (obj.selected) {
          ctx.strokeStyle = '#00ff00';
          ctx.lineWidth = 2;
          const textMetrics = ctx.measureText(obj.text || '');
          const textHeight = (obj.fontSize || 48) * 1.2;
          ctx.strokeRect(obj.x - 5, obj.y - 5, textMetrics.width + 10, textHeight + 10);
        }
      }
      
      ctx.globalAlpha = 1;
    });
  };

  /* ================= REDRAW WHEN BACKGROUND OR OBJECTS CHANGE ================= */
  useEffect(() => {
    drawCanvas();
  }, [backgroundImage, objects]);

  /* ================= YOUR ORIGINAL BACKGROUND GENERATION LOGIC ================= */
  const generateThumbnail = async () => {
    if (!prompt.trim()) {
      alert("Please enter a prompt");
      return;
    }
    
    setLoading(true);

    try {
      // YOUR ORIGINAL API CALL
      const res = await fetch("/api/ai/image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      const data = await res.json();
      
      // Store the background image data URL
      const imageData = data.mimeType 
        ? `data:${data.mimeType};base64,${data.imageBase64}`
        : `data:image/png;base64,${data.imageBase64}`;
      
      setBackgroundImage(imageData);
      setLoading(false);
        
    } catch (error) {
      console.error("Error generating thumbnail:", error);
      alert("Failed to generate thumbnail. Please try again.");
      setLoading(false);
    }
  };

  /* ================= OBJECT SELECTION ================= */
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    // Find which object was clicked
    let clickedObjectId: string | null = null;
    
    const updatedObjects = objects.map(obj => {
      let isClicked = false;
      
      if (obj.type === 'rect') {
        isClicked = x >= obj.x && x <= obj.x + (obj.width || 0) &&
                   y >= obj.y && y <= obj.y + (obj.height || 0);
      }
      else if (obj.type === 'circle') {
        const distance = Math.sqrt((x - obj.x) ** 2 + (y - obj.y) ** 2);
        isClicked = distance <= (obj.radius || 0);
      }
      else if (obj.type === 'text') {
        const ctx = canvas.getContext('2d');
        if (ctx && obj.text) {
          ctx.font = `bold ${obj.fontSize}px ${obj.fontFamily}`;
          const textWidth = ctx.measureText(obj.text).width;
          const textHeight = (obj.fontSize || 48) * 1.2;
          isClicked = x >= obj.x && x <= obj.x + textWidth &&
                     y >= obj.y && y <= obj.y + textHeight;
        }
      }
      
      if (isClicked) {
        clickedObjectId = obj.id;
        return { ...obj, selected: true };
      }
      return { ...obj, selected: false };
    });

    setObjects(updatedObjects);
    setSelectedObjectId(clickedObjectId);
  };

  /* ================= ADD TEXT ================= */
  const addText = () => {
    const newText: CanvasObject = {
      id: `text-${Date.now()}`,
      type: 'text',
      x: 100,
      y: 100,
      color: textColor,
      opacity: 1,
      text: "EDIT TEXT",
      fontSize,
      fontFamily,
      selected: true,
    };

    // Deselect all other objects
    const updatedObjects = objects.map(obj => ({
      ...obj,
      selected: false
    }));

    setObjects([...updatedObjects, newText]);
    setSelectedObjectId(newText.id);
  };

  /* ================= OVERLAYS ================= */
  const addBanner = () => {
    const newBanner: CanvasObject = {
      id: `banner-${Date.now()}`,
      type: 'rect',
      x: 0,
      y: 520,
      width: CANVAS_WIDTH,
      height: 160,
      color: shapeColor,
      opacity: 0.85,
      selected: false,
    };

    setObjects([...objects, newBanner]);
  };

  const addSideStrip = () => {
    const newStrip: CanvasObject = {
      id: `strip-${Date.now()}`,
      type: 'rect',
      x: 0,
      y: 0,
      width: 120,
      height: CANVAS_HEIGHT,
      color: shapeColor,
      opacity: 0.85,
      selected: false,
    };

    setObjects([...objects, newStrip]);
  };

  const addBlob = () => {
    const newCircle: CanvasObject = {
      id: `circle-${Date.now()}`,
      type: 'circle',
      x: 680,
      y: 180,
      radius: 150,
      color: shapeColor,
      opacity: 0.6,
      selected: false,
    };

    setObjects([...objects, newCircle]);
  };

  /* ================= DELETE ================= */
  const deleteSelected = () => {
    if (!selectedObjectId) {
      const activeObjects = objects.filter(obj => obj.selected);
      if (activeObjects.length === 0) {
        alert("No objects selected. Click on an object to select it first.");
        return;
      }
      
      const updatedObjects = objects.filter(obj => !obj.selected);
      setObjects(updatedObjects);
      setSelectedObjectId(null);
    } else {
      const updatedObjects = objects.filter(obj => obj.id !== selectedObjectId);
      setObjects(updatedObjects);
      setSelectedObjectId(null);
    }
  };

  /* ================= DOWNLOAD ================= */
  const download = () => {
    const canvas = canvasRef.current;
    if (!canvas) {
      alert("Canvas not ready");
      return;
    }

    const dataUrl = canvas.toDataURL('image/png');
    
    const link = document.createElement("a");
    link.download = "thumbnail.png";
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  /* ================= MOVE SELECTED OBJECT ================= */
  const moveSelected = (dx: number, dy: number) => {
    if (!selectedObjectId) {
      // Move all selected objects if multiple are selected
      const hasSelected = objects.some(obj => obj.selected);
      if (!hasSelected) return;
      
      const updatedObjects = objects.map(obj => 
        obj.selected ? { ...obj, x: obj.x + dx, y: obj.y + dy } : obj
      );
      setObjects(updatedObjects);
    } else {
      const updatedObjects = objects.map(obj => 
        obj.id === selectedObjectId ? { ...obj, x: obj.x + dx, y: obj.y + dy } : obj
      );
      setObjects(updatedObjects);
    }
  };

  /* ================= UPDATE SELECTED OBJECT PROPERTIES ================= */
  useEffect(() => {
    if (selectedObjectId) {
      const selectedObject = objects.find(obj => obj.id === selectedObjectId);
      if (selectedObject) {
        if (selectedObject.type === 'text') {
          setTextColor(selectedObject.color);
          setFontSize(selectedObject.fontSize || 72);
          setFontFamily(selectedObject.fontFamily || 'Impact');
        } else {
          setShapeColor(selectedObject.color);
        }
      }
    }
  }, [selectedObjectId, objects]);

  /* ================= APPLY STYLES TO SELECTED ================= */
  const applyStylesToSelected = () => {
    const updatedObjects = objects.map(obj => {
      if (obj.selected || obj.id === selectedObjectId) {
        if (obj.type === 'text') {
          return {
            ...obj,
            color: textColor,
            fontSize,
            fontFamily,
          };
        } else {
          return {
            ...obj,
            color: shapeColor,
          };
        }
      }
      return obj;
    });
    
    setObjects(updatedObjects);
  };

  return (
    <div className="p-6 bg-black min-h-screen text-white">
      <h1 className="text-xl font-bold mb-4">Thumbnail Editor</h1>

      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="YouTube thumbnail prompt"
        className="w-full p-2 bg-neutral-900 mb-3 rounded border border-neutral-700"
        rows={3}
      />

      <button
        onClick={generateThumbnail}
        disabled={loading || !canvasReady}
        className="bg-red-600 hover:bg-red-700 disabled:bg-red-900 px-4 py-2 rounded mb-4 transition-colors w-full"
      >
        {loading ? "Generating..." : "Generate Background"}
      </button>

      {/* OVERLAY BUTTONS */}
      <div className="flex gap-2 mb-4 flex-wrap">
        <button onClick={addBanner} className="bg-gray-700 hover:bg-gray-600 px-3 py-2 rounded transition-colors">
          ▬ Banner
        </button>
        <button onClick={addSideStrip} className="bg-gray-700 hover:bg-gray-600 px-3 py-2 rounded transition-colors">
          ▮ Side Strip
        </button>
        <button onClick={addBlob} className="bg-gray-700 hover:bg-gray-600 px-3 py-2 rounded transition-colors">
          ● Circle
        </button>
        <button onClick={addText} className="bg-gray-700 hover:bg-gray-600 px-3 py-2 rounded transition-colors">
          T Add Text
        </button>
      </div>

      {/* CONTROLS */}
      <div className="flex flex-wrap gap-4 items-center mb-4 p-4 bg-neutral-900 rounded">
        <label className="flex items-center gap-2">
          <span className="text-gray-300">Shape</span>
          <input
            type="color"
            value={shapeColor}
            onChange={(e) => setShapeColor(e.target.value)}
            className="w-8 h-8 cursor-pointer"
          />
        </label>

        <label className="flex items-center gap-2">
          <span className="text-gray-300">Text</span>
          <input
            type="color"
            value={textColor}
            onChange={(e) => setTextColor(e.target.value)}
            className="w-8 h-8 cursor-pointer"
          />
        </label>

        <label className="flex items-center gap-2">
          <span className="text-gray-300">Size</span>
          <input
            type="range"
            min="30"
            max="140"
            value={fontSize}
            onChange={(e) => setFontSize(+e.target.value)}
            className="w-32"
          />
          <span className="text-gray-300 w-12">{fontSize}px</span>
        </label>

        <select
          value={fontFamily}
          onChange={(e) => setFontFamily(e.target.value)}
          className="bg-gray-800 p-2 rounded border border-gray-700"
        >
          {FONTS.map((f) => (
            <option key={f} value={f}>
              {f}
            </option>
          ))}
        </select>

        <button 
          onClick={applyStylesToSelected} 
          className="bg-blue-600 hover:bg-blue-700 px-3 py-2 rounded transition-colors"
        >
          Apply to Selected
        </button>

        <div className="flex gap-2">
          <button 
            onClick={() => moveSelected(-10, 0)} 
            className="bg-gray-700 hover:bg-gray-600 px-3 py-2 rounded transition-colors"
          >
            ←
          </button>
          <button 
            onClick={() => moveSelected(10, 0)} 
            className="bg-gray-700 hover:bg-gray-600 px-3 py-2 rounded transition-colors"
          >
            →
          </button>
          <button 
            onClick={() => moveSelected(0, -10)} 
            className="bg-gray-700 hover:bg-gray-600 px-3 py-2 rounded transition-colors"
          >
            ↑
          </button>
          <button 
            onClick={() => moveSelected(0, 10)} 
            className="bg-gray-700 hover:bg-gray-600 px-3 py-2 rounded transition-colors"
          >
            ↓
          </button>
        </div>

        <button onClick={deleteSelected} className="bg-red-700 hover:bg-red-600 px-3 py-2 rounded transition-colors">
          Delete
        </button>

        <button onClick={download} className="bg-green-600 hover:bg-green-700 px-3 py-2 rounded transition-colors">
          Download
        </button>
      </div>

      {/* Canvas Status */}
      <div className="mb-4 p-2 bg-gray-900 rounded text-sm">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${canvasReady ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
          <span>{canvasReady ? 'Canvas Ready' : 'Initializing...'}</span>
          <span className="ml-4 text-gray-400">
            {selectedObjectId 
              ? `Selected: ${objects.find(o => o.id === selectedObjectId)?.type}` 
              : objects.some(o => o.selected) 
                ? `${objects.filter(o => o.selected).length} object(s) selected` 
                : 'Click objects to select'}
          </span>
          <span className="ml-4 text-gray-400">
            {backgroundImage ? '✓ Background loaded' : 'No background'}
          </span>
        </div>
      </div>

      {/* CANVAS */}
      <div className="border-2 border-gray-700 rounded overflow-hidden">
        <canvas 
          ref={canvasRef}
          onClick={handleCanvasClick}
          className="w-full h-auto bg-black"
          style={{ 
            maxWidth: '1080px',
            maxHeight: '720px',
            cursor: 'pointer'
          }}
        />
      </div>

      <div className="mt-4 text-sm text-gray-400">
        <p>• Click on elements to select them (green border indicates selection)</p>
        <p>• Use arrow buttons to move selected elements</p>
        <p>• Change colors/fonts and click "Apply to Selected" to update</p>
      </div>
    </div>
  );
}