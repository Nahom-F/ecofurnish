/**
 * Great-circle distance between two lat/lng points, in meters. Used to
 * check a driver's reported GPS location against their assigned
 * delivery's target coordinates on "near destination" and "delivered"
 * claims — see deliveryClaims.distanceMeters in db/schema.ts. Doesn't
 * need a paid Maps API: this is pure math, no network call.
 */
export function haversineDistanceMeters(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const EARTH_RADIUS_M = 6371000;
  const toRad = (deg: number) => (deg * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return EARTH_RADIUS_M * c;
}
