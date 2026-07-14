export const PALETTE_IDS = [
  "dark-teal",
  "sunset",
  "coral",
  "aqua-sky",
  "vivid-pop",
  "mono-red",
  "espresso",
  "ocean-coral",
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
    id: "sunset",
    name: "Sunset",
    colors: ["#003049", "#D62828", "#F77F00", "#FCBF49"],
  },
  {
    id: "coral",
    name: "Coral",
    colors: ["#DB1A1A", "#FFF6F6", "#8CC7C4", "#2C687B"],
  },
  {
    id: "aqua-sky",
    name: "Aqua Sky",
    colors: ["#008DDA", "#41C9E2", "#ACE2E1", "#F7EEDD"],
  },
  {
    id: "vivid-pop",
    name: "Vivid Pop",
    colors: ["#3EC1D3", "#F6F7D7", "#FF9A00", "#FF165D"],
  },
  {
    id: "mono-red",
    name: "Mono Red",
    colors: ["#171717", "#444444", "#DA0037", "#EDEDED"],
  },
  {
    id: "espresso",
    name: "Espresso",
    colors: ["#000000", "#1F150C", "#412D15", "#E1DCC9"],
  },
  {
    id: "ocean-coral",
    name: "Ocean Coral",
    colors: ["#07689F", "#A2D5F2", "#FAFAFA", "#FF7E67"],
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
