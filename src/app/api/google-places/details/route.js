import { NextResponse } from 'next/server';

const GOOGLE_PLACES_TEXT_SEARCH_URL = 'https://places.googleapis.com/v1/places:searchText';

export async function POST(request) {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ error: 'Google Maps API key is not configured.' }, { status: 500 });
  }

  try {
    const body = await request.json();
    const title = cleanText(body.title);
    const mapsUrl = cleanText(body.url);
    const textQuery = title || placeNameFromGoogleMapsUrl(mapsUrl);

    if (!textQuery) {
      return NextResponse.json({ error: 'A place title or Google Maps URL is required.' }, { status: 400 });
    }

    const response = await fetch(GOOGLE_PLACES_TEXT_SEARCH_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': apiKey,
        'X-Goog-FieldMask': [
          'places.id',
          'places.displayName',
          'places.formattedAddress',
          'places.addressComponents',
          'places.location',
          'places.nationalPhoneNumber',
          'places.internationalPhoneNumber',
          'places.websiteUri',
          'places.googleMapsUri',
        ].join(','),
      },
      body: JSON.stringify({
        textQuery,
        pageSize: 1,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json({ error: data.error?.message || 'Google Places lookup failed.' }, { status: response.status });
    }

    const place = data.places?.[0];
    if (!place) {
      return NextResponse.json({ error: 'No matching Google place found.' }, { status: 404 });
    }

    return NextResponse.json({ place: normalizePlace(place) });
  } catch (error) {
    return NextResponse.json({ error: error.message || 'Google Places lookup failed.' }, { status: 500 });
  }
}

function normalizePlace(place) {
  const address = addressFromComponents(place.addressComponents || []);

  return {
    placeId: place.id || null,
    name: place.displayName?.text || '',
    formattedAddress: place.formattedAddress || '',
    googleMapsUri: place.googleMapsUri || '',
    websiteUri: place.websiteUri || '',
    phone: place.nationalPhoneNumber || place.internationalPhoneNumber || '',
    latitude: place.location?.latitude ?? null,
    longitude: place.location?.longitude ?? null,
    ...address,
  };
}

function addressFromComponents(components) {
  const byType = (type) => components.find((component) => component.types?.includes(type));
  const streetNumber = byType('street_number')?.longText || '';
  const route = byType('route')?.longText || '';
  const subpremise = byType('subpremise')?.longText || '';

  return {
    addressLine1: [streetNumber, route].filter(Boolean).join(' '),
    addressLine2: subpremise ? `Suite ${subpremise}` : '',
    city: byType('locality')?.longText || byType('postal_town')?.longText || byType('sublocality')?.longText || '',
    county: byType('administrative_area_level_2')?.longText || '',
    region: byType('administrative_area_level_1')?.shortText || byType('administrative_area_level_1')?.longText || '',
    postalCode: byType('postal_code')?.longText || '',
    country: byType('country')?.shortText || 'US',
  };
}

function placeNameFromGoogleMapsUrl(value) {
  const text = cleanText(value);
  if (!text) return '';

  const match = text.match(/\/place\/([^/?#]+)/);
  if (!match) return '';

  return safeDecodeURIComponent(match[1]).replace(/\+/g, ' ');
}

function cleanText(value) {
  return typeof value === 'string' && value.trim() ? value.trim() : null;
}

function safeDecodeURIComponent(value) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}
