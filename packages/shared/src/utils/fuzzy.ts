/**
 * Levenshtein distance between two strings.
 * Used to fuzzy-cluster Memoni responses where spelling varies
 * (e.g. "Paani" / "Paany" / "Paane" all represent the same word).
 */
export function levenshtein(a: string, b: string): number {
  const an = a.length;
  const bn = b.length;
  if (an === 0) return bn;
  if (bn === 0) return an;

  const dp: number[][] = Array.from({ length: an + 1 }, (_, i) =>
    Array.from({ length: bn + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
  );

  for (let i = 1; i <= an; i++) {
    for (let j = 1; j <= bn; j++) {
      dp[i]![j] =
        a[i - 1] === b[j - 1]
          ? dp[i - 1]![j - 1]!
          : 1 + Math.min(dp[i - 1]![j]!, dp[i]![j - 1]!, dp[i - 1]![j - 1]!);
    }
  }
  return dp[an]![bn]!;
}

/** Normalise a Memoni phonetic string for comparison: lowercase + trim. */
export function normalise(s: string): string {
  return s.toLowerCase().trim();
}

/**
 * Group a list of (text) strings into fuzzy clusters.
 * Two strings belong to the same cluster if their Levenshtein distance ≤ maxDist.
 * Returns clusters sorted by size descending.
 */
export function clusterTexts(texts: string[], maxDist = 3): string[][] {
  const groups: string[][] = [];

  for (const text of texts) {
    const norm = normalise(text);
    let placed = false;

    for (const group of groups) {
      const rep = normalise(group[0]!);
      if (levenshtein(norm, rep) <= maxDist) {
        group.push(text);
        placed = true;
        break;
      }
    }

    if (!placed) {
      groups.push([text]);
    }
  }

  return groups.sort((a, b) => b.length - a.length);
}
