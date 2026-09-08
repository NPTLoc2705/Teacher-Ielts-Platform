# /dev — Start All Dev Servers

Starts the full local development environment: ASP.NET Core API + React/Vite frontend.

## Usage
```
/dev [api|frontend|all]
```
Default (no argument) = `all`.

---

## Start everything (2 terminals)

### Terminal 1 — TeacherPlatform API (ASP.NET Core, port 7244 HTTPS / 5269 HTTP)
```bash
cd BE_Teacher_Platform/Teacher_Platform/TeacherPlatform
dotnet run
```
Swagger UI: https://localhost:7244/swagger

### Terminal 2 — React Frontend (Vite, port 5173)
```bash
cd FE_Teacher_Platform
npm run dev
```
App: http://localhost:5173  
API requests connect to backend via `VITE_BACKEND=https://localhost:7244`.

---

## Start only the API
```bash
cd BE_Teacher_Platform/Teacher_Platform/TeacherPlatform
dotnet run
```

## Start only the frontend
```bash
cd FE_Teacher_Platform
npm run dev
```

---

## Notes
- `ASPNETCORE_ENVIRONMENT=Development` is configured so hot-reload and Swagger are enabled.
- The frontend is TypeScript + Vite — run `npm run build` or `npx tsc` to typecheck.
- Oxlint is available via `npm run lint` for high-speed frontend linting.
