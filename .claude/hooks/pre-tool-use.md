# Pre-Tool-Use Hooks — Guardrails for Sensitive Files

Documents the files that Claude Code should warn about before editing.

> **Note**: Claude Code's native hook system (`pre-tool-use` / `post-tool-use`) is configured
> via `settings.json`. The rules below are referenced by that config and also serve as
> human-readable documentation of what is protected and why.

---

## Protected Files — STOP and confirm before editing

### 1. `appsettings.json` (and `appsettings.*.json`)
**Path**: `BE_Teacher_Platform/Teacher_Platform/TeacherPlatform/appsettings.json`

**Why protected**: Contains database connection strings, JWT secret keys, and backend configurations.

**Before editing, confirm**:
- Are you editing only local development values?
- Should this change go in `appsettings.Development.json` instead?
- Will this file be committed? (Never commit sensitive credentials.)

**Correct pattern**: Use environment variables or dotnet user-secrets for local secrets:
```bash
dotnet user-secrets set "Jwt:Key" "<value>" --project BE_Teacher_Platform/Teacher_Platform/TeacherPlatform
```

### 2. `DAL/Migrations/*.cs` (EF Core migration files)
**Path**: `BE_Teacher_Platform/Teacher_Platform/DAL/Migrations/`

**Why protected**: Hand-editing migration files corrupts the migration history and can make `dotnet ef database update` fail or drop columns.

**Before editing, confirm**:
- Is there a legitimate reason not to use `dotnet ef migrations remove` + re-add?
- Has the migration already been applied to any shared/production database?

**Correct pattern**: Always use `dotnet ef migrations remove` then re-add. See `/db-rollback`.

### 3. `Program.cs` (DI registration & Pipeline)
**Path**: `BE_Teacher_Platform/Teacher_Platform/TeacherPlatform/Program.cs`

**Why protected**: Removing or reordering DI registrations silently breaks dependency injection at runtime (no compile error).

**Before editing, confirm**:
- If removing a service registration, verify no other service depends on it.
- If adding, follow the pattern: `builder.Services.AddScoped<IInterface, Implementation>()`.

### 4. `TeacherPlatformDbContext.cs`
**Path**: `BE_Teacher_Platform/Teacher_Platform/DAL/TeacherPlatformDbContext.cs`

**Why protected**: Modifying `OnModelCreating` or DbSet entity configurations here without a matching migration will cause the database to drift from the code model.

**Before editing**: Always follow with `dotnet ef migrations add` to capture schema changes.

### 5. Frontend `.env`
**Path**: `FE_Teacher_Platform/.env`

**Why protected**: Contains frontend API base URL (`VITE_BACKEND`). Changes affect all API calls from the browser.

---

## Hook Configuration (settings.json reference)

The `deny` list in `.claude/settings.json` enforces hard blocks:
- `dotnet ef database drop` — prevented unconditionally
- `git push --force` — prevented unconditionally
- `rm -rf` / `del /f` — prevented unconditionally

The files above require a **soft confirmation** (Claude asks before proceeding), not a hard block.
