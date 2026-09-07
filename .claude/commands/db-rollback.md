# /db-rollback — Roll Back Last EF Core Migration

Safely removes the last migration from **both** the database and the codebase.

## Usage
```
/db-rollback
```
Run when the latest migration has a bug and needs to be reverted before re-adding.

## Step 1 — Revert the database to the previous migration

```bash
cd d:\GitHub\ielts-writing-task\Ielts-System

# List migrations to find the target (second-to-last in the list)
dotnet ef migrations list \
  --project DAL \
  --startup-project Ielts_System \
  --context WritingAiHubDbContext

# Revert database to <PreviousMigrationName>
dotnet ef database update <PreviousMigrationName> \
  --project DAL \
  --startup-project Ielts_System \
  --context WritingAiHubDbContext
```

## Step 2 — Remove the migration files

```bash
dotnet ef migrations remove \
  --project DAL \
  --startup-project Ielts_System \
  --context WritingAiHubDbContext
```

## Rules
- ALWAYS run Step 1 before Step 2 — removing files without reverting the DB schema leaves the database inconsistent.
- Never manually delete files in `DAL/Migrations/` — always use `migrations remove`.
- If the migration was already pushed to a shared branch, stop here and discuss with the team before reverting.

## Tracking-System rollback

```bash
cd d:\GitHub\ielts-writing-task\Tracking-System

dotnet ef migrations list --project Tracking-System --context TrackingDbContext
dotnet ef database update <PreviousMigrationName> --project Tracking-System --context TrackingDbContext
dotnet ef migrations remove --project Tracking-System --context TrackingDbContext
```
