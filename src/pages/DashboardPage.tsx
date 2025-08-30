import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { apiClient } from "@/lib/api";

export function DashboardPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Get user from local storage
    const storedUser = apiClient.getStoredUser();
    if (storedUser) {
      setUser(storedUser);
    } else {
      // If no user data, redirect to login
      navigate("/login");
    }
  }, [navigate]);

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      await apiClient.logout();
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
      // Even if logout fails, redirect to login
      navigate("/login");
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center p-6 md:p-10">
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center p-6 md:p-10">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Dashboard</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <p className="text-lg font-medium">Welcome, {user.fullName}!</p>
            <p className="text-sm text-muted-foreground">{user.email}</p>
            <p className="text-sm text-muted-foreground">Role: {user.role}</p>
          </div>
          <p className="text-center text-muted-foreground">
            You are successfully logged in to your dashboard.
          </p>
          <div className="flex flex-col gap-2">
            <Button
              onClick={handleLogout}
              variant="outline"
              disabled={isLoading}
            >
              {isLoading ? "Logging out..." : "Logout"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
