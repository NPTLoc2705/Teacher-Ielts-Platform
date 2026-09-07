import { authHelper } from '../lib/auth';

const API_BASE_URL = `${import.meta.env.VITE_BACKEND}/api/Auth`;

export interface UserInfo {
  id: number;
  username: string;
  email: string;
  role: string;
  name?: string;
  displayName?: string | null;
}

export interface LoginResponse {
  message: string;
  token: string;
  refreshToken: string;
  refreshTokenExpiresAt: string;
  user: UserInfo;
}

interface ErrorResponse {
  message: string;
}

export const HARDCODED_TEACHER_CREDENTIALS = {
  email: 'teacher@wispace.edu.vn',
  password: 'teacher123',
};

export const HARDCODED_TEACHER_USER: UserInfo = {
  id: 1,
  username: 'teacher_demo',
  email: HARDCODED_TEACHER_CREDENTIALS.email,
  role: 'Teacher',
  name: 'Teacher Demo',
  displayName: 'Teacher Demo',
};

const MOCK_TOKEN = 'mock-teacher-jwt-token';

export const authService = {
  async login(email: string, password: string): Promise<LoginResponse> {
    // Check if hardcoded teacher account is used
    if (
      email.trim().toLowerCase() === HARDCODED_TEACHER_CREDENTIALS.email.toLowerCase() &&
      password === HARDCODED_TEACHER_CREDENTIALS.password
    ) {
      const mockResponse: LoginResponse = {
        message: 'Đăng nhập thành công với tài khoản mẫu',
        token: MOCK_TOKEN,
        refreshToken: 'mock-refresh-token',
        refreshTokenExpiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        user: HARDCODED_TEACHER_USER,
      };
      authHelper.setToken(mockResponse.token);
      return mockResponse;
    }

    const res = await fetch(`${API_BASE_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const err = (await res.json()) as ErrorResponse;
      throw new Error(err.message || 'Login failed');
    }
    const data = (await res.json()) as LoginResponse;
    authHelper.setToken(data.token);
    return data;
  },

  async getProfile(): Promise<UserInfo> {
    const token = authHelper.getToken();
    if (token === MOCK_TOKEN) {
      return HARDCODED_TEACHER_USER;
    }

    const res = await fetch(`${API_BASE_URL}/profile`, {
      headers: authHelper.getAuthHeaders(),
    });
    if (!res.ok) {
      const err = (await res.json()) as ErrorResponse;
      throw new Error(err.message || 'Failed to get profile');
    }
    return res.json();
  },

  logout(): void {
    authHelper.removeToken();
  },

  isLoggedIn(): boolean {
    return !!authHelper.getToken();
  },
};
