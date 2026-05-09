/* ═══════════════════════════════════════════════════════════
   IAES — Pages Module
   All page-specific rendering and initialization functions
   ═══════════════════════════════════════════════════════════ */

'use strict';

// ═══════════════════════════ DASHBOARD ══════════════════════

function initDashboard() {
  if (AppState.initialized.dashboard) {
    refreshDashboard();
    return;
  }
  AppState.initialized.dashboard = true;

  renderKpiStrip('kpiStrip', KPI_CONFIG);
  renderLivePipelines();
  renderAlerts();
  renderServiceHealthGrid();
  initThroughputChart();
  initDonutChart();
  startKpiUpdates();
}

function refreshDashboard() {
  renderLivePipelines();
  updateThroughputChart();
}

function renderKpiStrip(containerId, config) {
  const el = document.getElementById(containerId);
  if (!el) return;
  el.innerHTML = config.map(k => `
    <div class="kpi-card" style="--top-color:${k.topColor};--icon-bg:${k.iconBg};--icon-col:${k.iconCol}">
      <div class="kpi-icon"><i class="ti ${k.icon}"></i></div>
      <div class="kpi-label">${k.label}</div>
      <div class="kpi-val" id="${k.id}">${k.value}<span class="unit">${k.unit}</span></div>
      <div class="kpi-delta ${k.deltaPos ? '' : 'neg'}">
        <i class="ti ti-trending-${k.deltaPos ? 'up' : 'down'}"></i>
        ${k.delta}
      </div>
    </div>
  `).join('');
}

function renderLivePipelines() {
  const el = document.getElementById('livePipelinesList');
  if (!el) return;

  el.innerHTML = PIPELINES.slice(0, 5).map(p => {
    const scClass = p.status === 'running' ? 'sc-green' :
                    p.status === 'failed'  ? 'sc-red'   :
                    p.status === 'pending' ? 'sc-amber'  : 'sc-gray';
    const fillColor = p.status === 'running' ? '#22c55e' : '#f59e0b';
    return `
      <div class="pipeline-item" onclick="navigate('pipelines')">
        <div class="status-circle ${scClass}"></div>
        <div style="flex:1">
          <div class="pi-name">${p.name}</div>
          <div class="pi-progress">
            <div class="pi-fill" style="width:${p.progress}%;background:${fillColor}"></div>
          </div>
          <div class="pi-meta">${p.runs} runs · SLA ${p.sla}</div>
        </div>
        <div class="pi-time">${p.lastRun}</div>
      </div>
    `;
  }).join('');
}

function renderAlerts() {
  const el = document.getElementById('alertsContainer');
  if (!el) return;

  const alerts = [
    {
      type: 'critical',
      icon: 'ti-alert-circle',
      iconColor: 'var(--red)',
      title: 'Oracle DB Connection Lost',
      desc: '10 dependent pipelines paused. Auto-failover to read-replica initiated.',
      ts: '2 min ago',
    },
    {
      type: 'warning',
      icon: 'ti-activity',
      iconColor: 'var(--amber)',
      title: 'Workday HCM Latency Spike',
      desc: 'Response time 4× above baseline (180ms vs 42ms avg). AI diagnosis in progress.',
      ts: '11 min ago',
    },
    {
      type: 'info',
      icon: 'ti-arrow-autofit-up',
      iconColor: 'var(--teal)',
      title: 'Auto-scaling Event',
      desc: 'Kafka cluster scaled from 8 → 12 nodes due to consumer lag spike.',
      ts: '18 min ago',
    },
  ];

  el.innerHTML = alerts.map(a => `
    <div class="alert-row ${a.type}">
      <i class="ti ${a.icon} alert-icon" style="color:${a.iconColor}"></i>
      <div class="alert-body">
        <div class="alert-title">${a.title}</div>
        <div class="alert-desc">${a.desc}</div>
      </div>
      <div class="alert-ts">${a.ts}</div>
    </div>
  `).join('');
}

