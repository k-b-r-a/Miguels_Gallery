# Miguels Gallery

## Project Overview

This project is a photo gallery application with a Bun-powered React frontend and an Express-based backend. It features a modern, responsive UI with theme support and an administrative dashboard for gallery management.

## Tech Stack

- **Frontend**: React 19, Bun, Tailwind CSS 4, Material UI (MUI) 7, Headless UI 2, Framer Motion 12, DND Kit.
- **Backend**: Node.js, Express 5, MongoDB, Cloudinary SDK, Multer.
- **Runtime**: Bun (frontend dev/build), Node.js (backend).

## Project Structure

- `/src`: React frontend source code.
  - `/components`: UI components (Bento grid, VHS Carousel, Upload Modal, etc.).
  - `/utils`: Context providers (Auth, Theme), Daily Phrases utility, and API config.
- `/backend`: Express API with MongoDB integration.
  - `index.mjs`: Main entry point with robust error handling and Cloudinary integration.
- `build.ts`: Custom build script using Bun's native bundler.

## Architectural Decisions & New Features

- **VHS Strip Carousel**: A linear, horizontal VHS-themed carousel for featured content. It features retro scanlines, noise, tracking glitches, and a VCR-style On-Screen Display (OSD). Admin users can edit, delete, and reorder items directly from this strip.
- **People Tagging System**: Each photo supports interactive "people tags" with a clickable link (e.g., Instagram, personal site). Tags are displayed with an "@" prefix and a pulsing visual indicator. Admins can manage these tags during upload or via the edit mode.
- **Interactive Upload Process**: Photos are now published through a dedicated `UploadModal`, allowing administrators to set titles, descriptions, categories, locations, and people tags _before_ the upload to Cloudinary and MongoDB occurs.
- **Automated Metadata Extraction**: The backend now automatically fetches and persists EXIF technical data (ISO, Shutter Speed, Aperture, Focal Length, Camera Model) from Cloudinary immediately after upload, ensuring technical details are always available without manual entry.
- **Dual Parallax & Profile Settings**:
  - The site supports two independent parallax background zones (Top: Hero/Gallery; Bottom: Info/Contact).
  - Two independent profile photos are supported (Hero vs. About Me section).
  - Admins can manage these via a floating "Global Settings" panel.
- **Automated Storage Cleanup**: Replaced settings assets (profile photos or parallax backgrounds) are automatically deleted from Cloudinary to prevent storage bloat.
- **Dynamic Bento Grid**:
  - **Responsive Layout**: Switches between a 4-column desktop grid and a 2-column mobile grid.
  - **Resizable Cards**: Admin users can resize any photo in the grid via an intuitive `[-] Label [+]` interface (-W/W+, -H/H+). Changes are persisted to the database. Spans are intelligently clamped on mobile.
- **Infrastructure Limits**: Supports media uploads up to **150MB** to accommodate high-resolution photos and videos.
- **Hybrid Guided Scroll**: Uses a native `proximity` snapping model for informational sections while maintaining a **strictly free-scroll mandate for the Gallery**.
- **Custom Camera Cursor**: A themed cursor that follows the mouse, providing visual feedback like focus lines on hover and a subtle "flash" effect on click. It automatically reverts to a standard cursor for admin users to ensure precision during editing.
- **Dynamic Daily Phrases**: A utility selects a unique photographic phrase from a collection of 366 for every day of the year.

## Security & Authentication

- **Admin Access**: Hidden login accessed by a **long-press (2 seconds)** on the "Sobre mí" or "Inicio" buttons in the Header.
- **Type Safety Mandate**: **NEVER use the `any` type.** All components, props, and API responses must be strictly typed.

## Key Scripts

- `bun run dev`: Starts both frontend and backend concurrently.
- `bun run build`: Executes `build.ts` to generate a production build in the `dist/` directory.

## Recent Changes

- Optimized VHS Strip Carousel auto-scroll: implemented a 2-second interval with horizontal centering that prevents vertical page jumping by using container-specific `scrollTo`.
- Performed a comprehensive codebase cleanup, removing unused variables, imports, and dead code across frontend and backend.
- Cleaned up `package.json` by removing obsolete dependencies (`cloudinary-multer`, `nodemon`, `standard`, etc.).
- Standardized the project to use single quotes (`'`) for strings across all files via ESLint automation.
- Implemented automatic client-side image compression for files > 10MB.
- Upgraded Cloudinary synchronization to a global scan (all account assets except `/settings/`).
- Fixed a critical interface error (`onUpdate`) during photo publishing and resizing.
- Implemented interactive "@" people tagging system with clickable external links.
- Automated EXIF technical metadata extraction (ISO, Aperture, Shutter Speed, etc.).
- Updated `UploadModal` to support tagging people before publishing.
- Refined `PhotoDialog` UI to display technical details with standardized formatting.
- Refactored settings to support dual independent parallax/profile zones with automatic Cloudinary cleanup.
- Implemented custom Camera Cursor with interactive feedback and admin auto-disable.
- Optimized Bento Grid for mobile (2-column layout, responsive span clamping).
- Redesigned grid resize handles with a modern glassmorphism "[-] Label [+]" layout.
- Increased media upload limit to 150MB.
- Formalized the **strictly no-snap** mandate for the gallery section.
- Upgraded error handling to capture and display server HTML snippets for easier diagnostics.
- Migrated to a 100% type-safe architecture (Forbidden use of `any`).
- Changed favicon to a camera icon.

## Important rules (NO CHANGES ALLOWED)

- Only use React 19+.
- Maintain 100% type safety (No `any`).
- Use single quotes for strings.
