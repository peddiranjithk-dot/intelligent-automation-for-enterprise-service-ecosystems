/* ═══════════════════════════════════════════════════════════
   IAES — Data Layer
   All application data, constants, and state management
   ═══════════════════════════════════════════════════════════ */

'use strict';

// ── APP STATE ───────────────────────────────────────────────
const AppState = {
  currentPage: 'dashboard',
  charts: {},
  logInterval: null,
  kpiInterval: null,
  notifications: [],
  initialized: {},
};

// ── PIPELINE DATA ───────────────────────────────────────────
const PIPELINES = [
  {
    id: 'p001',
    name: 'Order Fulfillment Engine',
    status: 'running',
    progress: 67,
    runs: '48,240',
    sla: '99.1%',
    lastRun: '2s ago',
    avgTime: '0.8s',
    category: 'Commerce',
  },
  {
    id: 'p002',
    name: 'Customer Onboarding Flow',
    status: 'running',
    progress: 34,
    runs: '12,804',
    sla: '98.7%',
    lastRun: '18s ago',
    avgTime: '2.4s',
    category: 'CRM',
  },
  {
    id: 'p003',
    name: 'Incident Response Bot',
    status: 'pending',
    progress: 0,
    runs: '3,412',
    sla: '100%',
    lastRun: '4m ago',
    avgTime: '0.3s',
    category: 'ITSM',
  },
  {
    id: 'p004',
    name: 'Invoice Processing AI',
    status: 'running',
    progress: 89,
    runs: '22,108',
    sla: '97.4%',
    lastRun: '1s ago',
    avgTime: '1.1s',
    category: 'Finance',
  },
  {
    id: 'p005',
    name: 'HR Workflow Engine',
    status: 'idle',
    progress: 0,
    runs: '6,712',
    sla: '99.9%',
    lastRun: '12m ago',
    avgTime: '3.2s',
    category: 'HR',
  },
  {
    id: 'p006',
    name: 'Compliance Auditor',
    status: 'running',
    progress: 52,
    runs: '1,024',
    sla: '100%',
    lastRun: '8s ago',
    avgTime: '4.8s',
    category: 'Legal',
  },
  {
    id: 'p007',
    name: 'Data Sync Orchestrator',
    status: 'failed',
    progress: 0,
    runs: '9,844',
    sla: '94.2%',
    lastRun: '3m ago',
    avgTime: '0.5s',
    category: 'Data',
  },
];

// ── SERVICE DATA ────────────────────────────────────────────
const SERVICES = [
  { id:'s01', name:'Salesforce CRM',   type:'CRM',       status:'healthy',  uptime:'99.98%', latency:'28ms',  rpm:'4,200',  icon:'ti-cloud',          color:'#3b82f6' },
  { id:'s02', name:'SAP ERP',          type:'ERP',       status:'healthy',  uptime:'99.95%', latency:'45ms',  rpm:'2,800',  icon:'ti-building-bank',  color:'#f59e0b' },
  { id:'s03', name:'ServiceNow ITSM',  type:'ITSM',      status:'healthy',  uptime:'100%',   latency:'31ms',  rpm:'1,900',  icon:'ti-headset',        color:'#10b981' },
  { id:'s04', name:'Microsoft Teams',  type:'Collab',    status:'healthy',  uptime:'99.99%', latency:'15ms',  rpm:'8,100',  icon:'ti-brand-teams',    color:'#8b5cf6' },
  { id:'s05', name:'Workday HCM',      type:'HR',        status:'degraded', uptime:'98.12%', latency:'180ms', rpm:'620',    icon:'ti-users-group',    color:'#f59e0b' },
  { id:'s06', name:'AWS S3',           type:'Storage',   status:'healthy',  uptime:'100%',   latency:'12ms',  rpm:'15,400', icon:'ti-database',       color:'#06b6d4' },
  { id:'s07', name:'Apache Kafka',     type:'Messaging', status:'healthy',  uptime:'99.97%', latency:'4ms',   rpm:'42,000', icon:'ti-topology-star',  color:'#ec4899' },
  { id:'s08', name:'Oracle Database',  type:'Database',  status:'down',     uptime:'94.20%', latency:'—',     rpm:'0',      icon:'ti-database-cog',   color:'#f43f5e' },
  { id:'s09', name:'Twilio SMS/Voice', type:'Comms',     status:'healthy',  uptime:'99.80%', latency:'62ms',  rpm:'1,200',  icon:'ti-message-dots',   color:'#f97316' },
  { id:'s10', name:'Stripe Payments',  type:'Finance',   status:'healthy',  uptime:'100%',   latency:'95ms',  rpm:'3,100',  icon:'ti-credit-card',    color:'#6366f1' },
  { id:'s11', name:'Snowflake DW',     type:'Analytics', status:'healthy',  uptime:'99.92%', latency:'210ms', rpm:'380',    icon:'ti-snowflake',      color:'#38bdf8' },
  { id:'s12', name:'Jira Projects',    type:'PM',        status:'healthy',  uptime:'99.90%', latency:'55ms',  rpm:'940',    icon:'ti-brand-jira',     color:'#a78bfa' },
];

