import { Studio } from "./studio";

import { getSanityEnv } from "@/sanity/env";

/** Panel de carga de propiedades (Sanity Studio). El acceso lo controla Sanity. */
export default function AdminPage() {
  const result = getSanityEnv();
  if (!result.ok) {
    return (
      <main style={{ fontFamily: "system-ui, sans-serif", padding: "3rem", maxWidth: "40rem" }}>
        <h1>Panel sin configurar</h1>
        <p>{result.error}</p>
      </main>
    );
  }
  return <Studio env={result.env} />;
}
