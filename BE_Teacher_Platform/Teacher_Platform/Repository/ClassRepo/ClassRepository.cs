using BusinessObject;
using BusinessObject.Dtos;
using BusinessObject.Dtos.Teacher;
using DAL;

namespace Repository.ClassRepo
{
    public class ClassRepository : IClassRepository
    {
        private readonly ClassDAL _dal;
        public ClassRepository(ClassDAL dal) { _dal = dal; }

        public Task<List<Classroom>> GetAllByTeacherAsync(int teacherId) => _dal.GetAllByTeacherAsync(teacherId);
        public Task<Classroom?> GetByIdAsync(int classId) => _dal.GetByIdAsync(classId);
        public Task<Classroom> CreateAsync(Classroom classroom) => _dal.CreateAsync(classroom);
        public Task<Classroom> UpdateAsync(Classroom classroom) => _dal.UpdateAsync(classroom);
        public Task DeleteAsync(int classId) => _dal.DeleteAsync(classId);
        public Task<List<ClassEnrollment>> GetActiveEnrollmentsAsync(int classId) => _dal.GetActiveEnrollmentsAsync(classId);
        public Task<ClassEnrollment?> GetEnrollmentAsync(int classId, int studentId) => _dal.GetEnrollmentAsync(classId, studentId);
        public Task<ClassEnrollment> AddEnrollmentAsync(ClassEnrollment enrollment) => _dal.AddEnrollmentAsync(enrollment);
        public Task UpdateEnrollmentAsync(ClassEnrollment enrollment) => _dal.UpdateEnrollmentAsync(enrollment);
        public Task<int> GetEnrollmentCountAsync(int classId) => _dal.GetEnrollmentCountAsync(classId);
        public Task<ClassStatsRawData> GetClassStatsRawAsync(int classId) => _dal.GetClassStatsRawAsync(classId);
        public Task<List<StudentSearchResult>> SearchStudentsAsync(int classId, string query) => _dal.SearchStudentsAsync(classId, query);
        public Task<(int enrolled, int alreadyIn)> EnrollStudentsAsync(int classId, List<int> studentIds) => _dal.EnrollStudentsAsync(classId, studentIds);
        public Task<List<EnrolledStudentResponse>> GetEnrolledStudentsAsync(int classId) => _dal.GetEnrolledStudentsAsync(classId);
        public Task<bool> RemoveStudentAsync(int classId, int studentId) => _dal.RemoveStudentAsync(classId, studentId);
        public Task<bool> IsTaskHistoryInClassAsync(int classId, int taskHistoryId) => _dal.IsTaskHistoryInClassAsync(classId, taskHistoryId);
        public Task<HashSet<int>> GetTeacherStarredTaskHistoryIdsAsync(int teacherId, int classId) => _dal.GetTeacherStarredTaskHistoryIdsAsync(teacherId, classId);
        public Task<List<ClassGradingItemResponse>> GetClassGradingItemsAsync(int classId) => _dal.GetClassGradingItemsAsync(classId);
        public Task<PagedResults<ClassGradingItemResponse>> GetPaginatedGradingItemsAsync(int? teacherId, int? classId, string timeFilter, DateTime? customStart, DateTime? customEnd, bool isStarredOnly, string taskTypeFilter, string gradingModeFilter, string sortOrder, int page, int pageSize, bool sampleOnly) => _dal.GetPaginatedGradingItemsAsync(teacherId, classId, timeFilter, customStart, customEnd, isStarredOnly, taskTypeFilter, gradingModeFilter, sortOrder, page, pageSize, sampleOnly);
        public Task UpsertTeacherGradingStarAsync(int teacherId, int classId, int taskHistoryId, bool isStarred) => _dal.UpsertTeacherGradingStarAsync(teacherId, classId, taskHistoryId, isStarred);
        public Task<bool> SetGradingModeAsync(int taskHistoryId, int teacherId, string mode) => _dal.SetGradingModeAsync(taskHistoryId, teacherId, mode);
        public Task<bool> HideGradingItemAsync(int teacherId, int classId, int taskHistoryId) => _dal.HideGradingItemAsync(teacherId, classId, taskHistoryId);
        public Task<bool> UpdateTaskReviewStatusAsync(int taskHistoryId, int reviewerId, int? teacherScopeId, string reviewStatus, string? reviewComment) => _dal.UpdateTaskReviewStatusAsync(taskHistoryId, reviewerId, teacherScopeId, reviewStatus, reviewComment);
        public Task<TeacherAiScoreSnapshotResponse?> GetTeacherAiScoreSnapshotAsync(int taskHistoryId, int? teacherId) => _dal.GetTeacherAiScoreSnapshotAsync(taskHistoryId, teacherId);
        public Task SubmitAiRatingAsync(int teacherId, int taskHistoryId, int aiFeedbackRating, int teacherConfidenceRating) => _dal.SubmitAiRatingAsync(teacherId, taskHistoryId, aiFeedbackRating, teacherConfidenceRating);
        public Task<ClassGradingItemResponse?> UpdateClassGradingEvaluationAsync(int classId, int taskHistoryId, int teacherId, string targetTaskType, EvaluationDataDto evaluationData) => _dal.UpdateClassGradingEvaluationAsync(classId, taskHistoryId, teacherId, targetTaskType, evaluationData);
        public Task<ClassChartRawData> GetChartRawDataAsync(int classId, DateTime classStartDate) => _dal.GetChartRawDataAsync(classId, classStartDate);
        public Task<TaskHistory?> GetTaskHistoryDetailAsync(int taskHistoryId) => _dal.GetTaskHistoryDetailAsync(taskHistoryId);
        public Task<List<WritingEvaluation>> GetEvaluationsForTaskHistoryAsync(int? task1Id, int? task2Id) => _dal.GetEvaluationsForTaskHistoryAsync(task1Id, task2Id);
        public Task<(int? classId, string className)> GetClassInfoForTaskHistoryAsync(int studentId) => _dal.GetClassInfoForTaskHistoryAsync(studentId);
        public Task<bool> IsStarredForTeacherAsync(int taskHistoryId, int teacherId) => _dal.IsStarredForTeacherAsync(taskHistoryId, teacherId);
        public Task<(int? fbScore, int? confidenceScore)> GetLatestRatingAsync(int taskHistoryId, int teacherId) => _dal.GetLatestRatingAsync(taskHistoryId, teacherId);
    }
}
