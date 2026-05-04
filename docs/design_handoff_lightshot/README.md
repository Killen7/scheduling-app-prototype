# Handoff: Lightshot Bar

## Overview

The Lightshot Bar is a command-palette-style floating overlay for the TeamBuilder scheduling platform. Triggered via `⌘K` / `Ctrl+K` (or the "Add shift" button), it gives power users a single entry point for the three most common actions — creating shifts, browsing people, and browsing offices — plus a free-text AI assistant that interprets natural language and routes to the appropriate action.

Hovering over a person or office result opens a contextual **peek overlay** that shows a rich preview (week schedule + availability for people; day schedule grouped by section for offices) directly inside the bar, without navigating away.

---

## About the Design Files

The files bundled in this package are **HTML prototypes** — high-fidelity interactive references built to demonstrate look, feel, and behavior. They are **not production code to copy directly**. Your task is to **recreate these designs in your existing Next.js codebase**, using your established component library, CSS conventions, and file structure.

The prototype uses React + Babel inline for rapid prototyping. In your codebase, translate each component to a proper `.tsx` file with your existing patterns (e.g. shadcn/ui, Tailwind, CSS Modules, etc.).

---

## Fidelity

**High-fidelity.** The prototype reflects final colors, typography, spacing, interactions, and animation intent. Recreate pixel-accurately using your existing design system where tokens overlap; use the exact values below where they don't.

---

## Screens / Views

### 1. App Background (TeamBuilder Schedule)

The Lightshot bar floats over the existing Schedule page. The backdrop uses `rgba(0,0,0,0.25)` with `backdrop-filter: blur(4px)`.

---

### 2. Lightshot Bar — Default / Idle State

**Trigger:** `⌘K` / `Ctrl+K` or clicking "Add shift"  
**Position:** Fixed, centered horizontally, `padding-top: 120px` from top of viewport  
**Animation:** Scale from `0.96` + `translateY(-8px)` to `scale(1) translateY(0)`, `0.2s cubic-bezier(0.34, 1.2, 0.64, 1)`

**Container:**
- Width: `620px`, max `calc(100vw - 32px)`
- Background: `#ffffff`
- Border: `1px solid rgba(0,0,0,0.09)`
- Border-radius: `16px`
- Box-shadow: `0 0 0 1px rgba(61,82,160,0.06), 0 8px 32px rgba(0,0,0,0.12), 0 32px 64px rgba(0,0,0,0.08)`

**Input row:**
- Height: `~52px`, padding `14px 16px`
- Search icon (16×16) left, `color: #6b7280`
- Placeholder: `"Search or ask anything…"`, `font-size: 15px`, `color: #6b7280`
- `ESC` kbd badge right: `background: rgba(0,0,0,0.04)`, `border: 1px solid rgba(0,0,0,0.1)`, `border-radius: 5px`
- Caret color: `#3d52a0`
- Bottom border: `1px solid rgba(0,0,0,0.07)`

**Quick Picks row** (padding `10px 14px`, gap `6px`, bottom border `1px solid rgba(0,0,0,0.07)`):

| Pick | Style | Icon color |
|---|---|---|
| **Create Shift** | Navy filled — `background: #3d52a0`, `color: white`, `border-radius: 8px`, `font-size: 12px`, `font-weight: 500` | `rgba(255,255,255,0.18)` bg |
| **People** | Ghost — `background: rgba(0,0,0,0.03)`, `border: 1px solid rgba(0,0,0,0.09)` | `#059669` green |
| **Offices** | Ghost | `#d97706` amber |
| **Ask AI** | Ghost | `#6d5bc8` purple gradient |

Hover state for ghost picks: `background: rgba(61,82,160,0.08)`, `border-color: rgba(61,82,160,0.25)`, `color: #3d52a0`

**Results area** (`max-height: 480px`, overflow-y auto):
- Idle: shows "Recent" section with last 3 items
- Section label: `font-size: 10px`, `font-weight: 600`, `letter-spacing: 0.08em`, `color: #6b7280`, `text-transform: uppercase`, `padding: 10px 16px 4px`
- Result item: `padding: 9px 14px`, hover `background: rgba(0,0,0,0.04)`
- Focused item: left `2px` accent bar in `#3d52a0`

**Footer** (padding `8px 16px`, border-top `1px solid rgba(0,0,0,0.07)`):
- Keyboard hints: `↑↓ Navigate`, `↵ Select`, `ESC Close` — `font-size: 10px`, `color: #6b7280`
- "LIGHTSHOT" label right: `font-size: 10px`, `font-weight: 600`, `color: #6b7280`

---

### 3. Create Shift Panel (active panel inside bar)

3-step wizard rendered in the results area:

**Step indicator:** 3 bars, `height: 3px`, `border-radius: 2px`  
- Inactive: `rgba(0,0,0,0.08)`  
- Active: `rgba(61,82,160,0.4)`  
- Done: `#3d52a0`

