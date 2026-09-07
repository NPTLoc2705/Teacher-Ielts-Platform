using BusinessObject.Dtos;
using BusinessObject.Dtos.Teacher;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Service.ClassService;
using System.Security.Claims;

namespace TeacherPlatform.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class ClassController : ControllerBase
    {
        private readonly IClassService _classService;

        public ClassController(IClassService classService)
        {
            _classService = classService;
        }

        private int GetTeacherId()
        {
            var val = User.FindFirstValue(ClaimTypes.NameIdentifier);
            return int.TryParse(val, out var id) ? id : 0;
        }

        // GET /api/Class
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var teacherId = GetTeacherId();
            if (teacherId == 0) return Unauthorized();
            var classes = await _classService.GetAllByTeacherAsync(teacherId);
            return Ok(classes);
        }

        // GET /api/Class/{classId}
        [HttpGet("{classId:int}")]
        public async Task<IActionResult> GetById(int classId)
        {
            var teacherId = GetTeacherId();
            if (teacherId == 0) return Unauthorized();
            var cls = await _classService.GetByIdAsync(classId, teacherId);
            if (cls is null) return NotFound();
            return Ok(cls);
        }

        // POST /api/Class
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateClassRequest request)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);
            var teacherId = GetTeacherId();
            if (teacherId == 0) return Unauthorized();
            try
            {
                var cls = await _classService.CreateAsync(teacherId, request);
                return CreatedAtAction(nameof(GetById), new { classId = cls.Id }, cls);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // PUT /api/Class/{classId}
        [HttpPut("{classId:int}")]
        public async Task<IActionResult> Update(int classId, [FromBody] UpdateClassRequest request)
        {
            var teacherId = GetTeacherId();
            if (teacherId == 0) return Unauthorized();
            try
            {
                var cls = await _classService.UpdateAsync(classId, teacherId, request);
                if (cls is null) return NotFound();
                return Ok(cls);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // DELETE /api/Class/{classId}
        [HttpDelete("{classId:int}")]
        public async Task<IActionResult> Delete(int classId)
        {
            var teacherId = GetTeacherId();
            if (teacherId == 0) return Unauthorized();
            var success = await _classService.DeleteAsync(classId, teacherId);
            if (!success) return NotFound();
            return NoContent();
        }

        // GET /api/Class/{classId}/stats
        [HttpGet("{classId:int}/stats")]
        public async Task<IActionResult> GetStats(int classId)
        {
            var teacherId = GetTeacherId();
            if (teacherId == 0) return Unauthorized();
            var stats = await _classService.GetClassStatsAsync(classId, teacherId);
            if (stats is null) return NotFound();
            return Ok(stats);
        }

        // GET /api/Class/{classId}/students/search?q=...
        [HttpGet("{classId:int}/students/search")]
        public async Task<IActionResult> SearchStudents(int classId, [FromQuery] string q)
        {
            var teacherId = GetTeacherId();
            if (teacherId == 0) return Unauthorized();
            var results = await _classService.SearchStudentsAsync(classId, teacherId, q ?? string.Empty);
            return Ok(results);
        }

        // POST /api/Class/{classId}/students/enroll
        [HttpPost("{classId:int}/students/enroll")]
        public async Task<IActionResult> EnrollStudents(int classId, [FromBody] EnrollStudentsRequest request)
        {
            var teacherId = GetTeacherId();
            if (teacherId == 0) return Unauthorized();
            var result = await _classService.EnrollStudentsAsync(classId, teacherId, request.StudentIds);
            if (result is null) return NotFound();
            return Ok(result);
        }

        // GET /api/Class/{classId}/students
        [HttpGet("{classId:int}/students")]
        public async Task<IActionResult> GetStudents(int classId)
        {
            var teacherId = GetTeacherId();
            if (teacherId == 0) return Unauthorized();
            var students = await _classService.GetEnrolledStudentsAsync(classId, teacherId);
            if (students is null) return NotFound();
            return Ok(students);
        }

        // DELETE /api/Class/{classId}/students/{studentId}
        [HttpDelete("{classId:int}/students/{studentId:int}")]
        public async Task<IActionResult> RemoveStudent(int classId, int studentId)
        {
            var teacherId = GetTeacherId();
            if (teacherId == 0) return Unauthorized();
            var success = await _classService.RemoveStudentAsync(classId, teacherId, studentId);
            if (!success) return NotFound();
            return NoContent();
        }

        // GET /api/Class/{classId}/grading
        [HttpGet("{classId:int}/grading")]
        public async Task<IActionResult> GetGradingItems(int classId)
        {
            var teacherId = GetTeacherId();
            if (teacherId == 0) return Unauthorized();
            var items = await _classService.GetClassGradingItemsAsync(classId, teacherId);
            if (items is null) return NotFound();
            return Ok(items);
        }

        // GET /api/Class/grading/paginated
        [HttpGet("grading/paginated")]
        public async Task<IActionResult> GetPaginatedGradingItems(
            [FromQuery] int? classId,
            [FromQuery] string timeFilter = "all",
            [FromQuery] DateTime? customStart = null,
            [FromQuery] DateTime? customEnd = null,
            [FromQuery] bool isStarredOnly = false,
            [FromQuery] string taskTypeFilter = "all",
            [FromQuery] string gradingModeFilter = "all",
            [FromQuery] string sortOrder = "newest",
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 20,
            [FromQuery] bool sampleOnly = false)
        {
            var teacherId = GetTeacherId();
            if (teacherId == 0) return Unauthorized();
            var result = await _classService.GetPaginatedGradingItemsAsync(
                teacherId, classId, timeFilter, customStart, customEnd, isStarredOnly,
                taskTypeFilter, gradingModeFilter, sortOrder, page, pageSize, sampleOnly);
            return Ok(result);
        }

        // POST /api/Class/{classId}/grading/{taskHistoryId}/star
        [HttpPost("{classId:int}/grading/{taskHistoryId:int}/star")]
        public async Task<IActionResult> UpsertStar(int classId, int taskHistoryId, [FromBody] UpdateTeacherGradingStarRequest request)
        {
            var teacherId = GetTeacherId();
            if (teacherId == 0) return Unauthorized();
            var success = await _classService.UpsertTeacherGradingStarAsync(taskHistoryId, teacherId, classId, request.IsStarred);
            if (!success) return NotFound();
            return Ok(new { success = true });
        }

        // POST /api/Class/grading/{taskHistoryId}/mode
        [HttpPost("grading/{taskHistoryId:int}/mode")]
        public async Task<IActionResult> SetGradingMode(int taskHistoryId, [FromBody] UpdateGradingModeRequest request)
        {
            var teacherId = GetTeacherId();
            if (teacherId == 0) return Unauthorized();
            var success = await _classService.SetGradingModeAsync(taskHistoryId, teacherId, request.GradingMode);
            return success ? Ok(new { success = true }) : NotFound();
        }

        // POST /api/Class/{classId}/grading/{taskHistoryId}/hide
        [HttpPost("{classId:int}/grading/{taskHistoryId:int}/hide")]
        public async Task<IActionResult> HideGradingItem(int classId, int taskHistoryId)
        {
            var teacherId = GetTeacherId();
            if (teacherId == 0) return Unauthorized();
            var success = await _classService.HideGradingItemAsync(teacherId, classId, taskHistoryId);
            return success ? Ok(new { success = true }) : NotFound();
        }

        // POST /api/Class/grading/{taskHistoryId}/review
        [HttpPost("grading/{taskHistoryId:int}/review")]
        public async Task<IActionResult> UpdateReviewStatus(int taskHistoryId, [FromBody] UpdateTaskReviewStatusRequest request)
        {
            var teacherId = GetTeacherId();
            if (teacherId == 0) return Unauthorized();
            var success = await _classService.UpdateTaskReviewStatusAsync(taskHistoryId, teacherId, request.Status, request.Comment);
            return success ? Ok(new { success = true }) : BadRequest(new { message = "Invalid review status or task not found." });
        }

        // GET /api/Class/grading/{taskHistoryId}/ai-snapshot
        [HttpGet("grading/{taskHistoryId:int}/ai-snapshot")]
        public async Task<IActionResult> GetAiSnapshot(int taskHistoryId)
        {
            var teacherId = GetTeacherId();
            if (teacherId == 0) return Unauthorized();
            var snap = await _classService.GetTeacherAiScoreSnapshotAsync(taskHistoryId, teacherId);
            if (snap is null) return NotFound();
            return Ok(snap);
        }

        // POST /api/Class/grading/{taskHistoryId}/ai-rating
        [HttpPost("grading/{taskHistoryId:int}/ai-rating")]
        public async Task<IActionResult> SubmitAiRating(int taskHistoryId, [FromBody] SubmitAiRatingRequest request)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);
            var teacherId = GetTeacherId();
            if (teacherId == 0) return Unauthorized();
            await _classService.SubmitAiRatingAsync(teacherId, taskHistoryId, request.AiFeedbackRating, request.TeacherConfidenceRating);
            return Ok(new { success = true });
        }

        // PUT /api/Class/{classId}/grading/{taskHistoryId}/evaluation
        [HttpPut("{classId:int}/grading/{taskHistoryId:int}/evaluation")]
        public async Task<IActionResult> UpdateEvaluation(int classId, int taskHistoryId, [FromBody] UpdateTeacherGradingEvaluationRequest request)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);
            if (request.EvaluationData is null) return BadRequest(new { message = "evaluationData is required." });
            var teacherId = GetTeacherId();
            if (teacherId == 0) return Unauthorized();
            var result = await _classService.UpdateClassGradingEvaluationAsync(classId, taskHistoryId, teacherId, request.TargetTaskType, request.EvaluationData);
            if (result is null) return NotFound();
            return Ok(result);
        }

        // GET /api/Class/{classId}/chart
        [HttpGet("{classId:int}/chart")]
        public async Task<IActionResult> GetChartData(int classId)
        {
            var teacherId = GetTeacherId();
            if (teacherId == 0) return Unauthorized();
            var chart = await _classService.GetClassChartDataAsync(classId, teacherId);
            if (chart is null) return NotFound();
            return Ok(chart);
        }
    }
}
