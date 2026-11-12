export function formatAddress(record) {
  return [
    record?.address_line1,
    record?.address_line2,
    record?.city,
    record?.county,
    record?.region,
    record?.postal_code,
    record?.country,
  ]
    .filter((part) => part && String(part).trim())
    .map((part) => String(part).trim())
    .join(", ");
}

export function getDirectionsDestination(record) {
  if (!record?.address_line1?.trim()) return "";

  return formatAddress({
    ...record,
    county: record.city?.trim() || record.postal_code?.trim() ? null : record.county,
  });
}