// ── WORKFLOW DATA ───────────────────────────────────────────
const WORKFLOWS = [
  {
    id: 'w001', name: 'Smart Ticket Router',
    desc: 'AI-powered ITSM ticket classification and routing',
    status: 'active', runs: 8420, category: 'ITSM',
    triggers: 'Event', steps: 7,
  },
  {
    id: 'w002', name: 'Invoice Auto-Approver',
    desc: 'ML model validates invoices against PO data',
    status: 'active', runs: 5104, category: 'Finance',
    triggers: 'Schedule', steps: 5,
  },
  {
    id: 'w003', name: 'Employee Onboarding',
    desc: 'End-to-end employee provisioning across HR, IT, Facilities',
    status: 'active', runs: 312, category: 'HR',
    triggers: 'API', steps: 12,
  },
  {
    id: 'w004', name: 'Anomaly Alert Handler',
    desc: 'Detects, triages and escalates infrastructure anomalies',
    status: 'paused', runs: 1984, category: 'Ops',
    triggers: 'Webhook', steps: 9,
  },
  {
    id: 'w005', name: 'Contract Compliance Scan',
    desc: 'NLP review of vendor contracts for compliance flags',
    status: 'active', runs: 204, category: 'Legal',
    triggers: 'Manual', steps: 6,
  },
  {
    id: 'w006', name: 'Customer Sentiment Monitor',
    desc: 'Real-time analysis of support tickets and reviews',
    status: 'active', runs: 11240, category: 'CX',
    triggers: 'Stream', steps: 4,
  },
];

// ── ANOMALY DATA ────────────────────────────────────────────
const ANOMALIES = [
  {
    time: '14:32:01',
    service: 'Oracle Database',
    type: 'Connection Loss',
    severity: 'critical',
    confidence: '99.8%',
    action: 'Failover Activated',
    status: 'resolved',
  },
  {
    time: '14:21:44',
    service: 'Workday HCM',
    type: 'Latency Spike',
    severity: 'warning',
    confidence: '94.1%',
    action: 'Root Cause Analysis',
    status: 'in-progress',
  },
  {
    time: '13:58:12',
    service: 'Apache Kafka',
    type: 'Consumer Lag Spike',
    severity: 'warning',
    confidence: '87.3%',
    action: 'Auto-scaled +4 nodes',
    status: 'resolved',
  },
  {
    time: '13:12:08',
    service: 'Salesforce CRM',
    type: 'Auth Token Timeout',
    severity: 'info',
    confidence: '76.2%',
    action: 'Token Refresh Applied',
    status: 'resolved',
  },
  {
    time: '12:44:55',
    service: 'SAP ERP',
    type: 'Unusual Query Volume',
    severity: 'info',
    confidence: '81.6%',
    action: 'Rate Limit Applied',
    status: 'resolved',
  },
  {
    time: '11:30:22',
    service: 'Snowflake DW',
    type: 'Long Running Query',
    severity: 'warning',
    confidence: '91.4%',
    action: 'Query Terminated',
    status: 'resolved',
  },
];

