using BusinessObject;

namespace Repository.UserRepo
{
    public interface IUserRepository
    {
        Task<User?> GetByIdAsync(int userId);
        Task<User?> GetByEmailAsync(string email);
        Task<User?> GetByUsernameAsync(string username);
        Task<User> CreateAsync(User user);
        Task UpdateAsync(User user);
        Task<bool> EmailExistsAsync(string email);
        Task<bool> UsernameExistsAsync(string username);
       // Task<List<User>> GetAllActiveUsersAsync();
        Task<User?> ToggleBanUserAsync(int userId, bool isBanned);
    }
}
