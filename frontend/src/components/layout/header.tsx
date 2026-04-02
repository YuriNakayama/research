"use client";

import Link from "next/link";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { signOut } from "aws-amplify/auth";
import { useRouter } from "next/navigation";
import { BookOpen, Sun, Moon, LogOut, Menu, X } from "lucide-react";
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
    <header className="sticky top-0 z-50 border-b border-[var(--border-primary)] bg-[var(--header-bg)]">
      <div className="flex h-14 items-center justify-between px-4">
        <div className="flex items-center gap-4">
          {/* Mobile hamburger */}
          <button
            className="md:hidden cursor-pointer"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="メニューを開く"
          >
            {menuOpen ? (
              <X className="h-5 w-5 text-[var(--header-text)]" strokeWidth={1.5} />
            ) : (
              <Menu className="h-5 w-5 text-[var(--header-text)]" strokeWidth={1.5} />
            )}
          </button>

          <Link href="/docs" className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-[var(--accent-bg)]" strokeWidth={1.5} />
            <span className="text-base font-semibold tracking-tight text-[var(--header-text)]">
              Research Viewer
            </span>
          </Link>
        </div>

        <div className="flex items-center gap-1">
          {mounted && <PaletteSelector />}
          {mounted && (
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="rounded-[var(--radius-md)] p-2 text-[var(--header-text-secondary)] transition-colors duration-200 hover:text-[var(--header-text)] hover:bg-white/10 cursor-pointer"
              aria-label="テーマ切替"
            >
              {theme === "dark" ? (
                <Sun className="h-[18px] w-[18px]" strokeWidth={1.5} />
              ) : (
                <Moon className="h-[18px] w-[18px]" strokeWidth={1.5} />
              )}
            </button>
          )}

          <button
            onClick={handleSignOut}
            className="flex items-center gap-1.5 rounded-[var(--radius-md)] px-3 py-1.5 text-sm text-[var(--header-text-secondary)] transition-colors duration-200 hover:text-[var(--header-text)] hover:bg-white/10 cursor-pointer"
          >
            <LogOut className="h-3.5 w-3.5" strokeWidth={1.5} />
            ログアウト
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <nav className="border-t border-white/10 px-4 py-3 md:hidden">
          <Link
            href="/docs"
            className="block py-2 text-sm text-[var(--header-text-secondary)] hover:text-[var(--header-text)]"
            onClick={() => setMenuOpen(false)}
          >
            ドキュメント
          </Link>
        </nav>
      )}
    </header>
  );
}
