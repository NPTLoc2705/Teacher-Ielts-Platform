using BusinessObject;
using BusinessObject.Dtos;
using BusinessObject.Dtos.TaskHistory;
using BusinessObject.Dtos.Teacher;
using Microsoft.Extensions.Logging;
using Repository.ClassRepo;

namespace Service.ClassService
{
    public class ClassService : IClassService
    {
        private readonly IClassRepository _repo;
        private readonly ILogger<ClassService> _logger;

        private static readonly decimal[] ValidBandLevels = { 0m, 1m, 1.5m, 2m, 2.5m, 3m, 3.5m, 4m, 4.5m, 5m, 5.5m, 6m, 6.5m, 7m, 7.5m, 8m, 8.5m, 9m };

        public ClassService(IClassRepository repo, ILogger<ClassService> logger)
        {
            _repo = repo;
            _logger = logger;
        }

        private bool IsValidBandLevel(decimal level)
            => ValidBandLevels.Contains(level);

        public async Task<List<ClassResponse>> GetAllByTeacherAsync(int teacherId)
        {
            var classes = await _repo.GetAllByTeacherAsync(teacherId);
            var result = new List<ClassResponse>();
            foreach (var cls in classes)
            {
                var count = await _repo.GetEnrollmentCountAsync(cls.Id);
                result.Add(MapToResponse(cls, count));
            }
            return result;
        }

        public async Task<ClassResponse?> GetByIdAsync(int classId, int teacherId)
        {
            var cls = await _repo.GetByIdAsync(classId);
            if (cls is null || cls.TeacherId != teacherId) return null;
            var count = await _repo.GetEnrollmentCountAsync(cls.Id);
            return MapToResponse(cls, count);
        }

        public async Task<ClassResponse> CreateAsync(int teacherId, CreateClassRequest request)
        {
            if (!IsValidBandLevel(request.CurrentLevel))
                throw new ArgumentException("Invalid IELTS band level for CurrentLevel.");
            if (!IsValidBandLevel(request.TargetLevel))
                throw new ArgumentException("Invalid IELTS band level for TargetLevel.");
            if (request.TargetLevel <= request.CurrentLevel)
                throw new ArgumentException("TargetLevel must be greater than CurrentLevel.");
            if (request.EndDate <= request.StartDate)
                throw new ArgumentException("EndDate must be after StartDate.");

            var classroom = new Classroom
            {
                ClassName = request.ClassName.Trim(),
                Description = request.Description?.Trim(),
                StartDate = request.StartDate,
                EndDate = request.EndDate,
                NumberOfLessons = request.NumberOfLessons,
                CurrentLevel = request.CurrentLevel,
                TargetLevel = request.TargetLevel,
                Status = ClassStatus.Active,
                CreatedAt = DateTime.UtcNow,
                TeacherId = teacherId,
            };

            var created = await _repo.CreateAsync(classroom);
            return MapToResponse(created, 0);
        }

        public async Task<ClassResponse?> UpdateAsync(int classId, int teacherId, UpdateClassRequest request)
        {
            var cls = await _repo.GetByIdAsync(classId);
            if (cls is null || cls.TeacherId != teacherId) return null;

            if (request.ClassName is not null) cls.ClassName = request.ClassName.Trim();
            if (request.Description is not null) cls.Description = request.Description.Trim();
            if (request.StartDate.HasValue) cls.StartDate = request.StartDate.Value;
            if (request.EndDate.HasValue) cls.EndDate = request.EndDate.Value;
            if (request.NumberOfLessons.HasValue) cls.NumberOfLessons = request.NumberOfLessons.Value;
            if (request.CurrentLevel.HasValue) { if (!IsValidBandLevel(request.CurrentLevel.Value)) throw new ArgumentException("Invalid IELTS band level for CurrentLevel."); cls.CurrentLevel = request.CurrentLevel.Value; }
            if (request.TargetLevel.HasValue) { if (!IsValidBandLevel(request.TargetLevel.Value)) throw new ArgumentException("Invalid IELTS band level for TargetLevel."); cls.TargetLevel = request.TargetLevel.Value; }
            if (request.Status.HasValue) cls.Status = request.Status.Value;

            var updated = await _repo.UpdateAsync(cls);
            var count = await _repo.GetEnrollmentCountAsync(cls.Id);
            return MapToResponse(updated, count);
        }

