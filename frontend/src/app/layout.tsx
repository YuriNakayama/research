import type { Metadata } from "next";
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
