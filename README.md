# Sugar & Heart Clinic - Frontend Setup

This repository contains a scalable frontend monorepo for the Sugar & Heart Clinic ecosystem.

## Included Frontend Apps

- `apps/web`: Unified React web platform with role-based portals:
  - Front Desk
  - Doctor
  - Lab
  - Pharmacy
- `apps/mobile-patient`: React Native (Expo) app for patient-facing journeys.
- `apps/mobile-ops`: React Native (Expo) app for rider and phlebotomist workflows.

## Shared Packages

- `packages/ui`: Shared UI primitives and design tokens.

## Architecture Goals Covered

- Multi-clinic support ready at data model and API layer boundaries.
- Role-based access control scaffolding (RBAC) for all portals.
- API-driven setup with centralized auth and HTTP clients.
- Modular structure for appointments, EMR, diagnostics, pharmacy, billing, logistics.
- Responsive and scalable React architecture.
- Mobile-first support for patient and operational workforce apps.

## Recommended Backend Contract

- REST APIs with JWT auth and refresh session flow.
- Standardized error shape:
  - `code`
  - `message`
  - `details`
- Tenant/clinic context via:
  - `X-Clinic-Id` header
  - user claims in JWT

## Quick Start

1. Install dependencies:
   - `npm install`
2. Start web app:
   - `npm run dev:web`
3. Start patient mobile app:
   - `npm run dev:mobile:patient`
4. Start ops mobile app:
   - `npm run dev:mobile:ops`

## Suggested Next Steps

- Add real auth screens and JWT token refresh flow.
- Connect modules to Node.js backend APIs.
- Add React Query for caching and optimistic updates.
- Add test stack (Vitest + React Testing Library, Detox for mobile).
- Add CI/CD pipelines for Vercel (web) and EAS (mobile).
