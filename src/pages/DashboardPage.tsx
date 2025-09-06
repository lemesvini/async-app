import { ChartAreaInteractive } from "@/components/chart-area-interactive";
// import { RecentActivity } from "@/components/recent-activity";
import { SectionCards } from "@/components/section-cards";
import { DashboardLayout } from "@/components/DashboardLayout";

export function DashboardPage() {
  return (
    <DashboardLayout title="Dashboard">
      <div className="flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 p-4 md:gap-6 md:p-6">
          <SectionCards />
          <ChartAreaInteractive />
          {/* <RecentActivity /> */}
        </div>
      </div>
    </DashboardLayout>
  );
}
