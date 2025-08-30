import { DataTable } from "@/components/data-table";
import { DashboardLayout } from "@/components/DashboardLayout";
import data from "@/app/alunos/data.json";

export function AlunosPage() {
  return (
    <DashboardLayout title="Alunos">
      <div className="flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 p-4 md:gap-6 md:p-6">
          <DataTable data={data} />
        </div>
      </div>
    </DashboardLayout>
  );
}
