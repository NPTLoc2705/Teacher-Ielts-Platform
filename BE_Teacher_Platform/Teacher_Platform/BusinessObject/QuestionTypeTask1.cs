using System.ComponentModel.DataAnnotations;

namespace BusinessObject
{
    public class QuestionTypeTask1
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [StringLength(100)]
        public string Name { get; set; } = string.Empty;
    }
}
