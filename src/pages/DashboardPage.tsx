import { ChartAreaInteractive } from "@/components/chart-area-interactive";
import { DataTable } from "@/components/data-table";
import { SectionCards } from "@/components/section-cards";
import { DashboardLayout } from "@/components/DashboardLayout";
import data from "@/app/dashboard/data.json";

export function DashboardPage() {
  return (
    <DashboardLayout>
      <div className="flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 p-4 md:gap-6 md:p-6">
          <SectionCards />
          <ChartAreaInteractive />
          <DataTable data={data} />
        </div>
      </div>
    </DashboardLayout>
  );
}