        public async Task<bool> DeleteAsync(int classId, int teacherId)
        {
            var cls = await _repo.GetByIdAsync(classId);
            if (cls is null || cls.TeacherId != teacherId) return false;
            await _repo.DeleteAsync(classId);
            return true;
        }

        public async Task<ClassStatsResponse?> GetClassStatsAsync(int classId, int teacherId)
        {
            var cls = await _repo.GetByIdAsync(classId);
            if (cls is null || cls.TeacherId != teacherId) return null;

            var raw = await _repo.GetClassStatsRawAsync(classId);
            if (!raw.EnrolledStudentIds.Any())
            {
                return new ClassStatsResponse
                {
                    TargetLevel = cls.TargetLevel, StartDate = cls.StartDate, EndDate = cls.EndDate,
                    TargetProgressPercent = 0, TotalWritings = 0, TotalTask1 = 0, TotalTask2 = 0,
                    ClassAverageScore = 0, ScoreImprovement = 0, StudentsReachedTarget = 0, TotalStudents = 0
                };
            }

            var histories = raw.Histories;
            var totalWritings = histories.Count;
            var task1Count = histories.Count(h => h.WritingTask1Id.HasValue && !h.WritingTask2Id.HasValue);
            var task2Count = histories.Count(h => !h.WritingTask1Id.HasValue && h.WritingTask2Id.HasValue);
            var avgScore = totalWritings > 0 ? (decimal)histories.Average(h => (double)h.Score) : 0;

            decimal improvement = 0;
            var studentIds = raw.EnrolledStudentIds;
            var firstScores = studentIds.Select(sid => histories.Where(h => h.UserId == sid).OrderBy(h => h.Created).FirstOrDefault()?.Score).Where(s => s.HasValue).Select(s => s!.Value).ToList();
            var lastScores = studentIds.Select(sid => histories.Where(h => h.UserId == sid).OrderByDescending(h => h.Created).FirstOrDefault()?.Score).Where(s => s.HasValue).Select(s => s!.Value).ToList();
            if (firstScores.Any() && lastScores.Any()) improvement = (decimal)lastScores.Average(s => (double)s) - (decimal)firstScores.Average(s => (double)s);

            var studentsReached = studentIds.Count(sid =>
            {
                var last = histories.Where(h => h.UserId == sid).OrderByDescending(h => h.Created).FirstOrDefault();
                return last is not null && (decimal)last.Score >= cls.TargetLevel;
            });

            var now = DateTime.UtcNow;
            var totalDays = (cls.EndDate - cls.StartDate).TotalDays;
            var elapsed = (now - cls.StartDate).TotalDays;
            var progress = totalDays > 0 ? (int)Math.Min(100, Math.Max(0, (elapsed / totalDays) * 100)) : 0;

            return new ClassStatsResponse
            {
                TargetLevel = cls.TargetLevel, StartDate = cls.StartDate, EndDate = cls.EndDate,
                TargetProgressPercent = progress, TotalWritings = totalWritings,
                TotalTask1 = task1Count, TotalTask2 = task2Count,
                ClassAverageScore = Math.Round(avgScore, 1), ScoreImprovement = Math.Round(improvement, 1),
                StudentsReachedTarget = studentsReached, TotalStudents = studentIds.Count
            };
        }

        public async Task<List<StudentSearchResult>> SearchStudentsAsync(int classId, int teacherId, string query)
        {
            var cls = await _repo.GetByIdAsync(classId);
            if (cls is null || cls.TeacherId != teacherId) return new();
            if (string.IsNullOrWhiteSpace(query) || query.Length < 2) return new();
            return await _repo.SearchStudentsAsync(classId, query);
        }

