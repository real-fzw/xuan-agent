export const indexHtml = String.raw`<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>XuanAgent 紫微斗数工作台</title>
    <style>
      :root {
        color-scheme: light;
        --bg: #eef2ed;
        --paper: #fffdf8;
        --panel: #ffffff;
        --panel-soft: #f7f9f4;
        --ink: #17211c;
        --muted: #65736b;
        --line: #d7dfd7;
        --line-strong: #aeb9af;
        --jade: #12756b;
        --jade-soft: #e6f2ee;
        --cinnabar: #b4442f;
        --cinnabar-soft: #faece7;
        --brass: #9b7128;
        --brass-soft: #f5eedb;
        --shadow: 0 12px 36px rgba(27, 39, 31, 0.08);
      }

      * {
        box-sizing: border-box;
      }

      html {
        min-width: 320px;
      }

      body {
        margin: 0;
        min-height: 100vh;
        background:
          linear-gradient(90deg, rgba(23, 33, 28, 0.035) 1px, transparent 1px),
          linear-gradient(rgba(23, 33, 28, 0.03) 1px, transparent 1px),
          var(--bg);
        background-size: 36px 36px;
        color: var(--ink);
        font-family:
          ui-sans-serif,
          system-ui,
          -apple-system,
          BlinkMacSystemFont,
          "Segoe UI",
          sans-serif;
        letter-spacing: 0;
      }

      button,
      input,
      select,
      textarea {
        font: inherit;
      }

      button {
        cursor: pointer;
      }

      .app {
        min-height: 100vh;
        display: grid;
        grid-template-rows: auto 1fr;
      }

      .topbar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
        padding: 16px 22px;
        border-bottom: 1px solid var(--line);
        background: rgba(255, 253, 248, 0.94);
        position: sticky;
        top: 0;
        z-index: 10;
      }

      .brand {
        display: flex;
        align-items: center;
        gap: 12px;
        min-width: 0;
      }

      .seal {
        width: 40px;
        height: 40px;
        display: grid;
        place-items: center;
        border: 1px solid var(--cinnabar);
        border-radius: 8px;
        color: var(--cinnabar);
        background: var(--cinnabar-soft);
        font-weight: 800;
      }

      h1,
      h2,
      h3,
      p {
        margin: 0;
      }

      h1 {
        font-size: 20px;
        line-height: 1.2;
      }

      .sub {
        margin-top: 4px;
        color: var(--muted);
        font-size: 13px;
      }

      .top-actions {
        display: flex;
        align-items: center;
        gap: 10px;
        flex-wrap: wrap;
        justify-content: flex-end;
      }

      .pill {
        min-height: 32px;
        display: inline-flex;
        align-items: center;
        gap: 7px;
        padding: 6px 10px;
        border: 1px solid var(--line);
        border-radius: 8px;
        background: var(--panel);
        color: var(--muted);
        font-size: 12px;
        white-space: nowrap;
      }

      .dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: var(--jade);
      }

      .language {
        display: inline-flex;
        border: 1px solid var(--line);
        border-radius: 8px;
        overflow: hidden;
        background: var(--panel);
      }

      .language button {
        min-width: 48px;
        min-height: 32px;
        border: 0;
        background: transparent;
        color: var(--muted);
      }

      .language button.active {
        background: var(--ink);
        color: #fff;
      }

      .layout {
        display: grid;
        grid-template-columns: 320px minmax(520px, 1fr) 360px;
        gap: 16px;
        padding: 16px;
        align-items: start;
      }

      .panel {
        border: 1px solid var(--line);
        border-radius: 8px;
        background: rgba(255, 255, 255, 0.94);
        box-shadow: var(--shadow);
        overflow: hidden;
      }

      .panel-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        min-height: 52px;
        padding: 13px 15px;
        border-bottom: 1px solid var(--line);
        background: var(--paper);
      }

      .panel-title {
        font-size: 15px;
        font-weight: 750;
      }

      .panel-body {
        padding: 15px;
      }

      .form {
        display: grid;
        gap: 13px;
      }

      label {
        display: grid;
        gap: 6px;
        color: var(--muted);
        font-size: 12px;
      }

      input,
      select,
      textarea {
        width: 100%;
        min-height: 40px;
        border: 1px solid var(--line);
        border-radius: 8px;
        padding: 8px 10px;
        color: var(--ink);
        background: var(--panel);
        outline: none;
      }

      input:focus,
      select:focus,
      textarea:focus {
        border-color: var(--jade);
        box-shadow: 0 0 0 3px rgba(18, 117, 107, 0.12);
      }

      textarea {
        min-height: 76px;
        resize: vertical;
        line-height: 1.55;
      }

      input[type="checkbox"] {
        width: 18px;
        min-height: 18px;
        accent-color: var(--jade);
      }

      .two {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 10px;
      }

      .checkline {
        min-height: 40px;
        display: flex;
        align-items: center;
        gap: 8px;
        color: var(--ink);
      }

      .actions {
        display: grid;
        grid-template-columns: 1fr auto;
        gap: 10px;
      }

      .primary,
      .secondary {
        min-height: 42px;
        border-radius: 8px;
        padding: 0 14px;
        font-weight: 720;
      }

      .primary {
        border: 1px solid var(--jade);
        background: var(--jade);
        color: #fff;
      }

      .secondary {
        border: 1px solid var(--line);
        background: var(--paper);
        color: var(--ink);
      }

      .primary:disabled {
        opacity: 0.62;
        cursor: wait;
      }

      .status {
        min-height: 21px;
        color: var(--muted);
        font-size: 12px;
      }

      .status.error {
        color: var(--cinnabar);
      }

      .note {
        margin-top: 14px;
        padding: 12px;
        border: 1px solid var(--line);
        border-radius: 8px;
        background: var(--panel-soft);
        color: var(--muted);
        font-size: 12px;
        line-height: 1.55;
      }

      .chart-panel {
        min-width: 0;
      }

      .chart-head-meta {
        display: flex;
        align-items: center;
        gap: 8px;
        flex-wrap: wrap;
        justify-content: flex-end;
      }

      .board-wrap {
        padding: 16px;
      }

      .board {
        display: grid;
        grid-template-columns: repeat(4, minmax(112px, 1fr));
        grid-template-rows: repeat(4, minmax(118px, 1fr));
        gap: 8px;
        min-height: 568px;
        padding: 10px;
        border: 1px solid var(--line-strong);
        border-radius: 8px;
        background: var(--paper);
      }

      .palace {
        min-width: 0;
        min-height: 118px;
        border: 1px solid var(--line);
        border-radius: 8px;
        background: var(--panel);
        padding: 10px;
        display: grid;
        grid-template-rows: auto 1fr auto;
        gap: 8px;
        position: relative;
      }

      .palace.life {
        border-color: var(--jade);
        background: var(--jade-soft);
      }

      .palace.body {
        box-shadow: inset 0 0 0 2px rgba(155, 113, 40, 0.28);
      }

      .palace.has-star {
        border-color: rgba(180, 68, 47, 0.56);
      }

      .palace-top {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
      }

      .palace-name {
        min-width: 0;
        overflow-wrap: anywhere;
        font-weight: 760;
        font-size: 14px;
      }

      .branch {
        flex: 0 0 auto;
        display: grid;
        place-items: center;
        width: 28px;
        height: 28px;
        border: 1px solid var(--line);
        border-radius: 8px;
        color: var(--jade);
        background: var(--paper);
        font-weight: 800;
      }

      .stars {
        display: flex;
        align-content: flex-start;
        align-items: flex-start;
        flex-wrap: wrap;
        gap: 6px;
      }

      .star {
        max-width: 100%;
        overflow-wrap: anywhere;
        border: 1px solid rgba(180, 68, 47, 0.24);
        border-radius: 999px;
        padding: 4px 8px;
        background: var(--cinnabar-soft);
        color: var(--cinnabar);
        font-size: 12px;
        font-weight: 780;
      }

      .tagline {
        display: flex;
        flex-wrap: wrap;
        gap: 5px;
        min-height: 20px;
      }

      .tag {
        border: 1px solid var(--line);
        border-radius: 999px;
        padding: 2px 7px;
        color: var(--muted);
        background: rgba(255, 255, 255, 0.72);
        font-size: 11px;
      }

      .center {
        grid-column: 2 / 4;
        grid-row: 2 / 4;
        border: 1px solid var(--line);
        border-radius: 8px;
        background: #fcfaf2;
        padding: 16px;
        display: grid;
        grid-template-rows: auto 1fr auto;
        gap: 12px;
      }

      .center h2 {
        font-size: 18px;
      }

      .center-grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 8px;
      }

      .metric {
        min-height: 74px;
        border: 1px solid var(--line);
        border-radius: 8px;
        background: var(--panel);
        padding: 10px;
      }

      .metric span {
        color: var(--muted);
        font-size: 12px;
      }

      .metric strong {
        display: block;
        margin-top: 5px;
        font-size: 18px;
        overflow-wrap: anywhere;
      }

      .trace-line {
        color: var(--muted);
        font-size: 11px;
        line-height: 1.4;
        overflow-wrap: anywhere;
      }

      .inspector {
        display: grid;
        gap: 16px;
      }

      .fact-list {
        display: grid;
        gap: 8px;
      }

      .fact-row {
        display: grid;
        grid-template-columns: minmax(92px, 0.8fr) minmax(0, 1.2fr);
        gap: 8px;
        align-items: start;
        min-height: 46px;
        border: 1px solid var(--line);
        border-radius: 8px;
        background: var(--panel);
        padding: 9px 10px;
      }

      .fact-row span {
        color: var(--muted);
        font-size: 12px;
      }

      .fact-row strong {
        font-size: 14px;
        overflow-wrap: anywhere;
      }

      .trace-list {
        display: grid;
        gap: 8px;
      }

      .trace-item {
        border: 1px solid var(--line);
        border-radius: 8px;
        background: var(--panel-soft);
        padding: 10px;
      }

      .trace-item strong {
        display: block;
        margin-bottom: 5px;
        font-size: 13px;
      }

      .rag-form {
        display: grid;
        gap: 10px;
      }

      .rag-meta {
        min-height: 20px;
        color: var(--muted);
        font-size: 12px;
      }

      .rag-results {
        display: grid;
        gap: 8px;
        margin-top: 12px;
      }

      .rag-hit {
        border: 1px solid var(--line);
        border-radius: 8px;
        background: var(--panel);
        padding: 10px;
      }

      .rag-hit strong {
        display: block;
        margin-bottom: 6px;
        font-size: 13px;
      }

      .rag-hit p {
        color: var(--ink);
        font-size: 12px;
        line-height: 1.55;
      }

      .rag-tags {
        display: flex;
        flex-wrap: wrap;
        gap: 5px;
        margin-top: 8px;
      }

      .json-box {
        max-height: 300px;
        overflow: auto;
        border-radius: 8px;
        background: #111714;
        color: #edf6ef;
        padding: 12px;
        font-size: 12px;
        line-height: 1.5;
      }

      .empty {
        min-height: 568px;
        display: grid;
        place-items: center;
        border: 1px dashed var(--line-strong);
        border-radius: 8px;
        background: rgba(255, 253, 248, 0.78);
        color: var(--muted);
        text-align: center;
        padding: 24px;
      }

      [hidden] {
        display: none !important;
      }

      @media (max-width: 1180px) {
        .layout {
          grid-template-columns: 300px minmax(0, 1fr);
        }

        .inspector {
          grid-column: 1 / -1;
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }
      }

      @media (max-width: 860px) {
        .layout {
          grid-template-columns: 1fr;
        }

        .board {
          grid-template-columns: repeat(2, minmax(0, 1fr));
          grid-template-rows: none;
          min-height: 0;
        }

        .palace,
        .center {
          grid-column: auto !important;
          grid-row: auto !important;
        }

        .inspector {
          grid-template-columns: 1fr;
        }
      }

      @media (max-width: 560px) {
        .topbar {
          align-items: flex-start;
          flex-direction: column;
        }

        .top-actions {
          justify-content: flex-start;
        }

        .layout {
          padding: 10px;
        }

        .two,
        .actions,
        .center-grid {
          grid-template-columns: 1fr;
        }

        .board {
          grid-template-columns: 1fr;
        }
      }
    </style>
  </head>
  <body>
    <div class="app">
      <header class="topbar">
        <div class="brand">
          <div class="seal">玄</div>
          <div>
            <h1 data-i18n="title">XuanAgent 紫微斗数工作台</h1>
            <p class="sub" data-i18n="subtitle">确定性排盘事实、规则 trace 与后续 RAG 解读入口</p>
          </div>
        </div>
        <div class="top-actions">
          <span class="pill"><span class="dot"></span><span id="server-status">local</span></span>
          <span class="pill" id="ruleset-pill">ziwei.common-v0</span>
          <div class="language" aria-label="Language">
            <button type="button" class="active" data-lang="zh">中文</button>
            <button type="button" data-lang="en">EN</button>
          </div>
        </div>
      </header>

      <main class="layout">
        <aside class="panel">
          <div class="panel-head">
            <h2 class="panel-title" data-i18n="birthTitle">排盘输入</h2>
          </div>
          <div class="panel-body">
            <form id="birth-form" class="form">
              <div class="two">
                <label>
                  <span data-i18n="gender">性别</span>
                  <select name="gender">
                    <option value="unknown" data-i18n="unknown">未知</option>
                    <option value="male" data-i18n="male">男</option>
                    <option value="female" data-i18n="female">女</option>
                  </select>
                </label>
                <label>
                  <span data-i18n="year">农历年份</span>
                  <input name="year" type="number" min="1" max="9999" value="1990" required />
                </label>
              </div>
              <div class="two">
                <label>
                  <span data-i18n="month">农历月份</span>
                  <input name="month" type="number" min="1" max="12" value="8" required />
                </label>
                <label>
                  <span data-i18n="day">农历日期</span>
                  <input name="day" type="number" min="1" max="30" value="15" required />
                </label>
              </div>
              <div class="two">
                <label>
                  <span data-i18n="hour">出生时辰</span>
                  <select name="hourBranch" id="hour-branch"></select>
                </label>
                <label class="checkline">
                  <input name="isLeapMonth" type="checkbox" />
                  <span data-i18n="leap">闰月</span>
                </label>
              </div>
              <div class="actions">
                <button class="primary" type="submit" data-i18n="submit">生成命盘</button>
                <button class="secondary" type="button" id="reset-demo" data-i18n="reset">样例</button>
              </div>
              <div id="status" class="status"></div>
            </form>
            <div class="note" data-i18n="note">
              当前页面只使用本地确定性排盘引擎。解释层之后必须基于排盘事实和 RAG 引用，不能让模型自由发挥。
            </div>
          </div>
        </aside>

        <section class="panel chart-panel">
          <div class="panel-head">
            <div>
              <h2 class="panel-title" data-i18n="chartTitle">命盘盘面</h2>
              <p class="sub" id="chart-subtitle">农历 1990 年 8 月 15 日 子时</p>
            </div>
            <div class="chart-head-meta">
              <span class="pill" id="chart-id">未生成</span>
            </div>
          </div>
          <div class="board-wrap">
            <div id="empty" class="empty" data-i18n="empty">输入农历出生信息后生成本地命盘。</div>
            <div id="board" class="board" hidden></div>
          </div>
        </section>

        <aside class="inspector">
          <section class="panel">
            <div class="panel-head">
              <h2 class="panel-title" data-i18n="factsTitle">事实检查器</h2>
            </div>
            <div class="panel-body">
              <div id="fact-list" class="fact-list"></div>
            </div>
          </section>

          <section class="panel">
            <div class="panel-head">
              <h2 class="panel-title" data-i18n="traceTitle">Trace</h2>
            </div>
            <div class="panel-body">
              <div id="trace-list" class="trace-list"></div>
            </div>
          </section>

          <section class="panel">
            <div class="panel-head">
              <h2 class="panel-title" data-i18n="ragTitle">本地 RAG</h2>
              <span class="pill" id="rag-count">0 chunks</span>
            </div>
            <div class="panel-body">
              <form id="rag-form" class="rag-form">
                <label>
                  <span data-i18n="ragQuestion">检索问题</span>
                  <textarea name="question" data-i18n-placeholder="ragPlaceholder">命宫 紫微星</textarea>
                </label>
                <button class="secondary" type="submit" data-i18n="ragSearch">检索引用</button>
              </form>
              <div id="rag-status" class="rag-meta"></div>
              <div id="rag-results" class="rag-results"></div>
            </div>
          </section>

          <section class="panel">
            <div class="panel-head">
              <h2 class="panel-title" data-i18n="jsonTitle">原始 JSON</h2>
              <button class="secondary" type="button" id="copy-json" data-i18n="copy">复制</button>
            </div>
            <div class="panel-body">
              <pre id="json" class="json-box">{}</pre>
            </div>
          </section>
        </aside>
      </main>
    </div>

    <script>
      const hourBranches = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"];
      const branchLayout = {
        "巳": [1, 1],
        "午": [2, 1],
        "未": [3, 1],
        "申": [4, 1],
        "辰": [1, 2],
        "酉": [4, 2],
        "卯": [1, 3],
        "戌": [4, 3],
        "寅": [1, 4],
        "丑": [2, 4],
        "子": [3, 4],
        "亥": [4, 4]
      };

      const labels = {
        zh: {
          title: "XuanAgent 紫微斗数工作台",
          subtitle: "确定性排盘事实、规则 trace 与后续 RAG 解读入口",
          birthTitle: "排盘输入",
          gender: "性别",
          unknown: "未知",
          male: "男",
          female: "女",
          year: "农历年份",
          month: "农历月份",
          day: "农历日期",
          hour: "出生时辰",
          leap: "闰月",
          submit: "生成命盘",
          reset: "样例",
          note: "当前页面只使用本地确定性排盘引擎。解释层之后必须基于排盘事实和 RAG 引用，不能让模型自由发挥。",
          chartTitle: "命盘盘面",
          empty: "输入农历出生信息后生成本地命盘。",
          factsTitle: "事实检查器",
          traceTitle: "Trace",
          ragTitle: "本地 RAG",
          ragQuestion: "检索问题",
          ragPlaceholder: "命宫 紫微星",
          ragSearch: "检索引用",
          ragLoading: "检索中...",
          ragReady: "{framework} 本地索引已加载：{sourceCount} 个来源，{chunkCount} 个 chunks。",
          ragMissing: "本地 RAG index 未准备好。",
          ragEmpty: "没有检索到可引用片段。",
          ragFound: "找到 {count} 条可引用片段。",
          ragScore: "分数",
          jsonTitle: "原始 JSON",
          copy: "复制",
          copied: "已复制。",
          loading: "排盘中...",
          done: "已生成命盘。",
          noStars: "暂无主星",
          centerTitle: "核心结构",
          warningTitle: "边界",
          formula: "公式",
          confidence: "可信度",
          lifeTag: "命",
          bodyTag: "身",
          majorTag: "主星",
          unknownValue: "未知",
          notCreated: "未生成",
          factLabels: {
            "birth.sexagenary_year": "出生年干支",
            "life_palace.branch": "命宫",
            "body_palace.branch": "身宫",
            "body_palace.host_palace": "身宫落点",
            "life_palace.stem_branch": "命宫干支",
            "life_palace.nayin": "命宫纳音",
            "five_element_bureau": "五行局",
            "star.ziwei.branch": "紫微星"
          }
        },
        en: {
          title: "XuanAgent Zi Wei Workbench",
          subtitle: "Deterministic chart facts, rule trace, and RAG-ready interpretation",
          birthTitle: "Chart Input",
          gender: "Gender",
          unknown: "Unknown",
          male: "Male",
          female: "Female",
          year: "Lunar year",
          month: "Lunar month",
          day: "Lunar day",
          hour: "Birth hour branch",
          leap: "Leap month",
          submit: "Generate",
          reset: "Sample",
          note: "This page only uses the local deterministic chart engine. Interpretation must later be grounded in chart facts and RAG citations.",
          chartTitle: "Chart Board",
          empty: "Enter lunar birth data to generate a local chart.",
          factsTitle: "Fact Inspector",
          traceTitle: "Trace",
          ragTitle: "Local RAG",
          ragQuestion: "Search query",
          ragPlaceholder: "life palace Zi Wei star",
          ragSearch: "Search citations",
          ragLoading: "Searching...",
          ragReady: "{framework} local index loaded: {sourceCount} sources, {chunkCount} chunks.",
          ragMissing: "Local RAG index is not ready.",
          ragEmpty: "No citable chunks found.",
          ragFound: "Found {count} citable chunks.",
          ragScore: "Score",
          jsonTitle: "Raw JSON",
          copy: "Copy",
          copied: "Copied.",
          loading: "Calculating...",
          done: "Chart generated.",
          noStars: "No major star",
          centerTitle: "Core Structure",
          warningTitle: "Boundary",
          formula: "Formula",
          confidence: "Confidence",
          lifeTag: "Life",
          bodyTag: "Body",
          majorTag: "Major",
          unknownValue: "Unknown",
          notCreated: "Not created",
          factLabels: {
            "birth.sexagenary_year": "Birth year",
            "life_palace.branch": "Life palace",
            "body_palace.branch": "Body palace",
            "body_palace.host_palace": "Body host",
            "life_palace.stem_branch": "Life palace stem-branch",
            "life_palace.nayin": "Life palace Nayin",
            "five_element_bureau": "Five-element bureau",
            "star.ziwei.branch": "Zi Wei star"
          }
        }
      };

      let language = "zh";
      let chart = null;

      const form = document.querySelector("#birth-form");
      const statusEl = document.querySelector("#status");
      const emptyEl = document.querySelector("#empty");
      const boardEl = document.querySelector("#board");
      const factListEl = document.querySelector("#fact-list");
      const traceListEl = document.querySelector("#trace-list");
      const ragForm = document.querySelector("#rag-form");
      const ragStatusEl = document.querySelector("#rag-status");
      const ragResultsEl = document.querySelector("#rag-results");
      const ragCountEl = document.querySelector("#rag-count");
      const jsonEl = document.querySelector("#json");
      const chartIdEl = document.querySelector("#chart-id");
      const chartSubtitleEl = document.querySelector("#chart-subtitle");
      const rulesetPillEl = document.querySelector("#ruleset-pill");

      function t(key) {
        return labels[language][key] || key;
      }

      function fact(key) {
        if (!chart || !chart.facts) {
          return undefined;
        }
        return chart.facts.find(function (item) {
          return item.key === key;
        });
      }

      function displayValue(value) {
        if (value && typeof value === "object") {
          if (value.label) {
            return prettyLabel(value.label);
          }
          if (value.name) {
            return value.name;
          }
          if (value.palaceName) {
            return value.palaceName + " / " + value.branch;
          }
          return JSON.stringify(value);
        }
        if (value === undefined || value === null || value === "") {
          return t("unknownValue");
        }
        return String(value);
      }

      function prettyLabel(value) {
        return String(value)
          .replace("2局", "二局")
          .replace("3局", "三局")
          .replace("4局", "四局")
          .replace("5局", "五局")
          .replace("6局", "六局");
      }

      function setStatus(message, isError) {
        statusEl.textContent = message;
        statusEl.classList.toggle("error", Boolean(isError));
      }

      function setLanguage(nextLanguage) {
        language = nextLanguage;
        document.documentElement.lang = language === "zh" ? "zh-CN" : "en";
        document.querySelectorAll("[data-lang]").forEach(function (button) {
          button.classList.toggle("active", button.dataset.lang === language);
        });
        document.querySelectorAll("[data-i18n]").forEach(function (node) {
          node.textContent = t(node.dataset.i18n);
        });
        document.querySelectorAll("[data-i18n-placeholder]").forEach(function (node) {
          node.setAttribute("placeholder", t(node.dataset.i18nPlaceholder));
        });
        render();
      }

      function inputSummary() {
        const data = new FormData(form);
        if (language === "en") {
          return "Lunar " + data.get("year") + "/" + data.get("month") + "/" + data.get("day") + " " + data.get("hourBranch");
        }
        return "农历 " + data.get("year") + " 年 " + data.get("month") + " 月 " + data.get("day") + " 日 " + data.get("hourBranch") + "时";
      }

      function renderCenter() {
        const center = document.createElement("section");
        center.className = "center";

        const title = document.createElement("div");
        const h2 = document.createElement("h2");
        h2.textContent = t("centerTitle");
        const sub = document.createElement("p");
        sub.className = "sub";
        sub.textContent = chart ? chart.rulesetId : "";
        title.append(h2, sub);

        const grid = document.createElement("div");
        grid.className = "center-grid";
        [
          "birth.sexagenary_year",
          "life_palace.branch",
          "body_palace.branch",
          "five_element_bureau"
        ].forEach(function (key) {
          const item = fact(key);
          const metric = document.createElement("div");
          metric.className = "metric";
          const label = document.createElement("span");
          label.textContent = labels[language].factLabels[key] || key;
          const value = document.createElement("strong");
          value.textContent = displayValue(item && item.value);
          metric.append(label, value);
          grid.append(metric);
        });

        const warning = document.createElement("p");
        warning.className = "trace-line";
        warning.textContent =
          language === "zh"
            ? "当前 ruleset 覆盖命身宫、十二宫、五行局与紫微星定位；流派差异仍需后续 fixtures 建模。"
            : "The current ruleset covers palaces, five-element bureau, and Zi Wei placement; school-specific disagreements still need fixtures.";

        center.append(title, grid, warning);
        return center;
      }

      function renderBoard() {
        boardEl.replaceChildren();
        boardEl.append(renderCenter());

        const lifeBranch = displayValue(fact("life_palace.branch") && fact("life_palace.branch").value);
        const bodyBranch = displayValue(fact("body_palace.branch") && fact("body_palace.branch").value);

        (chart.palaces || []).forEach(function (palace) {
          const node = document.createElement("section");
          const placement = branchLayout[palace.branch] || [1, 1];
          node.className = "palace";
          node.style.gridColumn = String(placement[0]);
          node.style.gridRow = String(placement[1]);

          if (palace.branch === lifeBranch) {
            node.classList.add("life");
          }
          if (palace.branch === bodyBranch) {
            node.classList.add("body");
          }
          if (palace.stars && palace.stars.length > 0) {
            node.classList.add("has-star");
          }

          const top = document.createElement("div");
          top.className = "palace-top";
          const name = document.createElement("div");
          name.className = "palace-name";
          name.textContent = palace.name;
          const branch = document.createElement("div");
          branch.className = "branch";
          branch.textContent = palace.branch;
          top.append(name, branch);

          const stars = document.createElement("div");
          stars.className = "stars";
          if (!palace.stars || palace.stars.length === 0) {
            const empty = document.createElement("span");
            empty.className = "trace-line";
            empty.textContent = t("noStars");
            stars.append(empty);
          } else {
            palace.stars.forEach(function (star) {
              const item = document.createElement("span");
              item.className = "star";
              item.textContent = star.name;
              stars.append(item);
            });
          }

          const tags = document.createElement("div");
          tags.className = "tagline";
          if (palace.branch === lifeBranch) {
            const tag = document.createElement("span");
            tag.className = "tag";
            tag.textContent = t("lifeTag");
            tags.append(tag);
          }
          if (palace.branch === bodyBranch) {
            const tag = document.createElement("span");
            tag.className = "tag";
            tag.textContent = t("bodyTag");
            tags.append(tag);
          }
          if (palace.stars && palace.stars.length > 0) {
            const tag = document.createElement("span");
            tag.className = "tag";
            tag.textContent = t("majorTag");
            tags.append(tag);
          }

          node.append(top, stars, tags);
          boardEl.append(node);
        });
      }

      function renderFacts() {
        const keys = [
          "birth.sexagenary_year",
          "life_palace.branch",
          "body_palace.branch",
          "body_palace.host_palace",
          "life_palace.stem_branch",
          "life_palace.nayin",
          "five_element_bureau",
          "star.ziwei.branch"
        ];

        factListEl.replaceChildren();
        keys.forEach(function (key) {
          const item = fact(key);
          const row = document.createElement("div");
          row.className = "fact-row";
          const label = document.createElement("span");
          label.textContent = labels[language].factLabels[key] || key;
          const value = document.createElement("strong");
          value.textContent = displayValue(item && item.value);
          row.append(label, value);
          factListEl.append(row);
        });
      }

      function renderTrace() {
        const keys = [
          "life_palace.branch",
          "body_palace.branch",
          "five_element_bureau",
          "star.ziwei.branch"
        ];

        traceListEl.replaceChildren();
        keys.forEach(function (key) {
          const item = fact(key);
          const trace = item && item.trace;
          const node = document.createElement("div");
          node.className = "trace-item";
          const name = document.createElement("strong");
          name.textContent = labels[language].factLabels[key] || key;
          const formula = document.createElement("div");
          formula.className = "trace-line";
          formula.textContent = trace ? t("formula") + ": " + trace.formulaId : "";
          const confidence = document.createElement("div");
          confidence.className = "trace-line";
          confidence.textContent = trace ? t("confidence") + ": " + trace.confidence : "";
          node.append(name, formula, confidence);
          traceListEl.append(node);
        });
      }

      async function loadRagStatus() {
        try {
          const response = await fetch("/api/rag/status");
          const payload = await response.json();
          ragCountEl.textContent = payload.ready ? payload.chunkCount + " chunks" : "0 chunks";
          ragStatusEl.textContent = payload.ready
            ? t("ragReady")
                .replace("{framework}", payload.framework || "LangChain.js")
                .replace("{sourceCount}", String(payload.sourceCount))
                .replace("{chunkCount}", String(payload.chunkCount))
            : payload.error || t("ragMissing");
        } catch (error) {
          ragCountEl.textContent = "0 chunks";
          ragStatusEl.textContent = error instanceof Error ? error.message : t("ragMissing");
        }
      }

      function renderRagHits(hits) {
        ragResultsEl.replaceChildren();
        hits.forEach(function (hit) {
          const node = document.createElement("article");
          node.className = "rag-hit";

          const title = document.createElement("strong");
          title.textContent =
            (hit.citation && hit.citation.title ? hit.citation.title : hit.citation.sourceId) +
            " · " +
            (hit.citation.locator || hit.citation.chunkId);

          const snippet = document.createElement("p");
          snippet.textContent = hit.snippet;

          const meta = document.createElement("div");
          meta.className = "trace-line";
          meta.textContent = t("ragScore") + ": " + hit.score + " · " + hit.citation.chunkId;

          const tags = document.createElement("div");
          tags.className = "rag-tags";
          (hit.tags || []).forEach(function (tagText) {
            const tag = document.createElement("span");
            tag.className = "tag";
            tag.textContent = tagText;
            tags.append(tag);
          });

          node.append(title, snippet, meta, tags);
          ragResultsEl.append(node);
        });
      }

      async function searchRag(event) {
        event.preventDefault();
        const data = new FormData(ragForm);
        const text = String(data.get("question") || "").trim();
        if (!text) {
          ragStatusEl.textContent = t("ragMissing");
          return;
        }

        ragStatusEl.textContent = t("ragLoading");
        ragResultsEl.replaceChildren();

        try {
          const response = await fetch("/api/rag/search", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ text, topK: 5 })
          });
          const payload = await response.json();
          if (!response.ok) {
            throw new Error(payload.error || "RAG search failed.");
          }
          renderRagHits(payload.hits);
          ragStatusEl.textContent =
            payload.hits.length > 0
              ? t("ragFound").replace("{count}", String(payload.hits.length))
              : t("ragEmpty");
          ragCountEl.textContent = payload.chunkCount + " chunks";
        } catch (error) {
          ragStatusEl.textContent = error instanceof Error ? error.message : t("ragMissing");
        }
      }

      function render() {
        if (!chart) {
          emptyEl.hidden = false;
          boardEl.hidden = true;
          chartIdEl.textContent = t("notCreated");
          factListEl.replaceChildren();
          traceListEl.replaceChildren();
          jsonEl.textContent = "{}";
          return;
        }

        emptyEl.hidden = true;
        boardEl.hidden = false;
        chartIdEl.textContent = chart.chartId || t("notCreated");
        rulesetPillEl.textContent = chart.rulesetId || "ziwei.common-v0";
        chartSubtitleEl.textContent = inputSummary();
        renderBoard();
        renderFacts();
        renderTrace();
        jsonEl.textContent = JSON.stringify(chart, null, 2);
      }

      async function createChart(event) {
        if (event) {
          event.preventDefault();
        }

        const data = new FormData(form);
        const submit = form.querySelector("button[type='submit']");
        submit.disabled = true;
        setStatus(t("loading"), false);

        const birth = {
          gender: String(data.get("gender")),
          inputMode: "lunar",
          lunar: {
            year: Number(data.get("year")),
            month: Number(data.get("month")),
            isLeapMonth: data.get("isLeapMonth") === "on",
            day: Number(data.get("day")),
            hourBranch: String(data.get("hourBranch"))
          }
        };

        try {
          const response = await fetch("/api/ziwei/chart", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify(birth)
          });
          const payload = await response.json();
          if (!response.ok) {
            throw new Error(payload.error || "Request failed.");
          }
          chart = payload;
          setStatus(t("done"), false);
          render();
        } catch (error) {
          setStatus(error instanceof Error ? error.message : String(error), true);
        } finally {
          submit.disabled = false;
        }
      }

      function resetDemo() {
        form.elements.gender.value = "unknown";
        form.elements.year.value = "1990";
        form.elements.month.value = "8";
        form.elements.day.value = "15";
        form.elements.hourBranch.value = "子";
        form.elements.isLeapMonth.checked = false;
        void createChart();
      }

      document.querySelector("#hour-branch").replaceChildren(
        ...hourBranches.map(function (branch) {
          const option = document.createElement("option");
          option.value = branch;
          option.textContent = branch;
          option.selected = branch === "子";
          return option;
        })
      );

      form.addEventListener("submit", createChart);
      ragForm.addEventListener("submit", searchRag);
      document.querySelector("#reset-demo").addEventListener("click", resetDemo);
      document.querySelector("#copy-json").addEventListener("click", async function () {
        try {
          await navigator.clipboard.writeText(jsonEl.textContent || "{}");
          setStatus(t("copied"), false);
        } catch {
          setStatus(jsonEl.textContent || "{}", false);
        }
      });
      document.querySelectorAll("[data-lang]").forEach(function (button) {
        button.addEventListener("click", function () {
          setLanguage(button.dataset.lang);
        });
      });

      setLanguage("zh");
      void loadRagStatus();
      void createChart();
    </script>
  </body>
</html>`;
