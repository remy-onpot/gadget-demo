// src/lib/design-system.ts

export const CATEGORY_THEMES: Record<string, string> = {
  laptop: "bg-gradient-to-br from-slate-100 to-gray-200 text-slate-900", // Clean, Metallic (Apple style)
  gaming: "bg-gradient-to-br from-[#2E0249] to-[#570A57] text-white", // Deep Purple (Gamer aesthetic)
  audio: "bg-gradient-to-br from-[#FF6B6B] to-[#EE5D5D] text-white", // Energetic Coral/Red
  phone: "bg-gradient-to-br from-[#E0F7FA] to-[#B2EBF2] text-cyan-900", // Fresh, light blue
  monitor: "bg-gradient-to-br from-gray-900 to-slate-800 text-white", // Dark, cinematic (OLED vibes)
  camera: "bg-gradient-to-br from-[#FFF3E0] to-[#FFE0B2] text-orange-900", // Warm, sepia tones
  printer: "bg-white border-2 border-dashed border-gray-200 text-gray-600", // Office utility feel
  default: "bg-white text-slate-900 border border-gray-100"
};

export const GRID_SPANS: Record<string, string> = {
  laptop: "md:col-span-2 md:row-span-2", // Big hero card
  gaming: "md:col-span-1 md:row-span-2", // Tall vertical card
  audio: "md:col-span-1 md:row-span-1",
  monitor: "md:col-span-2 md:row-span-1", // Wide card
};