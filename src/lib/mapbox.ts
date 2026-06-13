export interface ParsedAddress {
  placeName: string;
  roadName: string;
  pincode: string;
  latitude: number;
  longitude: number;
}

interface MapboxFeature {
  id: string;
  place_name: string;
  center: [number, number];
  context?: Array<{ id: string; text: string }>;
  text?: string;
}

function getMapboxToken(): string {
  return import.meta.env.VITE_MAPBOX_TOKEN || "";
}

function extractPincode(feature: MapboxFeature): string {
  const postcode = feature.context?.find((item) => item.id.startsWith("postcode"));
  return postcode?.text ?? "";
}

function extractRoad(feature: MapboxFeature): string {
  const street = feature.context?.find(
    (item) => item.id.startsWith("address") || item.id.startsWith("street")
  );
  return street?.text ?? feature.text ?? "";
}

export function parseMapboxFeature(feature: MapboxFeature): ParsedAddress {
  const [longitude, latitude] = feature.center;
  return {
    placeName: feature.place_name,
    roadName: extractRoad(feature),
    pincode: extractPincode(feature),
    latitude,
    longitude,
  };
}

export async function searchAddresses(query: string): Promise<MapboxFeature[]> {
  const token = getMapboxToken();
  if (!token || !query.trim()) return [];

  const response = await fetch(
    `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${token}&country=IN&limit=5`
  );
  const data = await response.json();
  return Array.isArray(data?.features) ? data.features : [];
}

export async function reverseGeocode(latitude: number, longitude: number): Promise<ParsedAddress | null> {
  const token = getMapboxToken();
  if (!token) return null;

  const response = await fetch(
    `https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?access_token=${token}`
  );
  const data = await response.json();
  const feature = data?.features?.[0] as MapboxFeature | undefined;
  if (!feature) return null;
  return parseMapboxFeature(feature);
}

export async function getRoadDistanceKm(
  fromLng: number,
  fromLat: number,
  toLng: number,
  toLat: number
): Promise<number | null> {
  const token = getMapboxToken();
  if (!token) return null;

  const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${fromLng},${fromLat};${toLng},${toLat}?overview=false&access_token=${token}`;
  const response = await fetch(url);
  const data = await response.json();

  const meters = data?.routes?.[0]?.distance;
  if (typeof meters !== "number") return null;
  return meters / 1000;
}

export function buildStaticMapUrl(
  latitude: number,
  longitude: number,
  width = 600,
  height = 320
): string {
  const token = getMapboxToken();
  if (!token) return "";
  return `https://api.mapbox.com/styles/v1/mapbox/streets-v12/static/pin-l+1b4332(${longitude},${latitude})/${longitude},${latitude},14,0/${width}x${height}@2x?access_token=${token}`;
}
