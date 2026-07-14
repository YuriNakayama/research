"use client";

import { createContext, useContext, useEffect, useState } from "react";
import {
  type PaletteId,
  DEFAULT_PALETTE,
  getStoredPalette,
  storePalette,
} from "@/lib/palette";

type PaletteContextValue = {
  palette: PaletteId;
  setPalette: (id: PaletteId) => void;
};

const PaletteContext = createContext<PaletteContextValue>({
  palette: DEFAULT_PALETTE,
  setPalette: () => {},
});

export function usePalette() {
  return useContext(PaletteContext);
}

export function PaletteProvider({ children }: { children: React.ReactNode }) {
  const [palette, setPaletteState] = useState<PaletteId>(DEFAULT_PALETTE);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setPaletteState(getStoredPalette());
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const html = document.documentElement;
    // Every palette — including the default — now carries its own full
    // scheme (ink / surface / accent) via [data-palette="..."], so we
    // always set the attribute rather than falling back to base tokens.
    html.setAttribute("data-palette", palette);
  }, [palette, mounted]);

  const setPalette = (id: PaletteId) => {
    setPaletteState(id);
    storePalette(id);
  };

  return (
    <PaletteContext.Provider value={{ palette, setPalette }}>
      {children}
    </PaletteContext.Provider>
  );
}
