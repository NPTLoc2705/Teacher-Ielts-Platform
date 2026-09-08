# /migrate — Run EF Core Migrations

Runs `dotnet ef migrations add` against the correct project pair for **TeacherPlatform**.

## Usage
```
/migrate <MigrationName>
```

## What to run

```bash
cd BE_Teacher_Platform/Teacher_Platform
dotnet ef migrations add <MigrationName> \
  --project DAL \
  --startup-project TeacherPlatform \
  --context TeacherPlatformDbContext \
  --output-dir Migrations
```

## Rules
- `--project DAL` → migration files land in `DAL/Migrations/` ✅
- `--startup-project TeacherPlatform` → reads `appsettings.json` for connection string ✅
- Never run from repo root — the DbContext is in `DAL`, not the API project.
- After adding, verify the new `.cs` migration file in `DAL/Migrations/` before applying.

## Apply to database

```bash
cd BE_Teacher_Platform/Teacher_Platform
dotnet ef database update \
  --project DAL \
  --startup-project TeacherPlatform \
  --context TeacherPlatformDbContext
```
