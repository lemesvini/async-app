import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { getStudents, type Student } from "@/app/students/api/get-students";
import { StudentsList } from "@/app/students/components/students-list";

export function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const response = await getStudents(1, 100); // Get first 100 students
      setStudents(response.users);
      setError(null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch students"
      );
      console.error("Error fetching students:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  if (loading) {
    return (
      <DashboardLayout title="Students">
        <div className="flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 p-4 md:gap-6 md:p-6">
            <div className="flex items-center justify-center h-32">
              <div className="text-muted-foreground">Loading students...</div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout title="Students">
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
    <DashboardLayout title="Students">
      <div className="flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 p-4 md:gap-6 md:p-6">
          <StudentsList data={students} onDataChange={fetchStudents} />
        </div>
      </div>
    </DashboardLayout>
  );
}
