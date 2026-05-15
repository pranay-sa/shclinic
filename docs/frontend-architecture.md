# Frontend Architecture Blueprint

## Web App (`apps/web`)

- Framework: React + TypeScript + Vite
- Router: `react-router-dom`
- Security: JWT token storage abstraction + RBAC scaffolding
- API Layer: central `apiRequest` wrapper with clinic header support

### Planned Portal Route Groups

- `/frontdesk/*`
- `/doctor/*`
- `/lab/*`
- `/pharmacy/*`

### Shared Functional Domains

- `patients`
- `appointments`
- `billing`
- `consultations`
- `diagnostics`
- `pharmacy`
- `emr`
- `reports`
- `notifications`

## Mobile Apps

- `apps/mobile-patient`: patient journeys and super-app commerce flows
- `apps/mobile-ops`: rider and phlebotomist workforce operations
- Framework baseline: Expo + React Native

## Cross-App Standards

- Type-safe DTO contracts between frontend and backend
- Form and payload validations at feature boundaries
- Consistent API error handling and user feedback
- Clinic-aware contexts for multi-clinic data partitioning
- Role-aware navigation guards

## Future Enhancements

- Add `@tanstack/react-query` for data caching
- Add global state orchestration for auth/session
- Add websocket events for queue/order/live operational updates
- Add i18n and accessibility hardening
- Add unit/integration/e2e testing pipelines