**Step 1 — Select Office:**  
Pill options: `padding: 6px 12px`, `border-radius: 7px`, `border: 1px solid rgba(0,0,0,0.1)`, `color: #6b7280`  
Selected: `background: rgba(61,82,160,0.1)`, `border-color: rgba(61,82,160,0.4)`, `color: #1a1f36`, `font-weight: 600`

**Step 2 — Date + Time:**  
Date pills same as office pills. Time inputs: `background: rgba(0,0,0,0.03)`, `border: 1px solid rgba(0,0,0,0.1)`, `border-radius: 8px`, focused border `rgba(61,82,160,0.4)`

**Step 3 — Assign Person:**  
Person list with availability badges. Available: `background: rgba(5,150,105,0.1)`, `color: #059669`. Partial: amber. Conflict/busy: red, `opacity: 0.5`, `cursor: not-allowed`.

**OK chip:** `background: rgba(5,150,105,0.07)`, `border: 1px solid rgba(5,150,105,0.2)`, `color: #059669`

**Primary button:** `background: #3d52a0`, `border-radius: 9px`, white text, full width, `font-size: 13px`, `font-weight: 600`  
**Back button:** `background: rgba(0,0,0,0.04)`, `border: 1px solid rgba(0,0,0,0.1)`, `color: #1a1f36`

---

### 4. People Panel (active panel inside bar)

Searchable list. Each row:
- 32×32 avatar circle (color-coded by availability)
- Name `font-size: 13px`, `font-weight: 500`
- Role + office `font-size: 11px`, `color: #6b7280`
- Badge right: `font-size: 10px`, `border-radius: 20px`, `padding: 2px 7px`
- 7×7 dot far right

Availability colors:
- Available: `#059669` (green)
- Partial: `#d97706` (amber)  
- Unavailable/Busy: `#dc2626` (red)

**Hover → Person Peek** (320ms delay, see §6)

---

### 5. Offices Panel (active panel inside bar)

Each office row:
- 36×36 icon: `background: rgba(217,119,6,0.08)`, `border: 1px solid rgba(217,119,6,0.15)`, `color: #d97706`
- Name + stats (staffed/capacity, shifts today)
- Capacity bar: `44px wide`, `6px tall`, `border-radius: 3px`, fill color green/amber/red by ratio
- Hover: left `2px` accent bar `#3d52a0`

**Hover → Office Peek** (320ms delay, see §7)

---

### 6. Person Peek Overlay

Triggered on 320ms hover over a person row. Appears as an **absolute overlay** covering the entire lightshot container (`position: absolute; inset: 0`).

**Animation:** `translateX(12px) → translateX(0)` + fade, `0.2s cubic-bezier(0.34,1.2,0.64,1)`  
**Background:** `#ffffff`  
**Dismiss:** any keypress dismisses peek (ESC first closes peek, second press closes bar); clicking "ESC to close" button also dismisses

**Header:** person avatar (32px circle, color by availability), name `font-size: 13px, font-weight: 600`, subtitle `font-size: 11px, color: #6b7280`, "ESC to close" kbd button

**Week grid** (Mon–Sun, current week):
- Sticky header row: white `#fff`, `border-bottom: 1px solid rgba(0,0,0,0.07)`
- Today column header: `color: #3d52a0`
- 5 data rows, each with a `2px` left border accent:

| Row | Accent color | Cell style |
|---|---|---|
| **Shifts** | `#3d52a0` | Blue filled: `rgba(61,82,160,0.1)` bg, `rgba(61,82,160,0.25)` border |
| **Callouts** | `#d97706` | Amber striped: `rgba(217,119,6,0.07)` bg with diagonal stripe pattern |
| **Requests** | `#6d5bc8` | Dashed border: `border: 1px dashed rgba(61,82,160,0.35)` |
| **Availability** | `#059669` | Green: `rgba(5,150,105,0.08)` bg |
| **PTO** | `#dc2626` | Red: `rgba(220,38,38,0.07)` bg |

Empty cells: `background: rgba(0,0,0,0.02)`, `border: 1px dashed rgba(0,0,0,0.08)`  
Unavailable cells: diagonal stripe pattern, `rgba(0,0,0,0.015)`

**Legend** (single horizontal row, `flex-direction: row`, `flex-wrap: nowrap`, `overflow-x: auto`):  
Shift · Callout · Request · Available · PTO — each with 8×8 color dot + label, `font-size: 10px`

---

### 7. Office Peek Overlay

Same positioning/animation as Person Peek.

**Header:** amber hexagon icon, office name, date + people count

**Day schedule grid** (6am–8pm):
- Sticky time ruler: hour labels `6a` through `8p`, `font-size: 9px`, `color: #6b7280`
- **Section headers** between people groups: `background: rgba(0,0,0,0.025)`, `font-size: 9px`, `font-weight: 700`, `letter-spacing: 0.07em`, `color: #6b7280`, `text-transform: uppercase`
- Sections: **PROVIDERS**, **NON-CLINICAL STAFF** (and others as defined in data)
- Each person row: 20px avatar circle + name + role label, then timeline with shift bars

