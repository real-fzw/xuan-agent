# XuanAgent

以紫微斗数为起点的 Agentic RAG 工作台。

> 确定性排盘、来源可追溯检索、Agent 工具编排，以及可审计的引用式解读报告。

XuanAgent 不是普通算命网页，也不是让 LLM 黑箱编故事的项目。它把系统拆成四层：

- **排盘引擎**：历法、干支、宫位、星曜等确定性计算。
- **知识层**：合法来源或公版材料的登记、切分、引用和检索；RAG 框架优先采用 LangChain.js，后续 Agent 编排接 LangGraph。
- **Agent 层**：用工具调用组织排盘、检索和报告生成。
- **工作台**：面向开发者和研究者的 API、Web、CLI、MCP 等入口。

## 为什么先做紫微斗数

紫微斗数有非常清晰的结构：十二宫、主星、辅星、四化、大限、流年，以及不同流派之间的规则差异。这种结构适合被建模、测试、可视化和引用，也适合用来验证“确定性排盘 + RAG 引用 + Agent 解读”的工程边界。

后续可以扩展到八字、奇门、易经等体系，但当前重点是把紫微斗数核心链路打扎实。

## 快速体验

```bash
pnpm install
pnpm demo:ziwei
```

当前 demo 使用早期 `ziwei.common-v0` 规则集和仓库内原创示例笔记。它已经能生成命宫、身宫、十二宫、五行局、紫微星落宫、天府系与十四主星等带 trace 的核心事实，但还不是完整、权威、多流派的正式紫微斗数排盘器。

## RAG 框架

`@xuan/rag` 现在提供 LangChain.js 适配层：

- 将本地 `RagIndex` 转成 LangChain `Document`，metadata 中保留 `citation`、`sourceId`、`chunkId`、`license` 和 `usage`。
- 将本地检索器包装成 LangChain `BaseRetriever`。
- 提供 `xuan_rag_search` LangChain tool，供后续 Agentic RAG 工作流调用。

私有资料仍只允许在本地进入 `data/private/` 或 `corpus/private/`，不得提交书籍、课程、扫描件、OCR 文本、向量索引或衍生私有语料。

本地资料管道已经支持：

- Docling 提取 PDF、DOCX、PPTX，PDF 默认关闭 OCR。
- macOS `textutil` 提取旧 DOC/PPT；跨平台 Apache Tika 适配仍在后续计划中。
- OpenAI-compatible 视觉 API 生成图片 Caption；私有图片远程上传默认禁止。
- 将原生文本、文档 extraction artifact 和 Caption artifact 合并为同一个带 provenance/trace 的私有 RAG index。

实现和安全边界见 [资料提取与图片 Caption 管道](docs/extraction-pipeline.md)。

## Monorepo 结构

```text
packages/core    紫微斗数领域模型与确定性排盘引擎
packages/rag     来源登记、切分、引用与检索接口
packages/agent   工具编排与报告规划
packages/cli     开发者命令行与 demo
packages/mcp     面向外部 AI 助手的 MCP 服务骨架
apps/api         HTTP API 骨架
apps/web         React 工作台骨架
tools/ingest     本地语料索引、文档 artifact 和图片 Caption 工具
tools/extract    Docling / macOS textutil 私有文档提取 worker
docs             架构、路线图、来源政策与领域说明
```

## 核心原则

1. **先算法，后解读**：排盘数据必须来自版本化、可测试的确定性规则，不能来自 LLM 猜测。
2. **先引用，后断语**：每条解释都应该指向排盘事实和检索到的来源片段。
3. **默认本地优先**：用户可以在本地处理私有命盘和私有语料。
4. **不内置版权资料**：仓库只放原创示例、公开兼容的元数据和工具管道；用户可在本地导入自己合法拥有的材料。
5. **多流派，不装确定**：不同紫微斗数流派的差异应被显式建模为不同 ruleset，而不是被压平成一套没有出处的答案。
6. **关键技术必须入文档**：框架引入、架构调整、数据契约变化、重要技术取舍和验证结果，必须与代码同步记录在 `docs/`，不能只存在于提交信息或聊天记录中。

## 技术文档

- [架构](docs/architecture.md)
- [RAG 实现报告](docs/rag-implementation-report.md)
- [资料提取与图片 Caption 管道](docs/extraction-pipeline.md)
- [来源与版权政策](docs/source-policy.md)

## 初始路线图

- Milestone 0：项目骨架、领域模型、RAG/Agent 契约。
- Milestone 1：准确历法 provider、真太阳时选项、排盘 fixtures。
- Milestone 2：紫微斗数十二宫、命宫/身宫、五行局、主星安星。
- Milestone 3：四化、大限、流年、流月、流日。
- Milestone 4：语料工具链和带引用的解读报告。
- Milestone 5：Web 工作台、MCP 工具和公开 demo。

## 文化与法律说明

本项目用于文化计算、研究、教育与娱乐，不提供医疗、法律、金融或人生重大决策建议。

部分现代紫微斗数材料，包括当代老师的书籍、课程和讲义，可能受版权保护。XuanAgent 不包含这些文本。如何在本地私有 RAG 索引中使用合法拥有的资料，请见 [docs/source-policy.md](docs/source-policy.md)。
