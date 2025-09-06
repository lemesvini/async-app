interface Content {
  id: string;
  title: string;
  description: string | null;
  module: string;
  order: number;
  presentationUrl: string | null;
  studentsPdfUrl: string | null;
  homeworkUrl: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  classLessons?: {
    id: string;
    classId: string;
    lessonDate: string;
    notes: string | null;
    wasCompleted: boolean;
    class: {
      id: string;
      name: string;
    };
  }[];
}

interface ContentsResponse {
  contents: Content[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export async function getContents(
  page: number = 1,
  limit: number = 50
): Promise<ContentsResponse> {
  try {
    const response = await fetch(
      `${
        import.meta.env.VITE_API_URL || "http://localhost:3000"
      }/api/contents?page=${page}&limit=${limit}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
        credentials: "include",
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch contents");
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching contents:", error);
    throw error;
  }
}

export async function getContentsByModule(module: string): Promise<Content[]> {
  try {
    const response = await fetch(
      `${
        import.meta.env.VITE_API_URL || "http://localhost:3000"
      }/api/contents/module/${module}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
        credentials: "include",
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch contents by module");
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching contents by module:", error);
    throw error;
  }
}

export type { Content, ContentsResponse };
