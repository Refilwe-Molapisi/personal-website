# Synkra Platform — Design Language & Code Specification v2.0

> **Status:** Production Ready  
> **Visual Direction:** Soft Bento Minimalism with High-Contrast Obsidian Elements and Chartreuse Highlights  
> **Primary Font:** Outfit (Rounded Geometric Sans-Serif)  
> **Target Frameworks:** React 19 / Next.js 16 / TanStack / Tailwind CSS (v3 & v4)

---

## 1. Design Philosophy & Foundations

The Synkra Design System combines soft, tactile bento card architecture with bold high-contrast obsidian surfaces and vibrant lime accents. Every surface, curve, and elevation has been calibrated to mirror the mobile and desktop preview mock-ups.

### Core Rules
1. **Curvature Hierarchy:**
   - External Bento Cards & Main Panels: `rounded-[1.75rem]` (28px) or `rounded-[2rem]` (32px).
   - Inner Containers, Table Rows, Child Cards: `rounded-2xl` (16px).
   - Controls, Badges, Search Inputs, Action Buttons: `rounded-full` (9999px).
2. **Surface Harmony:**
   - Canvas background is soft warm bone (`#F4F3F0`), never stark white.
   - White cards (`#FFFFFF`) float with subtle 1px border (`rgba(0, 0, 0, 0.05)`) and micro-shadows.
   - High-contrast obsidian elements (`#15161A`) anchor key navigation (sidebar, mobile bottom bar, primary action modals).
   - Accent chartreuse (`#D6F824`) is strictly reserved for active states, key conversion metrics, and progress completion.

---

## 2. Design Tokens

### Color Palette

| Token Key | Hex Value | OKLCH Equivalent | Tailwind Class | Semantic Purpose |
|---|---|---|---|---|
| `bone` | `#F4F3F0` | `oklch(0.955 0.012 95)` | `bg-[#F4F3F0]` / `bg-bone` | Full viewport canvas background |
| `card` | `#FFFFFF` | `oklch(1 0 0)` | `bg-white` / `bg-card` | Bento cards, containers, inputs |
| `ink` | `#15161A` | `oklch(0.21 0.02 260)` | `bg-[#15161A]` / `bg-ink` | Sidebar, bottom nav, contrast summary |
| `ink-soft` | `#24262E` | `oklch(0.32 0.02 260)` | `bg-[#24262E]` | Hover states on dark elements |
| `lime` | `#D6F824` | `oklch(0.92 0.23 125)` | `bg-[#D6F824]` / `bg-lime` | Primary brand accent, active tabs, tags |
| `lime-fg` | `#141C00` | `oklch(0.25 0.03 260)` | `text-[#141C00]` | High-contrast text on lime backgrounds |
| `peach` | `#FDE6D2` | `oklch(0.93 0.05 60)` | `bg-[#FDE6D2]` | Calendar events, avatar fills, warm tags |
| `sky` | `#D8E9FE` | `oklch(0.90 0.05 240)` | `bg-[#D8E9FE]` | Calendar events, info badges, cool accents |
| `border` | `rgba(0,0,0,0.05)` | — | `border-black/5` | Soft perimeter borders on light cards |
| `border-dark` | `rgba(255,255,255,0.1)` | — | `border-white/10` | Subtle perimeter borders on dark cards |

### Typography Scale (Outfit)
```css
--font-sans: 'Outfit', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
```
- **Page Titles / Headers:** `font-black tracking-tight text-2xl sm:text-3xl`
- **Section Headers:** `font-bold text-base sm:text-lg`
- **Metric Numbers:** `font-black text-2xl sm:text-3xl tracking-tight`
- **Body Text:** `font-medium text-sm text-[#15161A]`
- **Subtitles & Metadata:** `font-normal text-xs text-gray-500`
- **Pill Badges & Tags:** `font-bold text-[10px] sm:text-[11px]`

---

## 3. Global CSS (`theme.css`)

