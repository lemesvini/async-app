const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

interface LoginRequest {
  email: string;
  password: string;
}

interface LoginResponse {
  message: string;
  user: {
    id: string;
    email: string;
    fullName: string;
    role: string;
  };
  accessToken: string;
}

interface ApiError {
  error: string;
  message: string;
}

interface DashboardStats {
  totalStudents: number;
  totalConsultants: number;
  totalContents: number;
  totalClasses: number;
  activeClasses: number;
  totalEnrollments: number;
  recentEnrollments: number;
  attendanceRate: number;
  totalRevenue: number;
  monthlyRevenue: number;
  paidPayments: number;
  pendingPayments: number;
  overduePayments: number;
  recentActivity: Array<{
    id: string;
    type: string;
    description: string;
    date: string;
  }>;
}

interface Payment {
  id: string;
  studentId: string;
  classId: string | null;
  amount: number;
  description: string;
  status: "PENDING" | "PAID" | "OVERDUE" | "CANCELLED";
  dueDate: string;
  paidDate: string | null;
  referenceMonth: number;
  referenceYear: number;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  student: {
    id: string;
    fullName: string;
    email: string;
  };
  class: {
    id: string;
    name: string;
  } | null;
}

interface CreatePaymentInput {
  studentId: string;
  classId?: string;
  amount: number;
  description: string;
  dueDate: string;
  referenceMonth: number;
  referenceYear: number;
  notes?: string;
}

interface UpdatePaymentInput {
  amount?: number;
  description?: string;
  status?: "PENDING" | "PAID" | "OVERDUE" | "CANCELLED";
  dueDate?: string;
  paidDate?: string;
  referenceMonth?: number;
  referenceYear?: number;
  notes?: string;
}

interface MarkPaymentPaidInput {
  paidDate?: string;
  notes?: string;
}

interface GetPaymentsQuery {
  page?: string;
  limit?: string;
  status?: "PENDING" | "PAID" | "OVERDUE" | "CANCELLED";
  studentId?: string;
  classId?: string;
  referenceMonth?: string;
  referenceYear?: string;
  sortBy?: "dueDate" | "paidDate" | "amount" | "createdAt";
  sortOrder?: "asc" | "desc";
}

