using BusinessObject;
using BusinessObject.Dtos.Auth;
using DAL;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace TeacherPlatform.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly TeacherPlatformDbContext _context;
        private readonly IConfiguration _config;

        public AuthController(TeacherPlatformDbContext context, IConfiguration config)
        {
            _context = context;
            _config = config;
        }

        // POST /api/Auth/login
        [HttpPost("login")]
        [AllowAnonymous]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Email == request.Email && !u.IsBanned);

            if (user is null)
                return Unauthorized(new { message = "Invalid credentials." });

            // Simple BCrypt verify (the original system uses hashed passwords)
            bool passwordValid = false;
            try { passwordValid = BCrypt.Net.BCrypt.Verify(request.Password, user.Password); }
            catch { passwordValid = false; }

            if (!passwordValid)
                return Unauthorized(new { message = "Invalid credentials." });

            if (user.Role != UserRole.Teacher && user.Role != UserRole.Admin && user.Role != UserRole.Academic)
                return Forbid();

            var token = GenerateJwt(user);

            return Ok(new LoginResponse
            {
                Message = "Login successful.",
                Token = token,
                RefreshToken = string.Empty,
                RefreshTokenExpiresAt = DateTime.UtcNow.AddDays(7).ToString("o"),
                User = new UserInfoResponse
                {
                    Id = user.Id,
                    Username = user.Username ?? string.Empty,
                    Email = user.Email ?? string.Empty,
                    Role = user.Role.ToString(),
                    DisplayName = user.DisplayName,
                }
            });
        }

        // GET /api/Auth/profile
        [HttpGet("profile")]
        [Authorize]
        public async Task<IActionResult> GetProfile()
        {
            var idStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!int.TryParse(idStr, out var userId)) return Unauthorized();

            var user = await _context.Users.FindAsync(userId);
            if (user is null) return NotFound();

            return Ok(new UserInfoResponse
            {
                Id = user.Id,
                Username = user.Username ?? string.Empty,
                Email = user.Email ?? string.Empty,
                Role = user.Role.ToString(),
                DisplayName = user.DisplayName,
            });
        }

        private string GenerateJwt(User user)
        {
            var jwtKey = _config["Jwt:Key"] ?? throw new InvalidOperationException("JWT Key not configured.");
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Email, user.Email ?? string.Empty),
                new Claim(ClaimTypes.Role, user.Role.ToString()),
                new Claim("displayName", user.DisplayName ?? user.Username ?? string.Empty),
            };

            var token = new JwtSecurityToken(
                issuer: _config["Jwt:Issuer"],
                audience: _config["Jwt:Audience"],
                claims: claims,
                expires: DateTime.UtcNow.AddHours(24),
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}
