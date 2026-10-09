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
