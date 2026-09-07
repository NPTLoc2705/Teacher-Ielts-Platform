// ── Auth Helper ────────────────────────────────────────────────────────────────
// Manages JWT token storage and retrieval

const TOKEN_KEY = 'auth_token';

export const authHelper = {
  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  },

  setToken(token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
  },

  removeToken(): void {
    localStorage.removeItem(TOKEN_KEY);
  },

  getAuthHeaders(): Record<string, string> {
    const token = this.getToken();
    if (!token) throw new Error('No authentication token found');
    return {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  },
};
