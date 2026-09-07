using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using BusinessObject.evaluation;

namespace BusinessObject
{
    public class WritingEvaluation
    {
        [Key]
        public int Id { get; set; }
        public int? WritingTask1Id { get; set; }
        public int? WritingTask2Id { get; set; }
        [Required]
        public WritingTaskType TaskType { get; set; }
        public decimal OverallScore { get; set; }
        [MaxLength(2000)]
        public string? OverallSummary { get; set; }
        public DateTime EvaluatedAt { get; set; } = DateTime.UtcNow;

        [ForeignKey("WritingTask1Id")]
        public virtual WritingTask1? WritingTask1 { get; set; }
        [ForeignKey("WritingTask2Id")]
        public virtual WritingTask2? WritingTask2 { get; set; }

        public virtual ICollection<CriteriaScore> CriteriaScores { get; set; } = new List<CriteriaScore>();
        public virtual ICollection<EvaluationSuggestion> Suggestions { get; set; } = new List<EvaluationSuggestion>();
        public virtual ICollection<EvaluationNextStep> NextSteps { get; set; } = new List<EvaluationNextStep>();
    }
}
