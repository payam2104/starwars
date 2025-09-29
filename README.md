# Star Wars Data Explorer (Angular 20 + Signals)

This project visualizes data from **SWAPI** (https://swapi.dev) as a modern, reactive web app.  
It provides list and detail views for **Films**, **People**, and **Vehicles**, including master–detail relations (e.g., Film → Characters/Planets/Vehicles).

> Tech highlights: Angular 20 (standalone components), **Signals-only** state, zoneless change detection, new template control flow (`@for`, `@if`), RxJS only for I/O, slim in-memory caches, responsive UI.

---

## Features
- **3 root resources:** **Films**, **People**, **Vehicles** as dedicated lists with detail pages.
- **Master–detail:** Film details load and show related **Characters**, **Planets**, and **Vehicles** via SWAPI URLs.
- **Efficient fetching:** de-duplicated requests; **list cache** and **detail cache** (in-memory) to avoid redundant loads.
- **Signals everywhere:** loading/error/data as signals; components use `computed()` instead of manual subscriptions.
- **Roman pipe:** episode numbers are rendered as Roman numerals (e.g., “Episode IV”).
- **Responsive layout:** adaptive navigation (hamburger/context menu), clean typography, large touch targets.
- **“Hyperspace” home:** subtle CSS star-burst animation that respects `prefers-reduced-motion`.

---

## Tech Stack & Architecture
- **Framework:** Angular 20, standalone components, **zoneless** (`provideZonelessChangeDetection`).
- **State:** **Signals** for data/loading/error. No NgRx dependency.
- **I/O:** RxJS for HTTP calls; services encapsulate fetching and caching.
- **Templates:** modern control flow `@for` / `@if`.
- **Caching:**
  - **List cache** per resource (e.g., all films loaded once → reused).
  - **Detail cache** per URL/ID (simple, no TTL for this challenge scope).

### Data flow (simplified)
```
Component (List/Detail)
   │  reads signals
   ▼
Service (Films/People/Vehicles)
   │  fetches via HttpClient, updates signals & caches
   ▼
SWAPI (https://swapi.dev/api/…)
```

---

## Project Structure
*(excerpt – can vary slightly)*
```
src/
├─ app/
│  ├─ components/
│  │  ├─ films/            # FilmList, FilmDetails, RomanPipe
│  │  ├─ people/           # PeopleList, People details
│  │  ├─ vehicles/         # VehicleList, Vehicle details
│  │  └─ shared/           # UI atoms (Loading, Error, Chips, Buttons, Card, …)
│  ├─ cores/
│  │  ├─ models/           # Film, People, Planet, Vehicle, enums
│  │  └─ services/         # FilmService, PeopleService, PlanetService, VehicleService, HelperService
│  ├─ app.routes.ts
│  ├─ app.config.ts
│  └─ ...
└─ assets/
   └─ images/              # Logos, icons
```

---

## Installation

### Prerequisites
- **Node.js** ≥ 20 (LTS recommended)
- **npm** (or **pnpm**/**yarn**)
- Optional: **Angular CLI** (`npm i -g @angular/cli`)

### Steps
```bash
# 1) Clone
git clone https://github.com/payam2104/starwars.git
cd starwars

# 2) Install dependencies
npm install
# or: pnpm install / yarn install
```

---

## Development server

This project was generated (and/or is compatible) with **Angular CLI** 20.1.x.

Start a local dev server:
```bash
ng serve
or
npm start
```
Open your browser at `http://localhost:4200/`. The app auto-reloads on source changes.

---
