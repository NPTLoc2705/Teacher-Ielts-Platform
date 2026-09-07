using BusinessObject;
using BusinessObject.Dtos.Auth;
using Repository.UserRepo;

namespace Service.UserService
{
    /// <summary>
    /// Implements authentication and user profile business logic.
    /// Depends on IUserRepository (data) and ITokenService (token generation) only.
    /// </summary>
    public class UserService : IUserService
    {
        private readonly IUserRepository _userRepository;
        private readonly ITokenService _tokenService;

        // Roles that are permitted to use the Teacher Platform.
        private static readonly HashSet<UserRole> AllowedRoles = new()
        {
            UserRole.Teacher,
            UserRole.Admin,
            UserRole.Academic,
        };

        public UserService(IUserRepository userRepository, ITokenService tokenService)
        {
            _userRepository = userRepository;
            _tokenService = tokenService;
        }

        /// <inheritdoc />
        public async Task<AuthResult> LoginAsync(LoginRequest request)
        {
            // 1. Fetch user by email — repository handles the query.
            var user = await _userRepository.GetByEmailAsync(request.Email);

            // 2. User must exist and not be banned.
            if (user is null || user.IsBanned)
                return AuthResult.InvalidCredentials();

            // 3. Verify password hash. Wrap in try/catch to handle malformed hashes gracefully.
            bool passwordValid;
            try
            {
                passwordValid = BCrypt.Net.BCrypt.Verify(request.Password, user.Password);
            }
            catch
            {
                passwordValid = false;
            }

            if (!passwordValid)
                return AuthResult.InvalidCredentials();

            // 4. Enforce role-based access — only Teacher Platform roles allowed.
            if (!AllowedRoles.Contains(user.Role))
                return AuthResult.Forbidden();

            // 5. Generate JWT via the dedicated token service.
            var token = _tokenService.GenerateJwt(user);

            var response = new LoginResponse
            {
                Message = "Login successful.",
                Token = token,
                RefreshToken = string.Empty,
                RefreshTokenExpiresAt = DateTime.UtcNow.AddDays(7).ToString("o"),
                User = MapToUserInfo(user),
            };

            return AuthResult.Success(response);
        }

        /// <inheritdoc />
        public async Task<AuthResult> RegisterAsync(RegisterRequest request)
        {
            var email = (request.Email ?? string.Empty).Trim();
            var username = (request.Username ?? string.Empty).Trim();
            var password = request.Password ?? string.Empty;

            if (string.IsNullOrWhiteSpace(email) || string.IsNullOrWhiteSpace(username) || string.IsNullOrWhiteSpace(password))
                return AuthResult.BadRequest("Email, username, and password are required.");

            if (password.Length < 6)
                return AuthResult.BadRequest("Password must be at least 6 characters.");

            if (await _userRepository.EmailExistsAsync(email))
                return AuthResult.Conflict("Email này đã được sử dụng.");

            if (await _userRepository.UsernameExistsAsync(username))
                return AuthResult.Conflict("Tên đăng nhập đã tồn tại.");

            var hashedPassword = BCrypt.Net.BCrypt.HashPassword(password);
            var displayName = string.IsNullOrWhiteSpace(request.DisplayName) ? username : request.DisplayName.Trim();

            var user = new User
            {
                Email = email,
                Username = username,
                DisplayName = displayName,
                Password = hashedPassword,
                Role = UserRole.Teacher,
                SecurityStamp = Guid.NewGuid().ToString(),
                EmailVerified = true,
                IsBanned = false,
                Createdat = DateTime.UtcNow,
            };

            var createdUser = await _userRepository.CreateAsync(user);
            var token = _tokenService.GenerateJwt(createdUser);

            var response = new LoginResponse
            {
                Message = "Registration successful.",
                Token = token,
                RefreshToken = string.Empty,
                RefreshTokenExpiresAt = DateTime.UtcNow.AddDays(7).ToString("o"),
                User = MapToUserInfo(createdUser),
            };

            return AuthResult.Success(response);
        }

        /// <inheritdoc />
        public async Task<UserInfoResponse?> GetProfileAsync(int userId)
        {
            var user = await _userRepository.GetByIdAsync(userId);
            return user is null ? null : MapToUserInfo(user);
        }

        // ── Private helpers ────────────────────────────────────────────────────

        private static UserInfoResponse MapToUserInfo(User user) => new()
        {
            Id = user.Id,
            Username = user.Username ?? string.Empty,
            Email = user.Email ?? string.Empty,
            Role = user.Role.ToString(),
            DisplayName = user.DisplayName,
        };
    }
}