        public async Task<EnrollStudentsResponse?> EnrollStudentsAsync(int classId, int teacherId, List<int> studentIds)
        {
            var cls = await _repo.GetByIdAsync(classId);
            if (cls is null || cls.TeacherId != teacherId) return null;
            if (!studentIds.Any()) return new EnrollStudentsResponse { Enrolled = 0, AlreadyIn = 0 };
            var (enrolled, alreadyIn) = await _repo.EnrollStudentsAsync(classId, studentIds);
            return new EnrollStudentsResponse { Enrolled = enrolled, AlreadyIn = alreadyIn };
        }

        public async Task<List<EnrolledStudentResponse>?> GetEnrolledStudentsAsync(int classId, int teacherId)
        {
            var cls = await _repo.GetByIdAsync(classId);
            if (cls is null || cls.TeacherId != teacherId) return null;
            return await _repo.GetEnrolledStudentsAsync(classId);
        }

        public async Task<bool> RemoveStudentAsync(int classId, int teacherId, int studentId)
        {
            var cls = await _repo.GetByIdAsync(classId);
            if (cls is null || cls.TeacherId != teacherId) return false;
            return await _repo.RemoveStudentAsync(classId, studentId);
        }

        public async Task<List<ClassGradingItemResponse>?> GetClassGradingItemsAsync(int classId, int teacherId)
        {
            var cls = await _repo.GetByIdAsync(classId);
            if (cls is null || cls.TeacherId != teacherId) return null;
            var items = await _repo.GetClassGradingItemsAsync(classId);
            var starredIds = await _repo.GetTeacherStarredTaskHistoryIdsAsync(teacherId, classId);
            foreach (var item in items) item.IsStarred = starredIds.Contains(item.TaskHistoryId);
            return items;
        }

        public async Task<PagedResults<ClassGradingItemResponse>> GetPaginatedGradingItemsAsync(int teacherId, int? classId, string timeFilter, DateTime? customStart, DateTime? customEnd, bool isStarredOnly, string taskTypeFilter, string gradingModeFilter, string sortOrder, int page, int pageSize, bool sampleOnly)
            => await _repo.GetPaginatedGradingItemsAsync(teacherId, classId, timeFilter, customStart, customEnd, isStarredOnly, taskTypeFilter, gradingModeFilter, sortOrder, page, pageSize, sampleOnly);

        public async Task<bool> UpsertTeacherGradingStarAsync(int taskHistoryId, int teacherId, int classId, bool isStarred)
        {
            var inClass = await _repo.IsTaskHistoryInClassAsync(classId, taskHistoryId);
            if (!inClass) return false;
            await _repo.UpsertTeacherGradingStarAsync(teacherId, classId, taskHistoryId, isStarred);
            return true;
        }

        public async Task<bool> SetGradingModeAsync(int taskHistoryId, int teacherId, string mode)
            => await _repo.SetGradingModeAsync(taskHistoryId, teacherId, mode);

        public async Task<bool> HideGradingItemAsync(int teacherId, int classId, int taskHistoryId)
            => await _repo.HideGradingItemAsync(teacherId, classId, taskHistoryId);

        public async Task<bool> UpdateTaskReviewStatusAsync(int taskHistoryId, int teacherId, string reviewStatus, string? reviewComment)
        {
            var allowed = new[] { "approved", "rejected", "pending" };
            if (!allowed.Contains(reviewStatus.ToLower())) return false;
            return await _repo.UpdateTaskReviewStatusAsync(taskHistoryId, teacherId, teacherId, reviewStatus, reviewComment);
        }

        public async Task<TeacherAiScoreSnapshotResponse?> GetTeacherAiScoreSnapshotAsync(int taskHistoryId, int teacherId)
            => await _repo.GetTeacherAiScoreSnapshotAsync(taskHistoryId, teacherId);

