"use client";

import { NextStudio } from "next-sanity/studio";
import { useMemo } from "react";

import { createStudioConfig } from "@/sanity/config";
import type { SanityPublicEnv } from "@/sanity/env";

export function Studio({ env }: { env: SanityPublicEnv }) {
  // Depende de los valores, no de la referencia del objeto recibido del servidor.
  const { projectId, dataset } = env;
  const config = useMemo(() => createStudioConfig({ projectId, dataset }), [projectId, dataset]);
  return <NextStudio config={config} />;
}