Shift bar colors:
- Primary shift: `rgba(110,142,251,0.25)` bg, `rgba(110,142,251,0.45)` border
- Alt shift: `rgba(52,211,153,0.2)` bg
- PTO bar: `rgba(220,38,38,0.08)` bg, `rgba(220,38,38,0.2)` border, red text

**Legend:** Shift · Alt shift · PTO · Unavailable

---

## Interactions & Behavior

### Opening/Closing
- `⌘K` / `Ctrl+K` toggles bar open/closed
- Clicking backdrop closes bar
- `ESC` closes peek first (if open), then bar on second press
- Any non-modifier keypress while peek is open dismisses peek

### Hover Peeks
- 320ms debounced delay before showing peek (prevents flicker on accidental hover)
- Hover timers stored in `useRef` and cleared on `mouseleave`
- Only one peek visible at a time (office or person, not both)

### AI Panel
- Activates automatically when user types >3 characters with no panel selected
- 900ms simulated thinking delay, then calls AI API
- Returns 1–2 sentence scheduling suggestion + 3 action chips
- Chips route to: Create Shift, People panel, or Offices panel

### Create Shift Wizard
- Step 1: Office selection (required to advance)
- Step 2: Date chips + time range inputs (required to advance)
- Step 3: Person assignment — available people shown green, conflicts grayed out
- Conflict rules: person must have availability, no existing shift conflict, no PTO

---

## State Management

```typescript
// LightshotBar state
const [open, setOpen] = useState(false)
const [query, setQuery] = useState('')
const [activePanel, setActivePanel] = useState<'shift' | 'people' | 'offices' | 'ai' | null>(null)
const [hoveredOffice, setHoveredOffice] = useState<Office | null>(null)
const [hoveredPerson, setPerson] = useState<Person | null>(null)

// ShiftPanel state
const [step, setStep] = useState<0 | 1 | 2>(0)
const [office, setOffice] = useState<Office | null>(null)
const [date, setDate] = useState<string>('')
const [startTime, setStartTime] = useState('08:00')
const [endTime, setEndTime] = useState('16:00')
const [person, setPerson] = useState<Person | null>(null)
```

---

## Design Tokens

```css
/* Brand */
--navy:        #3d52a0;
--navy-dark:   #2d3f7c;
--navy-light:  #e8ecf7;

/* Lightshot surface */
--ls-bg:       #ffffff;
--ls-border:   rgba(0,0,0,0.09);
--ls-text:     #1a1f36;
--ls-muted:    #6b7280;
--ls-accent:   #3d52a0;
--ls-accent2:  #6d5bc8;
--ls-hover:    rgba(0,0,0,0.04);
--ls-divider:  rgba(0,0,0,0.07);

/* Status */
--success:     #059669;
--warning:     #d97706;
--error:       #dc2626;

/* Radius */
--ls-radius:       16px;
--ls-item-radius:  10px;

/* Typography */
font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif;
```

---

## Key Components to Create

```
components/
  lightshot/
    LightshotBar.tsx          # Root component, keyboard handler, state
    LightshotInput.tsx        # Search input row
    LightshotQuickPicks.tsx   # Quick pick pills row
    LightshotFooter.tsx       # Keyboard hint row
    panels/
      ShiftPanel.tsx          # 3-step create shift wizard
      PeoplePanel.tsx         # Searchable people list
      OfficesPanel.tsx        # Office list with capacity bars
      AIPanel.tsx             # AI free-text assistant
    peeks/
      PersonPeek.tsx          # Week schedule overlay
      OfficePeek.tsx          # Day schedule overlay
    hooks/
      useLightshot.ts         # Open/close/query state
      useHoverPeek.ts         # 320ms debounced hover logic
```

---

## Next.js Integration Notes

- Add a global keyboard listener in a `useEffect` in `LightshotBar` — attach to `window`, clean up on unmount
- Render `LightshotBar` in your root layout (`app/layout.tsx`) so it's available on all pages
- Use a React portal (`ReactDOM.createPortal`) to render the backdrop/container at `document.body` level to avoid z-index/overflow issues with page content
- The AI panel should call your own API route (`/api/ai/schedule-assistant`) rather than calling the AI API directly from the client

---

## Files in This Package

| File | Description |
|---|---|
| `Lightshot Bar v2.html` | Full interactive prototype — the source of truth for all interactions |
| `README.md` | This document |

---

## Questions for the Team

1. What is your existing component library? (shadcn/ui, Radix, MUI, custom?)
2. Do you use Tailwind CSS or CSS Modules?
3. Where should the AI assistant route requests — existing backend or new endpoint?
4. Should the shift creation in the bar actually call the same API as the main "Add shift" form?
