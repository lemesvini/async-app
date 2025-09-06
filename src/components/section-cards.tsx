import {
  IconTrendingDown,
  IconTrendingUp,
  IconUsers,
  IconBook,
  IconSchool,
  IconCash,
} from "@tabler/icons-react";
import { useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { apiClient } from "@/lib/api";
import type { DashboardStats } from "@/lib/api";

export function SectionCards() {
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
      <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card
            key={i}
            className="bg-gradient-to-t from-primary/5 to-card shadow-sm animate-pulse"
          >
            <CardHeader>
              <CardDescription className="h-4 bg-gray-200 rounded"></CardDescription>
              <CardTitle className="h-8 bg-gray-200 rounded"></CardTitle>
            </CardHeader>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-gradient-to-t from-red-50 to-card shadow-sm col-span-full">
          <CardHeader>
            <CardTitle className="text-red-600">
              Error loading dashboard data
            </CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (!stats) return null;

  // Calculate growth percentages (using recent enrollments vs total as a simple metric)
  const revenueGrowth =
    stats.totalRevenue > 0
      ? Math.round((stats.monthlyRevenue / stats.totalRevenue) * 100)
      : 0;

  return (
    <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 md:grid-cols-2 lg:grid-cols-4">
      <Card className="bg-gradient-to-t from-primary/5 to-card shadow-sm">
        <CardHeader>
          <CardDescription>Total Students</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums lg:text-3xl flex items-center gap-2">
            <IconUsers className="size-6" />
            {stats.totalStudents}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconTrendingUp />
              Active
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {stats.recentEnrollments} new this week{" "}
            <IconTrendingUp className="size-4" />
          </div>
          <div className="text-muted-foreground">
            Total active enrollments: {stats.totalEnrollments}
          </div>
        </CardFooter>
      </Card>

      <Card className="bg-gradient-to-t from-primary/5 to-card shadow-sm">
        <CardHeader>
          <CardDescription>Total Consultants</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums lg:text-3xl flex items-center gap-2">
            <IconSchool className="size-6" />
            {stats.totalConsultants}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconTrendingUp />
              Active
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Teaching {stats.activeClasses} active classes{" "}
            <IconTrendingUp className="size-4" />
          </div>
          <div className="text-muted-foreground">
            Out of {stats.totalClasses} total classes
          </div>
        </CardFooter>
      </Card>

      <Card className="bg-gradient-to-t from-primary/5 to-card shadow-sm">
        <CardHeader>
          <CardDescription>Course Contents</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums lg:text-3xl flex items-center gap-2">
            <IconBook className="size-6" />
            {stats.totalContents}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconTrendingUp />
              Available
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Active learning materials <IconTrendingUp className="size-4" />
          </div>
          <div className="text-muted-foreground">
            Attendance rate: {stats.attendanceRate}%
          </div>
        </CardFooter>
      </Card>

      <Card className="bg-gradient-to-t from-primary/5 to-card shadow-sm">
        <CardHeader>
          <CardDescription>Monthly Revenue</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums lg:text-3xl flex items-center gap-2">
            <IconCash className="size-6" />${stats.monthlyRevenue.toFixed(2)}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              {revenueGrowth > 0 ? <IconTrendingUp /> : <IconTrendingDown />}
              {revenueGrowth}%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Total revenue: ${stats.totalRevenue.toFixed(2)}{" "}
            <IconTrendingUp className="size-4" />
          </div>
          <div className="text-muted-foreground">
            {stats.pendingPayments} pending, {stats.overduePayments} overdue
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
