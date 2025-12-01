// import React, { useEffect, useRef, useState } from "react";
// import Editor from "@monaco-editor/react";
// import { requestAutocomplete } from "./autocomplete";

// /*
// Props:
//   wsClient - WebSocket object returned from connectWebSocket()
// Behavior:
//   - Sends { type: "code_update", payload: { code } } on every editor change
//   - Receives initial_state and code_update and updates editor value
//   - Debounces calls to /autocomplete and shows a suggestion
// */

// export default function CodeEditor({ wsClient }) {
//   const [code, setCode] = useState("");
//   const [suggestion, setSuggestion] = useState(null);
//   const editorRef = useRef(null);
//   const lastOutgoingRef = useRef(""); // avoid applying change we just sent? not needed because backend excludes sender

//   // wire incoming WS messages into the editor
//   useEffect(() => {
//     if (!wsClient) return;

//     wsClient.onmessage = (event) => {
//       // we already parse in connectWebSocket, but some wrappers call onmessage directly
//       let msg;
//       try {
//         msg = typeof event === "string" ? JSON.parse(event) : event;
//       } catch (e) {
//         try {
//           msg = JSON.parse(event.data);
//         } catch (e2) {
//           return;
//         }
//       }

//       if (msg.type === "initial_state") {
//         setCode(msg.payload?.code || "");
//       } else if (msg.type === "code_update") {
//         // avoid applying if equal
//         const newCode = msg.payload?.code ?? "";
//         if (newCode !== code) setCode(newCode);
//       } else if (msg.type === "autocomplete_response") {
//         setSuggestion(msg.payload?.suggestion ?? null);
//       }
//     };

//     // If connectWebSocket used handlers, also set fallback
//     // (connectWebSocket calls handlers so these may be redundant)

//     return () => {
//       // cleanup if needed
//     };
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [wsClient, code]);

//   // send editor edits to server
//   const handleChange = (value) => {
//     setCode(value ?? "");
//     lastOutgoingRef.current = value ?? "";

//     if (wsClient?.readyState === 1) {
//       wsClient.sendJSON({
//         type: "code_update",
//         payload: { code: value ?? "" },
//       });
//     }
//     // debounced autocomplete
//     triggerAutocomplete(value ?? "");
//   };

//   // debounce function
//   const debounceRef = useRef();
//   const triggerAutocomplete = (currentCode) => {
//     clearTimeout(debounceRef.current);
//     debounceRef.current = setTimeout(async () => {
//       try {
//         // send REST autocomplete - this is optional & mocked on backend
//         const res = await requestAutocomplete({
//           code: currentCode,
//           cursorPosition: currentCode.length,
//           language: "python",
//         });
//         if (res && res.suggestion) {
//           setSuggestion(res.suggestion);
//         } else {
//           setSuggestion(null);
//         }
//       } catch (e) {
//         setSuggestion(null);
//       }
//     }, 600);
//   };

//   return (
//     <div className="editor-container">
//       <Editor
//         height="74vh"
//         theme="vs-dark"
//         defaultLanguage="python"
//         value={code}
//         onChange={handleChange}
//         onMount={(editor) => {
//           editorRef.current = editor;
//         }}
//       />

//       <div className="suggestion-box">
//         {suggestion ? (
//           <>
//             <div className="s-label">Autocomplete suggestion</div>
//             <pre className="s-code">{suggestion}</pre>
//           </>
//         ) : (
//           <div className="s-muted">Suggestion will appear here after you stop typing (~600ms)</div>
//         )}
//       </div>
//     </div>
//   );
// }
// src/CodeEditor.jsx
import React, { useEffect, useRef, useState } from "react";
import Editor from "@monaco-editor/react";
import { requestAutocomplete } from "./autocomplete";

/*
Props:
  wsClient - WebSocket object returned from connectWebSocket()
Behavior:
  - Sends { type: "code_update", payload: { code } } on every editor change (debounced could be added)
  - Receives initial_state and code_update and updates editor value
  - Debounces calls to /autocomplete and shows a suggestion
*/

export default function CodeEditor({ wsClient }) {
  const [code, setCode] = useState("");
  const [suggestion, setSuggestion] = useState(null);
  const editorRef = useRef(null);
  const lastAppliedRef = useRef("");

  useEffect(() => {
    if (!wsClient) return;

    const handleMessage = (event) => {
      let msg;
      try {
        msg = typeof event === "string" ? JSON.parse(event) : JSON.parse(event.data);
      } catch (e) {
        return;
      }

      if (msg.type === "initial_state") {
        const initialCode = msg.payload?.code ?? "";
        lastAppliedRef.current = initialCode;
        setCode(initialCode);
      } else if (msg.type === "code_update") {
        const newCode = msg.payload?.code ?? "";
        // Avoid overwriting local typing when equal
        if (newCode !== lastAppliedRef.current) {
          lastAppliedRef.current = newCode;
          setCode(newCode);
        }
      } else if (msg.type === "autocomplete_response") {
        setSuggestion(msg.payload?.suggestion ?? null);
      }
    };

    // If connectWebSocket already attached handlers, we keep this as a fallback
    wsClient.addEventListener("message", handleMessage);
    return () => wsClient.removeEventListener("message", handleMessage);
  }, [wsClient]);

  // send editor edits to server
  const handleChange = (value) => {
    const safe = value ?? "";
    setCode(safe);
    lastAppliedRef.current = safe;

    if (wsClient?.readyState === 1) {
      wsClient.sendJSON({
        type: "code_update",
        payload: { code: safe },
      });
    }

    triggerAutocomplete(safe);
  };

  // debounce autocomplete
  const debounceRef = useRef();
  const triggerAutocomplete = (currentCode) => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await requestAutocomplete({
          code: currentCode,
          cursorPosition: currentCode.length,
          language: "python",
        });
        if (res && res.suggestion) setSuggestion(res.suggestion);
        else setSuggestion(null);
      } catch (e) {
        setSuggestion(null);
      }
    }, 600);
  };

  return (
    <div className="editor-container">
      <Editor
        height="74vh"
        theme="vs-dark"
        defaultLanguage="python"
        value={code}
        onChange={handleChange}
        onMount={(editor) => (editorRef.current = editor)}
      />

      <div className="suggestion-box">
        {suggestion ? (
          <>
            <div className="s-label">Autocomplete suggestion</div>
            <pre className="s-code">{suggestion}</pre>
          </>
        ) : (
          <div className="s-muted">Suggestion will appear here after you stop typing (~600ms)</div>
        )}
      </div>
    </div>
  );
}
