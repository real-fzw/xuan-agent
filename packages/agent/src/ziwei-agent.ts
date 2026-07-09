import { createZiweiChart } from "@xuan/core";
import type { ComputedFact } from "@xuan/core";
import type { AgentContext, InterpretationReport, ZiweiQuestion } from "./types.js";

function selectFacts(facts: ComputedFact[], keys: string[]): ComputedFact[] {
  const keySet = new Set(keys);
  return facts.filter((fact) => keySet.has(fact.key));
}

export async function answerZiweiQuestion(
  input: ZiweiQuestion,
  context: AgentContext
): Promise<InterpretationReport> {
  const chart = createZiweiChart(input.birth);
  const evidence = await context.retriever.search({
    text: input.question,
    tags: input.focusTags,
    topK: 6
  });

  const coreFacts = selectFacts(chart.facts, [
    "birth.sexagenary_year",
    "life_palace.branch",
    "body_palace.branch",
    "life_palace.stem_branch",
    "five_element_bureau",
    "star.ziwei.branch"
  ]);

  return {
    chart,
    question: input.question,
    evidence,
    sections: [
      {
        title: "排盘事实",
        body: "已生成紫微斗数核心排盘事实。当前报告只陈列可追踪事实，不做未经验证的断语。",
        facts: coreFacts,
        citations: []
      },
      {
        title: "可引用材料",
        body:
          evidence.length > 0
            ? "检索到可用于解释的材料。后续 LLM 报告生成必须只基于这些片段和排盘事实展开。"
            : "当前知识库没有检索到足够材料。请先导入合法来源或补充原创笔记。",
        facts: [],
        citations: evidence.map((hit) => hit.citation)
      }
    ],
    caveats: [
      "当前 ruleset 是 ziwei.common-v0，已覆盖命身宫、十二宫、五行局与紫微星定位，但仍需更多流派 fixtures。",
      "解释层尚未接入大模型；本报告用于验证 Agentic RAG 数据流。",
      "请勿把输出用于医疗、法律、财务或人生重大决策。"
    ]
  };
}
