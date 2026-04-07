"use client";

import Link from "next/link";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { signOut } from "aws-amplify/auth";
import { useRouter } from "next/navigation";
import { Sun, Moon, LogOut, Menu, X } from "lucide-react";
import { PaletteSelector } from "./palette-selector";

export function Header() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();

  useEffect(() => setMounted(true), []);

  const handleSignOut = async () => {
    await signOut();
    router.replace("/login");
  };

  return (
    <header className="sticky top-0 z-50 brutal-border-b border-[var(--border-primary)] bg-[var(--header-bg)]">
      <div className="flex h-14 items-center justify-between">
        <div className="flex items-center">
          {/* Mobile hamburger */}
          <button
            type="button"
            className="flex h-14 w-14 items-center justify-center brutal-border-r border-[var(--border-primary)] text-[var(--header-text)] transition-colors hover:bg-[var(--accent-bg)] hover:text-[var(--accent-text)] md:hidden cursor-pointer"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="メニューを開く"
          >
            {menuOpen ? (
              <X className="h-5 w-5" strokeWidth={2} />
            ) : (
              <Menu className="h-5 w-5" strokeWidth={2} />
            )}
          </button>

          <Link
            href="/docs"
            className="flex h-14 items-center gap-3 px-4 brutal-border-r border-[var(--border-primary)] transition-colors hover:bg-[var(--accent-bg)] hover:text-[var(--accent-text)]"
          >
            <span className="brutal-label text-[var(--accent-bg)] group-hover:text-[var(--accent-text)]">
              [001]
            </span>
            <span className="brutal-display text-base text-[var(--header-text)] group-hover:text-[var(--accent-text)]">
              RESEARCH/VIEWER
            </span>
          </Link>
        </div>

        <div className="flex h-14 items-center">
          {mounted && <PaletteSelector />}
          {mounted && (
            <button
              type="button"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="flex h-14 w-14 items-center justify-center brutal-border-l border-[var(--border-primary)] text-[var(--header-text)] transition-colors hover:bg-[var(--accent-bg)] hover:text-[var(--accent-text)] cursor-pointer"
              aria-label="テーマ切替"
            >
              {theme === "dark" ? (
                <Sun className="h-[18px] w-[18px]" strokeWidth={2} />
              ) : (
                <Moon className="h-[18px] w-[18px]" strokeWidth={2} />
              )}
            </button>
          )}

          <button
            type="button"
            onClick={handleSignOut}
            className="flex h-14 items-center gap-2 px-4 brutal-border-l border-[var(--border-primary)] brutal-label text-[var(--header-text)] transition-colors hover:bg-[var(--accent-bg)] hover:text-[var(--accent-text)] cursor-pointer"
          >
            <LogOut className="h-3.5 w-3.5" strokeWidth={2} />
            LOGOUT
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <nav className="brutal-border-t border-[var(--border-primary)] bg-[var(--header-bg)] md:hidden">
          <Link
            href="/docs"
            className="block brutal-border-b border-[var(--border-primary)] px-4 py-3 brutal-label text-[var(--header-text)] transition-colors hover:bg-[var(--accent-bg)] hover:text-[var(--accent-text)]"
            onClick={() => setMenuOpen(false)}
          >
            &gt; DOCS
          </Link>
        </nav>
      )}
    </header>
  );
}
