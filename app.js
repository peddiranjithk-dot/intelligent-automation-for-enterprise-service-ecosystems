/* ═══════════════════════════════════════════════════════════
   IAES — App Controller
   Navigation, modals, notifications, toast system
   ═══════════════════════════════════════════════════════════ */

'use strict';

// ── NAVIGATION ──────────────────────────────────────────────

function navigate(page) {
  // Update URL hash (for bookmarkability)
  location.hash = page;

  // Deactivate all pages
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-link, .sidebar-item').forEach(a => a.classList.remove('active'));

  // Activate target
  const pageEl = document.getElementById(`page-${page}`);
  if (pageEl) pageEl.classList.add('active');

  document.querySelectorAll(`[data-page="${page}"]`).forEach(a => a.classList.add('active'));

  AppState.currentPage = page;

  // Initialize page if needed
  switch (page) {
    case 'dashboard': initDashboard();   break;
    case 'pipelines': initPipelines();   break;
    case 'services':  initServices();    break;
    case 'workflows': initWorkflows();   break;
    case 'analytics': initAnalytics();   break;
    case 'aiops':     initAiOps();       break;
  }

  // Close notifications panel
  closeNotifPanel();
}

// ── MODAL SYSTEM ─────────────────────────────────────────────

const MODAL_TEMPLATES = {
  newWorkflow: {
    title: 'Create New Workflow',
    body: `
      <div class="form-group">
        <label class="form-label">Workflow Name</label>
        <input class="form-input" placeholder="e.g. Invoice Auto-Approver" />
      </div>
      <div class="form-group">
        <label class="form-label">Category</label>
        <select class="form-select">
          <option>Finance</option>
          <option>ITSM</option>
          <option>HR</option>
          <option>Commerce</option>
          <option>Data</option>
          <option>Legal</option>
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">Trigger Type</label>
        <select class="form-select">
          <option>API Event</option>
          <option>Schedule (Cron)</option>
          <option>Webhook</option>
          <option>Manual</option>
          <option>Stream</option>
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">Description</label>
        <input class="form-input" placeholder="Describe what this workflow does..." />
      </div>
      <div class="form-group">
        <label class="form-label">AI Model</label>
        <select class="form-select">
          <option>claude-sonnet-4-20250514 (Recommended)</option>
          <option>claude-opus-4-6 (Complex reasoning)</option>
          <option>claude-haiku-4-5 (Fast, lightweight)</option>
          <option>None (Rule-based only)</option>
        </select>
      </div>
      <div class="modal-footer">
        <button class="btn outline" onclick="closeModal()">Cancel</button>
        <button class="btn primary" onclick="createWorkflow()">
          <i class="ti ti-plus"></i> Create Workflow
        </button>
      </div>
    `,
  },

  newPipeline: {
    title: 'Create New Pipeline',
    body: `
      <div class="form-group">
        <label class="form-label">Pipeline Name</label>
        <input class="form-input" placeholder="e.g. Customer Churn Prevention" />
      </div>
      <div class="form-group">
        <label class="form-label">Source Service</label>
        <select class="form-select">
          <option>Salesforce CRM</option>
          <option>ServiceNow ITSM</option>
          <option>Apache Kafka</option>
          <option>AWS S3</option>
          <option>SAP ERP</option>
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">Target Service</label>
        <select class="form-select">
          <option>SAP ERP</option>
          <option>Oracle Database</option>
          <option>Stripe Payments</option>
          <option>Twilio SMS/Voice</option>
          <option>Microsoft Teams</option>
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">SLA Target</label>
        <input class="form-input" type="text" placeholder="e.g. 99.5%" value="99.5%" />
      </div>
      <div class="modal-footer">
        <button class="btn outline" onclick="closeModal()">Cancel</button>
        <button class="btn primary" onclick="createPipeline()">
          <i class="ti ti-git-branch"></i> Create Pipeline
        </button>
      </div>
    `,
  },

  connectService: {
    title: 'Connect New Service',
    body: `
      <p style="font-size:12px;color:var(--text2);margin-bottom:16px">
        Choose from pre-built connectors or configure a custom integration.
      </p>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:16px">
        ${[
          { icon: 'ti-brand-salesforce', name: 'Salesforce', color: '#38bdf8' },
          { icon: 'ti-building-bank',    name: 'SAP ERP',    color: '#f59e0b' },
          { icon: 'ti-headset',          name: 'Zendesk',    color: '#22c55e' },
          { icon: 'ti-brand-slack',      name: 'Slack',      color: '#a78bfa' },
          { icon: 'ti-database',         name: 'PostgreSQL', color: '#06b6d4' },
          { icon: 'ti-brand-aws',        name: 'AWS SNS',    color: '#f97316' },
        ].map(s => `
          <div class="wf-card" onclick="selectConnector('${s.name}')" style="cursor:pointer">
            <div style="display:flex;align-items:center;gap:8px">
              <div style="width:30px;height:30px;border-radius:7px;background:${s.color}18;
                          color:${s.color};display:flex;align-items:center;justify-content:center;font-size:16px">
                <i class="ti ${s.icon}"></i>
              </div>
              <span style="font-size:12px;font-weight:500">${s.name}</span>
            </div>
          </div>
        `).join('')}
      </div>
      <div class="modal-footer">
        <button class="btn outline" onclick="closeModal()">Cancel</button>
        <button class="btn primary" onclick="connectCustomService()">
          <i class="ti ti-plug"></i> Custom Connector
        </button>
      </div>
    `,
  },

  editPipeline: {
    title: 'Edit Pipeline: Order Processing',
    body: `
      <div class="form-group">
        <label class="form-label">Pipeline Name</label>
        <input class="form-input" value="Order Fulfillment Engine" />
      </div>
      <div class="form-group">
        <label class="form-label">SLA Target</label>
        <input class="form-input" value="99.5%" />
      </div>
      <div class="form-group">
        <label class="form-label">Max Retries</label>
        <input class="form-input" type="number" value="3" />
      </div>
      <div class="form-group">
        <label class="form-label">Timeout (seconds)</label>
        <input class="form-input" type="number" value="30" />
      </div>
      <div class="modal-footer">
        <button class="btn danger" onclick="closeModal()"><i class="ti ti-trash"></i> Delete</button>
        <button class="btn outline" onclick="closeModal()">Cancel</button>
        <button class="btn primary" onclick="savePipeline()">Save Changes</button>
      </div>
    `,
  },

  importPipeline: {
    title: 'Import Pipeline',
    body: `
      <p style="font-size:12px;color:var(--text2);margin-bottom:16px">
        Import a pipeline definition from a JSON or YAML file.
      </p>
      <div style="border:2px dashed var(--border2);border-radius:10px;padding:32px;text-align:center;cursor:pointer;margin-bottom:16px"
           onclick="this.querySelector('input').click()">
        <i class="ti ti-upload" style="font-size:28px;color:var(--text3);display:block;margin-bottom:8px"></i>
        <div style="font-size:12px;color:var(--text2)">Drop a file here or click to browse</div>
        <div style="font-size:10px;color:var(--text3);margin-top:4px">Supports .json, .yaml, .yml</div>
        <input type="file" accept=".json,.yaml,.yml" style="display:none" onchange="handleImport(this)" />
      </div>
      <div class="modal-footer">
        <button class="btn outline" onclick="closeModal()">Cancel</button>
        <button class="btn primary" onclick="closeModal();showToast('Import complete','success')">
          <i class="ti ti-check"></i> Import
        </button>
      </div>
    `,
  },

  viewService: {
    title: '',
    body: '',
  },
};

