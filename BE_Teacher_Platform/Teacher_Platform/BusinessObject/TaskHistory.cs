using System.ComponentModel.DataAnnotations.Schema;

namespace BusinessObject
{
    public class TaskHistory
    {
        public int Id { get; set; }
        public DateTime Created { get; set; }
        public int? WritingTask1Id { get; set; }
        public int? WritingTask2Id { get; set; }
        public int UserId { get; set; }
        public bool IsStarred { get; set; }
        public float Score { get; set; }
        public float? AiScore { get; set; }
        public float? TeacherScore { get; set; }
        /// <summary>null = not graded, "ai" = revised AI, "self" = self-graded</summary>
        public string? GradingMode { get; set; }
        /// <summary>null = pending, "approved", "rejected"</summary>
        public string? ReviewStatus { get; set; }
        public string? ReviewComment { get; set; }
        public int? ReviewedByUserId { get; set; }
        public DateTime? ReviewedAt { get; set; }
        public float? Score1 { get; set; }
        public float? Score2 { get; set; }
        public string CompletionTimeMinutes { get; set; } = string.Empty;

        [ForeignKey("WritingTask1Id")]
        public virtual WritingTask1? WritingTask1 { get; set; }

        [ForeignKey("WritingTask2Id")]
        public virtual WritingTask2? WritingTask2 { get; set; }

        [ForeignKey("UserId")]
        public virtual User User { get; set; } = null!;
    }
}
