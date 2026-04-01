import { AuthGuard } from "@/components/auth/auth-guard";
import { Header } from "@/components/layout/header";

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <Header />
      {children}
    </AuthGuard>
  );
}
