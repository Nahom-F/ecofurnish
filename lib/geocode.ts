/**
 * Free, keyless geocoding via OpenStreetMap's Nominatim — gives the
 * dispatcher a starting pin when assigning a delivery, which they then
 * drag to correct. Ethiopian shipping addresses are often informal
 * enough that auto-geocoding alone isn't reliable, so this is
 * deliberately a starting point rather than the final delivery
 * coordinate (see deliveryAssignments.deliveryLat/Lng in db/schema.ts).
 * Nominatim's usage policy requires a descriptive User-Agent and caps
 * requests around 1/second — both trivially satisfied at this store's
 * scale (one lookup per delivery assignment, done by a dispatcher).
 */
export async function geocodeAddress(
  address: string,
  city: string
): Promise<{ lat: number; lng: number } | null> {
  const query = `${address}, ${city}, Ethiopia`;

  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(query)}`,
      { headers: { "User-Agent": "EcoFurnish/1.0 (admin@ecofurnish.abrdns.com)" } }
    );
    if (!res.ok) return null;

    const results = await res.json();
    if (!Array.isArray(results) || results.length === 0) return null;

    const { lat, lon } = results[0];
    const parsedLat = parseFloat(lat);
    const parsedLng = parseFloat(lon);
    if (!Number.isFinite(parsedLat) || !Number.isFinite(parsedLng)) return null;

    return { lat: parsedLat, lng: parsedLng };
  } catch (err) {
    console.error("Geocoding failed:", err);
    return null;
  }
}
