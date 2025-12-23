"use client";

export default function CopyButton({ value }: { value: string }) {
  const handleCopy = async () => {
    await navigator.clipboard.writeText(value);
    alert("Copied to clipboard");
  };

  return (
    <button
      onClick={handleCopy}
      className="px-3 py-1 text-sm rounded-md bg-white/10 hover:bg-white/20 transition"
    >
      Copy
    </button>
  );
}
