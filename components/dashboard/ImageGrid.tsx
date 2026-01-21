"use client";

import { motion } from "framer-motion";

const images = [
  "/demo/car.png?v=2",
  "/demo/cat.png?v=2",
  "/demo/dance.png?v=2",
  "/demo/dog.png?v=2",
  "/demo/man.png?v=2",
  "/demo/run.png?v=2",
  "/demo/1.png?v=2",
  "/demo/2.png?v=2",
  "/demo/3.png?v=2",
  "/demo/4.png?v=2",
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
