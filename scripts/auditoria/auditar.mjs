/**
 * Revisa las dependencias con `npm audit` y falla si hay vulnerabilidades altas o críticas,
 * salvo las aceptadas en excepciones.json. Cada excepción lleva un motivo y una fecha de
 * vencimiento: al vencer, vuelve a fallar para obligar a revisarla.
 *
 *   npm run auditar
 */
import { execFile } from "node:child_process";
import { readFile } from "node:fs/promises";

const blocking = new Set(["high", "critical"]);
const exceptionsUrl = new URL("./excepciones.json", import.meta.url);
const exceptions = JSON.parse(await readFile(exceptionsUrl, "utf8"));
const today = new Date().toISOString().slice(0, 10);

// npm audit termina con código 1 si encuentra algo: se lee el JSON igual.
const report = await new Promise((resolve, reject) => {
  execFile(
    "npm",
    ["audit", "--json"],
    { maxBuffer: 64 * 1024 * 1024, shell: process.platform === "win32" },
    (error, stdout) => {
      try {
        resolve(JSON.parse(stdout));
      } catch {
        reject(error ?? new Error("npm audit no devolvió JSON"));
      }
    },
  );
});

/** Avisos únicos (por id GHSA) con gravedad alta o crítica. */
const advisories = new Map();
for (const vulnerability of Object.values(report.vulnerabilities ?? {})) {
  for (const via of vulnerability.via) {
    if (typeof via !== "object" || !blocking.has(via.severity)) continue;
    const id = via.url?.split("/").pop() ?? String(via.source);
    advisories.set(id, { id, name: via.name, severity: via.severity, title: via.title });
  }
}

let failed = false;
for (const advisory of advisories.values()) {
  const exception = exceptions.find((e) => e.id === advisory.id);
  const label = `${advisory.severity} ${advisory.name} (${advisory.id}): ${advisory.title}`;
  if (!exception) {
    console.error(`✖ ${label}`);
    failed = true;
  } else if (exception.vence < today) {
    console.error(`✖ ${label}\n  La excepción venció el ${exception.vence}: revisarla.`);
    failed = true;
  } else {
    console.log(`• aceptada hasta ${exception.vence}: ${label}`);
  }
}

// Excepciones que ya no hacen falta: conviene borrarlas.
for (const exception of exceptions) {
  if (!advisories.has(exception.id)) {
    console.log(`ℹ La excepción ${exception.id} ya no aplica: se puede quitar.`);
  }
}

const counts = report.metadata?.vulnerabilities ?? {};
console.log(
  `Resumen: ${counts.critical ?? 0} críticas, ${counts.high ?? 0} altas, ${counts.moderate ?? 0} moderadas.`,
);
if (failed) {
  console.error("Hay vulnerabilidades altas o críticas sin revisar.");
  process.exit(1);
}
console.log("Sin vulnerabilidades altas o críticas pendientes de revisión.");
