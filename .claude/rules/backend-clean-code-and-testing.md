# Backend Development Rules

This document outlines the core principles and rules for developing, maintaining, refactoring, and testing the Backend (BE) code.

## 1. Clean Code & Maintainability
- **Single Responsibility Principle (SRP):** Each function, class, and module should have one, and only one, reason to change. Keep functions small and focused on a single task.
- **Meaningful Naming:** Use descriptive names for variables, functions, and classes. Avoid abbreviations that are not widely understood.
- **DRY (Don't Repeat Yourself):** Extract duplicated logic into reusable functions or utilities.
- **Error Handling:** Always handle errors gracefully. Avoid returning raw database errors to the client. Use consistent error formatting.
- **Documentation:** Write clear comments for complex logic, but aim for self-documenting code through good naming and structure.

## 2. Refactoring
- **Test First:** Never refactor code without a solid test suite covering the existing behavior. Ensure tests pass before and after the refactoring.
- **Small Steps:** Refactor in small, incremental steps. Commit frequently.
- **Leave it Better:** Follow the Boy Scout Rule: always leave the code you are working on cleaner than you found it.

## 3. Testing (BE)
- **Comprehensive Coverage:** Write unit tests for all business logic, utility functions, and complex algorithms.
- **Integration Tests:** Use integration tests for API endpoints and database interactions to ensure components work together correctly.
- **Mocking:** Mock external dependencies (e.g., third-party APIs, email services) in unit tests to ensure they are fast and deterministic.
- **Test Data:** Use realistic, isolated test data. Clean up after tests run.

## 4. Database & Query Performance (CRITICAL)
- **NO N+1 QUERIES:** This is strictly forbidden. It is the most common cause of performance issues.
- **No for loop when use query db**
  - *Never* execute a database query inside a loop.
  - Always use eager loading (e.g., Drizzle's `with` operator), `JOIN`s, or batching (e.g., DataLoader) to fetch related entities in a single query or a fixed number of queries.
- **Indexing:** Ensure appropriate indexes are added to database columns that are frequently used in `WHERE`, `ORDER BY`, or `JOIN` clauses.
- **Query Optimization:** Review and profile complex queries to ensure they perform efficiently, especially as the data volume grows.
