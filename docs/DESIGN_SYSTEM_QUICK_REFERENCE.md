# KOAS Design System — Quick Reference

## 🎨 Colors

### Brand
```css
--color-primary:        #0D4A1F  /* Dark forest green */
--color-primary-hover:  #0F5524
--color-accent:         #3DB54A  /* Grass green */
--color-accent-hover:   #35A042
```

### Surfaces
```css
--color-surface:        #FAFBFA  /* Page background */
--color-surface-card:   #FFFFFF  /* Cards */
--color-surface-dark:   #0A1810  /* Sidebar */
--color-surface-muted:  #F0F2F0  /* Dividers */
```

### Text
```css
--color-text-base:      #0F1F13  /* Primary text */
--color-text-secondary: #3D4F42  /* Secondary text */
--color-text-muted:     #6B7D71  /* Muted text */
--color-text-inverse:   #FFFFFF  /* Text on dark */
```

### Semantic
```css
--color-success:     #3DB54A
--color-success-bg:  #ECFDF5
--color-warning:     #F59E0B
--color-warning-bg:  #FFFBEB
--color-danger:      #DC2626
--color-danger-bg:   #FEF2F2
```

---

## 📏 Spacing

```css
--space-xs:   4px
--space-sm:   8px
--space-md:   12px
--space-lg:   16px
--space-xl:   24px
--space-2xl:  32px
--space-3xl:  48px
```

**Usage:**
- `xs` — Tight gaps in badges, icons
- `sm` — Component internal spacing
- `md` — Card padding
- `lg` — Section spacing
- `xl` — Major sections
- `2xl` — Page sections
- `3xl` — Hero areas

---

## 🔤 Typography

### Font Family
```css
--font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
```

### Sizes
```css
xs:   11px / 0.6875rem
sm:   13px / 0.8125rem
base: 15px / 0.9375rem
md:   16px / 1rem
lg:   18px / 1.125rem
xl:   20px / 1.25rem
xxl:  24px / 1.5rem
xxxl: 32px / 2rem
```

### Weights
```css
regular:   400
medium:    500
semibold:  600
bold:      700
extrabold: 800
```

### Common Patterns
```css
/* Page Title */
font-size: 1.75rem;
font-weight: 800;
letter-spacing: -0.02em;
line-height: 1.2;

/* Section Title */
font-size: 1.125rem;
font-weight: 700;
letter-spacing: -0.01em;
line-height: 1.3;

/* Body Text */
font-size: 0.9375rem;
font-weight: 400;
line-height: 1.6;

/* Label */
font-size: 0.8125rem;
font-weight: 600;
letter-spacing: 0.01em;
```

---

## 🔘 Border Radius

```css
--radius-sm:   6px   /* Small elements */
--radius-md:   8px   /* Inputs, buttons */
--radius-lg:   12px  /* Cards */
--radius-xl:   16px  /* Large containers */
--radius-full: 9999px /* Pills, badges */
```

---

## 🌑 Shadows

```css
--shadow-xs:   0 1px 2px 0 rgb(0 0 0 / 0.05)
--shadow-sm:   0 1px 3px 0 rgb(0 0 0 / 0.08), 0 1px 2px -1px rgb(0 0 0 / 0.08)
--shadow-md:   0 4px 6px -1px rgb(0 0 0 / 0.08), 0 2px 4px -2px rgb(0 0 0 / 0.08)
--shadow-lg:   0 10px 15px -3px rgb(0 0 0 / 0.08), 0 4px 6px -4px rgb(0 0 0 / 0.08)
--shadow-focus: 0 0 0 3px rgb(61 181 74 / 0.12)
```

---

## ⚡ Transitions

```css
--transition-fast: 150ms cubic-bezier(0.4, 0, 0.2, 1)
--transition-base: 200ms cubic-bezier(0.4, 0, 0.2, 1)
--transition-slow: 300ms cubic-bezier(0.4, 0, 0.2, 1)
```

---

## 🧩 Component Classes

### Buttons
```html
<!-- Primary -->
<button class="btn btn-primary">Sign In</button>

<!-- Accent -->
<button class="btn btn-accent">Confirm</button>

<!-- Ghost -->
<button class="btn btn-ghost">Cancel</button>

<!-- Danger -->
<button class="btn btn-danger">Delete</button>

<!-- Sizes -->
<button class="btn btn-primary btn-sm">Small</button>
<button class="btn btn-primary">Default</button>
<button class="btn btn-primary btn-lg">Large</button>
```

### Cards
```html
<!-- Basic card -->
<div class="card">
  Content here
</div>

<!-- Hoverable card -->
<div class="card card-hover">
  Content here
</div>

<!-- Interactive card (clickable) -->
<div class="card card-interactive">
  Content here
</div>
```

### Inputs
```html
<div>
  <label class="label">Email Address</label>
  <input type="email" class="input" placeholder="you@example.com" />
</div>
```

