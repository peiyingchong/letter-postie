# Postie - Digital Stationery Application

## Overview

Postie is a high-aesthetic digital stationery application where users create tactile multimedia letters with a unique "unboxing" experience. The goal is to make digital communication feel as special as receiving physical mail. Users can design letters with custom backgrounds, text, images, and stickers, then share them via unique links where recipients experience an animated envelope-opening reveal.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript, using Vite as the build tool
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack React Query for server state, local React state for UI
- **Styling**: Tailwind CSS with shadcn/ui component library (New York style)
- **Animations**: Framer Motion for drag-and-drop interactions and envelope animations
- **Component Pattern**: Radix UI primitives wrapped with shadcn/ui styling conventions

### Backend Architecture
- **Runtime**: Node.js with Express 5
- **API Design**: RESTful endpoints defined in `shared/routes.ts` with Zod validation
- **Database ORM**: Drizzle ORM with PostgreSQL dialect
- **Build System**: Custom esbuild script bundling server dependencies for optimized cold starts

### Data Storage
- **Database**: PostgreSQL (connection via DATABASE_URL environment variable)
- **Schema**: Single `letters` table storing letter metadata and content as JSONB
- **Content Structure**: Letters store background, text elements, images, and stickers with position/rotation/scale data
- **Share Links**: 8-character random hex IDs for public letter access

### Key Design Decisions

**Monorepo Structure**: Client, server, and shared code in one repository with path aliases (`@/` for client, `@shared/` for shared types/schemas). This enables type-safe API contracts between frontend and backend.

**JSONB Content Storage**: Letter content (backgrounds, text elements, images, stickers) stored as a single JSONB column rather than normalized tables. This simplifies the canvas state save/restore flow and reduces query complexity for a document-centric application.

**Typed API Routes**: API routes defined with Zod schemas in `shared/routes.ts`, providing runtime validation on the server and type inference on the client. This pattern ensures frontend-backend contract alignment.

**Canvas Editor Pattern**: The Studio page uses Framer Motion's drag capabilities for positioning elements. Elements support position (x, y), rotation, and scale transformations persisted to the database.

## External Dependencies

### Database
- PostgreSQL via `DATABASE_URL` environment variable
- Session storage via `connect-pg-simple`

### UI Libraries
- Radix UI primitives for accessible components
- Framer Motion for animations and drag-and-drop
- Lucide React for icons
- Embla Carousel for carousels
- cmdk for command palette patterns

### Build & Development
- Vite with React plugin for frontend development
- esbuild for server bundling
- Drizzle Kit for database migrations (`npm run db:push`)

### Fonts
- Google Fonts: DM Sans (body), Playfair Display (serif headings), Architects Daughter (handwritten), Fira Code (monospace)