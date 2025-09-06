import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { apiClient } from "@/lib/api";

// Define user roles as a type
type UserRole = "ADMIN" | "CONSULTANT" | "STUDENT";

export function DashboardLayout({
  children,
  title,
}: {
  children: React.ReactNode;
  title?: string;
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Get user from local storage
    const storedUser = apiClient.getStoredUser();
    if (storedUser) {
      setUser(storedUser);
      setIsLoading(false);

      // Role-based redirection logic
      const userRole = (storedUser.role as UserRole) || "STUDENT";
      const currentPath = location.pathname;

      // If user is on dashboard path, redirect based on role
      if (currentPath === "/dashboard") {
        switch (userRole) {
          case "CONSULTANT":
            navigate("/alunos", { replace: true });
            return;
          case "STUDENT":
            navigate("/contents", { replace: true });
            return;
          case "ADMIN":
          default:
            // Admin stays on dashboard
            break;
        }
      }
    } else {
      // If no user data, redirect to login
      navigate("/login");
    }
  }, [navigate, location.pathname]);

  if (isLoading || !user) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center p-6 md:p-10">
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "288px",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" user={user} />
      <SidebarInset>
        <SiteHeader title={title} />
        <div className="flex flex-1 flex-col">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
