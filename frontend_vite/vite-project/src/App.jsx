// import React, { useEffect, useState } from "react";
// import CodeEditor from "./CodeEditor";
// import { connectWebSocket } from "./websocket";

// export default function App() {
//   // put your room id here (same as backend)
//   const ROOM_ID = "4249d016-e05a-460e-87ff-3a23d5578145";

//   const [wsClient, setWsClient] = useState(null);
//   const [connected, setConnected] = useState(false);

//   useEffect(() => {
//     // connect and provide handlers for incoming messages
//     const ws = connectWebSocket(ROOM_ID, {
//       onInitialState: (code) => {
//         // we don't manage it here; CodeEditor reads ws messages itself
//         console.log("initial state:", code);
//       },
//       onCodeUpdate: (code) => {
//         console.log("remote code update received");
//       },
//       onOpen: () => setConnected(true),
//       onClose: () => setConnected(false),
//     });

//     setWsClient(ws);

//     return () => {
//       try {
//         ws && ws.close();
//       } catch (e) {}
//     };
//   }, []);

//   return (
//     <div className="app">
//       <header className="header">
//         <h1>Real-Time Code Collaboration</h1>
//         <div className="status">
//           Room: <strong>{ROOM_ID}</strong> —{" "}
//           <span className={connected ? "ok" : "bad"}>
//             {connected ? "connected" : "connecting..."}
//           </span>
//         </div>
//       </header>

//       <main>
//         {wsClient ? (
//           <CodeEditor wsClient={wsClient} />
//         ) : (
//           <div>Connecting WebSocket…</div>
//         )}
//       </main>

//       <footer className="footer">
//         <small>Type in one window — updates appear in other windows in real time.</small>
//       </footer>
//     </div>
//   );
// }
// src/App.jsx
// import React, { useEffect, useState } from "react";
// import Room from "./pages/room"; // Correct import path
// import { connectWebSocket } from "./websocket";

// export default function App() {
//   const ROOM_ID = "78dc9922-544e-4a4d-a354-677b6fbf35f1";

//   const [wsClient, setWsClient] = useState(null);
//   const [connected, setConnected] = useState(false);

//   useEffect(() => {
//     const ws = connectWebSocket(ROOM_ID, {
//       onInitialState: (code) => {
//         console.log("initial state:", code);
//       },
//       onCodeUpdate: (code) => {
//         console.log("remote code update received");
//       },
//       onOpen: () => setConnected(true),
//       onClose: () => setConnected(false),
//     });

//     setWsClient(ws);

//     return () => {
//       try {
//         ws && ws.close();
//       } catch (e) {}
//     };
//   }, []);

//   return (
//     <div className="app">
//       <header className="header">
//         <h1>Real-Time Code Collaboration</h1>
//         <div className="status">
//           Room: <strong>{ROOM_ID}</strong> —{" "}
//           <span className={connected ? "ok" : "bad"}>
//             {connected ? "connected" : "connecting..."}
//           </span>
//         </div>
//       </header>

//       <main>
//         {wsClient ? (
//           <Room wsClient={wsClient} /> // Pass wsClient to Room component
//         ) : (
//           <div>Connecting WebSocket…</div>
//         )}
//       </main>

//       <footer className="footer">
//         <small>Type in one window — updates appear in other windows in real time.</small>
//       </footer>
//     </div>
//   );
// }
// src/App.jsx
import React, { useEffect, useState } from "react";
import Room from "./pages/room";
import { connectWebSocket } from "./websocket";

export default function App() {
  // Replace ROOM_ID with dynamic id when integrating routing or room creation
  const ROOM_ID = "78dc9922-544e-4a4d-a354-677b6fbf35f1";

  const [wsClient, setWsClient] = useState(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    // create single shared websocket connection
    const ws = connectWebSocket(ROOM_ID, {
      onInitialState: (code) => {
        console.log("initial state:", code);
      },
      onCodeUpdate: (code) => {
        // optional: handle global update notifications
        console.log("remote code update received");
      },
      onOpen: () => setConnected(true),
      onClose: () => setConnected(false),
      onError: (err) => {
        console.error("WebSocket handler received error", err);
      },
    });

    setWsClient(ws);

    // cleanup on unmount
    return () => {
      try {
        ws && ws.close();
      } catch (e) {
        /* ignore */
      }
    };
  }, []); // run once

  return (
    <div className="app">
      <header className="header">
        <h1>Real-Time Code Collaboration</h1>
        <div className="status">
          Room: <strong>{ROOM_ID}</strong> —{" "}
          <span className={connected ? "ok" : "bad"}>
            {connected ? "connected" : "connecting..."}
          </span>
        </div>
      </header>

      <main>
        {wsClient ? <Room wsClient={wsClient} /> : <div>Connecting WebSocket…</div>}
      </main>

      <footer className="footer">
        <small>Type in one window — updates appear in other windows in real time.</small>
      </footer>
    </div>
  );
}
