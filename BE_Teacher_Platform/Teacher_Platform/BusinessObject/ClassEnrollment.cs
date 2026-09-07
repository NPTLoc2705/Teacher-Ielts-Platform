using System.ComponentModel.DataAnnotations;

namespace BusinessObject
{
    public class ClassEnrollment
    {
        [Key]
        public int Id { get; set; }

        public int ClassroomId { get; set; }
        public virtual Classroom Classroom { get; set; } = null!;

        public int StudentId { get; set; }
        public virtual User Student { get; set; } = null!;

        public DateTime EnrolledAt { get; set; } = DateTime.UtcNow;

        public EnrollmentStatus Status { get; set; } = EnrollmentStatus.Active;
    }
}