function renderServiceHealthGrid() {
  const el = document.getElementById('serviceHealthGrid');
  if (!el) return;

  el.innerHTML = SERVICES.slice(0, 12).map(s => `
    <div class="shg-card" onclick="navigate('services')" title="${s.name} — ${s.status}">
      <div class="shg-icon" style="background:${s.color}18;color:${s.color}">
        <i class="ti ${s.icon}"></i>
      </div>
      <div class="shg-name">${s.name.split(' ')[0]}</div>
      <div class="shg-status ${s.status}">● ${s.status}</div>
    </div>
  `).join('');
}

function startKpiUpdates() {
  if (AppState.kpiInterval) return;
  AppState.kpiInterval = setInterval(() => {
    const el = document.getElementById('kpi-automations');
    if (el) {
      const n = (2800 + Math.floor(Math.random() * 100)).toLocaleString();
      el.innerHTML = `${n}<span class="unit"></span>`;
    }
    updateThroughputChart();
  }, 3000);
}

// ═══════════════════════════ PIPELINES ══════════════════════

function initPipelines() {
  if (AppState.initialized.pipelines) return;
  AppState.initialized.pipelines = true;

  renderFlowCanvas();
  renderPipelinesTable();
  startLogStream();
}

function renderFlowCanvas() {
  const el = document.getElementById('flowCanvas');
  if (!el || el.dataset.init) return;
  el.dataset.init = '1';

  const nodes = [
    { icon: 'ti-inbox',         label: 'Receive\nOrder',    state: 'active',  badge: null },
    { icon: 'ti-shield-check',  label: 'Validate\nSchema',  state: 'active',  badge: null },
    { icon: 'ti-brain',         label: 'AI\nClassify',      state: 'ai',      badge: 'AI' },
    { icon: 'ti-git-branch',    label: 'Route\nLogic',      state: 'active',  badge: null },
    { icon: 'ti-building-bank', label: 'Update\nERP',       state: 'idle',    badge: null },
    { icon: 'ti-credit-card',   label: 'Process\nPayment',  state: 'ai',      badge: 'AI' },
    { icon: 'ti-send',          label: 'Notify\nCustomer',  state: 'idle',    badge: null },
  ];

  el.innerHTML = nodes.map((n, i) => {
    const cls = n.state === 'active' ? 'active-node' :
                n.state === 'ai'     ? 'ai-node'     : '';
    const iconColor = n.state === 'active' ? 'var(--green)' :
                      n.state === 'ai'     ? 'var(--purple)' : 'var(--text3)';
    const badgeHtml = n.badge ? `<div class="node-badge" style="background:var(--purple);color:#fff">${n.badge}</div>` : '';

    const arrow = i < nodes.length - 1 ? `
      <div class="flow-arrow">
        <i class="ti ti-chevron-right"></i>
      </div>
    ` : '';

    return `
      <div class="flow-node">
        <div class="flow-box ${cls}">
          ${badgeHtml}
          <i class="ti ${n.icon} fi" style="color:${iconColor}"></i>
          <span>${n.label.replace('\n', '<br>')}</span>
        </div>
      </div>
      ${arrow}
    `;
  }).join('');
}

function renderPipelinesTable(filter = 'all') {
  const tbody = document.getElementById('pipelinesBody');
  if (!tbody) return;

  const filtered = filter === 'all'
    ? PIPELINES
    : PIPELINES.filter(p => p.status === filter);

  tbody.innerHTML = filtered.map(p => {
    const tagClass = p.status === 'running' ? 'tag-green' :
                     p.status === 'failed'  ? 'tag-red'   :
                     p.status === 'pending' ? 'tag-amber'  : 'tag-blue';
    const slaColor = parseFloat(p.sla) >= 99 ? 'var(--green)' : 'var(--amber)';
    return `
      <tr>
        <td>
          <div style="font-weight:500">${p.name}</div>
          <div style="font-size:10px;color:var(--text2)">${p.category}</div>
        </td>
        <td><span class="tag ${tagClass}">${p.status.toUpperCase()}</span></td>
        <td class="mono">${p.runs}</td>
        <td style="color:${slaColor};font-weight:600;font-size:11px">${p.sla}</td>
        <td style="color:var(--text2);font-size:11px">${p.lastRun}</td>
      </tr>
    `;
  }).join('');
}

function filterPipelines(filter) {
  renderPipelinesTable(filter);
}