        public async Task<bool> SubmitAiRatingAsync(int teacherId, int taskHistoryId, int aiFeedbackRating, int teacherConfidenceRating)
        {
            await _repo.SubmitAiRatingAsync(teacherId, taskHistoryId, aiFeedbackRating, teacherConfidenceRating);
            return true;
        }

        public async Task<ClassGradingItemResponse?> UpdateClassGradingEvaluationAsync(int classId, int taskHistoryId, int teacherId, string targetTaskType, EvaluationDataDto evaluationData)
            => await _repo.UpdateClassGradingEvaluationAsync(classId, taskHistoryId, teacherId, targetTaskType, evaluationData);

        public async Task<ClassChartDataResponse?> GetClassChartDataAsync(int classId, int teacherId)
        {
            var cls = await _repo.GetByIdAsync(classId);
            if (cls is null || cls.TeacherId != teacherId) return null;

            var raw = await _repo.GetChartRawDataAsync(classId, cls.StartDate);
            return BuildChartData(raw);
        }

        public async Task<TaskHistoryDetailResponse?> GetTaskHistoryDetailAsync(int taskHistoryId, int teacherId)
        {
            var th = await _repo.GetTaskHistoryDetailAsync(taskHistoryId);
            if (th is null) return null;

            var (classId, className) = await _repo.GetClassInfoForTaskHistoryAsync(th.UserId);
            var evals = await _repo.GetEvaluationsForTaskHistoryAsync(th.WritingTask1Id, th.WritingTask2Id);
            var isStarred = await _repo.IsStarredForTeacherAsync(taskHistoryId, teacherId);
            var (fbScore, confScore) = await _repo.GetLatestRatingAsync(taskHistoryId, teacherId);

            var taskType = th.WritingTask1Id.HasValue && th.WritingTask2Id.HasValue ? "Virtual Exam"
                : th.WritingTask1Id.HasValue ? "Task 1" : "Task 2";

            TaskHistoryWritingDataDto? t1Data = null;
            if (th.WritingTask1 is not null)
            {
                var t1Evals = evals.Where(e => e.WritingTask1Id == th.WritingTask1Id).ToList();
                t1Data = new TaskHistoryWritingDataDto
                {
                    Question = th.WritingTask1.Question,
                    ImagePath = th.WritingTask1.ImagePath,
                    Answer = th.WritingTask1.Answer,
                    Evaluations = t1Evals.Select(MapEvaluation).ToList()
                };
            }

            TaskHistoryWritingDataDto? t2Data = null;
            if (th.WritingTask2 is not null)
            {
                var t2Evals = evals.Where(e => e.WritingTask2Id == th.WritingTask2Id).ToList();
                t2Data = new TaskHistoryWritingDataDto
                {
                    Question = th.WritingTask2.Question,
                    Answer = th.WritingTask2.Answer,
                    Evaluations = t2Evals.Select(MapEvaluation).ToList()
                };
            }

            return new TaskHistoryDetailResponse
            {
                TaskHistoryId = th.Id,
                StudentId = th.UserId,
                StudentName = th.User?.DisplayName ?? th.User?.Username ?? th.User?.Email ?? "Unknown",
                ClassName = className,
                ClassId = classId ?? 0,
                TaskType = taskType,
                QuestionType = th.WritingTask1Id.HasValue && !th.WritingTask2Id.HasValue
                    ? th.WritingTask1?.QuestionType?.Name
                    : th.WritingTask2?.QuestionType?.Name,
                Created = th.Created,
                AiScore = th.AiScore ?? th.Score,
                YourScore = th.TeacherScore,
                FbScore = fbScore,
                ConfidenceScore = confScore,
                GradingMode = th.GradingMode,
                ReviewStatus = th.ReviewStatus,
                IsStarred = isStarred,
                Task1 = t1Data,
                Task2 = t2Data,
            };
        }

