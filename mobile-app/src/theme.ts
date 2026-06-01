// ═══════════════════════════════════════════════════════════════
// KOAS Mobile Design System
// Premium Sports-Tech Aesthetic · Mobile-First · Light Mode Optimized
// ═══════════════════════════════════════════════════════════════

export const colors = {
  // ─── Brand Identity ────────────────────────────────────────
  primary:        '#ffffff',      // White primary base
  secondary:      '#215630',      // Forest Green accents for small components
  accent:         '#2E6F40',      // Forest Green action color
  primaryDark:    '#2E6F40',      // Same forest green across accents
  primaryLight:   '#2E6F40',      // Same forest green across accents
  primaryMuted:   'rgba(46, 111, 64, 0.12)',  // Subtle forest-tinted backgrounds
  secondaryMuted: 'rgba(46, 111, 64, 0.12)',  // Forest green muted overlay
  
  // ─── Light Surfaces (Clean Sports-Tech) ───────────────────
  dark: {
    bg:           '#f9fafb',      // Light base
    surface:      '#ffffff',      // Elevated surface
    card:         '#f1f5f9',      // Card background
    elevated:     '#e2e8f0',      // Hover/active surface
    border:       'rgba(15, 23, 42, 0.08)',  // Subtle borders
    borderStrong: 'rgba(15, 23, 42, 0.15)',  // Emphasized borders
  },
  
  // ─── Text Hierarchy (Light Theme) ──────────────────────────
  text: {
    primary:      '#0f172a',      // High emphasis
    secondary:    '#475569',      // Medium emphasis
    muted:        '#64748b',      // Low emphasis
    disabled:     '#94a3b8',      // Disabled state
    inverse:      '#ffffff',      // On dark backgrounds
  },
  
  // ─── Input States ──────────────────────────────────────────
  input: {
    bg:           '#ffffff',      // Input background
    border:       'rgba(15, 23, 42, 0.12)',  // Default border
    borderHover:  'rgba(15, 23, 42, 0.18)',  // Hover border
    borderFocus:  '#2E6F40',      // Focus border
    placeholder:  '#94a3b8',      // Placeholder text
  },
  
  // ─── Semantic Colors ───────────────────────────────────────
  success:        '#2E6F40',
  successBg:      'rgba(46, 111, 64, 0.1)',
  warning:        '#f59e0b',
  warningBg:      'rgba(245, 158, 11, 0.1)',
  danger:         '#ef4444',
  dangerBg:       'rgba(239, 68, 68, 0.1)',
  info:           '#3b82f6',
  infoBg:         'rgba(59, 130, 246, 0.1)',
  
  // ─── Legacy Support (Gradual Migration) ────────────────────
  authBg:         '#f9fafb',
  authCard:       '#ffffff',
  authInput:      '#ffffff',
  authBorder:     'rgba(15, 23, 42, 0.12)',
  authText:       '#0f172a',
  authMuted:      '#64748b',
  textInverse:    '#000000',
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
