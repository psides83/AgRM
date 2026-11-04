export function normalizeLocation(value) {
  return String(value || "")
    .trim()
    .toLowerCase();
}

export function matchesLocation(record, filters) {
  return ["city", "county"].every((field) => {
    const selected = (filters[field] || [])
      .map(normalizeLocation)
      .filter(Boolean);
    return (
      !selected.length || selected.includes(normalizeLocation(record[field]))
    );
  });
}

export function locationOptions(records, field) {
  const options = new Map();
  records.forEach((record) => {
    const value = String(record[field] || "").trim();
    if (value && !options.has(normalizeLocation(value))) {
      options.set(normalizeLocation(value), value);
    }
  });
  return [...options.values()].sort((a, b) => a.localeCompare(b));
}
