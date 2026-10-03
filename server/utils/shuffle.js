/**
 * Fisher-Yates shuffle — returns a new shuffled array without
 * mutating the original. Used for randomizing question order,
 * option order, and category-based random question selection.
 */
export const shuffleArray = (array) => {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
};

/**
 * Builds a randomized option order (e.g. ["C","A","D","B"]) so each
 * student sees the same 4 options in a different sequence, while the
 * server always knows which shuffled slot maps back to which
 * original A/B/C/D answer key.
 */
export const shuffleOptionOrder = () => shuffleArray(["A", "B", "C", "D"]);

