function normalizeAppendixImages(
  input: unknown,
): Array<{ title?: string; subtitle?: string; src: string }> {
  if (!Array.isArray(input)) return [];

  const items = input
    .map((item) => {
      if (!item || typeof item !== 'object') return null;
      const row = item as Record<string, unknown>;
      const src = asNullableString(row.src ?? row.url ?? row.imageUrl);
      if (!src) return null;

      const title = asNullableString(row.title ?? row.name);
      const subtitle = asNullableString(row.subtitle ?? row.caption);

      return {
        ...(title ? { title } : {}),
        ...(subtitle ? { subtitle } : {}),
        src,
      };
    })
    .filter((item) => item !== null);

  return items;
}
