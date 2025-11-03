import { ProtectedDashboard } from "@/components/dashboard/ProtectedDashboard";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ProtectedDashboard>{children}</ProtectedDashboard>;
}