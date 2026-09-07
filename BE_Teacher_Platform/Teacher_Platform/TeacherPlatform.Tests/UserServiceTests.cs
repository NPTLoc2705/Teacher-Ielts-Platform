using BusinessObject;
using BusinessObject.Dtos.Auth;
using Moq;
using Repository.UserRepo;
using Service.UserService;

namespace TeacherPlatform.Tests
{
    public class UserServiceTests
    {
        private readonly Mock<IUserRepository> _repoMock;
        private readonly Mock<ITokenService> _tokenMock;
        private readonly UserService _sut;

        public UserServiceTests()
        {
            _repoMock = new Mock<IUserRepository>();
            _tokenMock = new Mock<ITokenService>();
            _tokenMock.Setup(t => t.GenerateJwt(It.IsAny<User>())).Returns("test-jwt-token");
            _sut = new UserService(_repoMock.Object, _tokenMock.Object);
        }

        private static User MakeUser(UserRole role = UserRole.Teacher, bool isBanned = false)
            => new()
            {
                Id = 1,
                Email = "teacher@example.com",
                Password = BCrypt.Net.BCrypt.HashPassword("correctpassword"),
                Role = role,
                IsBanned = isBanned,
                EmailVerified = true,
            };

        // ── Login ─────────────────────────────────────────────────────────────

        [Fact]
        public async Task Login_ValidTeacher_ReturnsSuccess()
        {
            var user = MakeUser();
            _repoMock.Setup(r => r.GetByEmailAsync(user.Email)).ReturnsAsync(user);

            var result = await _sut.LoginAsync(new LoginRequest
            {
                Email = user.Email,
                Password = "correctpassword",
            });

            Assert.Equal(AuthStatus.Success, result.Status);
            Assert.NotNull(result.Data);
            Assert.Equal("test-jwt-token", result.Data!.Token);
        }

        [Fact]
        public async Task Login_UnknownEmail_ReturnsInvalidCredentials()
        {
            _repoMock.Setup(r => r.GetByEmailAsync(It.IsAny<string>())).ReturnsAsync((User?)null);

            var result = await _sut.LoginAsync(new LoginRequest
            {
                Email = "ghost@example.com",
                Password = "any",
            });

            Assert.Equal(AuthStatus.InvalidCredentials, result.Status);
        }

        [Fact]
        public async Task Login_BannedUser_ReturnsInvalidCredentials()
        {
            var user = MakeUser(isBanned: true);
            _repoMock.Setup(r => r.GetByEmailAsync(user.Email)).ReturnsAsync(user);

            var result = await _sut.LoginAsync(new LoginRequest
            {
                Email = user.Email,
                Password = "correctpassword",
            });

            Assert.Equal(AuthStatus.InvalidCredentials, result.Status);
        }

        [Fact]
        public async Task Login_WrongPassword_ReturnsInvalidCredentials()
        {
            var user = MakeUser();
            _repoMock.Setup(r => r.GetByEmailAsync(user.Email)).ReturnsAsync(user);

            var result = await _sut.LoginAsync(new LoginRequest
            {
                Email = user.Email,
                Password = "wrongpassword",
            });

            Assert.Equal(AuthStatus.InvalidCredentials, result.Status);
        }

        [Theory]
        [InlineData(UserRole.User)]
        [InlineData(UserRole.Moderator)]
        public async Task Login_UnauthorizedRole_ReturnsForbidden(UserRole role)
        {
            var user = MakeUser(role);
            _repoMock.Setup(r => r.GetByEmailAsync(user.Email)).ReturnsAsync(user);

            var result = await _sut.LoginAsync(new LoginRequest
            {
                Email = user.Email,
                Password = "correctpassword",
            });

            Assert.Equal(AuthStatus.Forbidden, result.Status);
        }

        [Theory]
        [InlineData(UserRole.Admin)]
        [InlineData(UserRole.Academic)]
        public async Task Login_AllowedNonTeacherRoles_ReturnsSuccess(UserRole role)
        {
            var user = MakeUser(role);
            _repoMock.Setup(r => r.GetByEmailAsync(user.Email)).ReturnsAsync(user);

            var result = await _sut.LoginAsync(new LoginRequest
            {
                Email = user.Email,
                Password = "correctpassword",
            });

            Assert.Equal(AuthStatus.Success, result.Status);
        }

