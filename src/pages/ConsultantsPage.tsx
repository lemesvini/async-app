import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import {
  getConsultants,
  type Consultant,
} from "@/app/consultants/api/get-consultants";
import { ConsultantsList } from "@/app/consultants/components/consultants-list";

export function ConsultantsPage() {
  const [consultants, setConsultants] = useState<Consultant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchConsultants = async () => {
      try {
        setLoading(true);
        const response = await getConsultants(1, 100); // Get first 100 consultants
        setConsultants(response.users);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch consultants"
        );
        console.error("Error fetching consultants:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchConsultants();
  }, []);

  if (loading) {
    return (
      <DashboardLayout title="Consultants">
        <div className="flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 p-4 md:gap-6 md:p-6">
            <div className="flex items-center justify-center h-32">
              <div className="text-muted-foreground">
                Loading consultants...
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout title="Consultants">
        <div className="flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 p-4 md:gap-6 md:p-6">
            <div className="flex items-center justify-center h-32">
              <div className="text-red-500">Error: {error}</div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Consultants">
      <div className="flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 p-4 md:gap-6 md:p-6">
          <ConsultantsList data={consultants} />
        </div>
      </div>
    </DashboardLayout>
  );
}
