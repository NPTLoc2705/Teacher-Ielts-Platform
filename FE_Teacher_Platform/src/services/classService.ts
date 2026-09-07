import { authHelper } from '../lib/auth';
import type {
  ClassResponse,
  CreateClassRequest,
  UpdateClassRequest,
  StudentSearchResult,
  EnrollStudentsResponse,
  EnrolledStudent,
  ClassGradingItem,
  ClassStatsResponse,
  ClassChartDataResponse,
  TaskHistoryDetail,
  TeacherEvaluationPayload,
} from '../types/class';

const API_BASE_URL = `${import.meta.env.VITE_BACKEND}/api/Class`;

interface ErrorResponse {
  message?: string;
  error?: string;
}

async function requestJson<T>(url: string, init?: RequestInit, fallbackError = 'Request failed'): Promise<T> {
  const res = await fetch(url, init);
  if (!res.ok) {
    let message = fallbackError;
    try {
      const text = await res.text();
      if (text) {
        const parsed = JSON.parse(text) as ErrorResponse;
        message = parsed.message || parsed.error || fallbackError;
      } else if (res.status === 401) {
        authHelper.removeToken();
        message = 'Phiên đăng nhập đã hết hạn hoặc không hợp lệ. Vui lòng đăng nhập lại.';
      } else if (res.status === 403) {
        message = 'Tài khoản không có quyền thực hiện thao tác này.';
      } else {
        message = `${fallbackError} (HTTP ${res.status})`;
      }
    } catch {
      message = `${fallbackError} (HTTP ${res.status})`;
    }
    throw new Error(message);
  }
  return res.json();
}

async function requestVoid(url: string, init?: RequestInit, fallbackError = 'Request failed'): Promise<void> {
  const res = await fetch(url, init);
  if (!res.ok) {
    let message = fallbackError;
    try {
      const text = await res.text();
      if (text) {
        const parsed = JSON.parse(text) as ErrorResponse;
        message = parsed.message || parsed.error || fallbackError;
      } else if (res.status === 401) {
        authHelper.removeToken();
        message = 'Phiên đăng nhập đã hết hạn hoặc không hợp lệ. Vui lòng đăng nhập lại.';
      } else if (res.status === 403) {
        message = 'Tài khoản không có quyền thực hiện thao tác này.';
      } else {
        message = `${fallbackError} (HTTP ${res.status})`;
      }
    } catch {
      message = `${fallbackError} (HTTP ${res.status})`;
    }
    throw new Error(message);
  }
}

/** Convert yyyy-MM-dd to ISO string for the BE */
export const toISODate = (dateStr: string): string => new Date(dateStr).toISOString();

/** Format an ISO date string to dd/MM/yyyy for display */
export const formatDisplayDate = (isoStr: string): string => {
  const d = new Date(isoStr);
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
};

/** Convert ClassResponse to ClassItem shape for pages */
export const mapToClassItem = (cls: ClassResponse) => ({
  id: String(cls.id),
  name: cls.className,
  level: String(cls.currentLevel),
  target: String(cls.targetLevel),
  description: cls.description ?? '',
  students: cls.studentCount ?? 0,
  sessions: cls.numberOfLessons === 0 ? 'Chua thiet lap so buoi' : cls.numberOfLessons,
  startDate: cls.startDate.split('T')[0],
  endDate: cls.endDate.split('T')[0],
});

