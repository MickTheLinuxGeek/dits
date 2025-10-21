/**
 * Responsive Breakpoint System
 * Breakpoints, media queries, and responsive utilities
 */

// Breakpoint values (in pixels)
export const breakpointValues = {
  xs: 0, // Extra small devices (phones in portrait)
  sm: 640, // Small devices (phones in landscape)
  md: 768, // Medium devices (tablets)
  lg: 1024, // Large devices (desktops)
  xl: 1280, // Extra large devices (large desktops)
  '2xl': 1536, // 2X large devices (larger desktops)
} as const;

export type Breakpoint = keyof typeof breakpointValues;

// Media query helpers
export const mediaQueries = {
  // Min-width queries (mobile-first approach)
  up: (breakpoint: Breakpoint): string => {
    const value = breakpointValues[breakpoint];
    return value === 0
      ? '@media (min-width: 0px)'
      : `@media (min-width: ${value}px)`;
  },

  // Max-width queries
  down: (breakpoint: Breakpoint): string => {
    const value = breakpointValues[breakpoint];
    // Subtract 0.02px to avoid overlap with up() query
    return `@media (max-width: ${value - 0.02}px)`;
  },

  // Between two breakpoints
  between: (min: Breakpoint, max: Breakpoint): string => {
    const minValue = breakpointValues[min];
    const maxValue = breakpointValues[max];
    return `@media (min-width: ${minValue}px) and (max-width: ${maxValue - 0.02}px)`;
  },

  // Only this specific breakpoint range
  only: (breakpoint: Breakpoint): string => {
    const breakpoints = Object.keys(breakpointValues) as Breakpoint[];
    const index = breakpoints.indexOf(breakpoint);

    if (index === breakpoints.length - 1) {
      // Last breakpoint, only has a lower bound
      return mediaQueries.up(breakpoint);
    }

    const nextBreakpoint = breakpoints[index + 1];
    return mediaQueries.between(breakpoint, nextBreakpoint);
  },

  // Custom media query
  custom: (query: string): string => `@media ${query}`,
} as const;

// Common responsive patterns
export const responsive = {
  // Hide/show at specific breakpoints
  hideOn: {
    xs: mediaQueries.only('xs'),
    sm: mediaQueries.only('sm'),
    md: mediaQueries.only('md'),
    lg: mediaQueries.only('lg'),
    xl: mediaQueries.only('xl'),
    '2xl': mediaQueries.only('2xl'),
  },

  showOn: {
    xs: mediaQueries.only('xs'),
    sm: mediaQueries.only('sm'),
    md: mediaQueries.only('md'),
    lg: mediaQueries.only('lg'),
    xl: mediaQueries.only('xl'),
    '2xl': mediaQueries.only('2xl'),
  },

  // Hide/show above or below breakpoint
  hideAbove: (breakpoint: Breakpoint) => mediaQueries.up(breakpoint),
  hideBelow: (breakpoint: Breakpoint) => mediaQueries.down(breakpoint),
  showAbove: (breakpoint: Breakpoint) => mediaQueries.up(breakpoint),
  showBelow: (breakpoint: Breakpoint) => mediaQueries.down(breakpoint),
} as const;

// Utility to check if screen size matches breakpoint (for JS usage)
export const isBreakpoint = (breakpoint: Breakpoint): boolean => {
  if (typeof window === 'undefined') return false;
  const width = window.innerWidth;
  const value = breakpointValues[breakpoint];
  return width >= value;
};

// Get current breakpoint based on window width
export const getCurrentBreakpoint = (): Breakpoint => {
  if (typeof window === 'undefined') return 'lg';

  const width = window.innerWidth;
  const breakpoints = Object.entries(breakpointValues).sort(
    ([, a], [, b]) => b - a,
  ) as [Breakpoint, number][];

  for (const [name, value] of breakpoints) {
    if (width >= value) {
      return name;
    }
  }

  return 'xs';
};

// React hook for responsive breakpoints (to be used with useState/useEffect)
export const useBreakpoint = () => {
  if (typeof window === 'undefined') {
    return {
      current: 'lg' as Breakpoint,
      is: () => false,
      up: () => false,
      down: () => false,
    };
  }

  const current = getCurrentBreakpoint();

  return {
    current,
    is: (breakpoint: Breakpoint) => current === breakpoint,
    up: (breakpoint: Breakpoint) =>
      breakpointValues[current] >= breakpointValues[breakpoint],
    down: (breakpoint: Breakpoint) =>
      breakpointValues[current] < breakpointValues[breakpoint],
  };
};

// CSS custom properties for breakpoints (can be used in CSS)
export const breakpointCSSVars = Object.entries(breakpointValues).reduce(
  (acc, [key, value]) => ({
    ...acc,
    [`--breakpoint-${key}`]: `${value}px`,
  }),
  {} as Record<string, string>,
);

// Container queries support (experimental)
export const containerQueries = {
  up: (size: number): string => `@container (min-width: ${size}px)`,
  down: (size: number): string => `@container (max-width: ${size}px)`,
} as const;
