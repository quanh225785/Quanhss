# Modern Adventurous Design System

## 1. Core Principles
- **Modern**: Clean lines, rounded corners, large typography, and ample whitespace.
- **Adventurous**: Vibrant "Ocean & Sunset" palette, dynamic hover effects, and immersive imagery.
- **Glassmorphism**: Use translucent backgrounds (`bg-white/x` + `backdrop-blur`) for depth and layering.
- **Bento Grid**: Organize content in modular, grid-based layouts (spans of 1x1, 2x1, 2x2).

## 2. Color Palette
Defined in `index.css` as CSS variables and Tailwind theme extensions.

| Semantic Name | Color Value | Tailwind Class | Usage |
| :--- | :--- | :--- | :--- |
| **Primary** | `#0EA5E9` (Ocean Blue) | `text-primary`, `bg-primary` | Main actions, active states, key highlights. |
| **Secondary** | `#F97316` (Sunset Orange) | `text-secondary`, `bg-secondary` | Accents, badges, "warm" calls to action. |
| **Surface** | `#F8FAFC` (Slate 50) | `bg-surface` | Main page background. |
| **Glass** | `rgba(255, 255, 255, 0.6)` | `bg-white/60` | Cards, sidebars, overlays. |
| **Text Main** | `#0F172A` (Slate 900) | `text-slate-900` | Headings, primary text. |
| **Text Muted** | `#64748B` (Slate 500) | `text-slate-500` | Body text, captions. |

## 3. Typography
| Typeface | Usage | properties |
| :--- | :--- | :--- |
| Typeface | Usage | properties |
| :--- | :--- | :--- |
| **Inter** | Display, Body, UI | `font-sans`, `font-display` |

## 4. Component Patterns

### Glass Card
Used for almost all containers (Sidebar, Booking Cards, Profile).
```jsx
<div className="bg-white/60 backdrop-blur-md border border-white/60 shadow-sm rounded-[2rem] p-6">
  {/* Content */}
</div>
```

### Floating Navbar / Sidebar
- **Style**: Fixed position, `bg-white/70`, `backdrop-blur-xl`, `rounded-[2rem]`, `shadow-2xl`.
- **Active Item**: `bg-primary/10`, `text-primary`, with a left-border indicator.

### Buttons
- **Primary**: `bg-slate-900 text-white hover:bg-primary` (Rounded-xl).
- **Secondary**: `bg-white text-slate-700 border border-slate-200 hover:bg-slate-50`.
- **Ghost**: `text-slate-500 hover:text-slate-900`.

### Backgrounds
Use ambient "blob" animations for depth.
```jsx
<div className="fixed top-0 left-0 -z-10 ...">
  <div className="bg-primary/5 blur-3xl animate-pulse ..."></div>
</div>
```

## 5. Animations
- **Float**: `animate-float` (Gentle up/down motion for hero images).
- **Fade In Up**: `animate-fade-in-up` (Entry animation for page content).
- **Hover Lift**: `hover:-translate-y-1 hover:shadow-xl` (Interactive cards).
