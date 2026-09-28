import Fuse from "fuse.js";

export interface SubjectItem {
  code: string;
  name: string;
  type?: string;
}

/**
 * Fuzzy matches a user query (e.g. "chem", "circuits", "EDC") against subject list.
 */
export function matchSubject(
  query: string,
  subjects: SubjectItem[]
): {
  exactMatch?: SubjectItem;
  candidates: SubjectItem[];
} {
  const clean = query.trim().toLowerCase();

  // 1. Direct code or exact name match
  const exact = subjects.find(
    (s) => s.code.toLowerCase() === clean || s.name.toLowerCase() === clean
  );
  if (exact) {
    return { exactMatch: exact, candidates: [exact] };
  }

  // 2. Fuse.js Fuzzy search
  const fuse = new Fuse(subjects, {
    keys: ["code", "name"],
    threshold: 0.45,
    distance: 100,
  });

  const results = fuse.search(clean);
  const candidates = results.map((r) => r.item);

  if (candidates.length === 1) {
    return { exactMatch: candidates[0], candidates };
  }

  return {
    exactMatch: undefined,
    candidates,
  };
}