function showModal(type, data) {
  const overlay = document.getElementById('modalOverlay');
  const titleEl = document.getElementById('modalTitle');
  const bodyEl  = document.getElementById('modalBody');

  if (!overlay) return;

  let tpl = MODAL_TEMPLATES[type];

  // Dynamic: viewService
  if (type === 'viewService' && data) {
    const statusColor = data.status === 'healthy' ? '#22c55e' :
                        data.status === 'degraded' ? '#f59e0b' : '#f43f5e';
    tpl = {
      title: data.name,
      body: `
        <div style="display:flex;align-items:center;gap:12px;margin-bottom:20px">
          <div style="width:48px;height:48px;border-radius:12px;background:${data.color}18;color:${data.color};
                      display:flex;align-items:center;justify-content:center;font-size:22px">
            <i class="ti ${data.icon}"></i>
          </div>
          <div>
            <div style="font-size:13px;font-weight:600">${data.name}</div>
            <div style="font-size:11px;color:var(--text2)">${data.type} Service</div>
          </div>
          <span class="chip" style="margin-left:auto;background:${statusColor}18;color:${statusColor};border-color:${statusColor}44">
            ● ${data.status}
          </span>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:16px">
          ${[
            { label: 'Uptime (30d)', val: data.uptime },
            { label: 'Avg Latency',  val: data.latency },
            { label: 'Requests/min', val: data.rpm },
            { label: 'Service ID',   val: data.id.toUpperCase() },
          ].map(r => `
            <div class="mini-stat-card" style="text-align:left">
              <div style="font-size:10px;color:var(--text2);margin-bottom:4px">${r.label}</div>
              <div style="font-size:16px;font-weight:600;font-family:'DM Mono',monospace">${r.val}</div>
            </div>
          `).join('')}
        </div>
        <div class="modal-footer">
          <button class="btn outline" onclick="closeModal()">Close</button>
          <button class="btn primary" onclick="closeModal();showToast('Monitoring dashboard opened','info')">
            <i class="ti ti-external-link"></i> Open Dashboard
          </button>
        </div>
      `,
    };
  }

  if (!tpl) return;

  titleEl.textContent = tpl.title;
  bodyEl.innerHTML    = tpl.body;
  overlay.classList.add('open');
}

