import { useWindowDimensions } from 'react-native';

/**
 * Returns responsive grid column count and percentage-based item width.
 */
export function useResponsiveGrid(breakpoint = 600, mobileCols = 3, tabletCols = 4) {
  const { width } = useWindowDimensions();
  const numCols = width >= breakpoint ? tabletCols : mobileCols;
  const itemWidth = `${100 / numCols}%` as `${number}%`;
  return { numCols, itemWidth };
}
