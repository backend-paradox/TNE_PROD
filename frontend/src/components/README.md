# Component Architecture

## Active Layout Stack

**Entry Point:** App.tsx

**Global Components:**
- Navbar.tsx + Navbar.css - Sticky navigation with authentication state
- Footer.tsx + Footer.css - Site footer with links and social media
- ChatbotWidget.tsx - Fixed chatbot widget (bottom-right corner)

**Structure:**
```tsx
<Navbar />
<main>
  <Routes>
    {/* Application routes */}
  </Routes>
</main>
<Footer />
<ChatbotWidget />
```

## CSS Architecture

### Load Order (main.tsx)

The CSS files are loaded in the following order to ensure proper cascade:

1. **design-tokens.css** - CSS custom properties/variables (source of truth for colors, spacing, etc.)
2. **animations.css** - Keyframe animation definitions (pulse animations, premium effects, utilities)
3. **globals.css** - Global resets and base styles
4. **index.css** - Utility classes and component styles

### Component Styles

Components use two patterns for styling:

- **ComponentName.css** - Global styles imported in .tsx files
- **ComponentName.module.css** - CSS Modules with scoped class names

### Animation System

All animations are consolidated in `animations.css` using a descriptive naming convention:

**Pattern:** `pulse-{context}-{effect}`

**Examples:**
- `pulse-hero-search` - Hero section search bar glow
- `pulse-recording-indicator` - Chat recording indicator
- `pulse-chatbot-widget` - Chatbot widget bounce
- `pulse-skeleton-loading` - Skeleton loader fade

**Utility Classes:**
- `.animate-float-gentle` - Gentle floating animation
- `.animate-shimmer` - Shimmer/shine effect
- `.animate-gradient-shift` - Animated gradient transitions
- `.animate-slide-up` - Slide up entrance animation
- `.animate-scale-in` - Scale in entrance animation
- `.animate-bounce-in` - Bounce in entrance animation

All animations respect `prefers-reduced-motion` for accessibility.

## Design Tokens

The `design-tokens.css` file is the single source of truth for all CSS custom properties.

**Color System:**
- `--color-primary-*` - Primary brand colors (teal/cyan)
- `--color-secondary-*` - Secondary colors
- `--color-accent-*` - Accent colors (orange)
- `--color-gray-*` - Grayscale palette
- `--color-success-*` - Success states (green)
- `--color-error-*` - Error states (red)
- `--color-warning-*` - Warning states (yellow)
- `--color-info-*` - Info states (blue)

**Spacing System:**
- `--spacing-*` - Consistent spacing scale

**Typography:**
- `--font-family-*` - Font stack definitions
- `--font-size-*` - Type scale
- `--font-weight-*` - Font weights
- `--line-height-*` - Line heights

**Shadows & Effects:**
- `--shadow-*` - Box shadow definitions
- `--border-radius-*` - Border radius scale

**Note:** All color values use hex format (not oklch). The Tailwind `@layer theme` has been removed to prevent token conflicts.

## Component Organization

```
components/
├── common/           # Deprecated - legacy JSX components
├── layout/           # Deprecated - legacy JSX layout
├── ui/               # UI primitives (skeleton, etc.)
├── travellers/       # Travellers feature components
│   ├── chat/
│   ├── dashboard/
│   └── invitations/
└── README.md         # This file
```

## Feature Modules

```
features/
├── auth/             # Authentication (login, register, logout)
├── chatbot/          # AI chatbot feature
│   ├── components/
│   │   ├── ChatbotWidget/
│   │   ├── ChatbotWindow/
│   │   └── ChatbotMessage/
│   └── hooks/
└── [other features]
```

## Deprecated Files

The following files are part of the legacy JSX architecture and are **NOT USED**:

- `App.jsx` - Replaced by `App.tsx`
- `routes/AppRoutes.jsx` - Routing now in `App.tsx`
- `components/layout/MainLayout.jsx` - No layout wrapper used
- `components/common/Header.jsx` - Replaced by `Navbar.tsx`
- `components/common/Footer.jsx` - Replaced by `Footer.tsx`

**Do not modify these files.** They are marked for removal in Q1 2026.

## Migration Notes

### From Legacy JSX to Active TSX

If you find yourself looking at the legacy JSX files:

1. **DO NOT** modify Header.jsx → use Navbar.tsx instead
2. **DO NOT** modify Footer.jsx → use Footer.tsx instead
3. **DO NOT** use MainLayout.jsx → App.tsx handles layout directly
4. **DO NOT** modify App.jsx → App.tsx is the active entry point

### Animation Updates

If you need to add new animations:

1. Define keyframes in `animations.css` using the `pulse-{context}-{effect}` naming pattern
2. Add utility classes if needed (e.g., `.animate-{animation-name}`)
3. Ensure `@media (prefers-reduced-motion: reduce)` support is included
4. Use the animation in component CSS via `animation: {keyframe-name} {duration} {timing} {iteration}`

### Design Token Usage

Always use CSS custom properties from `design-tokens.css`:

```css
/* Good */
.button {
  background: var(--color-primary-500);
  padding: var(--spacing-3);
  border-radius: var(--border-radius-md);
  box-shadow: var(--shadow-md);
}

/* Bad - hardcoded values */
.button {
  background: #14b8a6;
  padding: 12px;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}
```

## Testing

When making CSS changes:

1. Test in multiple browsers (Chrome, Firefox, Safari, Edge)
2. Verify animations respect `prefers-reduced-motion`
3. Check color contrast for accessibility
4. Test responsive behavior at different breakpoints
5. Verify no console warnings about undefined CSS variables or animations

## Build & Development

```bash
# Install dependencies
npm install

# Development server
npm run dev

# Production build
npm run build

# Preview production build
npm run preview
```

## Questions?

For architecture questions or issues with the component system, check:

1. This README for component organization
2. `styles/design-tokens.css` for available CSS variables
3. `styles/animations.css` for available animations
4. Individual component files for usage examples