export const classService = {
  /** GET /api/Class — All classes for the current teacher */
  async getMyClasses(): Promise<ClassResponse[]> {
    return requestJson<ClassResponse[]>(API_BASE_URL, { headers: authHelper.getAuthHeaders() }, 'Failed to fetch classes');
  },

  /** GET /api/Class/:id */
  async getClassDetail(classId: number): Promise<ClassResponse> {
    return requestJson<ClassResponse>(`${API_BASE_URL}/${classId}`, { headers: authHelper.getAuthHeaders() }, 'Failed to fetch class detail');
  },

  /** POST /api/Class */
  async createClass(data: CreateClassRequest): Promise<ClassResponse> {
    return requestJson<ClassResponse>(API_BASE_URL, {
      method: 'POST',
      headers: authHelper.getAuthHeaders(),
      body: JSON.stringify(data),
    }, 'Failed to create class');
  },

  /** PUT /api/Class/:id */
  async updateClass(classId: number, data: UpdateClassRequest): Promise<ClassResponse> {
    return requestJson<ClassResponse>(`${API_BASE_URL}/${classId}`, {
      method: 'PUT',
      headers: authHelper.getAuthHeaders(),
      body: JSON.stringify(data),
    }, 'Failed to update class');
  },

  /** DELETE /api/Class/:id */
  async deleteClass(classId: number): Promise<void> {
    return requestVoid(`${API_BASE_URL}/${classId}`, {
      method: 'DELETE',
      headers: authHelper.getAuthHeaders(),
    }, 'Failed to delete class');
  },

  /** GET /api/Class/:id/stats */
  async getClassStats(classId: number): Promise<ClassStatsResponse> {
    return requestJson<ClassStatsResponse>(`${API_BASE_URL}/${classId}/stats`, { headers: authHelper.getAuthHeaders() }, 'Failed to fetch class stats');
  },

  /** GET /api/Class/:classId/search-students */
  async searchStudents(classId: number, query: string): Promise<StudentSearchResult[]> {
    if (query.trim().length < 2) return [];
    return requestJson<StudentSearchResult[]>(
      `${API_BASE_URL}/${classId}/search-students?query=${encodeURIComponent(query)}`,
      { headers: authHelper.getAuthHeaders() },
      'Search failed'
    );
  },

  /** POST /api/Class/:classId/enroll */
  async enrollStudents(classId: number, studentIds: number[]): Promise<EnrollStudentsResponse> {
    return requestJson<EnrollStudentsResponse>(`${API_BASE_URL}/${classId}/enroll`, {
      method: 'POST',
      headers: authHelper.getAuthHeaders(),
      body: JSON.stringify({ studentIds }),
    }, 'Enroll failed');
  },

  /** GET /api/Class/:classId/students */
  async getEnrolledStudents(classId: number): Promise<EnrolledStudent[]> {
    return requestJson<EnrolledStudent[]>(`${API_BASE_URL}/${classId}/students`, { headers: authHelper.getAuthHeaders() }, 'Failed to fetch students');
  },

  /** DELETE /api/Class/:classId/students/:studentId */
  async removeStudent(classId: number, studentId: number): Promise<void> {
    return requestVoid(`${API_BASE_URL}/${classId}/students/${studentId}`, {
      method: 'DELETE',
      headers: authHelper.getAuthHeaders(),
    }, 'Failed to remove student');
  },

  /** GET /api/Class/:classId/grading-items */
  async getClassGradingItems(classId: number): Promise<ClassGradingItem[]> {
    return requestJson<ClassGradingItem[]>(`${API_BASE_URL}/${classId}/grading-items`, { headers: authHelper.getAuthHeaders() }, 'Failed to fetch grading items');
  },

  /** GET /api/Class/all-grading-items */
  async getAllGradingItems(params: {
    classId?: number;
    timeFilter?: string;
    customStart?: string;
    customEnd?: string;
    isStarredOnly?: boolean;
    taskTypeFilter?: string;
    gradingModeFilter?: string;
    sortOrder?: string;
    page?: number;
    pageSize?: number;
  }): Promise<{ items: ClassGradingItem[]; totalCount: number; totalPages: number }> {
    const sp = new URLSearchParams();
    if (params.classId) sp.set('classId', params.classId.toString());
    if (params.timeFilter) sp.set('timeFilter', params.timeFilter);
    if (params.customStart) sp.set('customStart', params.customStart);
    if (params.customEnd) sp.set('customEnd', params.customEnd);
    if (params.isStarredOnly) sp.set('isStarredOnly', params.isStarredOnly.toString());
    if (params.taskTypeFilter) sp.set('taskTypeFilter', params.taskTypeFilter);
    if (params.gradingModeFilter) sp.set('gradingModeFilter', params.gradingModeFilter);
    if (params.sortOrder) sp.set('sortOrder', params.sortOrder);
    if (params.page) sp.set('page', params.page.toString());
    if (params.pageSize) sp.set('pageSize', params.pageSize.toString());

    return requestJson<{ items: ClassGradingItem[]; totalCount: number; totalPages: number }>(
      `${API_BASE_URL}/all-grading-items?${sp.toString()}`,
      { headers: authHelper.getAuthHeaders() },
      'Failed to fetch grading items'
    );
  },

  /** PATCH /api/Class/grading-items/:taskHistoryId/grading-mode */
  async setGradingMode(taskHistoryId: number, gradingMode: 'ai' | 'self'): Promise<void> {
    return requestVoid(`${API_BASE_URL}/grading-items/${taskHistoryId}/grading-mode`, {
      method: 'PATCH',
      headers: authHelper.getAuthHeaders(),
      body: JSON.stringify({ gradingMode }),
    }, 'Failed to set grading mode');
  },

  /** PATCH /api/Class/:classId/grading-items/:taskHistoryId/hide */
  async hideGradingItem(classId: number, taskHistoryId: number): Promise<void> {
    return requestVoid(`${API_BASE_URL}/${classId}/grading-items/${taskHistoryId}/hide`, {
      method: 'PATCH',
      headers: authHelper.getAuthHeaders(),
    }, 'Failed to hide grading item');
  },

  /** PATCH /api/Class/:classId/grading-items/:taskHistoryId/star */
  async toggleTeacherGradingStar(
    classId: number,
    taskHistoryId: number,
    isStarred: boolean,
  ): Promise<{ taskHistoryId: number; isStarred: boolean }> {
    return requestJson<{ taskHistoryId: number; isStarred: boolean }>(
      `${API_BASE_URL}/${classId}/grading-items/${taskHistoryId}/star`,
      {
        method: 'PATCH',
        headers: authHelper.getAuthHeaders(),
        body: JSON.stringify({ isStarred }),
      },
      'Failed to update star'
    );
  },

  /** PATCH /api/Class/:classId/grading-items/:taskHistoryId/evaluation */
  async updateTeacherGradingEvaluation(
    classId: number,
    taskHistoryId: number,
    targetTaskType: 'task1' | 'task2',
    evaluationData: TeacherEvaluationPayload,
  ): Promise<ClassGradingItem> {
    return requestJson<ClassGradingItem>(
      `${API_BASE_URL}/${classId}/grading-items/${taskHistoryId}/evaluation`,
      {
        method: 'PATCH',
        headers: authHelper.getAuthHeaders(),
        body: JSON.stringify({ targetTaskType, evaluationData }),
      },
      'Failed to update evaluation'
    );
  },

  /** GET /api/Class/:classId/chart-data */
  async getChartData(classId: number): Promise<ClassChartDataResponse> {
    return requestJson<ClassChartDataResponse>(`${API_BASE_URL}/${classId}/chart-data`, { headers: authHelper.getAuthHeaders() }, 'Failed to fetch chart data');
  },

  /** POST /api/Class/grading-items/:taskHistoryId/ai-rating */
  async submitAiRating(
    taskHistoryId: number,
    data: { aiFeedbackRating: number; teacherConfidenceRating: number },
  ): Promise<void> {
    return requestVoid(`${API_BASE_URL}/grading-items/${taskHistoryId}/ai-rating`, {
      method: 'POST',
      headers: authHelper.getAuthHeaders(),
      body: JSON.stringify(data),
    }, 'Failed to submit AI rating');
  },

  /** GET /api/TaskHistory/:taskHistoryId/detail */
  async getTaskHistoryDetail(taskHistoryId: number): Promise<TaskHistoryDetail> {
    return requestJson<TaskHistoryDetail>(
      `${import.meta.env.VITE_BACKEND}/api/TaskHistory/${taskHistoryId}/detail`,
      { headers: authHelper.getAuthHeaders() },
      'Failed to fetch task history detail'
    );
  },
};

export const ClassService = classService;
export type {
  ClassResponse,
  CreateClassRequest,
  UpdateClassRequest,
  ClassItem,
  StudentSearchResult,
  EnrollStudentsResponse,
  EnrolledStudent,
  ClassGradingItem,
  ClassStatsResponse,
  ClassChartDataResponse,
  StudentScorePoint,
  BandBucket,
  ScoreOverTimePoint,
  TaskHistoryDetail,
} from '../types/class';
