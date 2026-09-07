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

export interface RegisterRequest {
  email: string;
  username: string;
  password: string;
  displayName?: string;
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

export const authService = {
  async login(email: string, password: string): Promise<LoginResponse> {
    const res = await fetch(`${API_BASE_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      let message = 'Đăng nhập thất bại';
      try {
        const text = await res.text();
        if (text) {
          const err = JSON.parse(text) as ErrorResponse;
          message = err.message || message;
        } else if (res.status === 401) {
          message = 'Email hoặc mật khẩu không chính xác';
        } else if (res.status === 403) {
          message = 'Tài khoản không có quyền truy cập hệ thống giáo viên';
        }
      } catch {
        message = `Đăng nhập thất bại (${res.status})`;
      }
      throw new Error(message);
    }

    const data = (await res.json()) as LoginResponse;
    authHelper.setToken(data.token);
    return data;
  },

  async register(data: RegisterRequest): Promise<LoginResponse> {
    const res = await fetch(`${API_BASE_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      let message = 'Đăng ký thất bại';
      try {
        const text = await res.text();
        if (text) {
          const err = JSON.parse(text) as ErrorResponse;
          message = err.message || message;
        } else if (res.status === 409) {
          message = 'Email hoặc tên đăng nhập đã được sử dụng';
        } else if (res.status === 400) {
          message = 'Thông tin đăng ký không hợp lệ';
        }
      } catch {
        message = `Đăng ký thất bại (${res.status})`;
      }
      throw new Error(message);
    }

    const result = (await res.json()) as LoginResponse;
    authHelper.setToken(result.token);
    return result;
  },

  async getProfile(): Promise<UserInfo> {
    const token = authHelper.getToken();
    // Invalidate stale mock tokens from previous runs
    if (token === 'mock-teacher-jwt-token') {
      authHelper.removeToken();
      throw new Error('Token không hợp lệ, vui lòng đăng nhập lại');
    }

    const res = await fetch(`${API_BASE_URL}/profile`, {
      headers: authHelper.getAuthHeaders(),
    });

    if (!res.ok) {
      let message = 'Không thể lấy thông tin người dùng';
      try {
        const text = await res.text();
        if (text) {
          const err = JSON.parse(text) as ErrorResponse;
          message = err.message || message;
        } else if (res.status === 401) {
          authHelper.removeToken();
          message = 'Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại';
        }
      } catch {
        message = `Không thể lấy thông tin người dùng (${res.status})`;
      }
      throw new Error(message);
    }

    return res.json();
  },

  logout(): void {
    authHelper.removeToken();
  },

  isLoggedIn(): boolean {
    const token = authHelper.getToken();
    if (token === 'mock-teacher-jwt-token') {
      authHelper.removeToken();
      return false;
    }
    return !!token;
  },
};
