// Google Maps URLs are outward links. The site never geolocates a visitor.
// A building/floor address is searchable, but never treated as a verified entrance.
const searchable = new Set(['Building Confirmed', 'Floor Confirmed', 'Entrance Confirmed', 'Pin Verified']);
const navigable = new Set(['Entrance Confirmed', 'Pin Verified']);

export function mapsSearchUrl(place) {
  if (!place || !searchable.has(place.address_precision) || !place.address?.trim()) return '';
  const query = [place.name_ar, place.address].filter(Boolean).join('، ');
  if (query.length > 700) return '';
  return 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(query);
}

export function mapsDirectionsUrl(place) {
  if (!place?.verified_entrance || !navigable.has(place.address_precision) || !place.directions_url) return '';
  try {
    const url = new URL(place.directions_url);
    if (url.protocol !== 'https:' || !['www.google.com', 'google.com', 'maps.google.com'].includes(url.hostname)) return '';
    if (!['/maps/dir', '/maps/dir/'].includes(url.pathname) || url.searchParams.get('api') !== '1' || !url.searchParams.get('destination')?.trim()) return '';
    url.searchParams.delete('origin'); // Let Google Maps use the visitor's own location, when available.
    url.searchParams.set('dir_action', 'navigate');
    return url.toString();
  } catch { return ''; }
}
