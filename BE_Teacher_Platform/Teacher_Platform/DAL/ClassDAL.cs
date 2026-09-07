using BusinessObject;
using BusinessObject.Dtos;
using BusinessObject.Dtos.Teacher;
using BusinessObject.evaluation;
using Microsoft.EntityFrameworkCore;

namespace DAL
{
    public class ClassDAL
    {
        private readonly TeacherPlatformDbContext _context;
        public ClassDAL(TeacherPlatformDbContext context) { _context = context; }

        public async Task<List<Classroom>> GetAllByTeacherAsync(int teacherId)
            => await _context.Classrooms.Where(c => c.TeacherId == teacherId).OrderByDescending(c => c.CreatedAt).ToListAsync();

        public async Task<Classroom?> GetByIdAsync(int classId)
            => await _context.Classrooms.Include(c => c.Teacher).FirstOrDefaultAsync(c => c.Id == classId);

        public async Task<Classroom> CreateAsync(Classroom classroom) { _context.Classrooms.Add(classroom); await _context.SaveChangesAsync(); return classroom; }

        public async Task<Classroom> UpdateAsync(Classroom classroom) { _context.Classrooms.Update(classroom); await _context.SaveChangesAsync(); return classroom; }

        public async Task DeleteAsync(int classId) { var c = await _context.Classrooms.FindAsync(classId); if (c != null) { _context.Classrooms.Remove(c); await _context.SaveChangesAsync(); } }

        public async Task<List<ClassEnrollment>> GetActiveEnrollmentsAsync(int classId)
            => await _context.ClassEnrollments.Include(e => e.Student).Where(e => e.ClassroomId == classId && e.Status == EnrollmentStatus.Active).ToListAsync();

        public async Task<ClassEnrollment?> GetEnrollmentAsync(int classId, int studentId)
            => await _context.ClassEnrollments.FirstOrDefaultAsync(e => e.ClassroomId == classId && e.StudentId == studentId);

        public async Task<ClassEnrollment> AddEnrollmentAsync(ClassEnrollment enrollment) { _context.ClassEnrollments.Add(enrollment); await _context.SaveChangesAsync(); return enrollment; }

        public async Task UpdateEnrollmentAsync(ClassEnrollment enrollment) { _context.ClassEnrollments.Update(enrollment); await _context.SaveChangesAsync(); }

        public async Task<int> GetEnrollmentCountAsync(int classId)
            => await _context.ClassEnrollments.CountAsync(e => e.ClassroomId == classId && e.Status == EnrollmentStatus.Active);

        public async Task<ClassStatsRawData> GetClassStatsRawAsync(int classId)
        {
            var ids = await _context.ClassEnrollments.Where(e => e.ClassroomId == classId && e.Status == EnrollmentStatus.Active).Select(e => e.StudentId).ToListAsync();
            if (!ids.Any()) return new ClassStatsRawData { EnrolledStudentIds = new(), Histories = new() };
            var histories = await _context.TaskHistories.Where(th => ids.Contains(th.UserId)).OrderBy(th => th.UserId).ThenBy(th => th.Created).ToListAsync();
            return new ClassStatsRawData { EnrolledStudentIds = ids, Histories = histories };
        }

        public async Task<List<StudentSearchResult>> SearchStudentsAsync(int classId, string query)
        {
            query = query.Trim().ToLower();
            var enrolledIds = await _context.ClassEnrollments.Where(e => e.ClassroomId == classId && e.Status == EnrollmentStatus.Active).Select(e => e.StudentId).ToListAsync();
            return await _context.Users.Where(u => u.Role == UserRole.User && !u.IsBanned && u.EmailVerified && ((u.Email != null && u.Email.ToLower().Contains(query)) || (u.DisplayName != null && u.DisplayName.ToLower().Contains(query)) || (u.Username != null && u.Username.ToLower().Contains(query)))).OrderBy(u => u.DisplayName ?? u.Username).Take(10)
                .Select(u => new StudentSearchResult { Id = u.Id, DisplayName = u.DisplayName ?? u.Username ?? u.Email ?? "Unknown", Email = u.Email ?? string.Empty, AlreadyEnrolled = enrolledIds.Contains(u.Id) }).ToListAsync();
        }

