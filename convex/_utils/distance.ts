// haversine distance ka use shortest distance find karne ke liye kiya jata hai
// two points ke bich mai
// a = sin (sq) ((change in latitude)/2 )+ cos (lat1) * cos (lat2) * sin (sq) ((change in longitude)/2)
// c = 2 x arctan2(sqrt(a), sqrt(1-a))
// final distance = Radius * C --> radius mtlb kitne daire mai aakar aap dekhna chahte ho

export function haversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3;
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}
