using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BusinessObject
{
    public class TeacherAiRating
    {
        [Key]
        public int Id { get; set; }
        public int TeacherId { get; set; }
        [ForeignKey("TeacherId")]
        public virtual User Teacher { get; set; } = null!;
        public int TaskHistoryId { get; set; }
        [ForeignKey("TaskHistoryId")]
        public virtual TaskHistory TaskHistory { get; set; } = null!;
        public int AiFeedbackRating { get; set; }
        public int TeacherConfidenceRating { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }

    public class TeacherGradingStar
    {
        [Key]
        public int Id { get; set; }
        public int TeacherId { get; set; }
        public virtual User Teacher { get; set; } = null!;
        public int ClassId { get; set; }
        public virtual Classroom Classroom { get; set; } = null!;
        public int TaskHistoryId { get; set; }
        public virtual TaskHistory TaskHistory { get; set; } = null!;
        public bool IsStarred { get; set; } = true;
        public bool IsHidden { get; set; } = false;
        public float? AiOverallScore { get; set; }
        public float? AiTrScore { get; set; }
        public float? AiCcScore { get; set; }
        public float? AiLrScore { get; set; }
        public float? AiGrScore { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
}
