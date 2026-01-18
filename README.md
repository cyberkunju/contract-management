# Contract Management Platform

[Live Demo](https://contractmanagement.cyberkunju.dev) · Hosted on Azure

A contract lifecycle management dashboard built with React + TypeScript. It allows users to design reusable blueprints, generate contract instances, and manage their status through a strict workflow.

## Setup

```bash
npm install
npm run dev
```

Opens at http://localhost:5173

## Features

**Blueprint Builder**: Create templates with configurable fields (Text, Date, Signature, Checkbox). Supports reordering with move up/down controls.

**Lifecycle Engine**: Contracts strictly follow the `Created → Approved → Sent → Signed → Locked` flow. State transitions are validated at the data layer.

**Revocation Logic**: Contracts can be revoked from early stages (Created, Approved, Sent) but become immutable once Signed or Locked.

**Dashboard**: Filterable views (Active, Pending, Signed, Archived) with search by contract or blueprint name.

## Architecture & Design Decisions

### Why React 18 + TypeScript?

TypeScript was essential here because the contract lifecycle has strict rules. By typing `ContractStatus` and `FieldType` as union types, the compiler catches invalid transitions before they reach runtime. React 18 was chosen for its mature ecosystem and because the app is purely client-side with no SSR requirements.

### Why Zustand over Redux?

Redux felt like overkill for this scope. Zustand gives the same benefits (predictable state, devtools support) with far less boilerplate. The built-in `persist` middleware made localStorage integration trivial—just wrap the store and it handles serialization automatically.

### Why CSS Modules instead of Tailwind?

I wanted full control over the design without fighting utility class conventions. CSS Modules keep styles scoped to components, and using CSS variables for colors/spacing made theming straightforward. No external dependencies means one less thing to maintain.

### Why a Finite State Machine?

The lifecycle logic needed to be bulletproof. Instead of scattering validation across components, I centralized it in `src/utils/stateMachine.ts`. The `canTransition(from, to)` function is the single source of truth. This makes the rules testable (14 unit tests cover it) and guarantees the UI can't accidentally allow an invalid action.

### Why snapshot contracts?

When you create a contract from a blueprint, the fields are copied—not referenced. This means editing a blueprint later won't affect existing contracts. It's how real contract systems work: once you generate a document, it's frozen.

## Project Structure

```
src/
├── components/     # Atomic UI (Button, Input, Modal) & feature components (SignaturePad)
├── pages/          # Route views (Dashboard, Blueprints, Contracts, NotFound)
├── stores/         # Zustand stores with localStorage persistence
├── data/           # Default blueprint templates
├── utils/          # State machine logic, date formatters, ID generators
├── types/          # Shared TypeScript interfaces
└── styles/         # CSS variables and global resets
```

## Assumptions

**Single User Mode**: The app demonstrates the full lifecycle from one view. The user plays both roles—internal manager (approving, sending) and external client (signing). Role-based hints in the UI clarify which action belongs to whom.

**No Backend**: All data lives in localStorage. This was intentional to keep the focus on frontend architecture. Swapping in an API later would just mean replacing the Zustand persist middleware with async fetches.

**Signature is Visual Only**: The signature pad uses HTML5 Canvas. It captures the drawing as a data URL but doesn't do any cryptographic verification. It's a simulation for demo purposes.

## Limitations

- No drag-and-drop for field positioning (used move up/down buttons instead)
- No undo/redo for actions
- No PDF export
- Mobile works but the table-heavy UI is optimized for desktop

## Tests

```bash
npm run test
```

14 unit tests covering:
- Valid forward transitions (Created → Approved → Sent → etc.)
- Blocked transitions (can't skip states, can't go backward except Revert to Draft)
- Terminal state enforcement (Locked/Revoked contracts can't transition)
- Dashboard filter mapping

## Default Templates

The app ships with 4 ready-to-use blueprints:
- Employment Contract
- Non-Disclosure Agreement (NDA)
- Freelance Service Agreement
- Rental/Lease Agreement

These are baked into the code so new users have something to work with immediately.
