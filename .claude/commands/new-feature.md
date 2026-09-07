# /new-feature — Scaffold N-Layer Files for a New Feature

Creates all five backend files (BO → DAL → Repo → Service → Controller) for a new feature, correctly placed in each layer.

## Usage
```
/new-feature <FeatureName> [FeatureGroup]
```

- `FeatureName`: PascalCase noun (e.g. `QuizAttempt`, `ReferralCode`)  
- `FeatureGroup` (optional): sub-folder grouping (e.g. `Quiz`, `Payments`). If omitted, files go in the feature root of each layer.

---

## Files to create

Given `/new-feature QuizAttempt Quiz`:

| Layer | Path | Class |
|---|---|---|
| BusinessObject | `Ielts-System/BusinessObject/Quiz/QuizAttempt.cs` | Entity class |
| DAL | `Ielts-System/DAL/QuizDAO/QuizAttemptDAO.cs` | DAO with `WritingAiHubDbContext` injection |
| Repository (interface) | `Ielts-System/Repository/QuizRepo/IQuizAttemptRepository.cs` | `IQuizAttemptRepository` interface |
| Repository (impl) | `Ielts-System/Repository/QuizRepo/QuizAttemptRepository.cs` | Calls DAO only |
| Service (interface) | `Ielts-System/Service/QuizService/IQuizAttemptService.cs` | `IQuizAttemptService` interface |
| Service (impl) | `Ielts-System/Service/QuizService/QuizAttemptService.cs` | Injects `IQuizAttemptRepository` |
| Controller | `Ielts-System/Ielts_System/Controllers/Quiz/QuizAttemptController.cs` | Injects `IQuizAttemptService` only |

---

## Template: Entity (`BusinessObject`)

```csharp
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BusinessObject.{FeatureGroup}
{
    [Table("{FeatureName}s")]
    public class {FeatureName}
    {
        [Key]
        public int Id { get; set; }

        // TODO: Add domain properties here
    }
}
```

## Template: DAO (`DAL`)

```csharp
using DAL;
using BusinessObject.{FeatureGroup};
using Microsoft.EntityFrameworkCore;

namespace DAL.{FeatureGroup}DAO
{
    public class {FeatureName}DAO
    {
        private readonly WritingAiHubDbContext _context;

        public {FeatureName}DAO(WritingAiHubDbContext context)
        {
            _context = context;
        }

        // Add query methods here
    }
}
```

## Template: Repository Interface

```csharp
namespace Repository.{FeatureGroup}Repo
{
    public interface I{FeatureName}Repository
    {
        // Define data-access contract here
    }
}
```

## Template: Repository Implementation

```csharp
using DAL.{FeatureGroup}DAO;

namespace Repository.{FeatureGroup}Repo
{
    public class {FeatureName}Repository : I{FeatureName}Repository
    {
        private readonly {FeatureName}DAO _dao;

        public {FeatureName}Repository({FeatureName}DAO dao)
        {
            _dao = dao;
        }
    }
}
```

## Template: Service Interface

```csharp
namespace Service.{FeatureGroup}Service
{
    public interface I{FeatureName}Service
    {
        // Define business operations here
    }
}
```

## Template: Service Implementation

```csharp
using Repository.{FeatureGroup}Repo;

namespace Service.{FeatureGroup}Service
{
    public class {FeatureName}Service : I{FeatureName}Service
    {
        private readonly I{FeatureName}Repository _repository;

        public {FeatureName}Service(I{FeatureName}Repository repository)
        {
            _repository = repository;
        }
    }
}
```

## Template: Controller

```csharp
using Microsoft.AspNetCore.Mvc;
using Service.{FeatureGroup}Service;

namespace Ielts_System.Controllers.{FeatureGroup}
{
    [ApiController]
    [Route("api/[controller]")]
    public class {FeatureName}Controller : ControllerBase
    {
        private readonly I{FeatureName}Service _service;

        public {FeatureName}Controller(I{FeatureName}Service service)
        {
            _service = service;
        }

        // Add endpoints here
    }
}
```

---

## After scaffolding — register DI in `Program.cs`

```csharp
// In Ielts-System/Ielts_System/Program.cs
builder.Services.AddScoped<{FeatureName}DAO>();
builder.Services.AddScoped<I{FeatureName}Repository, {FeatureName}Repository>();
builder.Services.AddScoped<I{FeatureName}Service, {FeatureName}Service>();
```

---

## Frontend counterpart (optional)

If the feature needs a frontend service:
- File: `client/src/Service/{FeatureName}Service.ts`
- Pattern: one exported async function per endpoint, using `authFetch` from `lib/authFetch.ts`
