export interface IngestPlan {
  inputDir: string;
  outputDir: string;
  sourcePolicy: "repo-safe" | "local-private-only";
}

export function createIngestPlan(plan: IngestPlan): IngestPlan {
  return plan;
}
