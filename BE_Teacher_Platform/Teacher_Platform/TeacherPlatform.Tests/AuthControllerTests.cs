using BusinessObject.Dtos.Auth;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Moq;
using Service.UserService;
using System.Security.Claims;
using TeacherPlatform.Controllers;

namespace TeacherPlatform.Tests
{
    public class AuthControllerTests
    {
        private readonly Mock<IUserService> _serviceMock;
        private readonly AuthController _sut;

        public AuthControllerTests()
        {
            _serviceMock = new Mock<IUserService>();
            _sut = new AuthController(_serviceMock.Object);
        }

        // ── POST /api/Auth/login ─────────────────────────────────────────

        [Fact]
        public async Task Login_SuccessResult_Returns200Ok()
        {
            var loginResponse = new LoginResponse { Message = "Login successful.", Token = "jwt" };
            _serviceMock.Setup(s => s.LoginAsync(It.IsAny<LoginRequest>()))
                        .ReturnsAsync(AuthResult.Success(loginResponse));

            var actionResult = await _sut.Login(new LoginRequest
            {
                Email = "teacher@example.com",
                Password = "pass",
            });

            var okResult = Assert.IsType<OkObjectResult>(actionResult);
            Assert.Equal(200, okResult.StatusCode);
        }

        [Fact]
        public async Task Login_InvalidCredentials_Returns401Unauthorized()
        {
            _serviceMock.Setup(s => s.LoginAsync(It.IsAny<LoginRequest>()))
                        .ReturnsAsync(AuthResult.InvalidCredentials());

            var actionResult = await _sut.Login(new LoginRequest
            {
                Email = "ghost@example.com",
                Password = "wrong",
            });

            Assert.IsType<UnauthorizedObjectResult>(actionResult);
        }

        [Fact]
        public async Task Login_ForbiddenResult_Returns403Forbid()
        {
            _serviceMock.Setup(s => s.LoginAsync(It.IsAny<LoginRequest>()))
                        .ReturnsAsync(AuthResult.Forbidden());

            var actionResult = await _sut.Login(new LoginRequest
            {
                Email = "student@example.com",
                Password = "pass",
            });

            Assert.IsType<ForbidResult>(actionResult);
        }

        // ── GET /api/Auth/profile ──────────────────────────────────────

        private static AuthController ControllerWithClaim(Mock<IUserService> mock, string? nameIdentifier)
        {
            var claims = nameIdentifier is not null
                ? new[] { new Claim(ClaimTypes.NameIdentifier, nameIdentifier) }
                : Array.Empty<Claim>();

            var identity = new ClaimsIdentity(claims, "TestAuth");
            var principal = new ClaimsPrincipal(identity);

            var controller = new AuthController(mock.Object)
            {
                ControllerContext = new ControllerContext
                {
                    HttpContext = new DefaultHttpContext { User = principal },
                },
            };
            return controller;
        }

        [Fact]
        public async Task GetProfile_MissingClaim_Returns401Unauthorized()
        {
            var controller = ControllerWithClaim(_serviceMock, null);

            var result = await controller.GetProfile();

            Assert.IsType<UnauthorizedResult>(result);
        }

        [Fact]
        public async Task GetProfile_UserFound_Returns200Ok()
        {
            var profile = new UserInfoResponse { Id = 1, Email = "teacher@example.com", Role = "Teacher" };
            _serviceMock.Setup(s => s.GetProfileAsync(1)).ReturnsAsync(profile);

            var controller = ControllerWithClaim(_serviceMock, "1");
            var result = await controller.GetProfile();

            var okResult = Assert.IsType<OkObjectResult>(result);
            var returned = Assert.IsType<UserInfoResponse>(okResult.Value);
            Assert.Equal(1, returned.Id);
        }

        [Fact]
        public async Task GetProfile_UserNotFound_Returns404NotFound()
        {
            _serviceMock.Setup(s => s.GetProfileAsync(It.IsAny<int>())).ReturnsAsync((UserInfoResponse?)null);

            var controller = ControllerWithClaim(_serviceMock, "999");
            var result = await controller.GetProfile();

            Assert.IsType<NotFoundResult>(result);
        }

        // ── POST /api/Auth/register ──────────────────────────────────────

        [Fact]
        public async Task Register_SuccessResult_Returns200Ok()
        {
            var loginResponse = new LoginResponse { Message = "Registration successful.", Token = "jwt" };
            _serviceMock.Setup(s => s.RegisterAsync(It.IsAny<RegisterRequest>()))
                        .ReturnsAsync(AuthResult.Success(loginResponse));

            var actionResult = await _sut.Register(new RegisterRequest
            {
                Email = "newteacher@example.com",
                Username = "newteacher",
                Password = "Password123!",
            });

            var okResult = Assert.IsType<OkObjectResult>(actionResult);
            Assert.Equal(200, okResult.StatusCode);
        }

        [Fact]
        public async Task Register_ConflictResult_Returns409Conflict()
        {
            _serviceMock.Setup(s => s.RegisterAsync(It.IsAny<RegisterRequest>()))
                        .ReturnsAsync(AuthResult.Conflict("Email đã tồn tại."));

            var actionResult = await _sut.Register(new RegisterRequest
            {
                Email = "existing@example.com",
                Username = "teacher",
                Password = "Password123!",
            });

            var conflictResult = Assert.IsType<ConflictObjectResult>(actionResult);
            Assert.Equal(409, conflictResult.StatusCode);
        }

        [Fact]
        public async Task Register_BadRequestResult_Returns400BadRequest()
        {
            _serviceMock.Setup(s => s.RegisterAsync(It.IsAny<RegisterRequest>()))
                        .ReturnsAsync(AuthResult.BadRequest("Mật khẩu quá ngắn."));

            var actionResult = await _sut.Register(new RegisterRequest
            {
                Email = "new@example.com",
                Username = "teacher",
                Password = "123",
            });

            var badRequestResult = Assert.IsType<BadRequestObjectResult>(actionResult);
            Assert.Equal(400, badRequestResult.StatusCode);
        }
    }
}
