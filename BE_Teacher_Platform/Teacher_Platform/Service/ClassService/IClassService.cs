using BusinessObject;
using BusinessObject.Dtos;
using BusinessObject.Dtos.Teacher;

namespace Service.ClassService
{
    public interface IClassService
    {
        Task<List<ClassResponse>> GetAllByTeacherAsync(int teacherId);
        Task<ClassResponse?> GetByIdAsync(int classId, int teacherId);
        Task<ClassResponse> CreateAsync(int teacherId, CreateClassRequest request);
        Task<ClassResponse?> UpdateAsync(int classId, int teacherId, UpdateClassRequest request);
        Task<bool> DeleteAsync(int classId, int teacherId);
        Task<ClassStatsResponse?> GetClassStatsAsync(int classId, int teacherId);
        Task<List<StudentSearchResult>> SearchStudentsAsync(int classId, int teacherId, string query);
        Task<EnrollStudentsResponse?> EnrollStudentsAsync(int classId, int teacherId, List<int> studentIds);
        Task<List<EnrolledStudentResponse>?> GetEnrolledStudentsAsync(int classId, int teacherId);
        Task<bool> RemoveStudentAsync(int classId, int teacherId, int studentId);
        Task<List<ClassGradingItemResponse>?> GetClassGradingItemsAsync(int classId, int teacherId);
        Task<PagedResults<ClassGradingItemResponse>> GetPaginatedGradingItemsAsync(int teacherId, int? classId, string timeFilter, DateTime? customStart, DateTime? customEnd, bool isStarredOnly, string taskTypeFilter, string gradingModeFilter, string sortOrder, int page, int pageSize, bool sampleOnly);
        Task<bool> UpsertTeacherGradingStarAsync(int taskHistoryId, int teacherId, int classId, bool isStarred);
        Task<bool> SetGradingModeAsync(int taskHistoryId, int teacherId, string mode);
        Task<bool> HideGradingItemAsync(int teacherId, int classId, int taskHistoryId);
        Task<bool> UpdateTaskReviewStatusAsync(int taskHistoryId, int teacherId, string reviewStatus, string? reviewComment);
        Task<TeacherAiScoreSnapshotResponse?> GetTeacherAiScoreSnapshotAsync(int taskHistoryId, int teacherId);
        Task<bool> SubmitAiRatingAsync(int teacherId, int taskHistoryId, int aiFeedbackRating, int teacherConfidenceRating);
        Task<ClassGradingItemResponse?> UpdateClassGradingEvaluationAsync(int classId, int taskHistoryId, int teacherId, string targetTaskType, EvaluationDataDto evaluationData);
        Task<ClassChartDataResponse?> GetClassChartDataAsync(int classId, int teacherId);
        Task<BusinessObject.Dtos.TaskHistory.TaskHistoryDetailResponse?> GetTaskHistoryDetailAsync(int taskHistoryId, int teacherId);
    }
}
