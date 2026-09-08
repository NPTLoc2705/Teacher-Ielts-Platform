# /test-backend — Run Backend Tests

Runs the .NET test suite for TeacherPlatform.

## Usage
```
/test-backend [filter]
```
`filter` is optional — any valid `dotnet test --filter` expression.

---

## Run all tests

```bash
cd BE_Teacher_Platform/Teacher_Platform
dotnet test Teacher_Platform.sln --verbosity normal
```

## Run tests matching a filter

```bash
cd BE_Teacher_Platform/Teacher_Platform
dotnet test Teacher_Platform.sln --filter "FullyQualifiedName~<filter>" --verbosity normal
```

Example — run only classroom tests:
```bash
cd BE_Teacher_Platform/Teacher_Platform
dotnet test Teacher_Platform.sln --filter "FullyQualifiedName~Class" --verbosity normal
```

## Run with coverage (if a coverage tool is installed)

```bash
cd BE_Teacher_Platform/Teacher_Platform
dotnet test Teacher_Platform.sln --collect:"XPlat Code Coverage" --verbosity normal
```

---

## Notes
- Tests live inside the solution (`Teacher_Platform.sln`) in `TeacherPlatform.Tests`.
- Frontend check:
  ```bash
  cd FE_Teacher_Platform
  npm run build
  npm run lint
  ```
