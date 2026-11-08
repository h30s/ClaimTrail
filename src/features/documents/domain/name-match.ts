// Is the name on a document this claim's patient? Handles titles, middle names, initials and
// surname-first order ("PAWAR RAJENDRA S."). If it can't tell, it says UNCHECKED, never MATCH.
const TITLES = new Set([
  "mr",
  "mrs",
  "ms",
  "miss",
  "smt",
  "shri",
  "shree",
  "sri",
  "kum",
  "dr",
  "master",
  "baby",
  "late",
]);

export function nameTokens(name: string): string[] {
  return name
    .toLowerCase()
    .replace(/[^a-z\s.]/g, " ")
    .replace(/\./g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 0 && !TITLES.has(t));
}

const tokenMatches = (a: string, b: string) =>
  a === b || (a.length === 1 && b.startsWith(a)) || (b.length === 1 && a.startsWith(b));

export function compareNames(expected: string, found: string | null): "MATCH" | "MISMATCH" | "UNCHECKED" {
  if (!found) return "UNCHECKED";
  const a = nameTokens(expected);
  const b = nameTokens(found);
  if (a.length === 0 || b.length === 0) return "UNCHECKED"; // e.g. name written in Devanagari
  const [shorter, longer] = a.length <= b.length ? [a, b] : [b, a];
  const covered = shorter.every((t) => longer.some((l) => tokenMatches(t, l)));
  const hasFullWord = shorter.some((t) => t.length > 1 && longer.includes(t));
  return covered && hasFullWord ? "MATCH" : "MISMATCH";
}
