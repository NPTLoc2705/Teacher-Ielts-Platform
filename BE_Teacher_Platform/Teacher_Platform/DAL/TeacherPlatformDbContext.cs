using BusinessObject;
using BusinessObject.evaluation;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;

namespace DAL
{
    public class TeacherPlatformDbContext : DbContext
    {
        public TeacherPlatformDbContext() { }

        public TeacherPlatformDbContext(DbContextOptions<TeacherPlatformDbContext> options)
            : base(options) { }

        // Core tables
        public DbSet<User> Users { get; set; }
        public DbSet<WritingTask1> WritingTask1s { get; set; }
        public DbSet<WritingTask2> WritingTask2s { get; set; }
        public DbSet<QuestionTypeTask1> QuestionTypeTask1s { get; set; }
        public DbSet<QuestionTypeTask2> QuestionTypeTask2s { get; set; }
        public DbSet<WritingEvaluation> WritingEvaluations { get; set; }
        public DbSet<CriteriaScore> CriteriaScores { get; set; }
        public DbSet<CriteriaFeedbackDetail> CriteriaFeedbackDetails { get; set; }
        public DbSet<CriteriaStrength> CriteriaStrengths { get; set; }
        public DbSet<CriteriaImprovement> CriteriaImprovements { get; set; }
        public DbSet<EvaluationSuggestion> EvaluationSuggestions { get; set; }
        public DbSet<EvaluationNextStep> EvaluationNextSteps { get; set; }
        public DbSet<TaskHistory> TaskHistories { get; set; }

        // Classroom system
        public DbSet<Classroom> Classrooms { get; set; }
        public DbSet<ClassEnrollment> ClassEnrollments { get; set; }
        public DbSet<TeacherGradingStar> TeacherGradingStars { get; set; }
        public DbSet<TeacherAiRating> TeacherAiRatings { get; set; }

        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            if (!optionsBuilder.IsConfigured)
            {
                optionsBuilder.UseNpgsql(GetConnectionString());
            }
        }

        private static string? _cachedConnectionString;
        private static string GetConnectionString()
        {
            if (_cachedConnectionString != null)
                return _cachedConnectionString;

            var basePath = Directory.GetCurrentDirectory();
            var appsettingsPath = Path.Combine(basePath, "appsettings.json");

            if (!File.Exists(appsettingsPath))
            {
                var candidate = Path.Combine(basePath, "..", "TeacherPlatform");
                if (Directory.Exists(candidate) && File.Exists(Path.Combine(candidate, "appsettings.json")))
                {
                    basePath = Path.GetFullPath(candidate);
                }
                else
                {
                    var baseAppDir = AppDomain.CurrentDomain.BaseDirectory;
                    if (File.Exists(Path.Combine(baseAppDir, "appsettings.json")))
                    {
                        basePath = baseAppDir;
                    }
                }
            }

            IConfiguration configuration = new ConfigurationBuilder()
                    .SetBasePath(basePath)
                    .AddJsonFile("appsettings.json", optional: true, reloadOnChange: false)
                    .Build();

            _cachedConnectionString = configuration.GetConnectionString("DefaultConnection")
                ?? configuration["ConnectionStrings:DefaultConnection"]
                ?? throw new InvalidOperationException("ConnectionStrings:DefaultConnection is not configured.");
            return _cachedConnectionString;
        }
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Map to existing table names
            modelBuilder.Entity<User>().ToTable("Users");
            modelBuilder.Entity<WritingTask1>().ToTable("WritingTask1s");
            modelBuilder.Entity<WritingTask2>().ToTable("WritingTask2s");
            modelBuilder.Entity<QuestionTypeTask1>().ToTable("QuestionTypeTask1s");
            modelBuilder.Entity<QuestionTypeTask2>().ToTable("QuestionTypeTask2s");
            modelBuilder.Entity<WritingEvaluation>().ToTable("WritingEvaluations");
            modelBuilder.Entity<CriteriaScore>().ToTable("CriteriaScores");
            modelBuilder.Entity<CriteriaFeedbackDetail>().ToTable("CriteriaFeedbackDetails");
            modelBuilder.Entity<CriteriaStrength>().ToTable("CriteriaStrengths");
            modelBuilder.Entity<CriteriaImprovement>().ToTable("CriteriaImprovements");
            modelBuilder.Entity<EvaluationSuggestion>().ToTable("EvaluationSuggestions");
            modelBuilder.Entity<EvaluationNextStep>().ToTable("EvaluationNextSteps");
            modelBuilder.Entity<TaskHistory>().ToTable("TaskHistories");
            modelBuilder.Entity<Classroom>().ToTable("Classrooms");
            modelBuilder.Entity<ClassEnrollment>().ToTable("ClassEnrollments");
            modelBuilder.Entity<TeacherGradingStar>().ToTable("TeacherGradingStars");
            modelBuilder.Entity<TeacherAiRating>().ToTable("TeacherAiRatings");

            // Ignore navigation collection that User entity might have but we do not declare
            modelBuilder.Entity<User>().Ignore(u => u.Id); // re-include below via HasKey
            modelBuilder.Entity<User>().HasKey(u => u.Id);
            modelBuilder.Entity<User>(entity =>
            {
                entity.HasKey(e => e.Id);

                entity.Property(e => e.Id)
                    .ValueGeneratedOnAdd();

                entity.HasIndex(e => e.Email)
                    .IsUnique()
                    .HasDatabaseName("IX_User_Email");

                entity.HasIndex(e => e.Username)
                    .HasDatabaseName("IX_User_Username");

                entity.Property(e => e.Createdat).HasColumnName("Createdat")
                    .HasDefaultValueSql("timezone('utc', now())");

                entity.Property(e => e.Role)
                   .HasConversion<string>()
                         .HasDefaultValue(UserRole.User)
                         .HasMaxLength(20);
                entity.Property(e => e.EmailVerified)
                    .HasDefaultValue(false);
               
            });

            // TaskHistory: CompletionTimeMinutes is a string column
            modelBuilder.Entity<TaskHistory>()
                .Property(th => th.CompletionTimeMinutes)
                .HasDefaultValue(string.Empty);
        }
    }
}

