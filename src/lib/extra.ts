export function generateRandomPoint(latitude, longitude, radius) {
    const x0 = longitude;
    const y0 = latitude;
    const rd = radius / 111300;

    const u = Math.random();
    const v = Math.random();

    const w = rd * Math.sqrt(u);
    const t = 2 * Math.PI * v;
    const x = w * Math.cos(t);
    const y = w * Math.sin(t);

    const xp = x / Math.cos(y0);

    const newLongitude = xp + x0;
    const newLatitude = y + y0;

    return { lat: newLatitude, lng: newLongitude };
}