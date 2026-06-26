# Book Audit

A simple full-stack app for tracking a personal book collection. Every change is recorded, so you can see exactly what happened to a book and when.

## What it does

- Add, edit and delete books
- Slug-based URLs for each book
- Multiple authors per book
- Publish date with validation (no future dates allowed)
- Full audit history shown as a timeline or a searchable table
- Soft delete — removed books stay in history but disappear from the list
- Draggable add/edit and history dialogs

## Tech stack

**Backend**

- .NET 10 Web API
- Entity Framework Core
- SQLite
- Swashbuckle (Swagger)

**Frontend**

- React 19 with TypeScript
- Vite
- MUI (Material UI)
- React Router
- TanStack Query
- React Hook Form + Zod
- Dayjs

## Project structure

```
book-audit/
├── backend/
│   ├── BookAudit.Api/          # Web API
│   └── BookAudit.Api.Tests/    # Unit tests
└── frontend/
    └── book-audit-client/      # React SPA
```

## Getting started

### Backend

```powershell
cd backend/BookAudit.Api

dotnet restore
dotnet build
dotnet ef database update
dotnet run --launch-profile http
```

Local Swagger: http://127.0.0.1:5000/swagger

### Frontend

```powershell
cd frontend/book-audit-client

npm install
npm run dev
```

Local app: http://localhost:5173/

### Docker

```powershell
docker compose up --build
```

Docker Swagger: http://localhost:5132/swagger

If the database already exists and migrations fail, remove the old volume:

```powershell
docker volume rm book-audit_backend-data
```

## How the history works

Every create, update, delete, author addition or author removal is captured by an EF Core interceptor. The frontend shows these events in two views: a timeline grouped by day, and a paginated, filterable list.

## Notes

- Slugs are generated automatically from the book title.
- Renaming a book updates the slug and the URL changes with it.
- Audit history is stored in the same SQLite database.


<img width="2014" height="673" alt="image" src="https://github.com/user-attachments/assets/d67eb224-6f99-43a7-b23f-8b379e84f1d9" />

<img width="718" height="678" alt="image" src="https://github.com/user-attachments/assets/92e4c1bb-ea7f-4f1b-8c16-65b7201c9613" />

<img width="1998" height="1151" alt="image" src="https://github.com/user-attachments/assets/1e21d8f6-4abe-4c23-a327-c7480fb390e6" />



