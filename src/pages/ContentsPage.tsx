import { DashboardLayout } from "@/components/DashboardLayout";

export function ContentsPage() {
  return (
    <DashboardLayout title="Contents">
      <div className="flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 p-4 md:gap-6 md:p-6">
          <div className="flex items-center justify-center h-32">
            <div className="text-muted-foreground text-lg">
              Contents will be implemented here
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
