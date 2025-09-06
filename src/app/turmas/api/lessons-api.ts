interface LessonResponse {
  id: string;
  classId: string;
  contentId: string;
  lessonDate: string;
  notes: string | null;
  wasCompleted: boolean;
  createdAt: string;
  updatedAt: string;
  class?: {
    id: string;
    name: string;
    type: string;
    level: string;
  };
  content?: {
    id: string;
    title: string;
    description: string | null;
    module: string;
    order: number;
  };
  attendance?: {
    id: string;
    studentId: string;
    status: "PRESENT" | "ABSENT" | "LATE" | "EXCUSED";
    notes: string | null;
    student?: {
      id: string;
      fullName: string;
      email: string;
    };
  }[];
}

interface CreateLessonInput {
  classId: string;
  contentId: string;
  lessonDate: string;
  notes?: string;
}

interface UpdateLessonInput {
  contentId?: string;
  lessonDate?: string;
  notes?: string;
  wasCompleted?: boolean;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

function getAuthHeaders() {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
  };
}

export async function createLesson(
  input: CreateLessonInput
): Promise<LessonResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/lessons`, {
      method: "POST",
      headers: getAuthHeaders(),
      credentials: "include",
      body: JSON.stringify(input),
    });

    if (!response.ok) {
      const errorData = await response.text();
      let errorMessage = `Failed to create lesson (${response.status})`;

      try {
        const errorJson = JSON.parse(errorData);
        if (errorJson.error) {
          errorMessage = errorJson.error;
        }
      } catch {
        if (errorData) {
          errorMessage = errorData;
        }
      }

      throw new Error(errorMessage);
    }

    return await response.json();
  } catch (error) {
    console.error("Error creating lesson:", error);
    throw error;
  }
}

export async function getLessonById(lessonId: string): Promise<LessonResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/lessons/${lessonId}`, {
      method: "GET",
      headers: getAuthHeaders(),
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error("Failed to fetch lesson");
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching lesson:", error);
    throw error;
  }
}

export async function getClassLessons(
  classId: string
): Promise<LessonResponse[]> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/lessons/class/${classId}`,
      {
        method: "GET",
        headers: getAuthHeaders(),
        credentials: "include",
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch class lessons");
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching class lessons:", error);
    throw error;
  }
}

export async function updateLesson(
  lessonId: string,
  input: UpdateLessonInput
): Promise<LessonResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/lessons/${lessonId}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      credentials: "include",
      body: JSON.stringify(input),
    });

    if (!response.ok) {
      const errorData = await response.text();
      let errorMessage = `Failed to update lesson (${response.status})`;

      try {
        const errorJson = JSON.parse(errorData);
        if (errorJson.error) {
          errorMessage = errorJson.error;
        }
      } catch {
        if (errorData) {
          errorMessage = errorData;
        }
      }

      throw new Error(errorMessage);
    }

    return await response.json();
  } catch (error) {
    console.error("Error updating lesson:", error);
    throw error;
  }
}

export async function deleteLesson(
  lessonId: string
): Promise<{ message: string }> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/lessons/${lessonId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
      },
      credentials: "include",
    });

    if (!response.ok) {
      const errorData = await response.text();
      let errorMessage = `Failed to delete lesson (${response.status})`;

      try {
        const errorJson = JSON.parse(errorData);
        if (errorJson.error) {
          errorMessage = errorJson.error;
        }
      } catch {
        if (errorData) {
          errorMessage = errorData;
        }
      }

      throw new Error(errorMessage);
    }

    return await response.json();
  } catch (error) {
    console.error("Error deleting lesson:", error);
    throw error;
  }
}

export type { LessonResponse, CreateLessonInput, UpdateLessonInput };
