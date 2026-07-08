import type { BirthProfile, ComputedFact, ZiweiChart } from "@xuan/core";
import type { Citation, RetrievalHit, Retriever } from "@xuan/rag";

export interface ZiweiQuestion {
  question: string;
  birth: BirthProfile;
  focusTags?: string[];
}

export interface AgentContext {
  retriever: Retriever;
}

export interface ReportSection {
  title: string;
  body: string;
  facts: ComputedFact[];
  citations: Citation[];
}

export interface InterpretationReport {
  chart: ZiweiChart;
  question: string;
  sections: ReportSection[];
  evidence: RetrievalHit[];
  caveats: string[];
}
