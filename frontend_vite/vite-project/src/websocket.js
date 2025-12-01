// // src/websocket.js
// export function connectWebSocket(roomId, handlers = {}) {
//     const url = `ws://127.0.0.1:8000/ws/${roomId}`;
//     const ws = new WebSocket(url);
  
//     ws.onopen = (e) => {
//       console.log("WebSocket connected:", url);
//       handlers.onOpen && handlers.onOpen(e);
//     };
  
//     ws.onclose = (e) => {
//       console.log("WebSocket closed");
//       handlers.onClose && handlers.onClose(e);
//     };
  
//     ws.onerror = (err) => {
//       console.error("WebSocket Error:", err);
//       handlers.onError && handlers.onError(err);
//     };
  
//     ws.onmessage = (event) => {
//       let payload;
//       try {
//         payload = JSON.parse(event.data);
//       } catch {
//         handlers.onRaw && handlers.onRaw(event.data);
//         return;
//       }
  
//       // handle message types
//       if (payload.type === "initial_state") {
//         handlers.onInitialState && handlers.onInitialState(payload.payload.code);
//       } else if (payload.type === "code_update") {
//         handlers.onCodeUpdate && handlers.onCodeUpdate(payload.payload.code);
//       } else {
//         handlers.onMessage && handlers.onMessage(payload);
//       }
//     };
  
//     // helper to send JSON messages
//     ws.sendJSON = (obj) => {
//       if (ws.readyState === 1) ws.send(JSON.stringify(obj));
//       else console.warn("WebSocket not open:", obj);
//     };
  
//     return ws;
//   }
// src/websocket.js
// Robust WebSocket connector for both dev and production.
// - Uses wss when page served over https
// - Uses same host as frontend in production (relative), falls back to 127.0.0.1:8000 for local dev
// - Returns a WebSocket object enhanced with sendJSON
// - Accepts handlers: { onInitialState, onCodeUpdate, onMessage, onOpen, onClose, onError }

export function connectWebSocket(roomId, handlers = {}) {
  const protocol = window.location.protocol === "https:" ? "wss" : "ws";

  // Prefer same host (works in prod). For local dev, use explicit fallback if host is blank or not the API host.
  // If your backend runs on a different host in prod, set WS_HOST env and replace logic accordingly.
  const host = window.location.hostname === "localhost" ? "127.0.0.1" : window.location.host;
  const portPart = window.location.hostname === "localhost" ? ":8000" : ""; // dev backend on 8000
  const url = `${protocol}://${host}${portPart}/ws/${roomId}`; // matches FastAPI route /ws/{room_id}

  console.log("Connecting to WebSocket:", url);
  const ws = new WebSocket(url);

  ws.onopen = (e) => {
    console.log("WebSocket connected:", url);
    handlers.onOpen && handlers.onOpen(e);
  };

  ws.onclose = (e) => {
    console.log("WebSocket closed:", e && e.code ? e.code : "");
    handlers.onClose && handlers.onClose(e);
  };

  ws.onerror = (err) => {
    console.error("WebSocket Error:", err);
    handlers.onError && handlers.onError(err);
  };

  ws.onmessage = (event) => {
    let payload = null;
    try {
      payload = JSON.parse(event.data);
    } catch (e) {
      handlers.onRaw && handlers.onRaw(event.data);
      return;
    }

    if (payload.type === "initial_state") {
      handlers.onInitialState && handlers.onInitialState(payload.payload?.code ?? "");
    } else if (payload.type === "code_update") {
      handlers.onCodeUpdate && handlers.onCodeUpdate(payload.payload?.code ?? "");
    } else if (payload.type === "autocomplete_response") {
      handlers.onAutocomplete && handlers.onAutocomplete(payload.payload);
    } else {
      handlers.onMessage && handlers.onMessage(payload);
    }
  };

  // convenience: safe send JSON
  ws.sendJSON = (obj) => {
    try {
      if (ws.readyState === 1) {
        ws.send(JSON.stringify(obj));
      } else {
        console.warn("Tried to send on a non-open socket", ws.readyState, obj);
      }
    } catch (e) {
      console.error("sendJSON error", e);
    }
  };

  return ws;
}
