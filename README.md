# TickTock Timesheet App

TickTock is a Next.js timesheet management app with a credentials login flow and a reusable timesheet experience for viewing weekly summaries and managing daily entries.

## What this project does

- Lets a user sign in with a credentials-based auth flow
- Redirects authenticated users to the timesheet area
- Shows a timesheet list with filters and pagination
- Opens a weekly detail view for entries inside a selected week
- Supports adding, editing, and deleting tasks from the week detail page
- Uses local Next.js API routes to power the timesheet data flow

## Tech Stack

- **Next.js 16** with the App Router
- **React 19**
- **TypeScript**
- **NextAuth.js** for authentication
- **Tailwind CSS 4** for styling
- **Lucide React** for icons
- **react-hook-form** and **zod** are available in the project dependencies

## Key Features

### Authentication

- Credentials login using NextAuth
- Session-based protected routes
- Redirects to `/login` when unauthenticated

### Timesheet List

- Route: `/timesheet`
- Displays weekly timesheet rows
- Status logic:
  - `completed` = 40 hours
  - `incomplete` = less than 40 hours but greater than 0
  - `missing` = no hours added
- Filter by date range
- Filter by status
- Pagination controls

### Week Detail

- Route: `/timesheet/[week]`
- Shows the selected week summary
- Groups entries by day
- Three-dot menu actions:
  - Edit
  - Delete
- Add new entry modal

### API Layer

The timesheet data is served through local Next.js API routes instead of hardcoded UI-only data.

Available routes:

- `GET /api/timesheets`
- `GET /api/timesheets/[week]`
- `POST /api/timesheets/[week]`
- `PUT /api/timesheets/[week]/entries/[entryId]`
- `DELETE /api/timesheets/[week]/entries/[entryId]`

## Project Structure

- `src/app/page.tsx` - redirects users to the login page
- `src/app/login/page.tsx` - login screen
- `src/app/timesheet/page.tsx` - timesheet list screen
- `src/app/timesheet/[week]/page.tsx` - weekly timesheet detail screen
- `src/app/api/auth/[...nextauth]/route.ts` - NextAuth handler
- `src/app/api/timesheets/*` - local timesheet API routes
- `src/lib/authOptions.ts` - auth configuration
- `src/lib/timesheetStore.ts` - in-memory timesheet data store and helpers
- `src/components/SessionProvider.tsx` - session provider wrapper

## Local Development

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Open:

```bash
http://localhost:3000
```

## Available Scripts

- `npm run dev` - start the development server
- `npm run build` - build the app for production
- `npm run start` - start the production server
- `npm run lint` - run ESLint

## Default Login

Use these credentials to sign in during local development:

- Email: `admin@ticktock.com`
- Password: `Password123!`

## Notes

- The timesheet data is currently stored in memory through the local API layer, so it resets when the server restarts.
- The app is currently optimized around the requested UI and route structure for the timesheet workflow.
- Test files and test configuration were removed because the project no longer uses a test workflow.

## Build Check

The app currently passes:

- lint
- production build

## Future Improvements

- Add persistent storage for timesheet entries
- Add API validation and error handling UI states
- Add automated tests again if the project needs them later