function closeModal() {
  document.getElementById('modalOverlay')?.classList.remove('open');
}

// ── MODAL ACTIONS ─────────────────────────────────────────────

function createWorkflow() {
  closeModal();
  showToast('Workflow created successfully', 'success');
}

function createPipeline() {
  closeModal();
  showToast('Pipeline created and deploying...', 'success');
}

function savePipeline() {
  closeModal();
  showToast('Pipeline configuration saved', 'success');
}

function selectConnector(name) {
  closeModal();
  showToast(`Connecting to ${name}...`, 'info');
  setTimeout(() => showToast(`${name} connected successfully`, 'success'), 1800);
}

function connectCustomService() {
  closeModal();
  showToast('Custom connector wizard opened', 'info');
}

function handleImport(input) {
  if (input.files.length > 0) {
    showToast(`Parsing ${input.files[0].name}...`, 'info');
  }
}

// ── NOTIFICATIONS ─────────────────────────────────────────────

function initNotifications() {
  AppState.notifications = [...INITIAL_NOTIFICATIONS];
  renderNotifications();

  document.getElementById('notifBtn')?.addEventListener('click', toggleNotifPanel);
  document.addEventListener('click', (e) => {
    if (!e.target.closest('#notifPanel') && !e.target.closest('#notifBtn')) {
      closeNotifPanel();
    }
  });
}

function toggleNotifPanel() {
  document.getElementById('notifPanel')?.classList.toggle('open');
}

function closeNotifPanel() {
  document.getElementById('notifPanel')?.classList.remove('open');
}

function renderNotifications() {
  const listEl = document.getElementById('notifList');
  const badgeEl = document.getElementById('notifBadge');
  if (!listEl) return;

  listEl.innerHTML = AppState.notifications.length
    ? AppState.notifications.map(n => `
        <div class="notif-item" onclick="clearNotif('${n.id}')">
          <i class="ti ${n.icon} notif-item-icon" style="color:${n.color}"></i>
          <div>
            <div class="notif-item-title">${n.title}</div>
            <div class="notif-item-desc">${n.desc}</div>
            <div class="notif-item-ts">${n.time}</div>
          </div>
        </div>
      `).join('')
    : '<div style="padding:20px;text-align:center;color:var(--text3);font-size:12px">No notifications</div>';

  if (badgeEl) {
    badgeEl.textContent = AppState.notifications.length;
    badgeEl.style.display = AppState.notifications.length ? 'flex' : 'none';
  }
}

