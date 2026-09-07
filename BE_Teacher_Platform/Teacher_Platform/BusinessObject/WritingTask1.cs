using System.ComponentModel.DataAnnotations.Schema;

namespace BusinessObject
{
    public class WritingTask1
    {
        public int Id { get; set; }
        public int? Usersid { get; set; }
        public string? Question { get; set; }
        public string? ImagePath { get; set; }
        public string? Answer { get; set; }
        public int? QuestionTypeIdTask1 { get; set; }

        [ForeignKey("Usersid")]
        public virtual User User { get; set; } = null!;

        [ForeignKey("QuestionTypeIdTask1")]
        public virtual QuestionTypeTask1? QuestionType { get; set; }
    }
}
