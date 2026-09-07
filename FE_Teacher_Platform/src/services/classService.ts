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
  message: string;
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
    const res = await fetch(API_BASE_URL, { headers: authHelper.getAuthHeaders() });
    if (!res.ok) throw new Error(((await res.json()) as ErrorResponse).message || 'Failed to fetch classes');
    return res.json();
  },

  /** GET /api/Class/:id */
  async getClassDetail(classId: number): Promise<ClassResponse> {
    const res = await fetch(`${API_BASE_URL}/${classId}`, { headers: authHelper.getAuthHeaders() });
    if (!res.ok) throw new Error(((await res.json()) as ErrorResponse).message || 'Failed to fetch class detail');
    return res.json();
  },

  /** POST /api/Class */
  async createClass(data: CreateClassRequest): Promise<ClassResponse> {
    const res = await fetch(API_BASE_URL, {
      method: 'POST',
      headers: authHelper.getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(((await res.json()) as ErrorResponse).message || 'Failed to create class');
    return res.json();
  },

  /** PUT /api/Class/:id */
  async updateClass(classId: number, data: UpdateClassRequest): Promise<ClassResponse> {
    const res = await fetch(`${API_BASE_URL}/${classId}`, {
      method: 'PUT',
      headers: authHelper.getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(((await res.json()) as ErrorResponse).message || 'Failed to update class');
    return res.json();
  },

  /** DELETE /api/Class/:id */
  async deleteClass(classId: number): Promise<void> {
    const res = await fetch(`${API_BASE_URL}/${classId}`, {
      method: 'DELETE',
      headers: authHelper.getAuthHeaders(),
    });
    if (!res.ok) throw new Error(((await res.json()) as ErrorResponse).message || 'Failed to delete class');
  },

  /** GET /api/Class/:id/stats */
  async getClassStats(classId: number): Promise<ClassStatsResponse> {
    const res = await fetch(`${API_BASE_URL}/${classId}/stats`, { headers: authHelper.getAuthHeaders() });
    if (!res.ok) throw new Error(((await res.json()) as ErrorResponse).message || 'Failed to fetch class stats');
    return res.json();
  },

  /** GET /api/Class/:classId/search-students */
  async searchStudents(classId: number, query: string): Promise<StudentSearchResult[]> {
    if (query.trim().length < 2) return [];
    const res = await fetch(
      `${API_BASE_URL}/${classId}/search-students?query=${encodeURIComponent(query)}`,
      { headers: authHelper.getAuthHeaders() },
    );
    if (!res.ok) throw new Error(((await res.json()) as ErrorResponse).message || 'Search failed');
    return res.json();
  },

  /** POST /api/Class/:classId/enroll */
  async enrollStudents(classId: number, studentIds: number[]): Promise<EnrollStudentsResponse> {
    const res = await fetch(`${API_BASE_URL}/${classId}/enroll`, {
      method: 'POST',
      headers: authHelper.getAuthHeaders(),
      body: JSON.stringify({ studentIds }),
    });
    if (!res.ok) throw new Error(((await res.json()) as ErrorResponse).message || 'Enroll failed');
    return res.json();
  },

  /** GET /api/Class/:classId/students */
  async getEnrolledStudents(classId: number): Promise<EnrolledStudent[]> {
    const res = await fetch(`${API_BASE_URL}/${classId}/students`, { headers: authHelper.getAuthHeaders() });
    if (!res.ok) throw new Error(((await res.json()) as ErrorResponse).message || 'Failed to fetch students');
    return res.json();
  },

  /** DELETE /api/Class/:classId/students/:studentId */
  async removeStudent(classId: number, studentId: number): Promise<void> {
    const res = await fetch(`${API_BASE_URL}/${classId}/students/${studentId}`, {
      method: 'DELETE',
      headers: authHelper.getAuthHeaders(),
    });
    if (!res.ok) throw new Error(((await res.json()) as ErrorResponse).message || 'Failed to remove student');
  },

  /** GET /api/Class/:classId/grading-items */
  async getClassGradingItems(classId: number): Promise<ClassGradingItem[]> {
    const res = await fetch(`${API_BASE_URL}/${classId}/grading-items`, { headers: authHelper.getAuthHeaders() });
    if (!res.ok) throw new Error(((await res.json()) as ErrorResponse).message || 'Failed to fetch grading items');
    return res.json();
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

    const res = await fetch(`${API_BASE_URL}/all-grading-items?${sp.toString()}`, {
      headers: authHelper.getAuthHeaders(),
    });
    if (!res.ok) throw new Error(((await res.json()) as ErrorResponse).message || 'Failed to fetch grading items');
    return res.json();
  },

  /** PATCH /api/Class/grading-items/:taskHistoryId/grading-mode */
  async setGradingMode(taskHistoryId: number, gradingMode: 'ai' | 'self'): Promise<void> {
    const res = await fetch(`${API_BASE_URL}/grading-items/${taskHistoryId}/grading-mode`, {
      method: 'PATCH',
      headers: authHelper.getAuthHeaders(),
      body: JSON.stringify({ gradingMode }),
    });
    if (!res.ok) throw new Error('Failed to set grading mode');
  },

  /** PATCH /api/Class/:classId/grading-items/:taskHistoryId/hide */
  async hideGradingItem(classId: number, taskHistoryId: number): Promise<void> {
    const res = await fetch(`${API_BASE_URL}/${classId}/grading-items/${taskHistoryId}/hide`, {
      method: 'PATCH',
      headers: authHelper.getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to hide grading item');
  },

  /** PATCH /api/Class/:classId/grading-items/:taskHistoryId/star */
  async toggleTeacherGradingStar(
    classId: number,
    taskHistoryId: number,
    isStarred: boolean,
  ): Promise<{ taskHistoryId: number; isStarred: boolean }> {
    const res = await fetch(`${API_BASE_URL}/${classId}/grading-items/${taskHistoryId}/star`, {
      method: 'PATCH',
      headers: authHelper.getAuthHeaders(),
      body: JSON.stringify({ isStarred }),
    });
    if (!res.ok) throw new Error(((await res.json()) as ErrorResponse).message || 'Failed to update star');
    return res.json();
  },

  /** PATCH /api/Class/:classId/grading-items/:taskHistoryId/evaluation */
  async updateTeacherGradingEvaluation(
    classId: number,
    taskHistoryId: number,
    targetTaskType: 'task1' | 'task2',
    evaluationData: TeacherEvaluationPayload,
  ): Promise<ClassGradingItem> {
    const res = await fetch(`${API_BASE_URL}/${classId}/grading-items/${taskHistoryId}/evaluation`, {
      method: 'PATCH',
      headers: authHelper.getAuthHeaders(),
      body: JSON.stringify({ targetTaskType, evaluationData }),
    });
    if (!res.ok) throw new Error(((await res.json()) as ErrorResponse).message || 'Failed to update evaluation');
    return res.json();
  },

  /** GET /api/Class/:classId/chart-data */
  async getChartData(classId: number): Promise<ClassChartDataResponse> {
    const res = await fetch(`${API_BASE_URL}/${classId}/chart-data`, { headers: authHelper.getAuthHeaders() });
    if (!res.ok) throw new Error(((await res.json()) as ErrorResponse).message || 'Failed to fetch chart data');
    return res.json();
  },

  /** POST /api/Class/grading-items/:taskHistoryId/ai-rating */
  async submitAiRating(
    taskHistoryId: number,
    data: { aiFeedbackRating: number; teacherConfidenceRating: number },
  ): Promise<void> {
    const res = await fetch(`${API_BASE_URL}/grading-items/${taskHistoryId}/ai-rating`, {
      method: 'POST',
      headers: authHelper.getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to submit AI rating');
  },

  /** GET /api/TaskHistory/:taskHistoryId/detail */
  async getTaskHistoryDetail(taskHistoryId: number): Promise<TaskHistoryDetail> {
    const res = await fetch(`${import.meta.env.VITE_BACKEND}/api/TaskHistory/${taskHistoryId}/detail`, {
      headers: authHelper.getAuthHeaders(),
    });
    if (!res.ok) {
      const raw = await res.text();
      try {
        const parsed = raw ? (JSON.parse(raw) as ErrorResponse) : null;
        throw new Error(parsed?.message || `Failed to fetch task history detail (HTTP ${res.status})`);
      } catch {
        throw new Error(`Failed to fetch task history detail (HTTP ${res.status})`);
      }
    }
    return res.json();
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