// ── LOG MESSAGES ────────────────────────────────────────────
const LOG_MESSAGES = [
  { type: 'ok',    msg: '[order-fulfillment] Task #48231 completed successfully in 0.7s' },
  { type: 'info',  msg: '[ai-router] Inference result: 98.4% confidence → route:express-lane' },
  { type: 'ok',    msg: '[invoice-proc] Batch #1204 validated: 48 invoices, 0 rejected' },
  { type: 'warn',  msg: '[workday-hcm] Retry attempt #2 for task #8821 — timeout exceeded' },
  { type: 'ok',    msg: '[kafka-consumer] 14,200 events consumed in partition 0-11 @ 1.2s' },
  { type: 'info',  msg: '[auto-scaler] Scaling decision: +4 workers applied to fulfillment pool' },
  { type: 'err',   msg: '[oracle-db] Connection pool exhausted (32/32). Failover is active.' },
  { type: 'ok',    msg: '[stripe] Payment auth #9944 approved: ₹1,82,400 — 0.19s' },
  { type: 'info',  msg: '[compliance-scan] Contract #CON-2204 passed 47/50 checks (3 warnings)' },
  { type: 'ok',    msg: '[onboarding-wf] Employee #EMP-4821 provisioned: AD, Slack, Jira, AWS' },
  { type: 'warn',  msg: '[anomaly-detect] Latency model flagged Workday HCM — confidence: 94.1%' },
  { type: 'ok',    msg: '[servicenow] 12 tickets auto-resolved by KB matcher — 0 escalations' },
  { type: 'info',  msg: '[sentiment-monitor] Batch #SM-882: avg score 7.2/10 (↑ 0.4 from yesterday)' },
  { type: 'debug', msg: '[scheduler] Next cron: invoice-scan @ 15:00:00 IST' },
];

// ── NOTIFICATIONS ───────────────────────────────────────────
const INITIAL_NOTIFICATIONS = [
  {
    id: 'n1',
    type: 'critical',
    icon: 'ti-alert-circle',
    color: '#f43f5e',
    title: 'Oracle DB Connection Lost',
    desc: '10 dependent pipelines paused. Failover active.',
    time: '2 min ago',
  },
  {
    id: 'n2',
    type: 'warning',
    icon: 'ti-activity',
    color: '#f59e0b',
    title: 'Workday HCM Latency Spike',
    desc: 'Response time 4× baseline (180ms vs 42ms avg).',
    time: '11 min ago',
  },
  {
    id: 'n3',
    type: 'info',
    icon: 'ti-arrow-up',
    color: '#38bdf8',
    title: 'Auto-scaling Triggered',
    desc: 'Kafka cluster scaled 8 → 12 nodes due to load.',
    time: '18 min ago',
  },
];

// ── EXECUTION HISTORY ───────────────────────────────────────
const EXEC_HISTORY = [
  { workflow: 'Smart Ticket Router',    trigger: 'API Event',   duration: '0.4s', steps: '7/7',   result: 'success', time: '14:32:11' },
  { workflow: 'Invoice Auto-Approver',  trigger: 'Schedule',    duration: '1.2s', steps: '5/5',   result: 'success', time: '14:31:00' },
  { workflow: 'Employee Onboarding',    trigger: 'Manual',      duration: '4.8s', steps: '12/12', result: 'success', time: '14:28:44' },
  { workflow: 'Anomaly Alert Handler',  trigger: 'Webhook',     duration: '0.2s', steps: '3/9',   result: 'failed',  time: '14:21:33' },
  { workflow: 'Customer Sentiment Mon', trigger: 'Stream',      duration: '0.8s', steps: '4/4',   result: 'success', time: '14:18:00' },
  { workflow: 'Contract Compliance',    trigger: 'Manual',      duration: '8.1s', steps: '6/6',   result: 'success', time: '14:05:22' },
  { workflow: 'Smart Ticket Router',    trigger: 'API Event',   duration: '0.3s', steps: '7/7',   result: 'success', time: '14:00:01' },
  { workflow: 'Invoice Auto-Approver',  trigger: 'Schedule',    duration: '1.4s', steps: '5/5',   result: 'warning', time: '13:45:00' },
];

