using BusinessObject;
using DAL;

namespace Repository.UserRepo
{
    public class UserRepository : IUserRepository
    {
        private readonly UserDAO _userDao;

        public UserRepository(UserDAO userDao)
        {
            _userDao = userDao;
        }

        public Task<User?> GetByIdAsync(int userId) => _userDao.GetUserById(userId);
        public Task<User?> GetByEmailAsync(string email) => _userDao.GetByEmailAsync(email);
        public Task<User?> GetByUsernameAsync(string username) => _userDao.GetByUsernameAsync(username);
        public Task<User> CreateAsync(User user) => _userDao.CreateAsync(user);
        public Task UpdateAsync(User user) => _userDao.UpdateAsync(user);
        public Task<bool> EmailExistsAsync(string email) => _userDao.EmailExistsAsync(email);
        public Task<bool> UsernameExistsAsync(string username) => _userDao.UsernameExistsAsync(username);
       // public Task<List<User>> GetAllActiveUsersAsync() => _userDao.GetAllActiveUsersAsync();
        public Task<User?> ToggleBanUserAsync(int userId, bool isBanned) => _userDao.ToggleBanUserAsync(userId, isBanned);
    }
}
