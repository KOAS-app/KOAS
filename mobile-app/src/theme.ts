// ═══════════════════════════════════════════════════════════════
// KOAS Mobile Design System
// Premium Sports-Tech Aesthetic · Mobile-First · Dark Mode Optimized
// ═══════════════════════════════════════════════════════════════

export const colors = {
  // ─── Brand Identity ────────────────────────────────────────
  primary:        '#16a34a',      // Green-600 - Primary actions
  primaryDark:    '#15803d',      // Green-700 - Hover states
  primaryLight:   '#22c55e',      // Green-500 - Accents
  primaryMuted:   'rgba(22, 163, 74, 0.12)',  // Subtle backgrounds
  accent:         '#16a34a',      // Alias for primary (navigation)
  
  // ─── Dark Surfaces (Premium Sports-Tech) ───────────────────
  dark: {
    bg:           '#0a0f0d',      // Deep dark base
    surface:      '#111816',      // Elevated surface
    card:         '#151d1a',      // Card background
    elevated:     '#1a2320',      // Hover/active states
    border:       'rgba(255, 255, 255, 0.06)',  // Subtle borders
    borderStrong: 'rgba(255, 255, 255, 0.1)',   // Emphasized borders
  },
  
  // ─── Text Hierarchy (Dark Mode Optimized) ──────────────────
  text: {
    primary:      '#f8faf9',      // High emphasis
    secondary:    '#c5ccc9',      // Medium emphasis
    muted:        '#8a9490',      // Low emphasis
    disabled:     '#5a6562',      // Disabled state
    inverse:      '#0a0f0d',      // On light backgrounds
  },
  
  // ─── Input States ──────────────────────────────────────────
  input: {
    bg:           '#1a2320',      // Input background
    border:       'rgba(255, 255, 255, 0.08)',  // Default border
    borderHover:  'rgba(255, 255, 255, 0.12)',  // Hover border
    borderFocus:  '#16a34a',      // Focus border
    placeholder:  '#6b7773',      // Placeholder text
  },
  
  // ─── Semantic Colors ───────────────────────────────────────
  success:        '#16a34a',
  successBg:      'rgba(22, 163, 74, 0.1)',
  warning:        '#f59e0b',
  warningBg:      'rgba(245, 158, 11, 0.1)',
  danger:         '#ef4444',
  dangerBg:       'rgba(239, 68, 68, 0.1)',
  info:           '#3b82f6',
  infoBg:         'rgba(59, 130, 246, 0.1)',
  
  // ─── Legacy Support (Gradual Migration) ────────────────────
  authBg:         '#0a0f0d',
  authCard:       '#151d1a',
  authInput:      '#1a2320',
  authBorder:     'rgba(255, 255, 255, 0.08)',
  authText:       '#f8faf9',
  authMuted:      '#8a9490',
  textInverse:    '#ffffff',
};

// ─── Spacing Scale (8pt Grid System) ──────────────────────────
export const spacing = {
  xxs: 2,   // Micro spacing
  xs:  4,   // Tight spacing
  sm:  8,   // Small spacing
  md:  12,  // Base spacing
  lg:  16,  // Medium spacing
  xl:  20,  // Large spacing
  xxl: 24,  // Extra large
  xxxl: 32, // Huge spacing
  huge: 40, // Massive spacing
};

// ─── Border Radius (Consistent Rounding) ───────────────────────
export const radius = {
  xs:   4,    // Micro elements
  sm:   6,    // Small components
  md:   10,   // Standard components
  lg:   14,   // Cards, modals
  xl:   18,   // Large containers
  xxl:  24,   // Hero elements
  full: 9999, // Pills, avatars
};

// ─── Typography Scale (Mobile-Optimized) ───────────────────────
export const typography = {
  sizes: {
    xs:   11,   // Captions, labels
    sm:   13,   // Secondary text
    base: 15,   // Body text
    md:   16,   // Emphasized body
    lg:   18,   // Subheadings
    xl:   20,   // Section titles
    xxl:  24,   // Page titles
    xxxl: 28,   // Hero text
    huge: 36,   // Display text
  },
  weights: {
    regular:  '400' as const,
    medium:   '500' as const,
    semibold: '600' as const,
    bold:     '700' as const,
    extrabold:'800' as const,
    black:    '900' as const,
  },
  lineHeights: {
    tight:   1.2,   // Headings
    snug:    1.375, // Subheadings
    normal:  1.5,   // Body text
    relaxed: 1.625, // Comfortable reading
  },
};

// ─── Shadows (Subtle Depth) ────────────────────────────────────
export const shadows = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  xs: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 12,
  },
};

// ─── Animation Timings ─────────────────────────────────────────
export const animation = {
  fast: 150,
  base: 200,
  slow: 300,
  slower: 400,
};
