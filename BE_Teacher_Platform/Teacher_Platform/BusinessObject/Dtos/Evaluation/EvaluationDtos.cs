using System.Text.Json.Serialization;

namespace BusinessObject.Dtos
{
    public class EvaluationDataDto
    {
        [JsonPropertyName("overallBand")]
        public float OverallBand { get; set; }

        [JsonPropertyName("criteria")]
        public Dictionary<string, CriteriaDataDto>? Criteria { get; set; }

        [JsonPropertyName("overallAssessment")]
        public OverallAssessmentDto? OverallAssessment { get; set; }
    }

    public class CriteriaDataDto
    {
        [JsonPropertyName("bandScore")]
        public float BandScore { get; set; }

        [JsonPropertyName("feedbackDetail")]
        public List<FeedbackDetailDto>? FeedbackDetail { get; set; }

        [JsonPropertyName("strengths")]
        public List<string>? Strengths { get; set; }

        [JsonPropertyName("areasForImprovement")]
        public List<string>? AreasForImprovement { get; set; }

        [JsonPropertyName("bandReason")]
        public string? BandReason { get; set; }
    }

    public class FeedbackDetailDto
    {
        [JsonPropertyName("feedbackDetailId")]
        public int FeedbackDetailId { get; set; }

        [JsonPropertyName("quote")]
        public string? Quote { get; set; }

        [JsonPropertyName("description")]
        public string? Description { get; set; }
    }

    public class OverallAssessmentDto
    {
        [JsonPropertyName("summary")]
        public string? Summary { get; set; }

        [JsonPropertyName("specificSuggestions")]
        public List<string>? SpecificSuggestions { get; set; }

        [JsonPropertyName("nextSteps")]
        public List<string>? NextSteps { get; set; }
    }

    public class PagedResults<T>
    {
        public IEnumerable<T> Items { get; set; } = new List<T>();
        public int TotalCount { get; set; }
        public int Page { get; set; }
        public int PageSize { get; set; }
        public int TotalPages => (int)Math.Ceiling((double)TotalCount / PageSize);
        public bool HasPreviousPage => Page > 1;
        public bool HasNextPage => Page < TotalPages;
        public static PagedResults<T> Empty(int page = 1, int pageSize = 10)
        {
            return new PagedResults<T>
            {
                Items = new List<T>(),
                TotalCount = 0,
                Page = page,
                PageSize = pageSize
            };
        }
    }
}
