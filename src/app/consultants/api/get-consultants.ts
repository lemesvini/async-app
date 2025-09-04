interface Consultant {
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

interface ConsultantsResponse {
  users: Consultant[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export async function getConsultants(
  page: number = 1,
  limit: number = 50
): Promise<ConsultantsResponse> {
  try {
    const response = await fetch(
      `${
        import.meta.env.VITE_API_URL || "http://localhost:3000"
      }/api/users?role=CONSULTANT&page=${page}&limit=${limit}`,
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
      throw new Error("Failed to fetch consultants");
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching consultants:", error);
    throw error;
  }
}

export type { Consultant, ConsultantsResponse };
