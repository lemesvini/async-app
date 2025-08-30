interface Student {
  id: string;
  email: string;
  fullName: string;
  role: string;
  phone?: string;
  birthDate?: string;
  address?: string;
  emergencyContact?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

interface StudentsResponse {
  users: Student[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export async function getStudents(
  page: number = 1,
  limit: number = 50
): Promise<StudentsResponse> {
  try {
    const response = await fetch(
      `${
        import.meta.env.VITE_API_URL || "http://localhost:3000"
      }/api/users?role=STUDENT&page=${page}&limit=${limit}`,
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
      throw new Error("Failed to fetch students");
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching students:", error);
    throw error;
  }
}

export type { Student, StudentsResponse };
