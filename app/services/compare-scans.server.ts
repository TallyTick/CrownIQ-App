type Key = { type: string; variantId: string | null };
const keyOf = (f: Key) => `${f.type}:${f.variantId ?? ""}`;

export function compareScans(previous: Key[], current: Key[]) {
  const prev = new Set(previous.map(keyOf));
  const curr = new Set(current.map(keyOf));
  const added = current.filter((f) => !prev.has(keyOf(f)));
  const resolved = previous.filter((f) => !curr.has(keyOf(f)));
  return { added, resolved };
}
