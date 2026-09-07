using BusinessObject;
using BusinessObject.Dtos;
using BusinessObject.Dtos.Teacher;

namespace Repository.ClassRepo
{
    public interface IClassRepository
    {
        Task<List<Classroom>> GetAllByTeacherAsync(int teacherId);
        Task<Classroom?> GetByIdAsync(int classId);
        Task<Classroom> CreateAsync(Classroom classroom);
        Task<Classroom> UpdateAsync(Classroom classroom);
        Task DeleteAsync(int classId);
        Task<List<ClassEnrollment>> GetActiveEnrollmentsAsync(int classId);
        Task<ClassEnrollment?> GetEnrollmentAsync(int classId, int studentId);
        Task<ClassEnrollment> AddEnrollmentAsync(ClassEnrollment enrollment);
        Task UpdateEnrollmentAsync(ClassEnrollment enrollment);
        Task<int> GetEnrollmentCountAsync(int classId);
        Task<ClassStatsRawData> GetClassStatsRawAsync(int classId);
        Task<List<StudentSearchResult>> SearchStudentsAsync(int classId, string query);
        Task<(int enrolled, int alreadyIn)> EnrollStudentsAsync(int classId, List<int> studentIds);
        Task<List<EnrolledStudentResponse>> GetEnrolledStudentsAsync(int classId);
        Task<bool> RemoveStudentAsync(int classId, int studentId);
        Task<bool> IsTaskHistoryInClassAsync(int classId, int taskHistoryId);
        Task<HashSet<int>> GetTeacherStarredTaskHistoryIdsAsync(int teacherId, int classId);
        Task<List<ClassGradingItemResponse>> GetClassGradingItemsAsync(int classId);
        Task<PagedResults<ClassGradingItemResponse>> GetPaginatedGradingItemsAsync(int? teacherId, int? classId, string timeFilter, DateTime? customStart, DateTime? customEnd, bool isStarredOnly, string taskTypeFilter, string gradingModeFilter, string sortOrder, int page, int pageSize, bool sampleOnly);
        Task UpsertTeacherGradingStarAsync(int teacherId, int classId, int taskHistoryId, bool isStarred);
        Task<bool> SetGradingModeAsync(int taskHistoryId, int teacherId, string mode);
        Task<bool> HideGradingItemAsync(int teacherId, int classId, int taskHistoryId);
        Task<bool> UpdateTaskReviewStatusAsync(int taskHistoryId, int reviewerId, int? teacherScopeId, string reviewStatus, string? reviewComment);
        Task<TeacherAiScoreSnapshotResponse?> GetTeacherAiScoreSnapshotAsync(int taskHistoryId, int? teacherId);
        Task SubmitAiRatingAsync(int teacherId, int taskHistoryId, int aiFeedbackRating, int teacherConfidenceRating);
        Task<ClassGradingItemResponse?> UpdateClassGradingEvaluationAsync(int classId, int taskHistoryId, int teacherId, string targetTaskType, EvaluationDataDto evaluationData);
        Task<ClassChartRawData> GetChartRawDataAsync(int classId, DateTime classStartDate);
        Task<TaskHistory?> GetTaskHistoryDetailAsync(int taskHistoryId);
        Task<List<WritingEvaluation>> GetEvaluationsForTaskHistoryAsync(int? task1Id, int? task2Id);
        Task<(int? classId, string className)> GetClassInfoForTaskHistoryAsync(int studentId);
        Task<bool> IsStarredForTeacherAsync(int taskHistoryId, int teacherId);
        Task<(int? fbScore, int? confidenceScore)> GetLatestRatingAsync(int taskHistoryId, int teacherId);
    }
}
