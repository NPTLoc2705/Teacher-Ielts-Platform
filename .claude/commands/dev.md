# /dev — Start All Dev Servers

Starts the full local development environment: ASP.NET Core API + React/Vite frontend.

## Usage
```
/dev [api|frontend|tracking|all]
```
Default (no argument) = `all`.

---

## Start everything (3 terminals)

### Terminal 1 — Ielts-System API (ASP.NET Core, port 7279 HTTPS / 5269 HTTP)
```bash
cd d:\GitHub\ielts-writing-task\Ielts-System\Ielts_System
dotnet run
```
Swagger UI: https://localhost:7279/swagger

### Terminal 2 — React Frontend (Vite, port 5173)
```bash
cd d:\GitHub\ielts-writing-task
npm run dev
```
App: http://localhost:5173  
The Vite proxy (`vite.config.ts`) forwards `/api` calls to `https://localhost:7279`.

### Terminal 3 — Tracking-System API (ASP.NET Core, separate port)
```bash
cd d:\GitHub\ielts-writing-task\Tracking-System\Tracking-System
dotnet run
```

---

## Start only the API
```bash
cd d:\GitHub\ielts-writing-task\Ielts-System\Ielts_System
dotnet run
```

## Start only the frontend
```bash
cd d:\GitHub\ielts-writing-task
npm run dev
```

---

## Notes
- `ASPNETCORE_ENVIRONMENT=Development` is set in `.claude/settings.json` so hot-reload and Swagger are enabled.
- The frontend is TypeScript — run `npm run check` to typecheck without starting the server.
- Do NOT use `npm run start` (that's the production build).
