import { useEffect, useMemo, useState } from "react";
import {
  getDefaultSession,
  handleIncomingRedirect,
  login,
  logout,
} from "@inrupt/solid-client-authn-browser";
import { getFile, overwriteFile } from "@inrupt/solid-client";

function toTextSafe(value: unknown): string {
  if (typeof value === "string") return value;
  if (value instanceof Error) return value.message;
  return String(value);
}

export default function App() {
  const session = useMemo(() => getDefaultSession(), []);
  const [ready, setReady] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [webId, setWebId] = useState<string>("");

  const [issuer, setIssuer] = useState("https://login.inrupt.com"); // change if you use another IdP
  const [status, setStatus] = useState<string>("");

  const [readUrl, setReadUrl] = useState("");
  const [readResult, setReadResult] = useState("");

  const [writeUrl, setWriteUrl] = useState("");
  const [writeBody, setWriteBody] = useState("Hello from a minimal SOLID PoC.\n");

  useEffect(() => {
    // Handle the redirect back from the Solid IdP, if this load is a callback.
    (async () => {
      try {
        await handleIncomingRedirect({ restorePreviousSession: true }); // standard browser flow :contentReference[oaicite:1]{index=1}
        setIsLoggedIn(session.info.isLoggedIn);
        setWebId(session.info.webId ?? "");
      } catch (e) {
        setStatus(`Redirect handling error: ${toTextSafe(e)}`);
      } finally {
        setReady(true);
      }
    })();
  }, [session]);

  async function doLogin() {
    setStatus("");
    try {
      // NOTE: redirectUrl MUST match the current origin during local dev.
      // For Vite dev server it's typically http://localhost:5173/
      await login({
        oidcIssuer: issuer.trim(),
        redirectUrl: window.location.href,
        clientName: "SOLID PoC (Vite + React)",
      });
    } catch (e) {
      setStatus(`Login error: ${toTextSafe(e)}`);
    }
  }

  async function doLogout() {
    setStatus("");
    try {
      await logout();
      setIsLoggedIn(false);
      setWebId("");
    } catch (e) {
      setStatus(`Logout error: ${toTextSafe(e)}`);
    }
  }

  async function readFile() {
    setStatus("");
    setReadResult("");
    try {
      if (!readUrl.trim()) throw new Error("Enter a Pod file URL to read.");
      const file = await getFile(readUrl.trim(), { fetch: session.fetch }); // file CRUD :contentReference[oaicite:2]{index=2}
      const text = await file.text();
      setReadResult(text);
    } catch (e) {
      setStatus(`Read error: ${toTextSafe(e)}`);
    }
  }

  async function writeFile() {
    setStatus("");
    try {
      if (!writeUrl.trim()) throw new Error("Enter a Pod file URL to write.");
      const blob = new Blob([writeBody], { type: "text/plain;charset=utf-8" });
      await overwriteFile(writeUrl.trim(), blob, { fetch: session.fetch }); // overwriteFile :contentReference[oaicite:3]{index=3}
      setStatus("Wrote file successfully.");
    } catch (e) {
      setStatus(`Write error: ${toTextSafe(e)}`);
    }
  }

  return (
    <div style={{ maxWidth: 900, margin: "2rem auto", padding: "0 1rem", fontFamily: "system-ui, sans-serif" }}>
      <h1>SOLID Pod PoC (React)</h1>

      {!ready ? (
        <p>Loading…</p>
      ) : (
        <>
          <section style={{ padding: "1rem", border: "1px solid #ddd", borderRadius: 8, marginBottom: "1rem" }}>
            <h2>Auth</h2>

            <label style={{ display: "block", marginBottom: 8 }}>
              OIDC Issuer (Identity Provider)
              <input
                style={{ width: "100%", padding: 8, marginTop: 4 }}
                value={issuer}
                onChange={(e) => setIssuer(e.target.value)}
                placeholder="https://login.inrupt.com"
                disabled={isLoggedIn}
              />
            </label>

            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              {!isLoggedIn ? (
                <button onClick={doLogin}>Login</button>
              ) : (
                <button onClick={doLogout}>Logout</button>
              )}
              <span>
                {isLoggedIn ? (
                  <>
                    Logged in as: <code>{webId}</code>
                  </>
                ) : (
                  "Not logged in"
                )}
              </span>
            </div>
          </section>

          <section style={{ padding: "1rem", border: "1px solid #ddd", borderRadius: 8, marginBottom: "1rem" }}>
            <h2>Read a Pod file</h2>
            <label style={{ display: "block", marginBottom: 8 }}>
              File URL to read
              <input
                style={{ width: "100%", padding: 8, marginTop: 4 }}
                value={readUrl}
                onChange={(e) => setReadUrl(e.target.value)}
                placeholder="https://YOUR-POD/.../example.txt"
              />
            </label>
            <button onClick={readFile} disabled={!isLoggedIn}>
              Read
            </button>

            {readResult ? (
              <>
                <h3>Result</h3>
                <pre style={{ whiteSpace: "pre-wrap", background: "#f7f7f7", padding: 12, borderRadius: 8 }}>
                  {readResult}
                </pre>
              </>
            ) : null}
          </section>

          <section style={{ padding: "1rem", border: "1px solid #ddd", borderRadius: 8 }}>
            <h2>Write a Pod file</h2>
            <label style={{ display: "block", marginBottom: 8 }}>
              File URL to write (will overwrite)
              <input
                style={{ width: "100%", padding: 8, marginTop: 4 }}
                value={writeUrl}
                onChange={(e) => setWriteUrl(e.target.value)}
                placeholder="https://YOUR-POD/.../hello.txt"
              />
            </label>

            <label style={{ display: "block", marginBottom: 8 }}>
              Contents
              <textarea
                style={{ width: "100%", padding: 8, marginTop: 4, minHeight: 120 }}
                value={writeBody}
                onChange={(e) => setWriteBody(e.target.value)}
              />
            </label>

            <button onClick={writeFile} disabled={!isLoggedIn}>
              Write
            </button>
          </section>

          {status ? (
            <p style={{ marginTop: "1rem" }}>
              <strong>Status:</strong> {status}
            </p>
          ) : null}

          <hr style={{ margin: "2rem 0" }} />
          <p style={{ fontSize: 14, color: "#555" }}>
            Notes: Writing/reading succeeds only if your Pod grants you access to those URLs. For early tests, try writing to a location you own
            (often under your pod’s public/ or private/ area depending on provider).
          </p>
        </>
      )}
    </div>
  );
}
