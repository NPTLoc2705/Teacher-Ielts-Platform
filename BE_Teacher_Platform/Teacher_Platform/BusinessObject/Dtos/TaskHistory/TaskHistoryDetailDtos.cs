namespace BusinessObject.Dtos.TaskHistory
{
    public class TaskHistoryFeedbackDetailDto
    {
        public string? Quote { get; set; }
        public string? Description { get; set; }
    }

    public class TaskHistoryStrengthDto
    {
        public string? StrengthDescription { get; set; }
    }

    public class TaskHistoryImprovementDto
    {
        public string? ImprovementDescription { get; set; }
    }

    public class TaskHistoryCriteriaScoreDto
    {
        public string? CriteriaName { get; set; }
        public float? Score { get; set; }
        public string? BandReason { get; set; }
        public List<TaskHistoryFeedbackDetailDto> FeedbackDetails { get; set; } = new();
        public List<TaskHistoryStrengthDto> Strengths { get; set; } = new();
        public List<TaskHistoryImprovementDto> AreasForImprovement { get; set; } = new();
    }

    public class TaskHistoryEvaluationDto
    {
        public float? OverallScore { get; set; }
        public string? OverallSummary { get; set; }
        public DateTime? EvaluatedAt { get; set; }
        public List<TaskHistoryCriteriaScoreDto> CriteriaScores { get; set; } = new();
        public List<string> Suggestions { get; set; } = new();
        public List<string> NextSteps { get; set; } = new();
    }

    public class TaskHistoryWritingDataDto
    {
        public string? Question { get; set; }
        public string? ImagePath { get; set; }
        public string? Answer { get; set; }
        public List<TaskHistoryEvaluationDto> Evaluations { get; set; } = new();
    }

    public class TaskHistoryDetailResponse
    {
        public int TaskHistoryId { get; set; }
        public int StudentId { get; set; }
        public string StudentName { get; set; } = string.Empty;
        public string ClassName { get; set; } = string.Empty;
        public int ClassId { get; set; }
        public string TaskType { get; set; } = string.Empty;
        public string? QuestionType { get; set; }
        public DateTime Created { get; set; }
        public float? AiScore { get; set; }
        public float? YourScore { get; set; }
        public int? FbScore { get; set; }
        public int? ConfidenceScore { get; set; }
        public string? GradingMode { get; set; }
        public string? ReviewStatus { get; set; }
        public bool IsStarred { get; set; }
        public TaskHistoryWritingDataDto? Task1 { get; set; }
        public TaskHistoryWritingDataDto? Task2 { get; set; }
    }
}
