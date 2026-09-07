using BusinessObject;
using System.ComponentModel.DataAnnotations;

namespace BusinessObject.Dtos.Teacher
{
    // ── Request DTOs ─────────────────────────────────────────────────────────

    public class CreateClassRequest
    {
        [Required][StringLength(150, MinimumLength = 3)]
        public string ClassName { get; set; } = string.Empty;
        [StringLength(500)]
        public string? Description { get; set; }
        [Required]
        public DateTime StartDate { get; set; }
        [Required]
        public DateTime EndDate { get; set; }
        [Required][Range(1, 500)]
        public int NumberOfLessons { get; set; }
        [Required]
        public decimal CurrentLevel { get; set; }
        [Required]
        public decimal TargetLevel { get; set; }
    }

    public class UpdateClassRequest
    {
        [StringLength(150, MinimumLength = 3)]
        public string? ClassName { get; set; }
        [StringLength(500)]
        public string? Description { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        [Range(1, 500)]
        public int? NumberOfLessons { get; set; }
        public decimal? CurrentLevel { get; set; }
        public decimal? TargetLevel { get; set; }
        public ClassStatus? Status { get; set; }
    }

    // ── Response DTOs ────────────────────────────────────────────────────────

    public class ClassResponse
    {
        public int Id { get; set; }
        public string ClassName { get; set; } = string.Empty;
        public string? Description { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public int NumberOfLessons { get; set; }
        public decimal CurrentLevel { get; set; }
        public decimal TargetLevel { get; set; }
        public string Status { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public int TeacherId { get; set; }
        public string TeacherName { get; set; } = string.Empty;
        public int StudentCount { get; set; }
    }

    public class ClassStatsResponse
    {
        public decimal TargetLevel { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public int TargetProgressPercent { get; set; }
        public int TotalWritings { get; set; }
        public int TotalTask1 { get; set; }
        public int TotalTask2 { get; set; }
        public decimal ClassAverageScore { get; set; }
        public decimal ScoreImprovement { get; set; }
        public int StudentsReachedTarget { get; set; }
        public int TotalStudents { get; set; }
    }

    public class StudentSearchResult
    {
        public int Id { get; set; }
        public string DisplayName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public bool AlreadyEnrolled { get; set; }
    }

    public class EnrollStudentsRequest
    {
        public List<int> StudentIds { get; set; } = new();
    }

    public class EnrollStudentsResponse
    {
        public int Enrolled { get; set; }
        public int AlreadyIn { get; set; }
    }

    public class EnrolledStudentResponse
    {
        public int StudentId { get; set; }
        public string DisplayName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public DateTime EnrolledAt { get; set; }
        public decimal AverageScore { get; set; }
        public int TotalEssays { get; set; }
    }

    public class ClassGradingItemResponse
    {
        public int TaskHistoryId { get; set; }
        public int ClassId { get; set; }
        public int StudentId { get; set; }
        public string StudentName { get; set; } = string.Empty;
        public string ClassName { get; set; } = string.Empty;
        public DateTime Created { get; set; }
        public string Topic { get; set; } = string.Empty;
        public string TaskType { get; set; } = string.Empty;
        public string QuestionType { get; set; } = string.Empty;
        public float AiScore { get; set; }
        public float? YourScore { get; set; }
        public int? FbScore { get; set; }
        public int? ConfidenceScore { get; set; }
        public bool IsStarred { get; set; }
        public string? GradingMode { get; set; }
        public string? ReviewStatus { get; set; }
        public string? ReviewComment { get; set; }
    }

    public class UpdateTeacherGradingStarRequest
    {
        public bool IsStarred { get; set; }
    }

    public class UpdateGradingModeRequest
    {
        public string GradingMode { get; set; } = string.Empty;
    }

    public class UpdateTaskReviewStatusRequest
    {
        [Required]
        public string Status { get; set; } = string.Empty;
        [MaxLength(2000)]
        public string? Comment { get; set; }
    }

    public class TeacherAiScoreSnapshotResponse
    {
        public float? AiOverallScore { get; set; }
        public float? AiTrScore { get; set; }
        public float? AiCcScore { get; set; }
        public float? AiLrScore { get; set; }
        public float? AiGrScore { get; set; }
    }

    public class SubmitAiRatingRequest
    {
        [Required][Range(0, 5)]
        public int AiFeedbackRating { get; set; }
        [Required][Range(1, 5)]
        public int TeacherConfidenceRating { get; set; }
    }

    public class UpdateTeacherGradingEvaluationRequest
    {
        [Required]
        public string TargetTaskType { get; set; } = "task2";
        [Required]
        public BusinessObject.Dtos.EvaluationDataDto? EvaluationData { get; set; }
    }

    public class ClassChartDataResponse
    {
        public List<string> Labels { get; set; } = new();
        public ChartOverallData Overall { get; set; } = new();
        public ChartCriteriaData Criteria { get; set; } = new();
    }

    public class ChartOverallData
    {
        public List<double?> Task1 { get; set; } = new();
        public List<double?> Task2 { get; set; } = new();
        public List<double?> VirtualExam { get; set; } = new();
    }

    public class ChartCriteriaData
    {
        public CriterionSeries Task1 { get; set; } = new();
        public CriterionSeries Task2 { get; set; } = new();
    }

    public class CriterionSeries
    {
        public List<double?> TaOrTr { get; set; } = new();
        public List<double?> Lr { get; set; } = new();
        public List<double?> Cc { get; set; } = new();
        public List<double?> Gra { get; set; } = new();
    }

    public class ChartHistoryRow
    {
        public DateTime Created { get; set; }
        public int? WritingTask1Id { get; set; }
        public int? WritingTask2Id { get; set; }
        public float Score { get; set; }
        public float? Score1 { get; set; }
        public float? Score2 { get; set; }
    }

    // ── Raw data containers for service layer calculations ──────────────────

    public class ClassStatsRawData
    {
        public List<int> EnrolledStudentIds { get; set; } = new();
        public List<BusinessObject.TaskHistory> Histories { get; set; } = new();
    }

    public class ClassChartRawData
    {
        public DateTime StartDate { get; set; }
        public List<ChartHistoryRow> Histories { get; set; } = new();
    }

    // ── Academic Dashboard DTOs ──────────────────────────────────────────────

    public class AcademicDashboardMetricsResponse
    {
        public int TotalSample { get; set; }
        public string AvgTime { get; set; } = "00:00";
        public decimal AvgFeedbackScore { get; set; }
        public decimal AvgOverwritePercent { get; set; }
        public int TimedSampleCount { get; set; }
        public int FeedbackSampleCount { get; set; }
    }

    public class AcademicDashboardMetricsRawData
    {
        public int TotalSample { get; set; }
        public int TotalCompletionSeconds { get; set; }
        public int TimedSampleCount { get; set; }
        public int TotalFeedbackScore { get; set; }
        public int FeedbackSampleCount { get; set; }
        public int TotalAiSegments { get; set; }
        public int OverwrittenAiSegments { get; set; }
    }

    public class AcademicDashboardBandDeviationResponse
    {
        public decimal Overall { get; set; }
        public decimal Tr { get; set; }
        public decimal Cc { get; set; }
        public decimal Lr { get; set; }
        public decimal Gr { get; set; }
    }

    public class AcademicDashboardStatusDistributionResponse
    {
        public int ApprovedCount { get; set; }
        public int RejectedCount { get; set; }
        public int NotVerifiedCount { get; set; }
        public decimal ApprovedPercent { get; set; }
        public decimal RejectedPercent { get; set; }
        public decimal NotVerifiedPercent { get; set; }
    }

    public class AcademicDashboardGradingModeDistributionResponse
    {
        public int AiCount { get; set; }
        public int SelfCount { get; set; }
        public decimal AiPercent { get; set; }
        public decimal SelfPercent { get; set; }
    }

    public class AcademicDashboardOverTimePointResponse
    {
        public string Label { get; set; } = string.Empty;
        public int SampleCount { get; set; }
        public decimal AvgOverwritePercent { get; set; }
    }

    public class AcademicDashboardBandBucketResponse
    {
        public string Band { get; set; } = "0.0";
        public int Count { get; set; }
        public decimal Percent { get; set; }
    }

    public class AcademicDashboardTeacherLeaderboardRow
    {
        public int TeacherId { get; set; }
        public string TeacherName { get; set; } = string.Empty;
        public int Sample { get; set; }
        public decimal ApprovePercent { get; set; }
    }

    public class AcademicDashboardOverviewResponse
    {
        public AcademicDashboardBandDeviationResponse AvgBandDeviation { get; set; } = new();
        public AcademicDashboardStatusDistributionResponse Status { get; set; } = new();
        public AcademicDashboardGradingModeDistributionResponse GradingMode { get; set; } = new();
        public List<AcademicDashboardBandBucketResponse> BandDistributionOverall { get; set; } = new();
        public List<AcademicDashboardBandBucketResponse> BandDistributionTr { get; set; } = new();
        public List<AcademicDashboardBandBucketResponse> BandDistributionCc { get; set; } = new();
        public List<AcademicDashboardBandBucketResponse> BandDistributionLr { get; set; } = new();
        public List<AcademicDashboardBandBucketResponse> BandDistributionGr { get; set; } = new();
        public List<AcademicDashboardTeacherLeaderboardRow> TeacherLeaderboard { get; set; } = new();
        public List<AcademicDashboardOverTimePointResponse> OverTime { get; set; } = new();
    }

    // ── Internal helper types for DAL ────────────────────────────────────────
    public class AcademicDashboardTaskRow
    {
        public int TaskHistoryId { get; set; }
        public string CompletionTimeMinutes { get; set; } = string.Empty;
        public float? TeacherScore { get; set; }
        public int? WritingTask1Id { get; set; }
        public int? WritingTask2Id { get; set; }
        public float? AiScore { get; set; }
        public float Score { get; set; }
    }

    public class AcademicDashboardOverviewTaskRow
    {
        public int TaskHistoryId { get; set; }
        public int StudentId { get; set; }
        public DateTime Created { get; set; }
        public int? WritingTask1Id { get; set; }
        public int? WritingTask2Id { get; set; }
        public float? AiScore { get; set; }
        public float Score { get; set; }
        public float? TeacherScore { get; set; }
        public string? GradingMode { get; set; }
        public string? ReviewStatus { get; set; }
    }

    public class AcademicDashboardAiSnapshotRow
    {
        public int TaskHistoryId { get; set; }
        public float? AiOverallScore { get; set; }
        public float? AiTrScore { get; set; }
        public float? AiCcScore { get; set; }
        public float? AiLrScore { get; set; }
        public float? AiGrScore { get; set; }
        public DateTime UpdatedAt { get; set; }
    }

    public class AcademicDashboardScoreContext
    {
        public float TeacherOverall { get; set; }
        public float TeacherTr { get; set; }
        public float TeacherCc { get; set; }
        public float TeacherLr { get; set; }
        public float TeacherGr { get; set; }
        public float AiOverall { get; set; }
        public float AiTr { get; set; }
        public float AiCc { get; set; }
        public float AiLr { get; set; }
        public float AiGr { get; set; }
    }

    public class AcademicDashboardOverTimeRow
    {
        public DateTime Created { get; set; }
        public int SampleCount { get; set; }
        public int TotalAiSegments { get; set; }
        public int OverwrittenAiSegments { get; set; }
    }

    public class AcademicDashboardTeacherAggregate
    {
        public int Sample { get; set; }
        public int Approved { get; set; }
    }
}