        public async Task<(int enrolled, int alreadyIn)> EnrollStudentsAsync(int classId, List<int> studentIds)
        {
            var existing = await _context.ClassEnrollments.Where(e => e.ClassroomId == classId && studentIds.Contains(e.StudentId)).ToDictionaryAsync(e => e.StudentId);
            int enrolled = 0, alreadyIn = 0;
            foreach (var sid in studentIds) {
                if (!existing.TryGetValue(sid, out var r)) { _context.ClassEnrollments.Add(new ClassEnrollment { ClassroomId = classId, StudentId = sid, EnrolledAt = DateTime.UtcNow, Status = EnrollmentStatus.Active }); enrolled++; }
                else if (r.Status == EnrollmentStatus.Active) alreadyIn++;
                else { r.Status = EnrollmentStatus.Active; r.EnrolledAt = DateTime.UtcNow; enrolled++; }
            }
            await _context.SaveChangesAsync();
            return (enrolled, alreadyIn);
        }

        public async Task<bool> RemoveStudentAsync(int classId, int studentId)
        {
            var e = await _context.ClassEnrollments.FirstOrDefaultAsync(e => e.ClassroomId == classId && e.StudentId == studentId && e.Status == EnrollmentStatus.Active);
            if (e is null) return false;
            e.Status = EnrollmentStatus.Removed;
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<List<EnrolledStudentResponse>> GetEnrolledStudentsAsync(int classId)
        {
            var enrollments = await _context.ClassEnrollments.Include(e => e.Student).Where(e => e.ClassroomId == classId && e.Status == EnrollmentStatus.Active).OrderBy(e => e.EnrolledAt).ToListAsync();
            if (!enrollments.Any()) return new();
            var ids = enrollments.Select(e => e.StudentId).ToList();
            var stats = await _context.TaskHistories.Where(th => ids.Contains(th.UserId)).GroupBy(th => th.UserId).Select(g => new { UserId = g.Key, TotalEssays = g.Count(), AvgScore = g.Average(th => (double)th.Score) }).ToListAsync();
            return enrollments.Select(e => { var s = stats.FirstOrDefault(h => h.UserId == e.StudentId); return new EnrolledStudentResponse { StudentId = e.StudentId, DisplayName = e.Student.DisplayName ?? e.Student.Username ?? e.Student.Email ?? "Unknown", Email = e.Student.Email ?? string.Empty, EnrolledAt = e.EnrolledAt, AverageScore = s != null ? Math.Round((decimal)s.AvgScore, 1) : 0, TotalEssays = s?.TotalEssays ?? 0 }; }).ToList();
        }

        public async Task<bool> IsTaskHistoryInClassAsync(int classId, int taskHistoryId)
        {
            var ids = await _context.ClassEnrollments.Where(e => e.ClassroomId == classId && e.Status == EnrollmentStatus.Active).Select(e => e.StudentId).ToListAsync();
            if (!ids.Any()) return false;
            return await _context.TaskHistories.AnyAsync(th => th.Id == taskHistoryId && ids.Contains(th.UserId));
        }

        public async Task<HashSet<int>> GetTeacherStarredTaskHistoryIdsAsync(int teacherId, int classId)
        {
            var ids = await _context.TeacherGradingStars.AsNoTracking().Where(s => s.TeacherId == teacherId && s.ClassId == classId && s.IsStarred).Select(s => s.TaskHistoryId).ToListAsync();
            return ids.ToHashSet();
        }

        public async Task UpsertTeacherGradingStarAsync(int teacherId, int classId, int taskHistoryId, bool isStarred)
        {
            var e = await _context.TeacherGradingStars.FirstOrDefaultAsync(s => s.TeacherId == teacherId && s.ClassId == classId && s.TaskHistoryId == taskHistoryId);
            if (e is null) _context.TeacherGradingStars.Add(new TeacherGradingStar { TeacherId = teacherId, ClassId = classId, TaskHistoryId = taskHistoryId, IsStarred = isStarred, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow });
            else { e.IsStarred = isStarred; e.UpdatedAt = DateTime.UtcNow; _context.TeacherGradingStars.Update(e); }
            await _context.SaveChangesAsync();
        }

        public async Task<bool> SetGradingModeAsync(int taskHistoryId, int teacherId, string mode)
        {
            var th = await _context.TaskHistories.FirstOrDefaultAsync(t => t.Id == taskHistoryId);
            if (th is null) return false;
            th.GradingMode = mode; _context.TaskHistories.Update(th); await _context.SaveChangesAsync(); return true;
        }

        public async Task<bool> HideGradingItemAsync(int teacherId, int classId, int taskHistoryId)
        {
            var e = await _context.TeacherGradingStars.FirstOrDefaultAsync(s => s.TeacherId == teacherId && s.ClassId == classId && s.TaskHistoryId == taskHistoryId);
            if (e is null) _context.TeacherGradingStars.Add(new TeacherGradingStar { TeacherId = teacherId, ClassId = classId, TaskHistoryId = taskHistoryId, IsHidden = true, IsStarred = false, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow });
            else { e.IsHidden = true; e.UpdatedAt = DateTime.UtcNow; _context.TeacherGradingStars.Update(e); }
            await _context.SaveChangesAsync(); return true;
        }

        public async Task<bool> UpdateTaskReviewStatusAsync(int taskHistoryId, int reviewerId, int? teacherScopeId, string reviewStatus, string? reviewComment)
        {
            var th = await _context.TaskHistories.FirstOrDefaultAsync(t => t.Id == taskHistoryId);
            if (th is null) return false;
            th.ReviewStatus = reviewStatus; th.ReviewComment = reviewComment; th.ReviewedByUserId = reviewerId; th.ReviewedAt = DateTime.UtcNow;
            _context.TaskHistories.Update(th); await _context.SaveChangesAsync(); return true;
        }

        public async Task<TeacherAiScoreSnapshotResponse?> GetTeacherAiScoreSnapshotAsync(int taskHistoryId, int? teacherId)
        {
            var q = _context.TeacherGradingStars.AsNoTracking().Where(s => s.TaskHistoryId == taskHistoryId);
            if (teacherId.HasValue) q = q.Where(s => s.TeacherId == teacherId.Value);
            var snap = await q.OrderByDescending(s => s.UpdatedAt).FirstOrDefaultAsync();
            if (snap is null) return null;
            return new TeacherAiScoreSnapshotResponse { AiOverallScore = snap.AiOverallScore, AiTrScore = snap.AiTrScore, AiCcScore = snap.AiCcScore, AiLrScore = snap.AiLrScore, AiGrScore = snap.AiGrScore };
        }

        public async Task SubmitAiRatingAsync(int teacherId, int taskHistoryId, int aiFeedbackRating, int teacherConfidenceRating)
        {
            _context.TeacherAiRatings.Add(new TeacherAiRating { TeacherId = teacherId, TaskHistoryId = taskHistoryId, AiFeedbackRating = aiFeedbackRating, TeacherConfidenceRating = teacherConfidenceRating, CreatedAt = DateTime.UtcNow });
            await _context.SaveChangesAsync();
        }

        public async Task<List<ClassGradingItemResponse>> GetClassGradingItemsAsync(int classId)
        {
            var cls = await _context.Classrooms.Where(c => c.Id == classId).Select(c => new { c.Id, c.ClassName, c.TeacherId }).FirstOrDefaultAsync();
            if (cls is null) return new();
            var studentIds = await _context.ClassEnrollments.Where(e => e.ClassroomId == classId && e.Status == EnrollmentStatus.Active).Select(e => e.StudentId).ToListAsync();
            if (!studentIds.Any()) return new();
            var hiddenIds = await _context.TeacherGradingStars.Where(s => s.ClassId == classId && s.IsHidden).Select(s => s.TaskHistoryId).ToListAsync();
            var rows = await _context.TaskHistories.AsNoTracking().Include(th => th.User).Include(th => th.WritingTask1).ThenInclude(w => w!.QuestionType).Include(th => th.WritingTask2).ThenInclude(w => w!.QuestionType).Where(th => studentIds.Contains(th.UserId) && (th.WritingTask1Id.HasValue || th.WritingTask2Id.HasValue) && !hiddenIds.Contains(th.Id)).OrderByDescending(th => th.Created).ToListAsync();
            var thIds = rows.Select(th => th.Id).ToList();
            var ratings = await _context.TeacherAiRatings.AsNoTracking().Where(r => thIds.Contains(r.TaskHistoryId) && r.TeacherId == cls.TeacherId).GroupBy(r => r.TaskHistoryId).Select(g => g.OrderByDescending(r => r.CreatedAt).Select(r => new { r.TaskHistoryId, r.AiFeedbackRating, r.TeacherConfidenceRating }).First()).ToListAsync();
            var rByTask = ratings.ToDictionary(r => r.TaskHistoryId, r => r);
            return rows.Select(th => { rByTask.TryGetValue(th.Id, out var rt); return new ClassGradingItemResponse { TaskHistoryId = th.Id, ClassId = classId, StudentId = th.UserId, StudentName = th.User?.DisplayName ?? th.User?.Username ?? th.User?.Email ?? "Unknown", ClassName = cls.ClassName, Created = th.Created, Topic = th.WritingTask1Id.HasValue && th.WritingTask2Id.HasValue ? "Virtual Exam" : th.WritingTask1Id.HasValue ? (th.WritingTask1?.Question ?? string.Empty) : (th.WritingTask2?.Question ?? string.Empty), TaskType = th.WritingTask1Id.HasValue && th.WritingTask2Id.HasValue ? "Virtual Exam" : th.WritingTask1Id.HasValue ? "Task 1" : "Task 2", QuestionType = th.WritingTask1Id.HasValue && th.WritingTask2Id.HasValue ? "Full Exam" : th.WritingTask1Id.HasValue ? (th.WritingTask1?.QuestionType?.Name ?? string.Empty) : (th.WritingTask2?.QuestionType?.Name ?? string.Empty), AiScore = th.AiScore ?? th.Score, YourScore = th.TeacherScore, FbScore = th.GradingMode == "ai" ? rt?.AiFeedbackRating : null, ConfidenceScore = rt?.TeacherConfidenceRating, IsStarred = false, GradingMode = th.GradingMode, ReviewStatus = th.ReviewStatus, ReviewComment = th.ReviewComment }; }).ToList();
        }

        public async Task<PagedResults<ClassGradingItemResponse>> GetPaginatedGradingItemsAsync(int? teacherId, int? classId, string timeFilter, DateTime? customStart, DateTime? customEnd, bool isStarredOnly, string taskTypeFilter, string gradingModeFilter, string sortOrder, int page, int pageSize, bool sampleOnly)
        {
            var cutoff = timeFilter switch { "7days" => (DateTime?)DateTime.UtcNow.AddDays(-7), "30days" => (DateTime?)DateTime.UtcNow.AddDays(-30), _ => null };
            var customEndI = customEnd?.AddDays(1).AddTicks(-1);
            var enrQ = _context.ClassEnrollments.Include(e => e.Classroom).Where(e => e.Status == EnrollmentStatus.Active);
            if (teacherId.HasValue) enrQ = enrQ.Where(e => e.Classroom.TeacherId == teacherId.Value);
            if (classId.HasValue && classId.Value > 0) enrQ = enrQ.Where(e => e.ClassroomId == classId.Value);
            var enr = await enrQ.Select(e => new { e.StudentId, e.ClassroomId, e.Classroom.ClassName }).ToListAsync();
            if (!enr.Any()) return new PagedResults<ClassGradingItemResponse> { Page = page, PageSize = pageSize, TotalCount = 0, Items = new List<ClassGradingItemResponse>() };
            var sids = enr.Select(e => e.StudentId).Distinct().ToList();
            var cids = enr.Select(e => e.ClassroomId).Distinct().ToList();
            var starred = new HashSet<int>(); var hidden = new HashSet<int>();
            if (teacherId.HasValue) { var stars = await _context.TeacherGradingStars.Where(s => s.TeacherId == teacherId.Value && cids.Contains(s.ClassId)).ToListAsync(); starred = stars.Where(s => s.IsStarred).Select(s => s.TaskHistoryId).ToHashSet(); hidden = stars.Where(s => s.IsHidden).Select(s => s.TaskHistoryId).ToHashSet(); }
            var q = _context.TaskHistories.Include(th => th.User).Include(th => th.WritingTask1).ThenInclude(w1 => w1!.QuestionType).Include(th => th.WritingTask2).ThenInclude(w2 => w2!.QuestionType).AsNoTracking().Where(th => sids.Contains(th.UserId) && (th.WritingTask1Id.HasValue || th.WritingTask2Id.HasValue) && !hidden.Contains(th.Id));
            if (cutoff.HasValue) q = q.Where(th => th.Created >= cutoff.Value);
            if (timeFilter == "custom") { if (customStart.HasValue) q = q.Where(th => th.Created >= customStart.Value); if (customEndI.HasValue) q = q.Where(th => th.Created <= customEndI.Value); }
            if (!string.IsNullOrEmpty(taskTypeFilter) && taskTypeFilter != "all") { if (taskTypeFilter == "task1") q = q.Where(th => th.WritingTask1Id.HasValue && !th.WritingTask2Id.HasValue); else if (taskTypeFilter == "task2") q = q.Where(th => !th.WritingTask1Id.HasValue && th.WritingTask2Id.HasValue); else if (taskTypeFilter == "virtual") q = q.Where(th => th.WritingTask1Id.HasValue && th.WritingTask2Id.HasValue); }
            if (!string.IsNullOrEmpty(gradingModeFilter) && gradingModeFilter != "all") { if (gradingModeFilter == "ai") q = q.Where(th => th.GradingMode == "ai"); else if (gradingModeFilter == "self") q = q.Where(th => th.GradingMode == "self"); else if (gradingModeFilter == "none") q = q.Where(th => th.GradingMode == null); }
            if (sampleOnly) q = q.Where(th => th.TeacherScore.HasValue && (th.GradingMode == "ai" || th.GradingMode == "self"));
            if (isStarredOnly) { var al = starred.ToList(); if (!al.Any()) return new PagedResults<ClassGradingItemResponse> { Page = page, PageSize = pageSize, TotalCount = 0, Items = new List<ClassGradingItemResponse>() }; q = q.Where(th => al.Contains(th.Id)); }
            var total = await q.CountAsync();
            q = sortOrder == "oldest" ? q.OrderBy(th => th.Created) : q.OrderByDescending(th => th.Created);
            var page_items = await q.Skip((page - 1) * pageSize).Take(pageSize).ToListAsync();
            var pids = page_items.Select(th => th.Id).ToList();
            var ratQ = _context.TeacherAiRatings.AsNoTracking().Where(r => pids.Contains(r.TaskHistoryId));
            if (teacherId.HasValue) ratQ = ratQ.Where(r => r.TeacherId == teacherId.Value);
            var rats = await ratQ.GroupBy(r => r.TaskHistoryId).Select(g => g.OrderByDescending(x => x.CreatedAt).Select(x => new { x.TaskHistoryId, x.AiFeedbackRating, x.TeacherConfidenceRating }).First()).ToListAsync();
            var ratById = rats.ToDictionary(x => x.TaskHistoryId, x => x);
            var items = page_items.Select(th => { var e = enr.First(x => x.StudentId == th.UserId); var isStar = starred.Contains(th.Id); ratById.TryGetValue(th.Id, out var rt); return new ClassGradingItemResponse { TaskHistoryId = th.Id, ClassId = e.ClassroomId, StudentId = th.UserId, StudentName = th.User?.DisplayName ?? th.User?.Username ?? th.User?.Email ?? "Unknown", ClassName = e.ClassName, Created = th.Created, Topic = th.WritingTask1Id.HasValue && th.WritingTask2Id.HasValue ? "Virtual Exam" : th.WritingTask1Id.HasValue ? (th.WritingTask1?.Question ?? string.Empty) : (th.WritingTask2?.Question ?? string.Empty), TaskType = th.WritingTask1Id.HasValue && th.WritingTask2Id.HasValue ? "Virtual Exam" : th.WritingTask1Id.HasValue ? "Task 1" : "Task 2", QuestionType = th.WritingTask1Id.HasValue && th.WritingTask2Id.HasValue ? "Full Exam" : th.WritingTask1Id.HasValue ? (th.WritingTask1?.QuestionType?.Name ?? string.Empty) : (th.WritingTask2?.QuestionType?.Name ?? string.Empty), AiScore = th.AiScore ?? th.Score, YourScore = th.TeacherScore, FbScore = th.GradingMode == "ai" ? rt?.AiFeedbackRating : null, ConfidenceScore = rt?.TeacherConfidenceRating, IsStarred = isStar, GradingMode = th.GradingMode, ReviewStatus = th.ReviewStatus, ReviewComment = th.ReviewComment }; }).ToList();
            return new PagedResults<ClassGradingItemResponse> { Items = items, TotalCount = total, Page = page, PageSize = pageSize };
        }

        public async Task<ClassChartRawData> GetChartRawDataAsync(int classId, DateTime classStartDate)
        {
            var ids = await _context.ClassEnrollments.Where(e => e.ClassroomId == classId && e.Status == EnrollmentStatus.Active).Select(e => e.StudentId).ToListAsync();
            if (!ids.Any()) return new ClassChartRawData { StartDate = classStartDate, Histories = new() };
            var histories = await _context.TaskHistories.Where(th => ids.Contains(th.UserId) && (th.WritingTask1Id.HasValue || th.WritingTask2Id.HasValue)).OrderBy(th => th.Created).Select(th => new ChartHistoryRow { Created = th.Created, WritingTask1Id = th.WritingTask1Id, WritingTask2Id = th.WritingTask2Id, Score = th.Score, Score1 = th.Score1, Score2 = th.Score2 }).ToListAsync();
            return new ClassChartRawData { StartDate = classStartDate, Histories = histories };
        }

        public async Task<TaskHistory?> GetTaskHistoryDetailAsync(int taskHistoryId)
            => await _context.TaskHistories.AsNoTracking().Include(th => th.User).Include(th => th.WritingTask1).ThenInclude(w => w!.QuestionType).Include(th => th.WritingTask2).ThenInclude(w => w!.QuestionType).FirstOrDefaultAsync(th => th.Id == taskHistoryId);

        public async Task<List<WritingEvaluation>> GetEvaluationsForTaskHistoryAsync(int? task1Id, int? task2Id)
            => await _context.WritingEvaluations.AsNoTracking().Include(e => e.CriteriaScores).ThenInclude(cs => cs.FeedbackDetails).Include(e => e.CriteriaScores).ThenInclude(cs => cs.Strengths).Include(e => e.CriteriaScores).ThenInclude(cs => cs.AreasForImprovement).Include(e => e.Suggestions).Include(e => e.NextSteps).Where(e => (task1Id.HasValue && e.WritingTask1Id == task1Id.Value) || (task2Id.HasValue && e.WritingTask2Id == task2Id.Value)).OrderByDescending(e => e.EvaluatedAt).ToListAsync();

        public async Task<(int? classId, string className)> GetClassInfoForTaskHistoryAsync(int studentId)
        {
            var enrollment = await _context.ClassEnrollments.AsNoTracking().Include(e => e.Classroom).Where(e => e.StudentId == studentId && e.Status == EnrollmentStatus.Active).OrderByDescending(e => e.EnrolledAt).FirstOrDefaultAsync();
            if (enrollment is null) return (null, string.Empty);
            return (enrollment.ClassroomId, enrollment.Classroom?.ClassName ?? string.Empty);
        }

        public async Task<bool> IsStarredForTeacherAsync(int taskHistoryId, int teacherId)
            => await _context.TeacherGradingStars.AnyAsync(s => s.TaskHistoryId == taskHistoryId && s.TeacherId == teacherId && s.IsStarred);

        public async Task<(int? fbScore, int? confidenceScore)> GetLatestRatingAsync(int taskHistoryId, int teacherId)
        {
            var r = await _context.TeacherAiRatings.AsNoTracking().Where(r => r.TaskHistoryId == taskHistoryId && r.TeacherId == teacherId).OrderByDescending(r => r.CreatedAt).FirstOrDefaultAsync();
            if (r is null) return (null, null);
            return (r.AiFeedbackRating, r.TeacherConfidenceRating);
        }

        public async Task<ClassGradingItemResponse?> UpdateClassGradingEvaluationAsync(int classId, int taskHistoryId, int teacherId, string targetTaskType, EvaluationDataDto evalData)
        {
            var norm = (targetTaskType ?? "task2").Trim().ToLowerInvariant();
            var upTask1 = norm == "task1";
            var cls = await _context.Classrooms.AsNoTracking().Where(c => c.Id == classId).Select(c => new { c.Id, c.ClassName, c.TeacherId }).FirstOrDefaultAsync();
            if (cls is null || cls.TeacherId != teacherId) return null;
            var th = await _context.TaskHistories.FirstOrDefaultAsync(t => t.Id == taskHistoryId);
            if (th is null) return null;
            var inClass = await _context.ClassEnrollments.AnyAsync(e => e.ClassroomId == classId && e.StudentId == th.UserId && e.Status == EnrollmentStatus.Active);
            if (!inClass) return null;
            if (upTask1 && !th.WritingTask1Id.HasValue) return null;
            if (!upTask1 && !th.WritingTask2Id.HasValue) return null;
            var existEval = await _context.WritingEvaluations.Include(e => e.CriteriaScores).Include(e => e.Suggestions).Include(e => e.NextSteps).Where(e => upTask1 ? e.WritingTask1Id == th.WritingTask1Id : e.WritingTask2Id == th.WritingTask2Id).OrderBy(e => e.Id).FirstOrDefaultAsync();
            await CaptureSnapshotAsync(classId, taskHistoryId, teacherId, th, existEval);
            if (existEval is null) { var ev = new WritingEvaluation { WritingTask1Id = upTask1 ? th.WritingTask1Id : null, WritingTask2Id = upTask1 ? null : th.WritingTask2Id, TaskType = upTask1 ? WritingTaskType.Task1 : WritingTaskType.Task2, OverallScore = (decimal)evalData.OverallBand, OverallSummary = evalData.OverallAssessment?.Summary, EvaluatedAt = DateTime.UtcNow, CriteriaScores = MapCriteria(evalData.Criteria), Suggestions = (evalData.OverallAssessment?.SpecificSuggestions ?? new()).Select(s => new EvaluationSuggestion { SuggestionDescription = s }).ToList(), NextSteps = (evalData.OverallAssessment?.NextSteps ?? new()).Select(s => new EvaluationNextStep { NextStepDescription = s }).ToList() }; _context.WritingEvaluations.Add(ev); }
            else { if (existEval.CriteriaScores.Any()) _context.CriteriaScores.RemoveRange(existEval.CriteriaScores); if (existEval.Suggestions.Any()) _context.EvaluationSuggestions.RemoveRange(existEval.Suggestions); if (existEval.NextSteps.Any()) _context.EvaluationNextSteps.RemoveRange(existEval.NextSteps); existEval.TaskType = upTask1 ? WritingTaskType.Task1 : WritingTaskType.Task2; existEval.OverallScore = (decimal)evalData.OverallBand; existEval.OverallSummary = evalData.OverallAssessment?.Summary; existEval.EvaluatedAt = DateTime.UtcNow; existEval.CriteriaScores = MapCriteria(evalData.Criteria); existEval.Suggestions = (evalData.OverallAssessment?.SpecificSuggestions ?? new()).Select(s => new EvaluationSuggestion { SuggestionDescription = s }).ToList(); existEval.NextSteps = (evalData.OverallAssessment?.NextSteps ?? new()).Select(s => new EvaluationNextStep { NextStepDescription = s }).ToList(); _context.WritingEvaluations.Update(existEval); }
            var sc = evalData.OverallBand;
            if (!th.AiScore.HasValue) th.AiScore = th.Score;
            if (th.WritingTask1Id.HasValue && th.WritingTask2Id.HasValue) { if (upTask1) th.Score1 = sc; else th.Score2 = sc; var s1 = th.Score1 ?? th.Score; var s2 = th.Score2 ?? th.Score; th.Score = RoundBand((s1 + 2f * s2) / 3f); th.TeacherScore = th.Score; }
            else { th.Score = sc; th.TeacherScore = sc; if (upTask1) th.Score1 = sc; else th.Score2 = sc; }
            _context.TaskHistories.Update(th); await _context.SaveChangesAsync();
            return await _context.TaskHistories.AsNoTracking().Include(t => t.User).Include(t => t.WritingTask1).ThenInclude(w => w!.QuestionType).Include(t => t.WritingTask2).ThenInclude(w => w!.QuestionType).Where(t => t.Id == taskHistoryId).Select(t => new ClassGradingItemResponse { TaskHistoryId = t.Id, ClassId = classId, StudentId = t.UserId, StudentName = t.User.DisplayName ?? t.User.Username ?? t.User.Email ?? "Unknown", ClassName = cls.ClassName, Created = t.Created, Topic = t.WritingTask1Id.HasValue && t.WritingTask2Id.HasValue ? "Virtual Exam" : t.WritingTask1Id.HasValue ? (t.WritingTask1!.Question ?? string.Empty) : (t.WritingTask2!.Question ?? string.Empty), TaskType = t.WritingTask1Id.HasValue && t.WritingTask2Id.HasValue ? "Virtual Exam" : t.WritingTask1Id.HasValue ? "Task 1" : "Task 2", QuestionType = t.WritingTask1Id.HasValue && t.WritingTask2Id.HasValue ? "Full Exam" : t.WritingTask1Id.HasValue ? (t.WritingTask1!.QuestionType!.Name ?? string.Empty) : (t.WritingTask2!.QuestionType!.Name ?? string.Empty), AiScore = t.AiScore ?? t.Score, YourScore = t.TeacherScore, IsStarred = false, GradingMode = t.GradingMode, ReviewStatus = t.ReviewStatus, ReviewComment = t.ReviewComment }).FirstOrDefaultAsync();
        }

        private async Task CaptureSnapshotAsync(int classId, int taskHistoryId, int teacherId, TaskHistory th, WritingEvaluation? existEval)
        {
            var star = await _context.TeacherGradingStars.FirstOrDefaultAsync(s => s.TeacherId == teacherId && s.ClassId == classId && s.TaskHistoryId == taskHistoryId);
            if (star is null) { star = new TeacherGradingStar { TeacherId = teacherId, ClassId = classId, TaskHistoryId = taskHistoryId, IsStarred = false, IsHidden = false, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow }; _context.TeacherGradingStars.Add(star); }
            if (star.AiOverallScore.HasValue || star.AiTrScore.HasValue || star.AiCcScore.HasValue || star.AiLrScore.HasValue || star.AiGrScore.HasValue) { star.UpdatedAt = DateTime.UtcNow; return; }
            star.AiOverallScore = th.AiScore ?? th.Score;
            foreach (var cs in existEval?.CriteriaScores ?? new List<CriteriaScore>()) { var k = ResolveKey(cs.CriteriaName); switch (k) { case "TR": star.AiTrScore = cs.Score; break; case "CC": star.AiCcScore = cs.Score; break; case "LR": star.AiLrScore = cs.Score; break; case "GR": star.AiGrScore = cs.Score; break; } }
            star.UpdatedAt = DateTime.UtcNow;
        }

        private static List<CriteriaScore> MapCriteria(Dictionary<string, CriteriaDataDto>? data)
        {
            if (data is null) return new();
            return data.Select(kv => new CriteriaScore { CriteriaName = kv.Key, Score = kv.Value.BandScore, BandReason = kv.Value.BandReason, FeedbackDetails = (kv.Value.FeedbackDetail ?? new()).Select(fd => new CriteriaFeedbackDetail { Quote = fd.Quote, Description = fd.Description ?? string.Empty }).ToList(), Strengths = (kv.Value.Strengths ?? new()).Select(s => new CriteriaStrength { StrengthDescription = s }).ToList(), AreasForImprovement = (kv.Value.AreasForImprovement ?? new()).Select(a => new CriteriaImprovement { ImprovementDescription = a }).ToList() }).ToList();
        }

        private static string? ResolveKey(string? name)
        {
            var n = (name ?? string.Empty).Trim().ToLowerInvariant();
            if (string.IsNullOrWhiteSpace(n)) return null;
            if (n.Contains("task") || n.Contains("response") || n.Contains("achievement")) return "TR";
            if (n.Contains("coherence") || n.Contains("cohesion")) return "CC";
            if (n.Contains("lexical") || n.Contains("vocabulary")) return "LR";
            if (n.Contains("grammar") || n.Contains("grammatical") || n.Contains("accuracy")) return "GR";
            return null;
        }

        private static float RoundBand(float score) { var b = Math.Max(0f, Math.Min(9f, score)); var i = (float)Math.Floor(b); var d = b - i; if (d >= 0.75f) return i + 1f; if (d > 0.3f) return i + 0.5f; return i; }
    }
}

