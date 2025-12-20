"use client";

import { motion } from "framer-motion";

const features = [
  {
    title: "Image Generation",
    desc: "Create high quality AI images from text prompts.",
  },
  {
    title: "Video Generation",
    desc: "Generate cinematic AI videos in seconds.",
  },
  {
    title: "Prompt History",
    desc: "Access and remix your past generations.",
  },
];

export default function FeaturesSection() {
  return (
    <div className="grid md:grid-cols-3 gap-8">
      {features.map((f, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: i * 0.15 }}
          className="
            rounded-3xl
            bg-white/5
            border border-white/10
            p-6
            backdrop-blur-xl
          "
        >
          <h3 className="text-lg font-semibold mb-2">{f.title}</h3>
          <p className="text-gray-400 text-sm">{f.desc}</p>
        </motion.div>
      ))}
    </div>
  );
}
