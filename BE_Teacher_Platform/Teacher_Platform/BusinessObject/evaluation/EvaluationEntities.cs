using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BusinessObject.evaluation
{
    public class CriteriaScore
    {
        [Key]
        public int Id { get; set; }
        public int WritingEvaluationId { get; set; }
        [Required][MaxLength(100)]
        public string CriteriaName { get; set; } = null!;
        public float Score { get; set; }
        [MaxLength(3000)]
        public string? BandReason { get; set; }
        [MaxLength(20)]
        public string? ScoreAccuracyVote { get; set; }
        public DateTime? VoteSubmittedAt { get; set; }

        [ForeignKey("WritingEvaluationId")]
        public virtual WritingEvaluation WritingEvaluation { get; set; } = null!;

        public virtual ICollection<CriteriaFeedbackDetail> FeedbackDetails { get; set; } = new List<CriteriaFeedbackDetail>();
        public virtual ICollection<CriteriaStrength> Strengths { get; set; } = new List<CriteriaStrength>();
        public virtual ICollection<CriteriaImprovement> AreasForImprovement { get; set; } = new List<CriteriaImprovement>();
    }

    public class CriteriaFeedbackDetail
    {
        [Key]
        public int Id { get; set; }
        public int CriteriaScoreId { get; set; }
        [MaxLength(1000)]
        public string? Quote { get; set; }
        [Required][MaxLength(2000)]
        public string Description { get; set; } = null!;
        public short? UserRating { get; set; }
        public DateTime? RatingSubmittedAt { get; set; }

        [ForeignKey("CriteriaScoreId")]
        public virtual CriteriaScore CriteriaScore { get; set; } = null!;
    }

    public class CriteriaStrength
    {
        [Key]
        public int Id { get; set; }
        public int CriteriaScoreId { get; set; }
        [Required][MaxLength(1000)]
        public string StrengthDescription { get; set; } = null!;

        [ForeignKey("CriteriaScoreId")]
        public virtual CriteriaScore CriteriaScore { get; set; } = null!;
    }

    public class CriteriaImprovement
    {
        [Key]
        public int Id { get; set; }
        public int CriteriaScoreId { get; set; }
        [Required][MaxLength(1000)]
        public string ImprovementDescription { get; set; } = null!;

        [ForeignKey("CriteriaScoreId")]
        public virtual CriteriaScore CriteriaScore { get; set; } = null!;
    }

    public class EvaluationSuggestion
    {
        [Key]
        public int Id { get; set; }
        public int WritingEvaluationId { get; set; }
        [Required][MaxLength(1000)]
        public string SuggestionDescription { get; set; } = null!;

        [ForeignKey("WritingEvaluationId")]
        public virtual WritingEvaluation WritingEvaluation { get; set; } = null!;
    }

    public class EvaluationNextStep
    {
        [Key]
        public int Id { get; set; }
        public int WritingEvaluationId { get; set; }
        [Required][MaxLength(1000)]
        public string NextStepDescription { get; set; } = null!;

        [ForeignKey("WritingEvaluationId")]
        public virtual WritingEvaluation WritingEvaluation { get; set; } = null!;
    }
}
