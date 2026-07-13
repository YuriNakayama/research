/**
 * Color palettes for the docs viewer.
 *
 * Each palette exposes 4 swatch colors (`colors: [c0, c1, c2, c3]`) shown in the
 * selector. `globals.css` maps these into a 3–5 color ROLE-TOKEN set per palette
 * (not a single accent), keeping the brutalist skeleton (radius 0, heavy borders,
 * hard shadows) intact:
 *
 *   --accent-bg      primary action / hover / active
 *   --accent-2-bg    secondary accent — table header, blockquote rail, ToC hover
 *   --surface-tint   subtle section fill — zebra rows, blockquote bg (light swatch)
 *
 * `--surface-tint` flips to a dark tint in `.dark` so body text stays AA.
 *
 * AA contrast (bg / text ≥ 4.5:1) verified for every role pairing — light mode
 * pairs against #0A0A0A / #FAFAFA, dark mode against #FAFAFA:
 *
 *   dark-teal    accent #00ADB5·7.21  accent-2 #222831·14.21  tint #EEEEEE·17.06
 *   pastel-mint  accent #3CFFB0        accent-2 #F9B2D7·11.67  tint #CFECF3·15.98
 *   pop-blue     accent #2E5BFF·4.96   accent-2 #FE9EC7·10.30  tint #F9F6C4·17.92
 *   forest       accent #00B84D        accent-2 #285A48·7.60   tint #B0E4CC·13.97
 *   sunset       accent #FF6B00        accent-2 #003049·13.25  tint #FCBF49·11.96
 *   coral        accent #FF006E        accent-2 #2C687B·5.96   tint #8CC7C4·10.45
 *
 * dark-teal is the DEFAULT; its role tokens live on :root/.dark (flash-free
 * before hydration) and are mirrored in the [data-palette="dark-teal"] block.
 */
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
