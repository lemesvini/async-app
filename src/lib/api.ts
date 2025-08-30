const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

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

class ApiClient {
  private baseUrl: string;
  private accessToken: string | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
    // Try to get token from localStorage
    this.accessToken = localStorage.getItem('accessToken');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}/${endpoint}`;
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    // Add authorization header if token exists
    if (this.accessToken) {
      headers['Authorization'] = `Bearer ${this.accessToken}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
      credentials: 'include', // Include cookies for refresh token
    });

    if (!response.ok) {
      const errorData: ApiError = await response.json();
      throw new Error(errorData.message || 'API request failed');
    }

    return response.json();
  }

  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await this.request<LoginResponse>('api/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });

    // Store access token
    this.accessToken = response.accessToken;
    localStorage.setItem('accessToken', response.accessToken);
    
    // Store user data
    localStorage.setItem('user', JSON.stringify(response.user));

    return response;
  }

  async logout(): Promise<void> {
    try {
      await this.request('api/auth/logout', {
        method: 'POST',
      });
    } finally {
      // Clear local storage regardless of API response
      this.accessToken = null;
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
    }
  }

  async getMe() {
    return this.request('api/auth/me');
  }

  async refreshToken() {
    try {
      const response = await this.request<{ accessToken: string }>('api/auth/refresh', {
        method: 'POST',
      });
      
      this.accessToken = response.accessToken;
      localStorage.setItem('accessToken', response.accessToken);
      
      return response;
    } catch (error) {
      // If refresh fails, clear tokens
      this.accessToken = null;
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
      throw error;
    }
  }

  getStoredUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }

  isAuthenticated(): boolean {
    return !!this.accessToken;
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
export type { LoginRequest, LoginResponse, ApiError };