```css
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&display=swap');

:root {
  --synkra-font: 'Outfit', sans-serif;
  --synkra-bone: #F4F3F0;
  --synkra-card: #FFFFFF;
  --synkra-card-border: rgba(0, 0, 0, 0.05);
  --synkra-ink: #15161A;
  --synkra-ink-soft: #24262E;
  --synkra-ink-text: #FBFBFC;
  --synkra-lime: #D6F824;
  --synkra-lime-foreground: #141C00;
  --synkra-peach: #FDE6D2;
  --synkra-sky: #D8E9FE;
  --radius-bento: 1.75rem;
  --radius-pill: 9999px;
  --shadow-bento: 0 2px 8px -2px rgba(0, 0, 0, 0.03), 0 1px 3px -1px rgba(0, 0, 0, 0.02);
}

body {
  font-family: var(--synkra-font);
  background-color: var(--synkra-bone);
  color: var(--synkra-ink);
  -webkit-font-smoothing: antialiased;
}
```

---

## 4. Reusable Core Components

### Component 1: `AppShell.tsx` (Desktop Floating Sidebar + Mobile Bottom Pill)
```tsx
import React, { ReactNode } from "react";
import {
  LayoutDashboard,
  Users,
  ClipboardList,
  KanbanSquare,
  CalendarDays,
  Search,
  Bell,
  Plus,
} from "lucide-react";

export const defaultNavItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "CRM", url: "/crm", icon: Users },
  { title: "Forms", url: "/forms", icon: ClipboardList },
  { title: "Tasks", url: "/tasks", icon: KanbanSquare },
  { title: "Calendar", url: "/calendar", icon: CalendarDays },
];

export const AppShell = ({ children, activePath = "/", onNavigate }) => {
  const isActive = (url) => (url === "/" ? activePath === "/" : activePath.startsWith(url));

  return (
    <div className="min-h-screen bg-[#F4F3F0] text-[#15161A] font-sans">
      {/* Desktop Floating Dark Pill Sidebar */}
      <aside className="fixed inset-y-4 left-4 z-40 hidden w-60 flex-col rounded-[2rem] bg-[#15161A] p-5 text-white shadow-2xl md:flex">
        <div className="flex items-center gap-2.5 px-2 pt-1">
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#D6F824]">
            <span className="text-sm font-black text-[#141C00]">C</span>
          </div>
          <span className="text-lg font-bold tracking-tight text-white">Capacitiq</span>
        </div>

        <nav className="mt-8 flex flex-1 flex-col gap-1.5">
          {defaultNavItems.map((item) => (
            <button
              key={item.title}
              onClick={() => onNavigate?.(item.url)}
              className={`flex items-center gap-3 rounded-full px-4 py-2.5 text-sm font-medium transition-all ${
                isActive(item.url)
                  ? "bg-[#D6F824] text-[#141C00] font-bold shadow-sm"
                  : "text-white/60 hover:bg-white/10 hover:text-white"
              }`}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              <span>{item.title}</span>
            </button>
          ))}
        </nav>

        <div className="rounded-2xl bg-white/5 p-3.5 border border-white/5">
          <div className="flex items-center gap-3">
            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#D6F824]/20 text-xs font-bold text-[#D6F824]">
              JE
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-white">Jordan Ellis</p>
              <p className="truncate text-xs text-white/50">Workspace Admin</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="md:pl-68">
        <header className="sticky top-0 z-30 flex items-center gap-3 bg-[#F4F3F0]/85 px-4 py-4 backdrop-blur-md md:px-8">
          <div className="flex min-w-0 flex-1 items-center gap-2.5 rounded-full bg-white px-4 py-2.5 shadow-sm border border-black/5">
            <Search className="h-4 w-4 shrink-0 text-gray-400" />
            <input
              placeholder="Search across the suite…"
              className="w-full min-w-0 bg-transparent text-sm outline-none placeholder:text-gray-400"
            />
          </div>
          <button className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white shadow-sm border border-black/5 hover:bg-gray-50">
            <Bell className="h-4 w-4 text-gray-700" />
          </button>
          <button className="flex h-10 shrink-0 items-center gap-2 rounded-full bg-[#15161A] px-5 text-sm font-semibold text-white hover:bg-[#24262E] active:scale-95 shadow-sm">
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">New</span>
          </button>
        </header>

        <main className="px-4 pb-28 pt-2 md:px-8 md:pb-12">{children}</main>
      </div>

      {/* Mobile Floating Pill Nav */}
      <nav className="fixed inset-x-4 bottom-4 z-40 flex items-center justify-between rounded-full bg-[#15161A] px-3 py-2 shadow-2xl border border-white/10 md:hidden">
        {defaultNavItems.map((item) => (
          <button
            key={item.title}
            onClick={() => onNavigate?.(item.url)}
            aria-label={item.title}
            className={`grid h-11 w-11 place-items-center rounded-full transition-colors ${
              isActive(item.url) ? "bg-[#D6F824] text-[#141C00]" : "text-white/60"
            }`}
          >
            <item.icon className="h-5 w-5" />
          </button>
        ))}
      </nav>
    </div>
  );
};
```

