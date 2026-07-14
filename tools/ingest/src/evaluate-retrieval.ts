import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createRetrieverFromIndex, type RagIndex, type RetrievalHit } from "@xuan/rag";

export interface RetrievalEvalCase {
  id: string;
  query: string;
  expectedAnyOf: string[];
  tags?: string[];
  topK?: number;
}

export interface RetrievalEvalSuite {
  version: 1;
  name: string;
  description: string;
  cases: RetrievalEvalCase[];
}

export interface RetrievalEvalCaseResult {
  id: string;
  firstRelevantRank: number | null;
  relevantHitCount: number;
  retrievedHitCount: number;
}

export interface RetrievalEvalResult {
  suite: string;
  caseCount: number;
  hitAt1: number;
  hitAt3: number;
  hitAt5: number;
  meanReciprocalRank: number;
  cases: RetrievalEvalCaseResult[];
}

function includesExpectedTerm(hit: RetrievalHit, expectedAnyOf: string[]): boolean {
  const searchable = `${hit.chunk.text}\n${hit.chunk.tags.join(" ")}`.toLowerCase();
  return expectedAnyOf.some((term) => searchable.includes(term.toLowerCase()));
}

function rate(numerator: number, denominator: number): number {
  return denominator === 0 ? 0 : numerator / denominator;
}

function round(value: number): number {
  return Number(value.toFixed(4));
}

export function validateEvalSuite(value: unknown): RetrievalEvalSuite {
  const suite = value as Partial<RetrievalEvalSuite>;
  if (
    suite.version !== 1 ||
    !suite.name ||
    !suite.description ||
    !Array.isArray(suite.cases) ||
    suite.cases.length === 0 ||
    suite.cases.some(
      (entry) =>
        !entry?.id ||
        !entry.query ||
        !Array.isArray(entry.expectedAnyOf) ||
        entry.expectedAnyOf.length === 0
    )
  ) {
    throw new Error("Invalid retrieval evaluation suite.");
  }

  const ids = new Set(suite.cases.map((entry) => entry.id));
  if (ids.size !== suite.cases.length) {
    throw new Error("Retrieval evaluation case ids must be unique.");
  }

  return suite as RetrievalEvalSuite;
}

export async function evaluateRetrieval(
  index: RagIndex,
  suite: RetrievalEvalSuite
): Promise<RetrievalEvalResult> {
  const retriever = createRetrieverFromIndex(index);
  const cases: RetrievalEvalCaseResult[] = [];

  for (const entry of suite.cases) {
    const hits = await retriever.search({
      text: entry.query,
      tags: entry.tags,
      topK: entry.topK ?? 5
    });
    const relevantRanks = hits
      .map((hit, index) => (includesExpectedTerm(hit, entry.expectedAnyOf) ? index + 1 : null))
      .filter((rank): rank is number => rank !== null);

    cases.push({
      id: entry.id,
      firstRelevantRank: relevantRanks[0] ?? null,
      relevantHitCount: relevantRanks.length,
      retrievedHitCount: hits.length
    });
  }

  const reciprocalRankTotal = cases.reduce(
    (sum, entry) => sum + (entry.firstRelevantRank ? 1 / entry.firstRelevantRank : 0),
    0
  );

  return {
    suite: suite.name,
    caseCount: cases.length,
    hitAt1: round(rate(cases.filter((entry) => entry.firstRelevantRank === 1).length, cases.length)),
    hitAt3: round(
      rate(
        cases.filter(
          (entry) => entry.firstRelevantRank !== null && entry.firstRelevantRank <= 3
        ).length,
        cases.length
      )
    ),
    hitAt5: round(
      rate(
        cases.filter(
          (entry) => entry.firstRelevantRank !== null && entry.firstRelevantRank <= 5
        ).length,
        cases.length
      )
    ),
    meanReciprocalRank: round(rate(reciprocalRankTotal, cases.length)),
    cases
  };
}

export function formatEvalResult(result: RetrievalEvalResult): string {
  const summary = [
    `Suite: ${result.suite}`,
    `Cases: ${result.caseCount}`,
    `Hit@1: ${result.hitAt1.toFixed(4)}`,
    `Hit@3: ${result.hitAt3.toFixed(4)}`,
    `Hit@5: ${result.hitAt5.toFixed(4)}`,
    `MRR: ${result.meanReciprocalRank.toFixed(4)}`
  ];
  const caseLines = result.cases.map(
    (entry) =>
      `${entry.id}\trank=${entry.firstRelevantRank ?? "miss"}\trelevant=${entry.relevantHitCount}/${entry.retrievedHitCount}`
  );

  return [...summary, "", ...caseLines].join("\n");
}

async function runCli(argv: string[]): Promise<void> {
  const indexPath = resolve(argv[2] ?? "data/private/rag-index.json");
  const suitePath = resolve(argv[3] ?? "evals/rag/ziwei-retrieval.json");
  const index = JSON.parse(readFileSync(indexPath, "utf8")) as RagIndex;
  const suite = validateEvalSuite(JSON.parse(readFileSync(suitePath, "utf8")));
  const result = await evaluateRetrieval(index, suite);

  console.log(formatEvalResult(result));
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  await runCli(process.argv);
}
