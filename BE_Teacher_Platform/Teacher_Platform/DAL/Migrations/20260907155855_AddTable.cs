using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace DAL.Migrations
{
    /// <inheritdoc />
    public partial class AddTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "QuestionTypeTask1s",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_QuestionTypeTask1s", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "QuestionTypeTask2s",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_QuestionTypeTask2s", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Users",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Username = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    Email = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    Password = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    SecurityStamp = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Role = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false, defaultValue: "User"),
                    IsBanned = table.Column<bool>(type: "boolean", nullable: false),
                    EmailVerified = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    DisplayName = table.Column<string>(type: "text", nullable: true),
                    Createdat = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "timezone('utc', now())")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Users", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Classrooms",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    ClassName = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    Description = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    StartDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    EndDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    NumberOfLessons = table.Column<int>(type: "integer", nullable: false),
                    CurrentLevel = table.Column<decimal>(type: "numeric(3,1)", nullable: false),
                    TargetLevel = table.Column<decimal>(type: "numeric(3,1)", nullable: false),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    TeacherId = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Classrooms", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Classrooms_Users_TeacherId",
                        column: x => x.TeacherId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "WritingTask1s",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Usersid = table.Column<int>(type: "integer", nullable: true),
                    Question = table.Column<string>(type: "text", nullable: true),
                    ImagePath = table.Column<string>(type: "text", nullable: true),
                    Answer = table.Column<string>(type: "text", nullable: true),
                    QuestionTypeIdTask1 = table.Column<int>(type: "integer", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_WritingTask1s", x => x.Id);
                    table.ForeignKey(
                        name: "FK_WritingTask1s_QuestionTypeTask1s_QuestionTypeIdTask1",
                        column: x => x.QuestionTypeIdTask1,
                        principalTable: "QuestionTypeTask1s",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_WritingTask1s_Users_Usersid",
                        column: x => x.Usersid,
                        principalTable: "Users",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "WritingTask2s",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Usersid = table.Column<int>(type: "integer", nullable: true),
                    Question = table.Column<string>(type: "text", nullable: true),
                    Answer = table.Column<string>(type: "text", nullable: true),
                    QuestionTypeIdTask2 = table.Column<int>(type: "integer", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_WritingTask2s", x => x.Id);
                    table.ForeignKey(
                        name: "FK_WritingTask2s_QuestionTypeTask2s_QuestionTypeIdTask2",
                        column: x => x.QuestionTypeIdTask2,
                        principalTable: "QuestionTypeTask2s",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_WritingTask2s_Users_Usersid",
                        column: x => x.Usersid,
                        principalTable: "Users",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "ClassEnrollments",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    ClassroomId = table.Column<int>(type: "integer", nullable: false),
                    StudentId = table.Column<int>(type: "integer", nullable: false),
                    EnrolledAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    Status = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ClassEnrollments", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ClassEnrollments_Classrooms_ClassroomId",
                        column: x => x.ClassroomId,
                        principalTable: "Classrooms",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ClassEnrollments_Users_StudentId",
                        column: x => x.StudentId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "TaskHistories",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Created = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    WritingTask1Id = table.Column<int>(type: "integer", nullable: true),
                    WritingTask2Id = table.Column<int>(type: "integer", nullable: true),
                    UserId = table.Column<int>(type: "integer", nullable: false),
                    IsStarred = table.Column<bool>(type: "boolean", nullable: false),
                    Score = table.Column<float>(type: "real", nullable: false),
                    AiScore = table.Column<float>(type: "real", nullable: true),
                    TeacherScore = table.Column<float>(type: "real", nullable: true),
                    GradingMode = table.Column<string>(type: "text", nullable: true),
                    ReviewStatus = table.Column<string>(type: "text", nullable: true),
                    ReviewComment = table.Column<string>(type: "text", nullable: true),
                    ReviewedByUserId = table.Column<int>(type: "integer", nullable: true),
                    ReviewedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    Score1 = table.Column<float>(type: "real", nullable: true),
                    Score2 = table.Column<float>(type: "real", nullable: true),
                    CompletionTimeMinutes = table.Column<string>(type: "text", nullable: false, defaultValue: "")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TaskHistories", x => x.Id);
                    table.ForeignKey(
                        name: "FK_TaskHistories_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_TaskHistories_WritingTask1s_WritingTask1Id",
                        column: x => x.WritingTask1Id,
                        principalTable: "WritingTask1s",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_TaskHistories_WritingTask2s_WritingTask2Id",
                        column: x => x.WritingTask2Id,
                        principalTable: "WritingTask2s",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "WritingEvaluations",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    WritingTask1Id = table.Column<int>(type: "integer", nullable: true),
                    WritingTask2Id = table.Column<int>(type: "integer", nullable: true),
                    TaskType = table.Column<int>(type: "integer", nullable: false),
                    OverallScore = table.Column<decimal>(type: "numeric", nullable: false),
                    OverallSummary = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    EvaluatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_WritingEvaluations", x => x.Id);
                    table.ForeignKey(
                        name: "FK_WritingEvaluations_WritingTask1s_WritingTask1Id",
                        column: x => x.WritingTask1Id,
                        principalTable: "WritingTask1s",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_WritingEvaluations_WritingTask2s_WritingTask2Id",
                        column: x => x.WritingTask2Id,
                        principalTable: "WritingTask2s",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "TeacherAiRatings",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    TeacherId = table.Column<int>(type: "integer", nullable: false),
                    TaskHistoryId = table.Column<int>(type: "integer", nullable: false),
                    AiFeedbackRating = table.Column<int>(type: "integer", nullable: false),
                    TeacherConfidenceRating = table.Column<int>(type: "integer", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TeacherAiRatings", x => x.Id);
                    table.ForeignKey(
                        name: "FK_TeacherAiRatings_TaskHistories_TaskHistoryId",
                        column: x => x.TaskHistoryId,
                        principalTable: "TaskHistories",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_TeacherAiRatings_Users_TeacherId",
                        column: x => x.TeacherId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "TeacherGradingStars",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    TeacherId = table.Column<int>(type: "integer", nullable: false),
                    ClassId = table.Column<int>(type: "integer", nullable: false),
                    ClassroomId = table.Column<int>(type: "integer", nullable: false),
                    TaskHistoryId = table.Column<int>(type: "integer", nullable: false),
                    IsStarred = table.Column<bool>(type: "boolean", nullable: false),
                    IsHidden = table.Column<bool>(type: "boolean", nullable: false),
                    AiOverallScore = table.Column<float>(type: "real", nullable: true),
                    AiTrScore = table.Column<float>(type: "real", nullable: true),
                    AiCcScore = table.Column<float>(type: "real", nullable: true),
                    AiLrScore = table.Column<float>(type: "real", nullable: true),
                    AiGrScore = table.Column<float>(type: "real", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TeacherGradingStars", x => x.Id);
                    table.ForeignKey(
                        name: "FK_TeacherGradingStars_Classrooms_ClassroomId",
                        column: x => x.ClassroomId,
                        principalTable: "Classrooms",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_TeacherGradingStars_TaskHistories_TaskHistoryId",
                        column: x => x.TaskHistoryId,
                        principalTable: "TaskHistories",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_TeacherGradingStars_Users_TeacherId",
                        column: x => x.TeacherId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "CriteriaScores",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    WritingEvaluationId = table.Column<int>(type: "integer", nullable: false),
                    CriteriaName = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Score = table.Column<float>(type: "real", nullable: false),
                    BandReason = table.Column<string>(type: "character varying(3000)", maxLength: 3000, nullable: true),
                    ScoreAccuracyVote = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    VoteSubmittedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CriteriaScores", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CriteriaScores_WritingEvaluations_WritingEvaluationId",
                        column: x => x.WritingEvaluationId,
                        principalTable: "WritingEvaluations",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "EvaluationNextSteps",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    WritingEvaluationId = table.Column<int>(type: "integer", nullable: false),
                    NextStepDescription = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_EvaluationNextSteps", x => x.Id);
                    table.ForeignKey(
                        name: "FK_EvaluationNextSteps_WritingEvaluations_WritingEvaluationId",
                        column: x => x.WritingEvaluationId,
                        principalTable: "WritingEvaluations",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "EvaluationSuggestions",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    WritingEvaluationId = table.Column<int>(type: "integer", nullable: false),
                    SuggestionDescription = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_EvaluationSuggestions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_EvaluationSuggestions_WritingEvaluations_WritingEvaluationId",
                        column: x => x.WritingEvaluationId,
                        principalTable: "WritingEvaluations",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "CriteriaFeedbackDetails",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    CriteriaScoreId = table.Column<int>(type: "integer", nullable: false),
                    Quote = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    Description = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: false),
                    UserRating = table.Column<short>(type: "smallint", nullable: true),
                    RatingSubmittedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CriteriaFeedbackDetails", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CriteriaFeedbackDetails_CriteriaScores_CriteriaScoreId",
                        column: x => x.CriteriaScoreId,
                        principalTable: "CriteriaScores",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "CriteriaImprovements",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    CriteriaScoreId = table.Column<int>(type: "integer", nullable: false),
                    ImprovementDescription = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CriteriaImprovements", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CriteriaImprovements_CriteriaScores_CriteriaScoreId",
                        column: x => x.CriteriaScoreId,
                        principalTable: "CriteriaScores",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "CriteriaStrengths",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    CriteriaScoreId = table.Column<int>(type: "integer", nullable: false),
                    StrengthDescription = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CriteriaStrengths", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CriteriaStrengths_CriteriaScores_CriteriaScoreId",
                        column: x => x.CriteriaScoreId,
                        principalTable: "CriteriaScores",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ClassEnrollments_ClassroomId",
                table: "ClassEnrollments",
                column: "ClassroomId");

            migrationBuilder.CreateIndex(
                name: "IX_ClassEnrollments_StudentId",
                table: "ClassEnrollments",
                column: "StudentId");

            migrationBuilder.CreateIndex(
                name: "IX_Classrooms_TeacherId",
                table: "Classrooms",
                column: "TeacherId");

            migrationBuilder.CreateIndex(
                name: "IX_CriteriaFeedbackDetails_CriteriaScoreId",
                table: "CriteriaFeedbackDetails",
                column: "CriteriaScoreId");

            migrationBuilder.CreateIndex(
                name: "IX_CriteriaImprovements_CriteriaScoreId",
                table: "CriteriaImprovements",
                column: "CriteriaScoreId");

            migrationBuilder.CreateIndex(
                name: "IX_CriteriaScores_WritingEvaluationId",
                table: "CriteriaScores",
                column: "WritingEvaluationId");

            migrationBuilder.CreateIndex(
                name: "IX_CriteriaStrengths_CriteriaScoreId",
                table: "CriteriaStrengths",
                column: "CriteriaScoreId");

            migrationBuilder.CreateIndex(
                name: "IX_EvaluationNextSteps_WritingEvaluationId",
                table: "EvaluationNextSteps",
                column: "WritingEvaluationId");

            migrationBuilder.CreateIndex(
                name: "IX_EvaluationSuggestions_WritingEvaluationId",
                table: "EvaluationSuggestions",
                column: "WritingEvaluationId");

            migrationBuilder.CreateIndex(
                name: "IX_TaskHistories_UserId",
                table: "TaskHistories",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_TaskHistories_WritingTask1Id",
                table: "TaskHistories",
                column: "WritingTask1Id");

            migrationBuilder.CreateIndex(
                name: "IX_TaskHistories_WritingTask2Id",
                table: "TaskHistories",
                column: "WritingTask2Id");

            migrationBuilder.CreateIndex(
                name: "IX_TeacherAiRatings_TaskHistoryId",
                table: "TeacherAiRatings",
                column: "TaskHistoryId");

            migrationBuilder.CreateIndex(
                name: "IX_TeacherAiRatings_TeacherId",
                table: "TeacherAiRatings",
                column: "TeacherId");

            migrationBuilder.CreateIndex(
                name: "IX_TeacherGradingStars_ClassroomId",
                table: "TeacherGradingStars",
                column: "ClassroomId");

            migrationBuilder.CreateIndex(
                name: "IX_TeacherGradingStars_TaskHistoryId",
                table: "TeacherGradingStars",
                column: "TaskHistoryId");

            migrationBuilder.CreateIndex(
                name: "IX_TeacherGradingStars_TeacherId",
                table: "TeacherGradingStars",
                column: "TeacherId");

            migrationBuilder.CreateIndex(
                name: "IX_User_Email",
                table: "Users",
                column: "Email",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_User_Username",
                table: "Users",
                column: "Username");

            migrationBuilder.CreateIndex(
                name: "IX_WritingEvaluations_WritingTask1Id",
                table: "WritingEvaluations",
                column: "WritingTask1Id");

            migrationBuilder.CreateIndex(
                name: "IX_WritingEvaluations_WritingTask2Id",
                table: "WritingEvaluations",
                column: "WritingTask2Id");

            migrationBuilder.CreateIndex(
                name: "IX_WritingTask1s_QuestionTypeIdTask1",
                table: "WritingTask1s",
                column: "QuestionTypeIdTask1");

            migrationBuilder.CreateIndex(
                name: "IX_WritingTask1s_Usersid",
                table: "WritingTask1s",
                column: "Usersid");

            migrationBuilder.CreateIndex(
                name: "IX_WritingTask2s_QuestionTypeIdTask2",
                table: "WritingTask2s",
                column: "QuestionTypeIdTask2");

            migrationBuilder.CreateIndex(
                name: "IX_WritingTask2s_Usersid",
                table: "WritingTask2s",
                column: "Usersid");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ClassEnrollments");

            migrationBuilder.DropTable(
                name: "CriteriaFeedbackDetails");

            migrationBuilder.DropTable(
                name: "CriteriaImprovements");

            migrationBuilder.DropTable(
                name: "CriteriaStrengths");

            migrationBuilder.DropTable(
                name: "EvaluationNextSteps");

            migrationBuilder.DropTable(
                name: "EvaluationSuggestions");

            migrationBuilder.DropTable(
                name: "TeacherAiRatings");

            migrationBuilder.DropTable(
                name: "TeacherGradingStars");

            migrationBuilder.DropTable(
                name: "CriteriaScores");

            migrationBuilder.DropTable(
                name: "Classrooms");

            migrationBuilder.DropTable(
                name: "TaskHistories");

            migrationBuilder.DropTable(
                name: "WritingEvaluations");

            migrationBuilder.DropTable(
                name: "WritingTask1s");

            migrationBuilder.DropTable(
                name: "WritingTask2s");

            migrationBuilder.DropTable(
                name: "QuestionTypeTask1s");

            migrationBuilder.DropTable(
                name: "QuestionTypeTask2s");

            migrationBuilder.DropTable(
                name: "Users");
        }
    }
}