### Badges
```html
<span class="badge badge-success">✓ Approved</span>
<span class="badge badge-warning">⏳ Pending</span>
<span class="badge badge-danger">✕ Cancelled</span>
<span class="badge badge-info">ℹ Info</span>
<span class="badge badge-muted">Muted</span>
```

### Typography
```html
<h1 class="page-title">Dashboard</h1>
<h2 class="section-title">Recent Activity</h2>
<p class="text-muted">Secondary information</p>
<p class="text-secondary">Less important text</p>
```

### Empty States
```html
<div class="card empty-state">
  <p class="empty-state-icon">🏟️</p>
  <p class="empty-state-title">No stadiums yet</p>
  <p class="empty-state-description">
    Add your first stadium to get started
  </p>
  <button class="btn btn-primary">+ Add Stadium</button>
</div>
```

### Loading States
```html
<div class="flex items-center gap-3">
  <div class="loading-spinner"></div>
  <p style="color: var(--color-text-muted)">Loading...</p>
</div>
```

---

## 📱 Mobile (React Native)

### Import Theme
```typescript
import { colors, spacing, radius, typography, shadows } from '../theme';
```

### Common Patterns
```typescript
// Card
{
  backgroundColor: colors.card,
  borderRadius: radius.lg,
  padding: spacing.lg,
  borderWidth: 1,
  borderColor: colors.border,
  ...shadows.sm,
}

// Button
{
  backgroundColor: colors.primary,
  borderRadius: radius.md,
  padding: spacing.lg,
  alignItems: 'center',
  ...shadows.sm,
}

// Input
{
  backgroundColor: colors.card,
  borderWidth: 1.5,
  borderColor: colors.border,
  borderRadius: radius.md,
  padding: spacing.md,
  fontSize: typography.sizes.base,
  ...shadows.sm,
}

// Text
{
  fontSize: typography.sizes.base,
  fontWeight: typography.weights.medium,
  color: colors.textPrimary,
  lineHeight: 24,
}
```

---

## 🎯 Common Layouts

### Page Header
```html
<div class="flex items-center justify-between mb-8">
  <div>
    <h1 class="page-title mb-2">Page Title</h1>
    <p class="text-sm" style="color: var(--color-text-muted)">
      Description text
    </p>
  </div>
  <button class="btn btn-primary">+ Add New</button>
</div>
```

### Filter Tabs
```html
<div class="flex gap-1 mb-5 p-1 rounded-lg w-fit"
  style="background-color: var(--color-surface-muted)">
  <button class="text-sm px-3 py-1.5 rounded-md font-medium">All</button>
  <button class="text-sm px-3 py-1.5 rounded-md font-medium">Active</button>
  <button class="text-sm px-3 py-1.5 rounded-md font-medium">Pending</button>
</div>
```

### Responsive Grid
```html
<div class="grid gap-5" 
  style="grid-template-columns: repeat(auto-fit, minmax(220px, 1fr))">
  <!-- Cards here -->
</div>
```

### Error Message
```html
<div class="text-sm px-4 py-3 rounded-lg mb-5"
  style="background-color: var(--color-danger-bg); 
         color: var(--color-danger);
         border: 1px solid #FECACA">
  Error message here
</div>
```

---

## ✅ Best Practices

### DO
✓ Use design tokens (CSS variables)  
✓ Maintain consistent spacing  
✓ Use semantic color names  
✓ Add hover/focus states  
✓ Provide loading feedback  
✓ Use proper font weights  
✓ Test on mobile devices  
✓ Keep touch targets 44px minimum  

### DON'T
✗ Use arbitrary values  
✗ Mix spacing scales  
✗ Use colors directly  
✗ Forget disabled states  
✗ Skip empty states  
✗ Use thin fonts (<400)  
✗ Ignore accessibility  
✗ Make tiny touch targets  

---

## 🚀 Quick Start

### Web (Tailwind + CSS)
```tsx
// Import global styles
import './index.css';

// Use utility classes + CSS variables
<button className="btn btn-primary">
  Sign In
</button>

<div className="card">
  <h2 className="section-title">Title</h2>
  <p style={{ color: 'var(--color-text-muted)' }}>
    Description
  </p>
</div>
```

### Mobile (React Native)
```tsx
import { colors, spacing, radius, typography, shadows } from '../theme';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
    padding: spacing.lg,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.lg,
    ...shadows.sm,
  },
  title: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
});
```

---

## 📚 Resources

- **Design System:** `admin-web/src/index.css` or `owner-web/src/index.css`
- **Mobile Theme:** `mobile-app/src/theme.ts`
- **Full Documentation:** `docs/UI_UX_REFINEMENT.md`
- **Font:** [Inter on Google Fonts](https://fonts.google.com/specimen/Inter)

---

**Version:** 2.0  
**Last Updated:** May 12, 2026
