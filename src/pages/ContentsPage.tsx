import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { getContents, type Content } from "@/app/contents/api/get-contents";
import { ContentsList } from "@/app/contents/components/contents-list";

export function ContentsPage() {
  const [contents, setContents] = useState<Content[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchContents = async () => {
    try {
      setLoading(true);
      const response = await getContents(1, 100); // Get first 100 contents
      setContents(response.contents);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch contents");
      console.error("Error fetching contents:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContents();
  }, []);

  if (loading) {
    return (
      <DashboardLayout title="Contents">
        <div className="flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 p-4 md:gap-6 md:p-6">
            <div className="flex items-center justify-center h-32">
              <div className="text-muted-foreground">Loading contents...</div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout title="Contents">
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
    <DashboardLayout title="Contents">
      <div className="flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 p-4 md:gap-6 md:p-6">
          <ContentsList data={contents} onRefresh={fetchContents} />
        </div>
      </div>
    </DashboardLayout>
  );
}
