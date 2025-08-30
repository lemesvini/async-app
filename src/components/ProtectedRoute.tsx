import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { apiClient } from "@/lib/api";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const navigate = useNavigate();

  useEffect(() => {
    if (!apiClient.isAuthenticated()) {
      navigate("/login");
    }
  }, [navigate]);

  if (!apiClient.isAuthenticated()) {
    return null; // or a loading spinner
  }

  return <>{children}</>;
}
