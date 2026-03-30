import type { Metadata } from "next";
import { ThemeProvider } from "next-themes";
import "@fontsource-variable/noto-sans-jp";
import "katex/dist/katex.min.css";
import "@/styles/globals.css";
import { AuthProvider } from "@/components/auth/auth-provider";

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
          <AuthProvider>{children}</AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