function clearNotif(id) {
  AppState.notifications = AppState.notifications.filter(n => n.id !== id);
  renderNotifications();
}

function clearNotifs() {
  AppState.notifications = [];
  renderNotifications();
  closeNotifPanel();
}

// ── TOAST SYSTEM ──────────────────────────────────────────────

const toastContainer = (() => {
  const el = document.createElement('div');
  el.style.cssText = `
    position:fixed;bottom:20px;right:20px;z-index:9999;
    display:flex;flex-direction:column;gap:8px;
  `;
  document.body.appendChild(el);
  return el;
})();

function showToast(message, type = 'info') {
  const colors = {
    success: { bg: 'rgba(34,197,94,0.12)',  border: 'rgba(34,197,94,0.3)',  icon: 'ti-check',   col: '#22c55e' },
    error:   { bg: 'rgba(244,63,94,0.12)',  border: 'rgba(244,63,94,0.3)',  icon: 'ti-x',       col: '#f43f5e' },
    warning: { bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.3)', icon: 'ti-alert',   col: '#f59e0b' },
    info:    { bg: 'rgba(56,189,248,0.12)', border: 'rgba(56,189,248,0.3)', icon: 'ti-info-circle', col: '#38bdf8' },
  };
  const c = colors[type] || colors.info;

  const el = document.createElement('div');
  el.style.cssText = `
    display:flex;align-items:center;gap:10px;
    padding:11px 14px;
    background:${c.bg};
    border:1px solid ${c.border};
    border-radius:10px;
    font-size:12px;
    color:var(--text);
    box-shadow:0 4px 20px rgba(0,0,0,0.4);
    animation:toastIn 0.25s ease;
    max-width:300px;
    font-family:'DM Sans',sans-serif;
  `;
  el.innerHTML = `
    <i class="ti ${c.icon}" style="color:${c.col};font-size:15px;flex-shrink:0"></i>
    <span>${message}</span>
  `;

  toastContainer.appendChild(el);

  const style = document.createElement('style');
  style.textContent = `@keyframes toastIn{from{opacity:0;transform:translateX(16px)}to{opacity:1;transform:none}}`;
  document.head.appendChild(style);

  setTimeout(() => {
    el.style.opacity = '0';
    el.style.transition = 'opacity 0.3s';
    setTimeout(() => el.remove(), 300);
  }, 3500);
}

// ── KEYBOARD SHORTCUTS ────────────────────────────────────────

document.addEventListener('keydown', (e) => {
  if (e.ctrlKey || e.metaKey) {
    switch (e.key) {
      case '1': e.preventDefault(); navigate('dashboard'); break;
      case '2': e.preventDefault(); navigate('pipelines'); break;
      case '3': e.preventDefault(); navigate('services');  break;
      case '4': e.preventDefault(); navigate('workflows'); break;
      case '5': e.preventDefault(); navigate('analytics'); break;
      case '6': e.preventDefault(); navigate('aiops');     break;
    }
  }
  if (e.key === 'Escape') {
    closeModal();
    closeNotifPanel();
  }
});

// ── NAV CLICK HANDLERS ────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  // Attach nav clicks
  document.querySelectorAll('[data-page]').forEach(el => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      navigate(el.dataset.page);
    });
  });

  // Initialize notifications
  initNotifications();

  // Read hash on load
  const hash = location.hash.replace('#', '');
  const validPages = ['dashboard', 'pipelines', 'services', 'workflows', 'analytics', 'aiops'];
  const startPage = validPages.includes(hash) ? hash : 'dashboard';
  navigate(startPage);

  // Show welcome toast
  setTimeout(() => showToast('IAES Platform loaded — 26 services monitored', 'success'), 800);
});

// Handle hash change
window.addEventListener('hashchange', () => {
  const page = location.hash.replace('#', '');
  if (page && page !== AppState.currentPage) navigate(page);
});
