// export async function requestAutocomplete(body) {
//     try {
//       const res = await fetch("http://127.0.0.1:8000/autocomplete", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(body),
//       });
//       if (!res.ok) throw new Error("autocomplete failed");
//       return await res.json();
//     } catch (e) {
//       console.error("autocomplete error", e);
//       return null;
//     }
//   }
// src/autocomplete.js
// Simple wrapper to call backend autocomplete endpoint.
// Uses relative host in production; falls back to 127.0.0.1:8000 in dev (same logic as websocket).

const BASE_URL = (() => {
  if (typeof window === "undefined") return "http://127.0.0.1:8000";
  if (window.location.hostname === "localhost") return "http://127.0.0.1:8000";
  // production: same host origin
  return `${window.location.protocol}//${window.location.host}`;
})();

export async function requestAutocomplete(body) {
  try {
    const res = await fetch(`${BASE_URL}/autocomplete`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const txt = await res.text();
      throw new Error(`autocomplete failed: ${res.status} ${txt}`);
    }
    return await res.json();
  } catch (e) {
    console.error("autocomplete error", e);
    return null;
  }
}