// ── CHART COLOR HELPERS ─────────────────────────────────────
const CHART_COLORS = {
  blue:   '#3b82f6',
  green:  '#22c55e',
  amber:  '#f59e0b',
  red:    '#f43f5e',
  purple: '#a78bfa',
  teal:   '#2dd4bf',
  pink:   '#f472b6',
  cyan:   '#38bdf8',
};

// ── KPI CONFIG ──────────────────────────────────────────────
const KPI_CONFIG = [
  {
    label: 'Automations Running',
    value: '2,847',
    id: 'kpi-automations',
    unit: '',
    delta: '+14.2% this week',
    deltaPos: true,
    icon: 'ti-check',
    topColor: '#22c55e',
    iconBg: 'rgba(34,197,94,0.12)',
    iconCol: '#22c55e',
  },
  {
    label: 'Avg. Resolution Time',
    value: '1.4',
    id: 'kpi-resolution',
    unit: 'min',
    delta: '78% faster than manual',
    deltaPos: true,
    icon: 'ti-clock',
    topColor: '#38bdf8',
    iconBg: 'rgba(56,189,248,0.12)',
    iconCol: '#38bdf8',
  },
  {
    label: 'AI Decisions Today',
    value: '94.3',
    id: 'kpi-ai',
    unit: 'K',
    delta: '+31% month over month',
    deltaPos: true,
    icon: 'ti-brain',
    topColor: '#a78bfa',
    iconBg: 'rgba(167,139,250,0.12)',
    iconCol: '#a78bfa',
  },
  {
    label: 'Cost Savings (MTD)',
    value: '$2.1',
    id: 'kpi-savings',
    unit: 'M',
    delta: 'ROI: 340%',
    deltaPos: true,
    icon: 'ti-currency-dollar',
    topColor: '#f59e0b',
    iconBg: 'rgba(245,158,11,0.12)',
    iconCol: '#f59e0b',
  },
];

// ── AI CHAT CONFIG ──────────────────────────────────────────
const AI_REPLIES = [
  'Analyzing your request across 26 connected services... I\'ve detected 3 correlated anomalies. The pattern suggests a network partition event in the primary data center. I recommend activating DR Protocol B immediately.',
  'Current throughput is 147 tasks/min — 12% above the 7-day moving average. All SLAs are within bounds. The Kafka consumer lag from earlier has been mitigated by the auto-scaling event.',
  'Root cause analysis for Workday HCM latency: certificate renewal caused connection pool starvation. I\'ve applied an automated token refresh. Expect full recovery within 4 minutes.',
  'Cost optimization opportunity: 3 idle automation workers have been running since 14:00. Scheduling a scale-down action would save approximately ₹98,000 per month. Shall I proceed?',
  'The Oracle DB failover to the read-replica completed in 4.2s. 10 paused pipelines have resumed processing. I\'m monitoring replication lag — currently at 0.8s, within acceptable thresholds.',
  'Compliance scan result for the last 24 hours: 2,204 contracts reviewed, 12 flagged for human review (0.54% flag rate), 8 auto-resolved via policy rules. No critical violations detected.',
  'Predictive model indicates a 78% probability of a load spike on the Order Fulfillment pipeline between 16:00–18:00 IST today. Pre-scaling from 8 to 14 workers is recommended. Confirm?',
];

const SYSTEM_CONTEXT = `You are an AI Operations Assistant for IAES (Intelligent Automation for Enterprise Service Ecosystems). 
You help enterprise teams monitor, manage and optimize their automation pipelines, service health, and AI-driven workflows.
Current system state: 24 services online (1 degraded - Workday HCM, 1 down - Oracle DB), 
12 active pipelines, 94.3K AI decisions made today, 99.1% auto-resolution rate.
Be concise, technical, and actionable. Focus on enterprise operations context.`;
