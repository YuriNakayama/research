import type { Metadata, Viewport } from "next";
import { ThemeProvider } from "next-themes";
import "@fontsource-variable/noto-sans-jp";
import "@fontsource-variable/jetbrains-mono";
import "katex/dist/katex.min.css";
import "highlight.js/styles/github.css";
import "@/styles/globals.css";
import { AuthProvider } from "@/components/auth/auth-provider";
import { PaletteProvider } from "@/components/layout/palette-provider";

export const metadata: Metadata = {
  title: "Research Viewer",
  description: "リサーチレポート閲覧サービス",
};

// The sticky header is #0A0A0A in both themes, so the browser UI (mobile
// address bar) matches it regardless of light/dark.
// Pinch-to-zoom is explicitly enabled (userScalable + a generous maximumScale)
// so users on small screens can enlarge content. minimumScale is below 1 so
// that from the default fit-to-width state, pinching out further zooms OUT to
// see more at once. This is also an accessibility requirement (WCAG 1.4.4) —
// never disable zoom.
export const viewport: Viewport = {
  themeColor: "#0A0A0A",
  width: "device-width",
  initialScale: 1,
  minimumScale: 0.5,
  maximumScale: 5,
  userScalable: true,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <body className="min-h-screen bg-background antialiased">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <PaletteProvider>
            <AuthProvider>{children}</AuthProvider>
          </PaletteProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