### Component 2: `StatCard.tsx` (Bento Metric Card)
```tsx
export const StatCard = ({ label, value, delta, subtext }) => (
  <div className="rounded-[1.75rem] bg-white p-4 shadow-sm border border-black/5 hover:shadow-md transition-shadow">
    <p className="truncate text-xs font-semibold text-gray-500">{label}</p>
    <p className="mt-1.5 text-2xl sm:text-3xl font-black tracking-tight text-[#15161A]">{value}</p>
    {delta && (
      <span className="mt-2 inline-block rounded-full bg-[#D6F824] px-2.5 py-0.5 text-[11px] font-bold text-[#141C00]">
        {delta}
      </span>
    )}
    {subtext && <p className="mt-1 text-[11px] text-gray-400">{subtext}</p>}
  </div>
);
```

### Component 3: `PipelineStage.tsx` (CRM Deal Stage Bento)
```tsx
export const PipelineStage = ({ stage, count, pct }) => (
  <div className="rounded-2xl bg-[#F4F3F0] p-3.5 border border-black/5">
    <span className="inline-block rounded-full bg-[#D6F824] px-2.5 py-0.5 text-[10px] font-bold text-[#141C00]">
      {stage}
    </span>
    <p className="mt-3 text-2xl font-black text-[#15161A]">{count}</p>
    <p className="text-[11px] text-gray-500 font-medium">deals</p>
    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-gray-200">
      <div className="h-full rounded-full bg-[#D6F824]" style={{ width: `${pct}%` }} />
    </div>
    <p className="mt-1.5 text-[10px] font-semibold text-gray-400">{pct}% conversion</p>
  </div>
);
```

### Component 4: `PillTabs.tsx` (Segmented Switcher)
```tsx
export const PillTabs = ({ options, active, onChange }) => (
  <div className="flex rounded-full bg-white p-1 shadow-sm border border-black/5">
    {options.map((option) => (
      <button
        key={option}
        onClick={() => onChange(option)}
        className={`rounded-full px-4 py-1.5 text-xs font-bold transition-all ${
          option === active
            ? "bg-[#15161A] text-white shadow-sm"
            : "text-gray-500 hover:text-[#15161A]"
        }`}
      >
        {option}
      </button>
    ))}
  </div>
);
```

### Component 5: `LeadScoreDial.tsx` (Radial Score Rating)
```tsx
export const LeadScoreDial = ({ score = 90, grade = "Grade A", subtext = "High purchase intent" }) => (
  <div className="rounded-[1.75rem] bg-white p-5 shadow-sm border border-black/5 text-center">
    <div className="relative mx-auto grid h-28 w-28 place-items-center rounded-full border-4 border-dashed border-[#D6F824] p-2">
      <div>
        <span className="text-3xl font-black text-[#15161A]">{score}</span>
        <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">{grade}</span>
      </div>
    </div>
    <p className="mt-3 text-xs font-semibold text-gray-600">{subtext}</p>
  </div>
);
```

---

## 5. Integration Notes for Your Team

1. **Monorepo Integration (`packages/design-system`):** Place these components and tokens inside your shared `@synkra/design-system` package so CRM, Forms, and Tasks can import them identically.
2. **Next.js 16 + React 19:** All components are SSR-friendly, pure client/server compatible with standard Lucide React icons.
3. **Responsive Breakpoints:**
   - `< 768px (Mobile):` Renders top compact search + floating bottom pill bar.
   - `>= 768px (Desktop):` Renders left fixed pill sidebar with 60px (`w-60`) width, offset by `md:pl-68`.
