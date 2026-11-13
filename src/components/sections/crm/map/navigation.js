const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || '';

export async function geocodeAddress(address) {
  const url = new URL(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json`);
  url.searchParams.set('access_token', mapboxToken);
  url.searchParams.set('country', 'US');
  url.searchParams.set('limit', '1');

  try {
    const response = await fetch(url.toString());
    const data = await response.json();
    return data.features?.[0]?.center || null;
  } catch {
    return null;
  }
}

export function distanceFrom(origin, [longitude, latitude]) {
  const radians = Math.PI / 180;
  const haversine = Math.sin((latitude - origin.latitude) * radians / 2) ** 2
    + Math.cos(origin.latitude * radians) * Math.cos(latitude * radians)
    * Math.sin((longitude - origin.longitude) * radians / 2) ** 2;
  return 2 * 3959 * Math.asin(Math.sqrt(Math.min(1, haversine)));
}

export function getDirectionsLinks(record) {
  const destination = formatCoordinates(record.coordinates) || record.address;
  if (!destination) return null;
  const encoded = encodeURIComponent(destination);
  return {
    google: `https://www.google.com/maps/dir/?api=1&destination=${encoded}&travelmode=driving&dir_action=navigate`,
    apple: `https://maps.apple.com/?daddr=${encoded}&dirflg=d`,
  };
}

export function formatCoordinates(coordinates) {
  if (!coordinates) return '';
  return `${coordinates[1].toFixed(6)}, ${coordinates[0].toFixed(6)}`;
}
