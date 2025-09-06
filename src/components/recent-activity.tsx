import { useEffect, useState } from "react";
import { IconCash, IconSchool, IconCalendar } from "@tabler/icons-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { apiClient } from "@/lib/api";
import type { DashboardStats } from "@/lib/api";

export function RecentActivity() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const data = await apiClient.getDashboardStats();
        setStats(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch dashboard data"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest system activities</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="flex items-center space-x-4 animate-pulse"
              >
                <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-red-600">
            Error loading recent activity
          </CardTitle>
          <CardDescription>{error}</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (!stats || !stats.recentActivity.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest system activities</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground py-8">
            No recent activity found
          </div>
        </CardContent>
      </Card>
    );
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "payment":
        return <IconCash className="w-4 h-4" />;
      case "enrollment":
        return <IconSchool className="w-4 h-4" />;
      default:
        return <IconCalendar className="w-4 h-4" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case "payment":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "enrollment":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>
          Latest system activities and transactions
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {stats.recentActivity.map((activity) => (
            <div key={activity.id} className="flex items-start space-x-4">
              <div
                className={`flex items-center justify-center w-8 h-8 rounded-full ${getActivityColor(
                  activity.type
                )}`}
              >
                {getActivityIcon(activity.type)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                  {activity.description}
                </p>
                <div className="flex items-center mt-1 space-x-2">
                  <Badge variant="outline" className="text-xs">
                    {activity.type}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {new Date(activity.date).toLocaleDateString()}{" "}
                    {new Date(activity.date).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
