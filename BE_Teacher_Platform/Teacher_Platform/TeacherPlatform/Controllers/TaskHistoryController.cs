using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Service.ClassService;
using System.Security.Claims;

namespace TeacherPlatform.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class TaskHistoryController : ControllerBase
    {
        private readonly IClassService _classService;

        public TaskHistoryController(IClassService classService)
        {
            _classService = classService;
        }

        private int GetTeacherId()
        {
            var val = User.FindFirstValue(ClaimTypes.NameIdentifier);
            return int.TryParse(val, out var id) ? id : 0;
        }

        // GET /api/TaskHistory/{taskHistoryId}/detail
        [HttpGet("{taskHistoryId:int}/detail")]
        public async Task<IActionResult> GetDetail(int taskHistoryId)
        {
            var teacherId = GetTeacherId();
            if (teacherId == 0) return Unauthorized();
            var detail = await _classService.GetTaskHistoryDetailAsync(taskHistoryId, teacherId);
            if (detail is null) return NotFound();
            return Ok(detail);
        }
    }
}
