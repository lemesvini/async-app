export async function deleteConsultant(consultantId: string) {
  try {
    const response = await fetch(
      `${
        import.meta.env.VITE_API_URL || "http://localhost:3000"
      }/api/users/${consultantId}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
        credentials: "include",
      }
    );

    if (!response.ok) {
      const errorData = await response.text();
      let errorMessage = `Failed to delete consultant (${response.status})`;

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
    console.error("Error deleting consultant:", error);
    throw error;
  }
}
