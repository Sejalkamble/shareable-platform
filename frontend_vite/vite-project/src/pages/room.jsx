// // src/Room.jsx
// import React, { useState, useEffect, useRef } from "react";

// function Room({ wsClient }) {
//   const [text, setText] = useState("");
//   const isIncoming = useRef(false);

//   // Listen for incoming messages
//   useEffect(() => {
//     if (!wsClient) return;

//     const handleMessage = (event) => {
//       const data = JSON.parse(event.data);

//       // Only handle code updates
//       if (data.type === "code_update") {
//         isIncoming.current = true;
//         setText(data.payload.code);
//       }
//     };

//     wsClient.addEventListener("message", handleMessage);

//     return () => {
//       wsClient.removeEventListener("message", handleMessage);
//     };
//   }, [wsClient]);

//   const handleChange = (e) => {
//     const value = e.target.value;
//     setText(value);

//     if (isIncoming.current) {
//       isIncoming.current = false;
//       return;
//     }

//     // Send code update
//     wsClient.sendJSON({
//       type: "code_update",
//       payload: { code: value },
//     });
//   };

//   return (
//     <div>
//       <h2>Room Editor</h2>
//       <textarea
//         value={text}
//         onChange={handleChange}
//         rows={15}
//         cols={70}
//       />
//     </div>
//   );
// }

// export default Room;
// src/pages/room.jsx
import React, { useEffect, useRef, useState } from "react";
import CodeEditor from "../CodeEditor";

/*
Room component receives wsClient from App and renders the editor.
No local WebSocket creation here — App owns it.
*/

export default function Room({ wsClient }) {
  // Show editor (CodeEditor handles all ws messages too), but we also keep a small textarea fallback
  return (
    <div>
      <h2>Room Editor</h2>
      {wsClient ? (
        <CodeEditor wsClient={wsClient} />
      ) : (
        <div>Waiting for websocket...</div>
      )}
    </div>
  );
}
