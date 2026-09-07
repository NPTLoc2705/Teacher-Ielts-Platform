using System.ComponentModel.DataAnnotations;

namespace BusinessObject
{
    /// <summary>
    /// Simplified User entity — only fields required by the Teacher Platform.
    /// Maps to the shared Users table in the existing database.
    /// </summary>
    public class User
    {
        [Key]
        public int Id { get; set; }
        [StringLength(50)]
        public string? Username { get; set; }
        [StringLength(100)]
        public string? Email { get; set; }
        [StringLength(255)]
        public string? Password { get; set; }
        [StringLength(100)]
        public string SecurityStamp { get; set; } = Guid.NewGuid().ToString();
        public UserRole Role { get; set; } = UserRole.User;
        public bool IsBanned { get; set; } = false;
        public bool EmailVerified { get; set; } = false;
        public string? DisplayName { get; set; }
        public DateTime Createdat { get; set; } = DateTime.UtcNow;
    }
}
