import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { TurmasList } from "@/app/turmas/components/turmas-list";
import { getTurmas, type Turma } from "@/app/turmas/api/get-turmas";

export function TurmasPage() {
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTurmas = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getTurmas(1, 50);
      setTurmas(response.classes);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      console.error("Failed to fetch turmas:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTurmas();
  }, []);

  const handleDataRefresh = () => {
    fetchTurmas();
  };

  if (loading) {
    return (
      <DashboardLayout title="Classes">
        <div className="flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 p-4 md:gap-6 md:p-6">
            <div className="flex items-center justify-center h-32">
              <div className="text-muted-foreground">Loading classes...</div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout title="Classes">
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
    <DashboardLayout title="Classes">
      <div className="flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 p-4 md:gap-6 md:p-6">
          <TurmasList data={turmas} onDataChange={handleDataRefresh} />
        </div>
      </div>
    </DashboardLayout>
  );
}