        private static TaskHistoryEvaluationDto MapEvaluation(WritingEvaluation e)
        {
            return new TaskHistoryEvaluationDto
            {
                OverallScore = (float)e.OverallScore,
                OverallSummary = e.OverallSummary,
                EvaluatedAt = e.EvaluatedAt,
                CriteriaScores = e.CriteriaScores.Select(cs => new TaskHistoryCriteriaScoreDto
                {
                    CriteriaName = cs.CriteriaName,
                    Score = cs.Score,
                    BandReason = cs.BandReason,
                    FeedbackDetails = cs.FeedbackDetails.Select(fd => new TaskHistoryFeedbackDetailDto { Quote = fd.Quote, Description = fd.Description }).ToList(),
                    Strengths = cs.Strengths.Select(s => new TaskHistoryStrengthDto { StrengthDescription = s.StrengthDescription }).ToList(),
                    AreasForImprovement = cs.AreasForImprovement.Select(a => new TaskHistoryImprovementDto { ImprovementDescription = a.ImprovementDescription }).ToList()
                }).ToList(),
                Suggestions = e.Suggestions.Select(s => s.SuggestionDescription).ToList(),
                NextSteps = e.NextSteps.Select(s => s.NextStepDescription).ToList()
            };
        }

        private static ClassResponse MapToResponse(Classroom cls, int studentCount)
        {
            return new ClassResponse
            {
                Id = cls.Id, ClassName = cls.ClassName, Description = cls.Description,
                StartDate = cls.StartDate, EndDate = cls.EndDate, NumberOfLessons = cls.NumberOfLessons,
                CurrentLevel = cls.CurrentLevel, TargetLevel = cls.TargetLevel,
                Status = cls.Status.ToString(), CreatedAt = cls.CreatedAt, TeacherId = cls.TeacherId,
                TeacherName = cls.Teacher?.DisplayName ?? cls.Teacher?.Username ?? cls.Teacher?.Email ?? string.Empty,
                StudentCount = studentCount,
            };
        }

        private static ClassChartDataResponse BuildChartData(ClassChartRawData raw)
        {
            var histories = raw.Histories;
            if (!histories.Any()) return new ClassChartDataResponse { Labels = new(), Overall = new(), Criteria = new() };

            var start = raw.StartDate;
            var end = histories.Max(h => h.Created);
            var totalDays = (end - start).TotalDays;
            int bucketCount = totalDays <= 30 ? 4 : totalDays <= 90 ? 6 : 8;

            var buckets = Enumerable.Range(0, bucketCount).Select(i =>
            {
                var bucketStart = start.AddDays(i * totalDays / bucketCount);
                var bucketEnd = start.AddDays((i + 1) * totalDays / bucketCount);
                var label = bucketStart.ToString("MMM d");
                return new { label, bucketStart, bucketEnd };
            }).ToList();

            double? BucketAvg(IEnumerable<ChartHistoryRow> rows) => rows.Any() ? rows.Average(h => (double)h.Score) : null;

            var labels = buckets.Select(b => b.label).ToList();
            var task1Overall = buckets.Select(b => BucketAvg(histories.Where(h => h.WritingTask1Id.HasValue && !h.WritingTask2Id.HasValue && h.Created >= b.bucketStart && h.Created < b.bucketEnd))).ToList();
            var task2Overall = buckets.Select(b => BucketAvg(histories.Where(h => !h.WritingTask1Id.HasValue && h.WritingTask2Id.HasValue && h.Created >= b.bucketStart && h.Created < b.bucketEnd))).ToList();
            var virtualOverall = buckets.Select(b => BucketAvg(histories.Where(h => h.WritingTask1Id.HasValue && h.WritingTask2Id.HasValue && h.Created >= b.bucketStart && h.Created < b.bucketEnd))).ToList();

            return new ClassChartDataResponse
            {
                Labels = labels,
                Overall = new ChartOverallData { Task1 = task1Overall, Task2 = task2Overall, VirtualExam = virtualOverall },
                Criteria = new ChartCriteriaData { Task1 = new CriterionSeries(), Task2 = new CriterionSeries() }
            };
        }
    }
}

