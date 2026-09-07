# /test-backend — Run Backend Tests

Runs the .NET test suite for Ielts-System.

## Usage
```
/test-backend [filter]
```
`filter` is optional — any valid `dotnet test --filter` expression.

---

## Run all tests

```bash
cd d:\GitHub\ielts-writing-task\Ielts-System
dotnet test Ielts-System.sln --no-restore --verbosity normal
```

## Run tests matching a filter

```bash
cd d:\GitHub\ielts-writing-task\Ielts-System
dotnet test Ielts-System.sln --filter "FullyQualifiedName~<filter>" --verbosity normal
```

Example — run only payment tests:
```bash
dotnet test Ielts-System.sln --filter "FullyQualifiedName~Payment" --verbosity normal
```

## Run with coverage (if a coverage tool is installed)

```bash
dotnet test Ielts-System.sln --collect:"XPlat Code Coverage" --verbosity normal
```

---

## Notes
- Tests live inside the solution (`Ielts-System.sln`) — always run from `Ielts-System/`, not from a layer folder.
- If no test project exists yet: test projects should be added to the solution as `{Layer}.Tests` (e.g. `Service.Tests`).
- TypeScript type-check (frontend):
  ```bash
  cd d:\GitHub\ielts-writing-task
  npm run check
  ```
