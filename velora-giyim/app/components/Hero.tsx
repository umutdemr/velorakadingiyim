"use client";

import { motion } from "framer-motion";

export default function Hero() {
  return (
    <section className="relative h-[85vh] w-full overflow-hidden">
      {/* Arka plan görseli */}
      <img
        src="/images/5.png"
        alt="Velora Giyim Hero"
        className="absolute inset-0 w-full h-full object-cover brightness-75"
      />

      {/* Hero içeriği */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 flex flex-col justify-center h-full">
        <motion.h1
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="text-white text-5xl md:text-6xl lg:text-7xl font-light tracking-tight leading-tight"
        >
          2025 Koleksiyonu <br />
          <span className="font-semibold text-[#f6d9c6]">
            Zarafetin Yeni Dönemi
          </span>
        </motion.h1>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 1 }}
          className="mt-8 flex flex-col sm:flex-row gap-4"
        >
          <a
            href="/shop"
            className="bg-[#eabf9f] text-gray-900 px-8 py-3 rounded-full font-semibold shadow-md hover:bg-[#FFFFFF] hover:text-white transition-all duration-300 text-center"
          >
            Şimdi Keşfet
          </a>
          <a
            href="#collections"
            className="bg-[#eabf9f] text-gray-900 px-8 py-3 rounded-full font-semibold shadow-md hover:bg-[#FFFFFF] hover:text-white transition-all duration-300 text-center"
          >
            Koleksiyonlar
          </a>
        </motion.div>
      </div>

      {/* Alt degradeli overlay */}
    </section>
  );
}