function startLogStream() {
  const el = document.getElementById('logStream');
  if (!el || AppState.logInterval) return;

  function addEntry() {
    const log = LOG_MESSAGES[Math.floor(Math.random() * LOG_MESSAGES.length)];
    const ts = new Date().toTimeString().slice(0, 8);
    const div = document.createElement('div');
    div.className = `log-entry log-${log.type}`;
    div.innerHTML = `<span class="log-ts">${ts}</span><span class="log-msg">${log.msg}</span>`;
    el.appendChild(div);
    el.scrollTop = el.scrollHeight;
    if (el.children.length > 60) el.removeChild(el.firstChild);
  }

  // Pre-populate
  for (let i = 0; i < 10; i++) addEntry();
  AppState.logInterval = setInterval(addEntry, 2000);
}

// ═══════════════════════════ SERVICES ═══════════════════════

function initServices() {
  if (AppState.initialized.services) return;
  AppState.initialized.services = true;

  renderServicesKpi();
  renderServicesTable();
  initServiceChart('latency');
}

function renderServicesKpi() {
  const el = document.getElementById('svcKpiStrip');
  if (!el) return;

  const config = [
    {
      label: 'Services Online',
      value: '24',
      unit: '/26',
      delta: '92.3% availability',
      deltaPos: true,
      icon: 'ti-check',
      topColor: '#22c55e',
      iconBg: 'rgba(34,197,94,0.12)',
      iconCol: '#22c55e',
    },
    {
      label: 'API Calls Today',
      value: '4.8',
      unit: 'M',
      delta: '+12% from yesterday',
      deltaPos: true,
      icon: 'ti-api',
      topColor: '#38bdf8',
      iconBg: 'rgba(56,189,248,0.12)',
      iconCol: '#38bdf8',
    },
    {
      label: 'Avg Latency',
      value: '42',
      unit: 'ms',
      delta: 'Within SLA thresholds',
      deltaPos: true,
      icon: 'ti-clock',
      topColor: '#a78bfa',
      iconBg: 'rgba(167,139,250,0.12)',
      iconCol: '#a78bfa',
    },
    {
      label: 'Data Processed',
      value: '3.2',
      unit: 'TB',
      delta: 'Today across all services',
      deltaPos: true,
      icon: 'ti-database',
      topColor: '#f59e0b',
      iconBg: 'rgba(245,158,11,0.12)',
      iconCol: '#f59e0b',
    },
  ];

  renderKpiStrip('svcKpiStrip', config);
}

