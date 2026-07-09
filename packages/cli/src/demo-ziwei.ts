import { answerZiweiQuestion } from "@xuan/agent";
import { chunkPlainTextByParagraphs, MemoryRetriever } from "@xuan/rag";
import type { KnowledgeSource } from "@xuan/rag";

const source: KnowledgeSource = {
  id: "original-ziwei-notes",
  title: "Original Zi Wei Dou Shu Framework Notes",
  author: "XuanAgent contributors",
  language: "zh",
  license: "original",
  usage: "repo-safe",
  notes: "Synthetic notes for framework testing. Not copied from any copyrighted book."
};

const chunks = chunkPlainTextByParagraphs(
  source,
  [
    "命宫常被视为观察个体性情、行动方式与人生主轴的核心宫位。工程实现中应先把命宫作为结构事实，而不是直接生成断语。",
    "身宫可作为行动落点与后天着力处的观察入口。不同流派对身宫权重有差异，因此解释时应标注所用规则集。",
    "五行局与紫微星落宫属于排盘层事实。解释层应先引用规则集和排盘结果，再引用来源材料，不应由语言模型自行补排。",
    "紫微斗数解释应区分排盘事实、流派规则、案例经验和现代心理化表达。RAG 系统需要为每一类证据保留来源标签。"
  ].join("\n\n"),
  ["紫微斗数", "命宫", "身宫", "五行局", "紫微星", "方法论"]
);

const retriever = new MemoryRetriever([source], chunks);

const report = await answerZiweiQuestion(
  {
    question: "这个命盘的命宫、身宫、五行局和紫微星应该如何作为解释入口？",
    focusTags: ["命宫", "身宫", "五行局", "紫微星"],
    birth: {
      gender: "unknown",
      inputMode: "lunar",
      lunar: {
        year: 1990,
        month: 8,
        isLeapMonth: false,
        day: 15,
        hourBranch: "子"
      }
    }
  },
  { retriever }
);

console.log(JSON.stringify(report, null, 2));
