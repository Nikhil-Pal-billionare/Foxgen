"use client";

type Props = {
  images: string[];
  selectedImage: string | null;
  onSelect: (img: string) => void;
};

export default function ThumbnailVariations({
  images,
  selectedImage,
  onSelect,
}: Props) {
  return (
    <div>
      <h3 className="text-lg font-semibold mb-3">Choose a variation</h3>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {images.map((img, idx) => (
          <button
            key={idx}
            onClick={() => onSelect(img)}
            className={`border rounded overflow-hidden transition ${
              selectedImage === img
                ? "border-red-600"
                : "border-neutral-700 hover:border-neutral-500"
            }`}
          >
            <img
              src={img}
              alt={`variation-${idx}`}
              className="object-cover w-full h-32"
            />
          </button>
        ))}
      </div>
    </div>
  );
}