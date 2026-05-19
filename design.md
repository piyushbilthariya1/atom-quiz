# Alactic OS — Frontend Architecture & Design Blueprint

This document details the professional frontend architecture of Alactic, focusing on the Next.js implementation, visual design system, and user experience patterns.

---

## 1. Frontend Framework Architecture

Alactic's frontend is a high-performance **Next.js 15+** application leveraging the **App Router** for optimized routing and data fetching.

### Routing Strategy:

- **Route Groups**:
  - `(auth)`: Encapsulates authentication flows (Login, Register) with shared layouts for branding.
  - `(dashboard)`: Contains the core product experience, including agent management, analytics, and settings.
- **Loading & Error Handling**: Uses `loading.tsx` for granular shimmer states and `not-found.tsx` for custom 404 experiences.

### Core Technologies:

- **Framework**: Next.js 15 (React 19).
- **Styling**: Tailwind CSS 4 with custom design tokens.
- **Icons**: Lucide React for consistent, thin-stroke iconography.
- **Language**: TypeScript for end-to-end type safety with the API.

---

## 2. "Linear" Design System

The visual language is inspired by Linear's precision engineering aesthetic — a dark-mode-first environment where content is defined by luminance and spatial density.

### A. Design Tokens (`globals.css`)

- **Primary Canvas**: `#08090a` (The deepest black background).
- **Surface Elevation**:
  - `panel`: `#0f1011`
  - `surface`: `#191a1b`
  - `surface-hover`: `#28282c`
- **Typography**:
  - **Sans**: `Space Grotesk` (Modern, geometric for UI).
  - **Display**: `League Spartan` (Bold, authoritative for headlines).
- **Brand Accent**: Indigo-Violet (`#5e6ad2`) used sparingly for CTAs.

### B. The "Luminance Stacking" Model

Elevation is communicated not through drop shadows (which are invisible on black), but through **background opacity steps**:

- Level 0: `#08090a`
- Level 1: `rgba(255, 255, 255, 0.02)`
- Level 2: `rgba(255, 255, 255, 0.05)` (Standard Card/Input)

---

## 3. Layout & Layout Patterns

Alactic uses a unique **"Framed Page"** layout to evoke a premium, high-end software feel.

### The Page Frame (`.page-frame`)

- Implements fixed 1px vertical borders (`rgba(255, 255, 255, 0.06)`) on the left and right of the 1280px container.
- Creates a "surgical" layout where content feels contained and structured within the viewport.

### Component Architecture:

- **Sidebar**: A sticky navigation component with active state highlighting using "Glow" accents.
- **Stats Grid**: A multi-cell grid for analytics, using 1px borders to separate metrics without visual noise.
- **Feature Switcher**: A vertical tab system with left-border indicators (`--color-glow-primary`).

---

## 4. Motion & Interactivity

Interaction design is subtle and high-frequency, ensuring the app feels alive.

- **Marquee Branding**: `animate-marquee` utility used for moving logo walls or social proof.
- **Fade-in-Up**: Applied to page content transitions to provide a smooth, upward motion upon navigation.
- **Shimmer States**: Used in `loading.tsx` to maintain layout structure while data is being fetched.
- **Glow Effects**: Radial gradients (`bg-glow-amber`) used as soft backdrops for high-priority sections.

---

## 5. API Integration & State

The frontend communicates with the FastAPI backend using standardized patterns:

- **Data Fetching**: Native `fetch` with caching strategies tailored to the content type (e.g., analytics vs. agent settings).
- **Real-time Chat**: Implements streaming response handlers to process chunks from the `/v1/chat` endpoint, updating the UI token-by-token.
- **Authentication**: Session-based auth with secure cookie management, integrated with Next.js middleware for route protection.

---

## 6. Visual Excellence Guidelines (Do's & Don'ts)

### Do:

- Use `border-subtle` (`0.05` white) for most dividers.
- Apply `Space Grotesk` for all functional UI text.
- Use `text-gradient-amber` sparingly for "Premium" or "Pro" features.
- Ensure all interactive elements have a `bg-ghost-hover` state.

### Don't:

- Do not use pure white `#ffffff` for body text (use `text-secondary` `#d0d6e0`).
- Avoid large solid color blocks; use transparency and gradients instead.
- Do not use positive letter-spacing on display headlines.
