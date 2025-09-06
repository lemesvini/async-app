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

interface CreateContentInput {
  title: string;
  description?: string;
  module: string;
  order: number;
  presentationUrl?: string;
  studentsPdfUrl?: string;
  homeworkUrl?: string;
  isActive?: boolean;
}

export async function createContent(
  input: CreateContentInput
): Promise<Content> {
  try {
    const requestBody = JSON.stringify(input);

    const response = await fetch(
      `${import.meta.env.VITE_API_URL || "http://localhost:3000"}/api/contents`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
        credentials: "include",
        body: requestBody,
      }
    );

    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch {
        errorData = {
          error: `HTTP ${response.status}: ${response.statusText}`,
        };
      }
      console.error("API Error:", errorData);
      throw new Error(errorData.error || "Failed to create content");
    }

    return await response.json();
  } catch (error) {
    console.error("Error creating content:", error);
    throw error;
  }
}

export async function deleteContent(id: string): Promise<{ message: string }> {
  try {
    const response = await fetch(
      `${
        import.meta.env.VITE_API_URL || "http://localhost:3000"
      }/api/contents/${id}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
        credentials: "include",
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to delete content");
    }

    return await response.json();
  } catch (error) {
    console.error("Error deleting content:", error);
    throw error;
  }
}

export type { Content, ContentsResponse, CreateContentInput };
