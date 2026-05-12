export const colors = {
  // Brand
  primary:        '#0D4A1F',
  primaryLight:   '#166534',
  primaryHover:   '#0F5524',
  accent:         '#3DB54A',
  accentLight:    '#5DCF68',
  accentHover:    '#35A042',
  
  // Surfaces
  surface:        '#FAFBFA',
  card:           '#FFFFFF',
  sidebar:        '#0A1810',
  muted:          '#F0F2F0',
  hover:          '#E8EDE9',
  
  // Dark Mode Auth
  authBg:         '#0B1410',
  authCard:       '#111D17',
  authInput:      '#1A2820',
  authBorder:     '#1F3028',
  authText:       '#E8F0EC',
  authMuted:      '#7A8A80',
  
  // Text
  textPrimary:    '#0F1F13',
  textSecondary:  '#3D4F42',
  textMuted:      '#6B7D71',
  textInverse:    '#FFFFFF',
  
  // Semantic
  success:        '#3DB54A',
  successBg:      '#ECFDF5',
  warning:        '#F59E0B',
  warningBg:      '#FFFBEB',
  danger:         '#DC2626',
  dangerBg:       '#FEF2F2',
  info:           '#3B82F6',
  infoBg:         '#EFF6FF',
  
  // Borders
  border:         '#E5E7E5',
  borderStrong:   '#D1D9D2',
  borderFocus:    '#3DB54A',
};

export const spacing = {
  xs:  4,
  sm:  8,
  md:  12,
  lg:  16,
  xl:  24,
  xxl: 32,
  xxxl: 48,
};

export const radius = {
  sm:   6,
  md:   8,
  lg:   12,
  xl:   16,
  full: 9999,
};

export const typography = {
  sizes: {
    xs:   11,
    sm:   13,
    base: 15,
    md:   16,
    lg:   18,
    xl:   20,
    xxl:  24,
    xxxl: 32,
    huge: 48,
  },
  weights: {
    regular:  '400' as const,
    medium:   '500' as const,
    semibold: '600' as const,
    bold:     '700' as const,
    extrabold:'800' as const,
    black:    '900' as const,
  },
};

export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 8,
  },
  auth: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.24,
    shadowRadius: 16,
    elevation: 12,
  },
};
