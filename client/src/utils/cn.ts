/**
 * Tiny classnames joiner — avoids pulling in a dependency for
 * conditionally combining Tailwind class strings.
 */
export const cn = (...classes: Array<string | false | null | undefined>): string =>
  classes.filter(Boolean).join(" ");

