export const PALETTE_IDS = [
  "dark-teal",
  "pastel-mint",
  "pop-blue",
  "forest",
  "sunset",
  "coral",
] as const;

export type PaletteId = (typeof PALETTE_IDS)[number];

export type PaletteInfo = {
  id: PaletteId;
  name: string;
  colors: [string, string, string, string];
};

export const PALETTES: PaletteInfo[] = [
  {
    id: "dark-teal",
    name: "Dark Teal",
    colors: ["#222831", "#393E46", "#00ADB5", "#EEEEEE"],
  },
  {
    id: "pastel-mint",
    name: "Pastel Mint",
    colors: ["#F9B2D7", "#CFECF3", "#DAF9DE", "#F6FFDC"],
  },
  {
    id: "pop-blue",
    name: "Pop Blue",
    colors: ["#FE9EC7", "#F9F6C4", "#89D4FF", "#44ACFF"],
  },
  {
    id: "forest",
    name: "Forest",
    colors: ["#091413", "#285A48", "#408A71", "#B0E4CC"],
  },
  {
    id: "sunset",
    name: "Sunset",
    colors: ["#003049", "#D62828", "#F77F00", "#FCBF49"],
  },
  {
    id: "coral",
    name: "Coral",
    colors: ["#DB1A1A", "#FFF6F6", "#8CC7C4", "#2C687B"],
  },
];

export const DEFAULT_PALETTE: PaletteId = "dark-teal";

const STORAGE_KEY = "palette";

export function getStoredPalette(): PaletteId {
  if (typeof window === "undefined") return DEFAULT_PALETTE;
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored && PALETTE_IDS.includes(stored as PaletteId)) {
    return stored as PaletteId;
  }
  return DEFAULT_PALETTE;
}

export function storePalette(id: PaletteId): void {
  localStorage.setItem(STORAGE_KEY, id);
}