        // ── GetProfile ────────────────────────────────────────────────────────

        [Fact]
        public async Task GetProfile_ExistingUser_ReturnsUserInfo()
        {
            var user = MakeUser();
            _repoMock.Setup(r => r.GetByIdAsync(user.Id)).ReturnsAsync(user);

            var profile = await _sut.GetProfileAsync(user.Id);

            Assert.NotNull(profile);
            Assert.Equal(user.Id, profile!.Id);
            Assert.Equal(user.Email, profile.Email);
        }

        [Fact]
        public async Task GetProfile_NonExistentUser_ReturnsNull()
        {
            _repoMock.Setup(r => r.GetByIdAsync(It.IsAny<int>())).ReturnsAsync((User?)null);

            var profile = await _sut.GetProfileAsync(999);

            Assert.Null(profile);
        }

        // ── Register ──────────────────────────────────────────────────────────

        [Fact]
        public async Task Register_ValidRequest_ReturnsSuccessAndJwt()
        {
            var req = new RegisterRequest
            {
                Email = "newteacher@example.com",
                Username = "newteacher",
                Password = "Password123!",
                DisplayName = "New Teacher"
            };

            _repoMock.Setup(r => r.EmailExistsAsync(req.Email)).ReturnsAsync(false);
            _repoMock.Setup(r => r.UsernameExistsAsync(req.Username)).ReturnsAsync(false);
            _repoMock.Setup(r => r.CreateAsync(It.IsAny<User>()))
                     .ReturnsAsync((User u) => { u.Id = 42; return u; });

            var result = await _sut.RegisterAsync(req);

            Assert.Equal(AuthStatus.Success, result.Status);
            Assert.NotNull(result.Data);
            Assert.Equal("test-jwt-token", result.Data!.Token);
            Assert.Equal(42, result.Data.User.Id);
            Assert.Equal("Teacher", result.Data.User.Role);
            Assert.Equal("New Teacher", result.Data.User.DisplayName);

            _repoMock.Verify(r => r.CreateAsync(It.Is<User>(u =>
                u.Email == req.Email &&
                u.Username == req.Username &&
                u.Role == UserRole.Teacher &&
                u.EmailVerified == true &&
                !string.IsNullOrEmpty(u.Password))), Times.Once);
        }

        [Fact]
        public async Task Register_ExistingEmail_ReturnsConflict()
        {
            var req = new RegisterRequest
            {
                Email = "existing@example.com",
                Username = "newteacher",
                Password = "Password123!"
            };

            _repoMock.Setup(r => r.EmailExistsAsync(req.Email)).ReturnsAsync(true);

            var result = await _sut.RegisterAsync(req);

            Assert.Equal(AuthStatus.Conflict, result.Status);
            _repoMock.Verify(r => r.CreateAsync(It.IsAny<User>()), Times.Never);
        }

        [Fact]
        public async Task Register_ExistingUsername_ReturnsConflict()
        {
            var req = new RegisterRequest
            {
                Email = "new@example.com",
                Username = "existinguser",
                Password = "Password123!"
            };

            _repoMock.Setup(r => r.EmailExistsAsync(req.Email)).ReturnsAsync(false);
            _repoMock.Setup(r => r.UsernameExistsAsync(req.Username)).ReturnsAsync(true);

            var result = await _sut.RegisterAsync(req);

            Assert.Equal(AuthStatus.Conflict, result.Status);
            _repoMock.Verify(r => r.CreateAsync(It.IsAny<User>()), Times.Never);
        }

        [Fact]
        public async Task Register_ShortPassword_ReturnsBadRequest()
        {
            var req = new RegisterRequest
            {
                Email = "new@example.com",
                Username = "newuser",
                Password = "123"
            };

            var result = await _sut.RegisterAsync(req);

            Assert.Equal(AuthStatus.BadRequest, result.Status);
            _repoMock.Verify(r => r.CreateAsync(It.IsAny<User>()), Times.Never);
        }
    }
}
