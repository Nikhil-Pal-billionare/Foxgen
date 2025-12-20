"use client";

import { motion } from "framer-motion";

const images = [
  "/demo/car.png",
  "/demo/cat.png",
  "/demo/dance.png",
  "/demo/run.png",
  "/demo/dog.png",
  "/demo/man.png",
];

export default function ImageGrid() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
      {images.map((src, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: i * 0.1 }}
          className="rounded-2xl overflow-hidden bg-black"
        >
          <img
            src={src}
            alt="Generated"
            className="w-full h-full object-cover"
          />
        </motion.div>
      ))}
    </div>
  );
}
