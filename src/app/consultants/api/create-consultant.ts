export interface CreateConsultantInput {
  email: string;
  password: string;
  fullName: string;
  role: "CONSULTANT";
  phone?: string;
  birthDate?: string;
  address?: string;
  emergencyContact?: string;
  notes?: string;
}

export async function createConsultant(input: CreateConsultantInput) {
  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL || "http://localhost:3000"}/api/users`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
        credentials: "include",
        body: JSON.stringify(input),
      }
    );

    if (!response.ok) {
      const errorData = await response.text();
      let errorMessage = `Failed to create consultant (${response.status})`;

      try {
        const errorJson = JSON.parse(errorData);
        if (errorJson.error) {
          errorMessage = errorJson.error;
        }
      } catch {
        // If parsing fails, use the text response
        if (errorData) {
          errorMessage = errorData;
        }
      }

      throw new Error(errorMessage);
    }

    return await response.json();
  } catch (error) {
    console.error("Error creating consultant:", error);
    throw error;
  }
}
