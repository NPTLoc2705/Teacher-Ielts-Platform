# /migrate — Run EF Core Migrations

Runs `dotnet ef migrations add` against the correct project pair for **Ielts-System**.

## Usage
```
/migrate <MigrationName>
```

## What to run

```bash
cd d:\GitHub\ielts-writing-task\Ielts-System
dotnet ef migrations add <MigrationName> \
  --project DAL \
  --startup-project Ielts_System \
  --context WritingAiHubDbContext \
  --output-dir Migrations
```

## Rules
- `--project DAL` → migration files land in `DAL/Migrations/` ✅
- `--startup-project Ielts_System` → reads `appsettings.json` for connection string ✅
- Never run from repo root — the DbContext is in `DAL`, not the API project.
- After adding, verify the new `.cs` migration file in `DAL/Migrations/` before applying.

## Apply to database

```bash
cd d:\GitHub\ielts-writing-task\Ielts-System
dotnet ef database update \
  --project DAL \
  --startup-project Ielts_System \
  --context WritingAiHubDbContext
```

## Tracking-System (separate DbContext)

```bash
cd d:\GitHub\ielts-writing-task\Tracking-System
dotnet ef migrations add <MigrationName> \
  --project Tracking-System \
  --context TrackingDbContext \
  --output-dir Migrations

dotnet ef database update \
  --project Tracking-System \
  --context TrackingDbContext
```
