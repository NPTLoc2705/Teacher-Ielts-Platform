using System.ComponentModel.DataAnnotations.Schema;

namespace BusinessObject
{
    public class WritingTask2
    {
        public int Id { get; set; }
        public int? Usersid { get; set; }
        public string? Question { get; set; }
        public string? Answer { get; set; }
        public int? QuestionTypeIdTask2 { get; set; }

        [ForeignKey("Usersid")]
        public virtual User User { get; set; } = null!;

        [ForeignKey("QuestionTypeIdTask2")]
        public virtual QuestionTypeTask2? QuestionType { get; set; }
    }
}
