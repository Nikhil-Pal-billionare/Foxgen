"use client";

export default function PromptBox() {
  return (
    <div className="relative">
      {/* Outer glass card */}
      <div className="
        rounded-3xl 
        bg-gradient-to-br from-white/10 to-white/5
        backdrop-blur-xl
        border border-white/15
        shadow-[0_20px_60px_rgba(0,0,0,0.6)]
        p-6
      ">
        {/* Textarea */}
        <textarea
          placeholder="Describe what you want to create…"
          className="
            w-full
            h-36
            resize-none
            bg-transparent
            text-lg
            text-white
            placeholder:text-gray-400
            outline-none
            leading-relaxed
          "
        />

        {/* Bottom bar */}
        <div className="flex items-center justify-between mt-4">
          {/* Helper text */}
          <span className="text-sm text-gray-400">
            Be descriptive for better results
          </span>

          {/* Generate button */}
          <button
            className="
              px-8 py-3
              rounded-2xl
              font-medium
              text-black
              bg-gradient-to-r from-purple-500 via-indigo-500 to-cyan-400
              hover:opacity-90
              transition
              shadow-lg
            "
          >
            Generate
          </button>
        </div>
      </div>
    </div>
  );
}