interface GetPaymentsResponse {
  payments: Payment[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface PaymentStatsResponse {
  totalPayments: number;
  paidPayments: number;
  pendingPayments: number;
  overduePayments: number;
  totalAmount: number;
  paidAmount: number;
  pendingAmount: number;
  overdueAmount: number;
}

interface BulkCreatePaymentsInput {
  classId: string;
  amount: number;
  description: string;
  dueDate: string;
  referenceMonth: number;
  referenceYear: number;
}

class ApiClient {
  private baseUrl: string;
  private accessToken: string | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
    // Try to get token from localStorage
    this.accessToken = localStorage.getItem("accessToken");
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}/${endpoint}`;

    const headers: Record<string, string> = {
      ...(options.headers as Record<string, string>),
    };

    // Only set Content-Type for requests with a body
    if (options.body) {
      headers["Content-Type"] = "application/json";
    }

    // Add authorization header if token exists
    if (this.accessToken) {
      headers["Authorization"] = `Bearer ${this.accessToken}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
      credentials: "include", // Include cookies for refresh token
    });

    if (!response.ok) {
      const errorData: ApiError = await response.json();
      throw new Error(errorData.message || "API request failed");
    }

    return response.json();
  }

  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await this.request<LoginResponse>("api/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    });

    // Store access token
    this.accessToken = response.accessToken;
    localStorage.setItem("accessToken", response.accessToken);

    // Store user data
    localStorage.setItem("user", JSON.stringify(response.user));

    return response;
  }

  async logout(): Promise<void> {
    try {
      await this.request("api/auth/logout", {
        method: "POST",
      });
    } finally {
      // Clear local storage regardless of API response
      this.accessToken = null;
      localStorage.removeItem("accessToken");
      localStorage.removeItem("user");
    }
  }

  async getMe() {
    return this.request("api/auth/me");
  }

  async refreshToken() {
    try {
      const response = await this.request<{ accessToken: string }>(
        "api/auth/refresh",
        {
          method: "POST",
        }
      );

      this.accessToken = response.accessToken;
      localStorage.setItem("accessToken", response.accessToken);

      return response;
    } catch (error) {
      // If refresh fails, clear tokens
      this.accessToken = null;
      localStorage.removeItem("accessToken");
      localStorage.removeItem("user");
      throw error;
    }
  }

  getStoredUser() {
    const userStr = localStorage.getItem("user");
    return userStr ? JSON.parse(userStr) : null;
  }

  isAuthenticated(): boolean {
    return !!this.accessToken;
  }

  // Dashboard endpoints
  async getDashboardStats(): Promise<DashboardStats> {
    return this.request<DashboardStats>("api/dashboard/stats");
  }

  // Payment endpoints
  async getPayments(query?: GetPaymentsQuery): Promise<GetPaymentsResponse> {
    const params = new URLSearchParams();
    if (query) {
      Object.entries(query).forEach(([key, value]) => {
        if (value !== undefined) {
          params.append(key, value);
        }
      });
    }
    const queryString = params.toString();
    return this.request<GetPaymentsResponse>(
      `api/payments${queryString ? `?${queryString}` : ""}`
    );
  }

  async getPayment(id: string): Promise<Payment> {
    return this.request<Payment>(`api/payments/${id}`);
  }

  async createPayment(input: CreatePaymentInput): Promise<Payment> {
    return this.request<Payment>("api/payments", {
      method: "POST",
      body: JSON.stringify(input),
    });
  }

  async updatePayment(id: string, input: UpdatePaymentInput): Promise<Payment> {
    return this.request<Payment>(`api/payments/${id}`, {
      method: "PUT",
      body: JSON.stringify(input),
    });
  }

  async deletePayment(id: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`api/payments/${id}`, {
      method: "DELETE",
    });
  }

  async markPaymentAsPaid(
    id: string,
    input?: MarkPaymentPaidInput
  ): Promise<Payment> {
    return this.request<Payment>(`api/payments/${id}/pay`, {
      method: "PATCH",
      body: JSON.stringify(input || {}),
    });
  }

  async getPaymentStats(): Promise<PaymentStatsResponse> {
    return this.request<PaymentStatsResponse>("api/payments/stats");
  }

  async createBulkPayments(input: BulkCreatePaymentsInput): Promise<{
    message: string;
    paymentsCreated: number;
    studentsAffected: Array<{ id: string; name: string; email: string }>;
  }> {
    return this.request("api/payments/bulk", {
      method: "POST",
      body: JSON.stringify(input),
    });
  }

  async getStudentPayments(
    studentId: string,
    query?: GetPaymentsQuery
  ): Promise<GetPaymentsResponse> {
    const params = new URLSearchParams();
    if (query) {
      Object.entries(query).forEach(([key, value]) => {
        if (value !== undefined) {
          params.append(key, value);
        }
      });
    }
    const queryString = params.toString();
    return this.request<GetPaymentsResponse>(
      `api/payments/student/${studentId}${queryString ? `?${queryString}` : ""}`
    );
  }

  // User endpoints
  async getUsers(query?: {
    role?: string;
    page?: string;
    limit?: string;
    search?: string;
  }): Promise<{
    users: Array<{ id: string; fullName: string; email: string; role: string }>;
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const params = new URLSearchParams();
    if (query) {
      Object.entries(query).forEach(([key, value]) => {
        if (value !== undefined) {
          params.append(key, value);
        }
      });
    }
    const queryString = params.toString();
    return this.request(`api/users${queryString ? `?${queryString}` : ""}`);
  }

  // Class endpoints
  async getClasses(): Promise<{
    classes: Array<{ id: string; name: string; isActive: boolean }>;
  }> {
    return this.request("api/classes");
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
export type {
  LoginRequest,
  LoginResponse,
  ApiError,
  DashboardStats,
  Payment,
  CreatePaymentInput,
  UpdatePaymentInput,
  MarkPaymentPaidInput,
  GetPaymentsQuery,
  GetPaymentsResponse,
  PaymentStatsResponse,
  BulkCreatePaymentsInput,
};
