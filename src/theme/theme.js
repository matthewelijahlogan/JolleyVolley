export const colors = {
  background: '#09020F',
  backgroundAlt: '#16051F',
  surface: 'rgba(24, 10, 34, 0.88)',
  surfaceStrong: 'rgba(34, 10, 42, 0.96)',
  stroke: 'rgba(255, 92, 190, 0.32)',
  primary: '#FF3FA4',
  primaryBright: '#FF6ED1',
  primarySoft: '#FFB6E4',
  accent: '#7EF9FF',
  success: '#59FFA8',
  text: '#FFF5FB',
  textMuted: '#E4B9D4',
  textDim: '#B57D9E',
};

export const spacing = {
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 28,
  xxl: 40,
};

export const radii = {
  sm: 14,
  md: 20,
  lg: 28,
  round: 999,
};

export const neonShadow = {
  shadowColor: colors.primaryBright,
  shadowOpacity: 0.45,
  shadowRadius: 16,
  shadowOffset: {
    width: 0,
    height: 0,
  },
  elevation: 14,
};

export const blockGlow = {
  shadowColor: colors.primaryBright,
  shadowOpacity: 0.28,
  shadowRadius: 14,
  shadowOffset: {
    width: 0,
    height: 0,
  },
  elevation: 10,
};

export const blockCard = {
  borderRadius: 22,
  borderWidth: 2,
  borderColor: 'rgba(255, 110, 209, 0.44)',
  backgroundColor: 'rgba(18, 6, 25, 0.96)',
  ...blockGlow,
};

export const blockPanel = {
  borderRadius: 18,
  borderWidth: 2,
  borderColor: 'rgba(255, 110, 209, 0.3)',
  backgroundColor: 'rgba(16, 7, 24, 0.94)',
};

export const blockPanelAlt = {
  borderRadius: 18,
  borderWidth: 2,
  borderColor: 'rgba(126, 249, 255, 0.22)',
  backgroundColor: 'rgba(10, 8, 18, 0.92)',
};

export const blockEyebrow = {
  color: colors.accent,
  fontSize: 11,
  fontWeight: '800',
  letterSpacing: 1.6,
  textTransform: 'uppercase',
};

export const blockTitle = {
  color: colors.text,
  fontSize: 28,
  fontWeight: '900',
  letterSpacing: 1.8,
  textTransform: 'uppercase',
  textShadowColor: 'rgba(255, 110, 209, 0.85)',
  textShadowOffset: {
    width: 0,
    height: 0,
  },
  textShadowRadius: 9,
};

export const blockTitleLarge = {
  ...blockTitle,
  fontSize: 34,
  letterSpacing: 2.2,
  textShadowRadius: 11,
};

export const blockValue = {
  color: colors.text,
  fontSize: 28,
  fontWeight: '900',
  fontVariant: ['tabular-nums'],
  letterSpacing: 1.2,
  textShadowColor: 'rgba(255, 110, 209, 0.84)',
  textShadowOffset: {
    width: 0,
    height: 0,
  },
  textShadowRadius: 8,
};
