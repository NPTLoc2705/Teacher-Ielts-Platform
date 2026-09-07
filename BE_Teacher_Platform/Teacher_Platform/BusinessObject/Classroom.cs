using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BusinessObject
{
    public class Classroom
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [StringLength(150)]
        public string ClassName { get; set; } = string.Empty;

        [StringLength(500)]
        public string? Description { get; set; }

        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }

        /// <summary>Total number of lessons in this class</summary>
        public int NumberOfLessons { get; set; }

        /// <summary>Student current IELTS level when joining (e.g. 5.0, 5.5)</summary>
        [Column(TypeName = "decimal(3,1)")]
        public decimal CurrentLevel { get; set; }

        /// <summary>Target IELTS score to achieve by end of class (e.g. 6.0, 6.5)</summary>
        [Column(TypeName = "decimal(3,1)")]
        public decimal TargetLevel { get; set; }

        public ClassStatus Status { get; set; } = ClassStatus.Active;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public int TeacherId { get; set; }
        public virtual User Teacher { get; set; } = null!;
    }
}
