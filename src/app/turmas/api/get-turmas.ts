interface Turma {
  id: string;
  name: string;
  description: string | null;
  type: "CORPORATE" | "PRIVATE";
  level:
    | "A1"
    | "A2"
    | "B1"
    | "B2"
    | "C1"
    | "C2"
    | "CONVERSATION_A1"
    | "CONVERSATION_A2"
    | "CONVERSATION_B1"
    | "CONVERSATION_B2"
    | "CONVERSATION_C1"
    | "CONVERSATION_C2";
  maxStudents: number;
  isActive: boolean;
  startTime: string;
  endTime: string;
  dayOfWeek: number;
  consultantId: string;
  createdAt: string;
  updatedAt: string;
  consultant?: {
    id: string;
    fullName: string;
    email: string;
  };
  enrollments?: {
    id: string;
    studentId: string;
    enrolledAt: string;
    isActive: boolean;
    student: {
      id: string;
      fullName: string;
      email: string;
    };
  }[];
}

interface TurmasResponse {
  classes: Turma[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface CreateTurmaInput {
  name: string;
  description?: string;
  type: "CORPORATE" | "PRIVATE";
  level: string;
  maxStudents?: number;
  isActive?: boolean;
  startTime: string;
  endTime: string;
  dayOfWeek: number;
  consultantId: string;
}

interface UpdateTurmaInput extends Partial<CreateTurmaInput> {}

interface EnrollStudentInput {
  studentId: string;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

// Helper function to get authorization headers
const getAuthHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
});

export async function getTurmas(
  page: number = 1,
  limit: number = 50,
  filters?: {
    type?: "CORPORATE" | "PRIVATE";
    level?: string;
    consultantId?: string;
    isActive?: boolean;
  }
): Promise<TurmasResponse> {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    if (filters?.type) {
      params.append("type", filters.type);
    }
    if (filters?.level) {
      params.append("level", filters.level);
    }
    if (filters?.consultantId) {
      params.append("consultantId", filters.consultantId);
    }
    if (filters?.isActive !== undefined) {
      params.append("isActive", filters.isActive.toString());
    }

    const response = await fetch(`${API_BASE_URL}/api/classes?${params}`, {
      method: "GET",
      headers: getAuthHeaders(),
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error("Failed to fetch classes");
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching classes:", error);
    throw error;
  }
}

export async function getTurmaById(id: string): Promise<Turma> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/classes/${id}`, {
      method: "GET",
      headers: getAuthHeaders(),
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error("Failed to fetch class");
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching class:", error);
    throw error;
  }
}

export async function createTurma(input: CreateTurmaInput): Promise<Turma> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/classes`, {
      method: "POST",
      headers: getAuthHeaders(),
      credentials: "include",
      body: JSON.stringify(input),
    });

    if (!response.ok) {
      throw new Error("Failed to create class");
    }

    return await response.json();
  } catch (error) {
    console.error("Error creating class:", error);
    throw error;
  }
}

export async function updateTurma(
  id: string,
  input: UpdateTurmaInput
): Promise<Turma> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/classes/${id}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      credentials: "include",
      body: JSON.stringify(input),
    });

    if (!response.ok) {
      throw new Error("Failed to update class");
    }

    return await response.json();
  } catch (error) {
    console.error("Error updating class:", error);
    throw error;
  }
}

export async function deleteTurma(id: string): Promise<{ message: string }> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/classes/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error("Failed to delete class");
    }

    return await response.json();
  } catch (error) {
    console.error("Error deleting class:", error);
    throw error;
  }
}

export async function enrollStudentInTurma(
  classId: string,
  input: EnrollStudentInput
) {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/classes/${classId}/enroll`,
      {
        method: "POST",
        headers: getAuthHeaders(),
        credentials: "include",
        body: JSON.stringify(input),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to enroll student");
    }

    return await response.json();
  } catch (error) {
    console.error("Error enrolling student:", error);
    throw error;
  }
}

export async function unenrollStudentFromTurma(
  classId: string,
  studentId: string
) {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/classes/${classId}/students/${studentId}`,
      {
        method: "DELETE",
        headers: getAuthHeaders(),
        credentials: "include",
      }
    );

    if (!response.ok) {
      throw new Error("Failed to unenroll student");
    }

    return await response.json();
  } catch (error) {
    console.error("Error unenrolling student:", error);
    throw error;
  }
}

export async function getTurmaEnrollments(classId: string) {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/classes/${classId}/enrollments`,
      {
        method: "GET",
        headers: getAuthHeaders(),
        credentials: "include",
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch class enrollments");
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching class enrollments:", error);
    throw error;
  }
}

export type {
  Turma,
  TurmasResponse,
  CreateTurmaInput,
  UpdateTurmaInput,
  EnrollStudentInput,
};
