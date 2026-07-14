# 路线图

## 0. 框架

- Monorepo：core、RAG、agent、CLI、API、Web、MCP 和导入工具。
- 紫微斗数领域模型。
- 用于 demo 的排盘骨架。
- 私有版权资料的来源政策。

## 1. 历法基础

- 历法 provider 接口。
- 阳历转农历 provider。
- 时区和真太阳时选项。
- 节气 provider。
- 已知日期的 golden fixtures。

## 2. 紫微斗数引擎

- 命宫和身宫。
- 十二宫布局校验。
- 五行局。
- 紫微星定位。
- 天府系安星。
- 十四主星。
- 辅星和杂曜。
- 四化。
- 大限、流年、流月和流日。

## 3. RAG 知识层

- 本地文本导入。
- 元数据优先的来源登记。
- 主题分类：宫位、星曜、四化、格局、运限、流派。
- LangChain.js `Document`、`BaseRetriever` 和 tool adapter。
- 混合检索 adapter：关键词、向量和规则标签共同参与召回。
- 基于 citation 的报告 schema。
- Docling 文档提取 worker 与质量门禁。
- Apache Tika 旧 Office 提取适配器。
- 图片 Caption 管道；保留原图 citation 和模型推断 trace，不使用 OCR。
- MinerU 复杂 PDF 可选回退插件。
- 30 题紫微检索基线：Hit@K、MRR 和无正文泄露的评测 runner。
- 人工相关性标注、中文 BM25、embedding 与 rerank 对照评测。

## 4. Agent 工作台

- 工具调用规划器。
- LangGraph 编排：排盘、检索、证据校验、报告生成分节点执行。
- 报告生成器。
- 矛盾与无依据断语检查器。
- 多流派比较模式。
- Web UI 和可分享的静态报告。

## 5. 开发生态

- NPM 包。
- MCP 服务。
- REST API。
- 示例 notebooks 和 fixtures。
- 使用合成语料或授权语料的公开 demo。
