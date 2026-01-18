# Contract Management Platform

A frontend-based Contract Management Platform that demonstrates product thinking, UI design, state management, and clean code architecture.

![React](https://img.shields.io/badge/React-18.3-61DAFB?logo=react) ![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178C6?logo=typescript) ![Vite](https://img.shields.io/badge/Vite-6.0-646CFF?logo=vite) ![Zustand](https://img.shields.io/badge/Zustand-5.0-000?logo=zustand)

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm run test

# Build for production
npm run build
```

The application runs at **http://localhost:5173**

---

## Features

### Blueprint Creation
- Create reusable contract templates with configurable fields
- Supported field types: **Text**, **Date**, **Signature**, **Checkbox**
- **Move Up/Down** positioning for field ordering
- Full CRUD operations with confirmation dialogs

### Contract Creation
- Select from existing blueprints
- Contracts inherit all fields as a snapshot (changes to blueprint don't affect existing contracts)
- Fill field values with type-specific inputs including canvas-based signature capture

### Contract Lifecycle
Contracts follow a controlled state machine:

```
CREATED → APPROVED → SENT → SIGNED → LOCKED
    ↓         ↓        ↓
         REVOKED (terminal)
```

**Rules enforced:**
- ✅ No skipping states
- ✅ Locked contracts are read-only
- ✅ Revoked contracts cannot proceed
- ✅ Confirmation modals for destructive actions

### Dashboard
- Contract table with all relevant columns
- Filter tabs: **All**, **Active**, **Pending**, **Signed**, **Archived**
- Search by contract or blueprint name
- Status badges with distinct colors
- Empty states per filter

---

## Architecture

### Tech Stack

| Layer | Technology | Rationale |
|-------|------------|-----------|
| **Framework** | React 18 + Vite | Fast dev server, pure SPA (no SSR needed) |
| **Language** | TypeScript (strict) | Type safety, self-documenting, catches bugs |
| **State** | Zustand | Minimal boilerplate, TypeScript-native, performant |
| **Routing** | React Router v6 | Industry standard, type-safe routes |
| **Styling** | CSS Modules + Variables | Full control, no external dependencies |
| **Testing** | Vitest | Fast, Vite-native, React Testing Library compatible |

### Folder Structure

```
src/
├── components/
│   ├── ui/                    # Atomic components (Button, Input, Badge, Modal, Card, Table, Select)
│   ├── features/              # Feature components (BlueprintForm, SignaturePad)
│   └── Layout/                # App layout with navigation
├── data/
│   └── defaultBlueprints.ts   # Built-in professional templates
├── pages/
│   ├── Dashboard/             # Contract listing with filters
│   ├── Blueprints/            # Blueprint CRUD pages
│   ├── Contracts/             # Contract creation and viewing
│   └── NotFound/              # 404 page
├── stores/
│   ├── blueprintStore.ts      # Blueprint state with localStorage persistence
│   └── contractStore.ts       # Contract state with FSM-controlled transitions
├── types/                     # TypeScript interfaces
├── utils/
│   ├── stateMachine.ts        # Contract lifecycle FSM
│   └── helpers.ts             # Utility functions
└── styles/                    # Design system (CSS variables)
```

### State Machine Implementation

The contract lifecycle is implemented as an explicit finite state machine in `src/utils/stateMachine.ts`:

```typescript
const TRANSITIONS: Record<ContractStatus, ContractStatus[]> = {
  CREATED:  ['APPROVED', 'REVOKED'],
  APPROVED: ['SENT', 'CREATED', 'REVOKED'],  // Can revert to draft
  SENT:     ['SIGNED', 'REVOKED'],
  SIGNED:   ['LOCKED'],
  LOCKED:   [],   // Terminal
  REVOKED:  [],   // Terminal
};
```

This approach ensures:
- **Controlled transitions**: `canTransition()` validates every state change
- **Predictable behavior**: Single source of truth for lifecycle rules
- **Testable logic**: 14 unit tests cover all transition scenarios

---

## Design Decisions

### Ambiguity Resolutions (Product Thinking)

The requirements contained deliberate ambiguities. Here's how they were resolved:

#### Trap A: Dashboard Filter Mismatch

**Problem**: 6 lifecycle states vs 3 dashboard filters

**Solution**: Added a 4th filter and mapped states:

| Filter | Statuses |
|--------|----------|
| Active | CREATED, APPROVED |
| Pending | SENT |
| Signed | SIGNED, LOCKED |
| Archived | REVOKED |

#### Trap B: Revoked Logic Hole

**Problem**: Spec says "after creation or sending" — implies APPROVED cannot be revoked

**Solution**: Allow REVOKED from any pre-signature state (CREATED, APPROVED, SENT). This is logical for real-world use.

#### Trap C: Basic Positioning vs Drag-and-Drop

**Problem**: "Basic positioning" required, drag-and-drop optional

**Solution**: Implemented list-based positioning with Move Up/Down buttons. Meets requirements without overengineering.

### Other Key Decisions

1. **Snapshot relationship for contracts**: When a contract is created, fields are COPIED from the blueprint. Changes to the blueprint don't affect existing contracts.

2. **Editable only in CREATED state**: Once a contract is approved, field values are locked. This prevents unauthorized modifications after approval.

3. **Signature as canvas**: Used HTML Canvas API for signature capture instead of file upload for a more authentic experience.

4. **localStorage persistence**: Data persists across browser sessions via Zustand's persist middleware. Ready for backend integration.

5. **Default templates**: Four professional blueprint templates (Employment, NDA, Freelance, Rental) are included out-of-the-box.

---

## Assumptions

1. **Single user**: No authentication or multi-user scenarios
2. **Browser environment**: localStorage available, modern browser
3. **No backend**: All data stored in localStorage
4. **No signature validation**: Signature is a visual confirmation only
5. **English only**: No i18n considerations

## Limitations

1. **No drag-and-drop**: Field positioning uses buttons instead
2. **No undo/redo**: Actions are immediate
3. **No contract versioning**: Blueprint changes don't create new versions
4. **No export**: Contracts cannot be exported as PDF
5. **Limited mobile optimization**: Responsive but table-heavy UI

---

## Testing

```bash
# Run all tests
npm run test

# Run tests once (CI mode)
npm run test:run
```

**Test coverage includes:**
- FSM transition validation (14 tests)
- State skipping prevention
- Terminal state enforcement
- Dashboard filter mapping

---

## Development

```bash
# Lint code
npm run lint

# Format code (if Prettier configured)
npx prettier --write src/
```

---

## Project Status

✅ **Core Requirements Complete**
- Blueprint CRUD with field management
- Contract creation from blueprints
- Controlled lifecycle transitions
- Dashboard with filters and search

✅ **Optional Enhancements**
- Status timeline visualization
- Unit tests for state machine
- Reusable component library

---

Built with care for clean code and great UX.
