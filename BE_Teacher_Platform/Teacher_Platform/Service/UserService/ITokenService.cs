using BusinessObject;

namespace Service.UserService
{
    /// <summary>
    /// Responsible solely for generating authentication tokens.
    /// </summary>
    public interface ITokenService
    {
        string GenerateJwt(User user);
    }
}
