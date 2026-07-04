// Wspólne funkcje matematyczne używane w całej grze.
export function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

export function distance(x1, y1, x2, y2) {
  return Math.hypot(x2 - x1, y2 - y1);
}

// Normalizuje różnicę klatek do bazy ~60 fps, żeby prędkości były spójne
// niezależnie od faktycznego frame rate przeglądarki.
export function frameFactor(dtMs) {
  return dtMs / 16.6667;
}
