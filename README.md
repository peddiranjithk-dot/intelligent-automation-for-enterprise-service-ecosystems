# IAES — Intelligent Automation for Enterprise Service Ecosystems

A production-grade enterprise automation platform dashboard built with vanilla HTML, CSS, and JavaScript — no build tools required.

---

## 📁 Project Structure

```
iaes-project/
├── index.html          ← Main entry point (open this in a browser)
├── css/
│   └── main.css        ← Complete design system + all component styles
└── js/
    ├── data.js         ← All application data, constants, and state
    ├── charts.js       ← Chart.js chart definitions and updaters
    ├── pages.js        ← Page-specific rendering (dashboard, pipelines, etc.)
    ├── api.js          ← Anthropic Claude API integration (AI chat)
    └── app.js          ← Navigation, modals, toast notifications, keyboard shortcuts
```

---

## 🚀 Getting Started

### Option 1 — Open Directly (Simplest)
Just double-click `index.html` in your file explorer.

> Note: The AI chat will use local fallback replies since the Anthropic API requires a server context or API key.

### Option 2 — Local Dev Server (Recommended)

**Using Python (built-in):**
```bash
cd iaes-project
python3 -m http.server 8080
# Open http://localhost:8080
```

**Using Node.js:**
```bash
cd iaes-project
npx serve .
# Open the URL shown in terminal
```

**Using VS Code:**
Install the "Live Server" extension, right-click `index.html` → "Open with Live Server".

---

## 🤖 AI Chat Setup

The AI Ops Assistant uses the Anthropic Claude API. To enable live AI responses:

1. Get an API key from [console.anthropic.com](https://console.anthropic.com)
2. The API call is in `js/api.js` — the key is passed automatically in the Claude.ai environment.
3. If running outside Claude.ai, add your key to the fetch headers:
   ```javascript
   headers: {
     'Content-Type': 'application/json',
     'x-api-key': 'YOUR_API_KEY_HERE',       // Add this
     'anthropic-version': '2023-06-01',       // Add this
   }
   ```

---

## 📋 Pages & Features

| Page         | Features |
|--------------|----------|
| **Dashboard**  | KPI strip, throughput chart, task donut, live pipelines, alerts, service health grid |
| **Pipelines**  | Visual flow canvas, pipeline table with filters, live event log stream |
| **Services**   | 12 connected services table, performance bar chart, uptime/latency metrics |
| **Workflows**  | Workflow library cards, execution history chart, run log table |
| **Analytics**  | Growth chart, savings by category, volume ranking, resolution time distribution |
| **AI Ops**     | Live Claude AI chat, anomaly detection table, model accuracy chart, KPIs |

---

## ⌨️ Keyboard Shortcuts

| Shortcut   | Action |
|------------|--------|
| `Ctrl+1`   | Dashboard |
| `Ctrl+2`   | Pipelines |
| `Ctrl+3`   | Services |
| `Ctrl+4`   | Workflows |
| `Ctrl+5`   | Analytics |
| `Ctrl+6`   | AI Ops |
| `Esc`      | Close modal / notifications |

---

## 🎨 Tech Stack

- **HTML5** — Semantic markup, no framework
- **CSS3** — Custom design system with CSS variables, dark theme, animations
- **Vanilla JavaScript (ES6+)** — Modular, no bundler required
- **Chart.js 4.4** — All data visualizations (line, bar, donut, horizontal bar)
- **Tabler Icons** — Icon library (webfont)
- **Google Fonts** — Syne (headings), DM Sans (body), DM Mono (code/metrics)
- **Anthropic Claude API** — AI Ops assistant powered by `claude-sonnet-4-20250514`

---

## 🏗️ Extending the Platform

### Add a new page
1. Add a `<section class="page" id="page-yourpage">` block in `index.html`
2. Add nav links with `data-page="yourpage"` in both topnav and sidebar
3. Add an `initYourPage()` function in `js/pages.js`
4. Add a `case 'yourpage': initYourPage(); break;` in the `navigate()` switch in `js/app.js`

### Add a new chart
1. Add a `<canvas id="myChart">` in the appropriate page HTML
2. Add an `initMyChart()` function in `js/charts.js`
3. Store the instance in `AppState.charts.myChart` to prevent re-initialization

### Add new mock data
All data is defined in `js/data.js`. Add to the existing arrays or create new constants.

---

## 📄 License
MIT — Free to use, modify, and distribute.
