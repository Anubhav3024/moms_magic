import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/adminSession";

export default function AdminProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = getAdminSession();
  if (!session) {
    redirect("/admin/login");
  }
  return <>{children}</>;
}

