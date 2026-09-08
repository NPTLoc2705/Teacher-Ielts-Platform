# /new-feature — Scaffold N-Layer Files for a New Feature

Creates all five backend files (BO → DAL → Repo → Service → Controller) for a new feature, correctly placed in each layer.

## Usage
```
/new-feature <FeatureName> [FeatureGroup]
```

- `FeatureName`: PascalCase noun (e.g. `Assignment`, `StudentFeedback`)  
- `FeatureGroup` (optional): sub-folder grouping (e.g. `Classroom`, `Evaluation`). If omitted, files go in the feature root of each layer.

---

## Files to create

Given `/new-feature Assignment Classroom`:

| Layer | Path | Class |
|---|---|---|
| BusinessObject | `BE_Teacher_Platform/Teacher_Platform/BusinessObject/Classroom/Assignment.cs` | Entity class |
| DAL | `BE_Teacher_Platform/Teacher_Platform/DAL/ClassroomDAO/AssignmentDAO.cs` | DAO with `TeacherPlatformDbContext` injection |
| Repository (interface) | `BE_Teacher_Platform/Teacher_Platform/Repository/ClassroomRepo/IAssignmentRepository.cs` | `IAssignmentRepository` interface |
| Repository (impl) | `BE_Teacher_Platform/Teacher_Platform/Repository/ClassroomRepo/AssignmentRepository.cs` | Calls DAO only |
| Service (interface) | `BE_Teacher_Platform/Teacher_Platform/Service/ClassroomService/IAssignmentService.cs` | `IAssignmentService` interface |
| Service (impl) | `BE_Teacher_Platform/Teacher_Platform/Service/ClassroomService/AssignmentService.cs` | Injects `IAssignmentRepository` |
| Controller | `BE_Teacher_Platform/Teacher_Platform/TeacherPlatform/Controllers/Classroom/AssignmentController.cs` | Injects `IAssignmentService` only |

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
        private readonly TeacherPlatformDbContext _context;

        public {FeatureName}DAO(TeacherPlatformDbContext context)
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
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Service.{FeatureGroup}Service;

namespace TeacherPlatform.Controllers.{FeatureGroup}
{
    [Authorize]
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
// In BE_Teacher_Platform/Teacher_Platform/TeacherPlatform/Program.cs
builder.Services.AddScoped<{FeatureName}DAO>();
builder.Services.AddScoped<I{FeatureName}Repository, {FeatureName}Repository>();
builder.Services.AddScoped<I{FeatureName}Service, {FeatureName}Service>();
```

---

## Frontend counterpart (optional)

If the feature needs a frontend service:
- File: `FE_Teacher_Platform/src/services/{featureName}Service.ts`
- Pattern: API client module using `authHelper.getAuthHeaders()` and `import.meta.env.VITE_BACKEND`
