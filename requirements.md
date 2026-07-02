# Timesheet Management App Requirements

## App Overview
A small, professional, component-based SaaS-style Timesheet Management App built with Next.js, TypeScript, TailwindCSS, and NextAuth.

## Technical Stack
- **Framework**: Next.js (App or Pages router, to be decided/aligned with Figma designs)
- **Language**: TypeScript
- **Styling**: TailwindCSS
- **Authentication**: NextAuth.js (with dummy authentication)
- **API routes**: Client-side API calls should route through Next.js internal API routes
- **Testing**: Basic unit/component tests

## Key Screen Requirements

### 1. Login Screen
- **Inputs**:
  - Email
  - Password
- **Behavior**:
  - Store token securely via session (NextAuth)
  - On success, redirect to the dashboard
  - Implement dummy authentication backend

### 2. Dashboard Page
- **Layout**: Responsive layout, clean UI/UX
- **Features**:
  - Table View of timesheet entries with columns:
    - Week #
    - Date
    - Status
    - Actions
  - Add/Edit modal for timesheet entries
  - Form validation and error handling for the creation form

## Additional Guidelines & Evaluation Criteria
- **Modularity**: Project should be highly component-based, clean, scalable, and professional.
- **Developer Empathy**: Good naming, clear separation of concerns, easy to understand.
- **Documentation**: Include a README.md with setup instructions, libraries used, assumptions, and time spent.
- **Testing**: Extra credit for test suite.

## Design & Typography
- **Font**: [Inter (Google Fonts)](https://fonts.google.com/specimen/Inter)

## API & Data Requirements
- **Local API Endpoints**: Do not import or call mock data directly in components; build and invoke local API endpoints (e.g. Next.js api routes / Route Handlers) to simulate a real integration.
- **Mock Data**: Create and structure mock data for:
  - User data (for authentication/login)
  - List of weekly timesheets
  - List of all individual timesheet entries per week
  - The mock data can reside within the project (e.g., in a separate data folder or JSON files) or be hosted externally.

---
*Awaiting Figma design pictures to proceed with the specific design and implementation layout.*
