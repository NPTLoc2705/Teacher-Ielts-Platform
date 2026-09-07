namespace BusinessObject.Dtos.Auth
{
    public class LoginRequest
    {
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }

    public class LoginResponse
    {
        public string Message { get; set; } = string.Empty;
        public string Token { get; set; } = string.Empty;
        public string RefreshToken { get; set; } = string.Empty;
        public string RefreshTokenExpiresAt { get; set; } = string.Empty;
        public UserInfoResponse User { get; set; } = new();
    }

    public class UserInfoResponse
    {
        public int Id { get; set; }
        public string Username { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
        public string? DisplayName { get; set; }
    }

    public class RegisterRequest
    {
        public string Email { get; set; } = string.Empty;
        public string Username { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public string? DisplayName { get; set; }
    }

    /// <summary>
    /// Encapsulates the outcome of an authentication attempt.
    /// Keeps HTTP concerns (status codes) out of the service layer.
    /// </summary>
    public class AuthResult
    {
        public AuthStatus Status { get; private set; }
        public LoginResponse? Data { get; private set; }
        public string? ErrorMessage { get; private set; }

        public bool IsSuccess => Status == AuthStatus.Success;

        public static AuthResult Success(LoginResponse data)
            => new() { Status = AuthStatus.Success, Data = data };

        public static AuthResult InvalidCredentials(string message = "Invalid credentials.")
            => new() { Status = AuthStatus.InvalidCredentials, ErrorMessage = message };

        public static AuthResult Forbidden(string message = "Access denied for this role.")
            => new() { Status = AuthStatus.Forbidden, ErrorMessage = message };

        public static AuthResult Conflict(string message)
            => new() { Status = AuthStatus.Conflict, ErrorMessage = message };

        public static AuthResult BadRequest(string message)
            => new() { Status = AuthStatus.BadRequest, ErrorMessage = message };
    }

    public enum AuthStatus
    {
        Success,
        InvalidCredentials,
        Forbidden,
        Conflict,
        BadRequest
    }
}
