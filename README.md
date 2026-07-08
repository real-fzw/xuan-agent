# XuanAgent

Agentic RAG workbench for Chinese metaphysics, starting with Zi Wei Dou Shu.

> Deterministic chart calculation, source-grounded retrieval, agent planning, and auditable interpretation reports.

XuanAgent is not a black-box fortune-telling site. The project separates:

- **Chart engine**: deterministic calendrical and Zi Wei Dou Shu calculations.
- **Knowledge layer**: licensed or public-domain source ingestion, chunking, citation, and retrieval.
- **Agent layer**: tool-calling workflow that explains a chart with explicit evidence.
- **Workbench**: API, Web UI, CLI, and MCP surfaces for developers and researchers.

## Why Start With Zi Wei Dou Shu

Zi Wei Dou Shu has a rich symbolic structure: twelve palaces, major stars, auxiliary stars, four transformations, decade luck, yearly flow, and multiple schools. That structure is perfect for a developer-facing project because it can be modeled, tested, visualized, and cited.

## Quick Demo

```bash
pnpm install
pnpm demo:ziwei
```

The current demo uses a minimal experimental ruleset and local sample notes. It is a framework milestone, not an authoritative Zi Wei Dou Shu calculator yet.

## Monorepo Layout

```text
packages/core    Zi Wei Dou Shu domain model and deterministic chart engine
packages/rag     Source registry, chunking, citations, and retrieval interfaces
packages/agent   Tool orchestration and report planning
packages/cli     Developer CLI and demos
packages/mcp     MCP server skeleton for external AI assistants
apps/api         HTTP API skeleton
apps/web         React workbench skeleton
tools/ingest     Local corpus ingestion CLI skeleton
docs             Architecture, roadmap, source policy, and domain notes
```

## Principles

1. **Algorithms before prose**: chart data should come from versioned deterministic rules, not LLM guesses.
2. **Citations before claims**: every interpretation should point to chart facts and retrieved source passages.
3. **Local-first by default**: users can run private charts and private corpora locally.
4. **No bundled copyrighted books**: users may ingest legally owned materials locally; this repo ships only original examples and public-compatible metadata.
5. **Multiple schools, no fake certainty**: different Zi Wei Dou Shu schools should be represented as explicit rulesets.

## Initial Roadmap

- Milestone 0: project skeleton, domain model, RAG/Agent contracts.
- Milestone 1: accurate lunar calendar provider, true solar time option, chart fixtures.
- Milestone 2: Zi Wei Dou Shu twelve palaces, life/body palace, five-element bureau, major star placement.
- Milestone 3: four transformations, decade/year/month/day flow.
- Milestone 4: retrieval corpus tooling and cited interpretation reports.
- Milestone 5: Web workbench, MCP tools, and public demo site.

## Cultural and Legal Note

This project is for cultural computing, research, education, and entertainment. It does not provide medical, legal, financial, or life-critical advice.

Some modern Zi Wei Dou Shu materials, including books by contemporary teachers, may be copyrighted. XuanAgent does not include those texts. See [docs/source-policy.md](docs/source-policy.md) for how to use legally provided materials in a private local RAG index.
