using BusinessObject.Dtos.Auth;

namespace Service.UserService
{
    public interface IUserService
    {
        /// <summary>
        /// Validates credentials and returns an AuthResult containing the JWT and user info on success,
        /// or a failure status (InvalidCredentials / Forbidden) on failure.
        /// </summary>
        Task<AuthResult> LoginAsync(LoginRequest request);

        /// <summary>
        /// Registers a new teacher user, hashes password, saves to DB, and returns an AuthResult with JWT.
        /// Returns Conflict if email or username already exists.
        /// </summary>
        Task<AuthResult> RegisterAsync(RegisterRequest request);

        /// <summary>
        /// Returns the profile DTO for the given user ID, or null if not found.
        /// </summary>
        Task<UserInfoResponse?> GetProfileAsync(int userId);
    }
}