function renderServicesTable() {
  const tbody = document.getElementById('servicesBody');
  if (!tbody) return;

  tbody.innerHTML = SERVICES.map(s => {
    const statusClass = s.status === 'healthy'  ? 'tag-green' :
                        s.status === 'degraded' ? 'tag-amber'  : 'tag-red';
    const latColor = s.latency === '—'                   ? 'var(--red)'   :
                     parseInt(s.latency) > 100            ? 'var(--amber)' :
                                                            'var(--green)';
    return `
      <tr>
        <td>
          <div style="display:flex;align-items:center;gap:9px">
            <div style="width:30px;height:30px;border-radius:8px;background:${s.color}18;
                        color:${s.color};display:flex;align-items:center;justify-content:center;font-size:15px">
              <i class="ti ${s.icon}"></i>
            </div>
            <div>
              <div style="font-weight:500">${s.name}</div>
            </div>
          </div>
        </td>
        <td><span class="chip blue" style="font-size:9px">${s.type}</span></td>
        <td><span class="tag ${statusClass}">● ${s.status}</span></td>
        <td class="mono">${s.uptime}</td>
        <td class="mono" style="color:${latColor}">${s.latency}</td>
        <td class="mono">${s.rpm}</td>
        <td>
          <div style="display:flex;gap:6px">
            <button class="btn outline sm" onclick="viewService('${s.id}')">
              <i class="ti ti-eye"></i> Monitor
            </button>
            <button class="btn outline sm" onclick="restartService('${s.id}','${s.name}')">
              <i class="ti ti-refresh"></i>
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

function viewService(id) {
  const svc = SERVICES.find(s => s.id === id);
  if (!svc) return;
  showModal('viewService', svc);
}

function restartService(id, name) {
  showToast(`Restart initiated for ${name}`, 'info');
  setTimeout(() => showToast(`${name} restarted successfully`, 'success'), 2500);
}

// ═══════════════════════════ WORKFLOWS ══════════════════════

function initWorkflows() {
  if (AppState.initialized.workflows) return;
  AppState.initialized.workflows = true;

  renderWorkflowGrid();
  renderExecHistory();
  initExecHistChart();
}

function renderWorkflowGrid() {
  const el = document.getElementById('workflowGrid');
  if (!el) return;

  el.innerHTML = WORKFLOWS.map(w => {
    const statusClass = w.status === 'active' ? 'chip green' : 'chip amber';
    return `
      <div class="wf-card">
        <div class="wf-header">
          <div class="wf-name">${w.name}</div>
          <span class="${statusClass}">${w.status}</span>
        </div>
        <div class="wf-desc">${w.desc}</div>
        <div class="wf-footer">
          <div class="wf-stat"><i class="ti ti-refresh"></i>${w.runs.toLocaleString()} runs</div>
          <div class="wf-stat"><i class="ti ti-bolt"></i>${w.triggers}</div>
          <div class="wf-stat"><i class="ti ti-list"></i>${w.steps} steps</div>
        </div>
      </div>
    `;
  }).join('');
}

function renderExecHistory() {
  const tbody = document.getElementById('execBody');
  if (!tbody) return;

  tbody.innerHTML = EXEC_HISTORY.map(e => {
    const resultClass = e.result === 'success' ? 'tag-green' :
                        e.result === 'failed'  ? 'tag-red'   : 'tag-amber';
    return `
      <tr>
        <td style="font-weight:500">${e.workflow}</td>
        <td><span class="chip blue" style="font-size:9px">${e.trigger}</span></td>
        <td class="mono">${e.duration}</td>
        <td class="mono">${e.steps}</td>
        <td><span class="tag ${resultClass}">${e.result}</span></td>
        <td class="mono" style="color:var(--text2)">${e.time}</td>
      </tr>
    `;
  }).join('');
}

// ═══════════════════════════ ANALYTICS ══════════════════════

function initAnalytics() {
  if (AppState.initialized.analytics) return;
  AppState.initialized.analytics = true;

  renderAnalyticsKpis();
  initAnalyticsCharts();
}

function renderAnalyticsKpis() {
  const el = document.getElementById('analyticsKpis');
  if (!el) return;

  const cards = [
    { label: 'Total Executions (MTD)', val: '1.24M', color: '#38bdf8', icon: 'ti-chart-dots' },
    { label: 'Hours Saved (MTD)',       val: '18,400', color: '#22c55e', icon: 'ti-clock-stop' },
    { label: 'Error Rate',              val: '0.6%',  color: '#f59e0b', icon: 'ti-alert-triangle' },
    { label: 'Avg ROI per Workflow',    val: '312%',  color: '#a78bfa', icon: 'ti-trending-up' },
  ];

  el.innerHTML = cards.map(c => `
    <div class="card" style="border-top:2px solid ${c.color}">
      <div class="kpi-icon" style="background:${c.color}18;color:${c.color}">
        <i class="ti ${c.icon}"></i>
      </div>
      <div class="kpi-label">${c.label}</div>
      <div class="kpi-val" style="font-size:22px">${c.val}</div>
    </div>
  `).join('');
}

// ═══════════════════════════ AI OPS ═════════════════════════

function initAiOps() {
  if (AppState.initialized.aiops) return;
  AppState.initialized.aiops = true;

  renderAiKpis();
  renderAnomalyTable();
  initAiAccuracyChart();
  initChat();
}

function renderAiKpis() {
  const el = document.getElementById('aiKpis');
  if (!el) return;

  const cards = [
    { label: 'Model Accuracy',      val: '98.7%', color: '#22c55e', icon: 'ti-target' },
    { label: 'Inference Time',      val: '12ms',  color: '#38bdf8', icon: 'ti-bolt' },
    { label: 'Anomalies Detected',  val: '284',   color: '#a78bfa', icon: 'ti-radar-2' },
    { label: 'Auto-resolved',       val: '99.1%', color: '#f59e0b', icon: 'ti-check-circle' },
  ];

  el.innerHTML = cards.map(c => `
    <div class="card" style="border-top:2px solid ${c.color}">
      <div class="kpi-icon" style="background:${c.color}18;color:${c.color}">
        <i class="ti ${c.icon}"></i>
      </div>
      <div class="kpi-label">${c.label}</div>
      <div class="kpi-val" style="font-size:22px">${c.val}</div>
    </div>
  `).join('');
}

function renderAnomalyTable() {
  const tbody = document.getElementById('anomalyBody');
  if (!tbody) return;

  tbody.innerHTML = ANOMALIES.map(a => {
    const sevClass = a.severity === 'critical' ? 'tag-red' :
                     a.severity === 'warning'  ? 'tag-amber' : 'tag-blue';
    const stClass  = a.status === 'resolved'    ? 'tag-green' :
                     a.status === 'in-progress' ? 'tag-amber'  : 'tag-blue';
    const confColor = parseFloat(a.confidence) > 90 ? 'var(--green)' : 'var(--amber)';
    return `
      <tr>
        <td class="mono" style="color:var(--text2)">${a.time}</td>
        <td style="font-weight:500">${a.service}</td>
        <td>${a.type}</td>
        <td><span class="tag ${sevClass}">${a.severity}</span></td>
        <td class="mono" style="color:${confColor}">${a.confidence}</td>
        <td style="font-size:11px;color:var(--text2)">${a.action}</td>
        <td><span class="tag ${stClass}">${a.status}</span></td>
      </tr>
    `;
  }).join('');
}

// ── CHAT ─────────────────────────────────────────────────────

const chatHistory = [];

function initChat() {
  chatHistory.length = 0;
  const el = document.getElementById('chatMessages');
  if (!el) return;

  el.innerHTML = '';
  addChatMessage('ai', '👋 Hello! I\'m your AI Ops assistant. I\'ve detected a critical incident: **Oracle DB is down**. I\'ve activated the read-replica failover and paused 10 dependent pipelines. How can I assist you?');
}

function addChatMessage(role, text) {
  const el = document.getElementById('chatMessages');
  if (!el) return;

  chatHistory.push({ role, text });

  const div = document.createElement('div');
  div.className = `chat-msg ${role === 'user' ? 'user-msg' : 'ai-msg'}`;
  div.innerHTML = `
    <div class="chat-avatar">
      <i class="ti ${role === 'user' ? 'ti-user' : 'ti-brain'}"></i>
    </div>
    <div class="chat-bubble">${text}</div>
  `;
  el.appendChild(div);
  el.scrollTop = el.scrollHeight;
}

function addTypingIndicator() {
  const el = document.getElementById('chatMessages');
  if (!el) return;
  const div = document.createElement('div');
  div.className = 'chat-msg ai-msg';
  div.id = 'typing-indicator';
  div.innerHTML = `
    <div class="chat-avatar"><i class="ti ti-brain"></i></div>
    <div class="chat-bubble">
      <div class="typing-dots">
        <div class="tdot"></div>
        <div class="tdot"></div>
        <div class="tdot"></div>
      </div>
    </div>
  `;
  el.appendChild(div);
  el.scrollTop = el.scrollHeight;
}

function removeTypingIndicator() {
  const el = document.getElementById('typing-indicator');
  if (el) el.remove();
}

async function sendMessage() {
  const input = document.getElementById('chatInput');
  const sendBtn = document.getElementById('sendBtn');
  const text = input.value.trim();
  if (!text) return;

  input.value = '';
  sendBtn.disabled = true;
  addChatMessage('user', text);
  addTypingIndicator();

  try {
    const reply = await callAI(text);
    removeTypingIndicator();
    addChatMessage('ai', reply);
  } catch (e) {
    removeTypingIndicator();
    // Fallback to local replies
    const localReply = AI_REPLIES[Math.floor(Math.random() * AI_REPLIES.length)];
    addChatMessage('ai', localReply);
  }

  sendBtn.disabled = false;
}

// ── PIPELINE EDIT/IMPORT ─────────────────────────────────────

function editPipeline() {
  showModal('editPipeline');
}

function importPipeline() {
  showModal('importPipeline');
}
