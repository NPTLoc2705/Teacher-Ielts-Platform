using BusinessObject.Dtos.Auth;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Service.UserService;
using System.Security.Claims;

namespace TeacherPlatform.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IUserService _userService;

        public AuthController(IUserService userService)
        {
            _userService = userService;
        }

        // POST /api/Auth/login
        [HttpPost("login")]
        [AllowAnonymous]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            var result = await _userService.LoginAsync(request);

            return result.Status switch
            {
                AuthStatus.Success => Ok(result.Data),
                AuthStatus.Forbidden => Forbid(),
                _ => Unauthorized(new { message = result.ErrorMessage }),
            };
        }

        // POST /api/Auth/register
        [HttpPost("register")]
        [AllowAnonymous]
        public async Task<IActionResult> Register([FromBody] RegisterRequest request)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var result = await _userService.RegisterAsync(request);

            return result.Status switch
            {
                AuthStatus.Success => Ok(result.Data),
                AuthStatus.Conflict => Conflict(new { message = result.ErrorMessage }),
                AuthStatus.BadRequest => BadRequest(new { message = result.ErrorMessage }),
                _ => BadRequest(new { message = result.ErrorMessage ?? "Registration failed." }),
            };
        }

        // GET /api/Auth/profile
        [HttpGet("profile")]
        [Authorize]
        public async Task<IActionResult> GetProfile()
        {
            var idClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!int.TryParse(idClaim, out var userId))
                return Unauthorized();

            var profile = await _userService.GetProfileAsync(userId);
            return profile is null ? NotFound() : Ok(profile);
        }
    }
}

