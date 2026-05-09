/* ═══════════════════════════════════════════════════════════
   IAES — Charts Module
   All Chart.js chart definitions and update functions
   ═══════════════════════════════════════════════════════════ */

'use strict';

// ── GLOBAL CHART DEFAULTS ───────────────────────────────────
Chart.defaults.color = '#4a5568';
Chart.defaults.borderColor = 'rgba(56,189,248,0.08)';
Chart.defaults.font.family = "'DM Sans', sans-serif";
Chart.defaults.font.size = 11;

// ── HELPER: generate random hourly data ────────────────────
function hourlyData(base, variance, hours = 24) {
  return Array.from({ length: hours }, () =>
    Math.round(base + (Math.random() - 0.5) * variance * 2)
  );
}

function hourLabels(count = 24) {
  const labels = [];
  for (let i = count - 1; i >= 0; i--) {
    labels.push(i === 0 ? 'Now' : `${i}h`);
  }
  return labels;
}

// ── THROUGHPUT CHART ────────────────────────────────────────
function initThroughputChart() {
  const ctx = document.getElementById('throughputChart');
  if (!ctx || AppState.charts.throughput) return;

  const data = hourlyData(120, 60);
  AppState.charts.throughput = new Chart(ctx, {
    type: 'line',
    data: {
      labels: hourLabels(),
      datasets: [
        {
          label: 'Throughput',
          data,
          borderColor: '#38bdf8',
          backgroundColor: 'rgba(56,189,248,0.07)',
          fill: true,
          tension: 0.45,
          pointRadius: 0,
          pointHoverRadius: 4,
          borderWidth: 2,
        },
        {
          label: 'AI-handled',
          data: data.map(v => Math.round(v * 0.78)),
          borderColor: '#a78bfa',
          backgroundColor: 'rgba(167,139,250,0.04)',
          fill: true,
          tension: 0.45,
          pointRadius: 0,
          pointHoverRadius: 4,
          borderWidth: 1.5,
          borderDash: [4, 4],
        },
      ],
    },
    options: {
      responsive: true,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: {
          position: 'top',
          labels: { boxWidth: 10, padding: 14, font: { size: 10 } },
        },
        tooltip: {
          callbacks: {
            label: (c) => ` ${c.dataset.label}: ${c.parsed.y} tasks/min`,
          },
        },
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { maxTicksLimit: 10, font: { size: 9 } },
        },
        y: {
          grid: { color: 'rgba(56,189,248,0.05)' },
          ticks: { font: { size: 9 } },
        },
      },
    },
  });
}

// ── DONUT CHART ─────────────────────────────────────────────
function initDonutChart() {
  const ctx = document.getElementById('donutChart');
  if (!ctx || AppState.charts.donut) return;

  AppState.charts.donut = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Completed', 'In Progress', 'Retrying', 'Failed'],
      datasets: [{
        data: [94.2, 3.8, 1.4, 0.6],
        backgroundColor: ['#22c55e', '#3b82f6', '#f59e0b', '#f43f5e'],
        borderWidth: 0,
        hoverOffset: 5,
      }],
    },
    options: {
      cutout: '74%',
      responsive: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (c) => `  ${c.label}: ${c.parsed}%`,
          },
        },
      },
    },
  });

  // Render legend manually
  const legendEl = document.getElementById('donutLegend');
  if (legendEl) {
    const entries = [
      { label: 'Completed', color: '#22c55e', val: '94.2%' },
      { label: 'In Progress', color: '#3b82f6', val: '3.8%' },
      { label: 'Retrying', color: '#f59e0b', val: '1.4%' },
      { label: 'Failed', color: '#f43f5e', val: '0.6%' },
    ];
    legendEl.innerHTML = entries.map(e => `
      <div class="legend-row">
        <div class="legend-dot" style="background:${e.color}"></div>
        <span>${e.label}</span>
        <span class="legend-pct">${e.val}</span>
      </div>
    `).join('');
  }
}

// ── SERVICE CHART ────────────────────────────────────────────
function initServiceChart(metric = 'latency') {
  const ctx = document.getElementById('serviceChart');
  if (!ctx) return;

  if (AppState.charts.service) {
    AppState.charts.service.destroy();
  }

  const labels = SERVICES.slice(0, 8).map(s => s.name.split(' ')[0]);
  let data, color, label;

  switch (metric) {
    case 'uptime':
      data = [99.98, 99.95, 100, 99.99, 98.12, 100, 99.97, 94.20];
      color = '#22c55e';
      label = 'Uptime %';
      break;
    case 'throughput':
      data = [4200, 2800, 1900, 8100, 620, 15400, 42000, 0];
      color = '#a78bfa';
      label = 'Requests/min';
      break;
    default:
      data = [28, 45, 31, 15, 180, 12, 4, 0];
      color = '#38bdf8';
      label = 'Latency (ms)';
  }

  AppState.charts.service = new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label,
        data,
        backgroundColor: data.map((v, i) => {
          if (metric === 'latency' && v > 100) return 'rgba(245,158,11,0.6)';
          if (v === 0) return 'rgba(244,63,94,0.5)';
          return `${color}99`;
        }),
        borderColor: data.map((v, i) => {
          if (metric === 'latency' && v > 100) return '#f59e0b';
          if (v === 0) return '#f43f5e';
          return color;
        }),
        borderWidth: 1,
        borderRadius: 5,
      }],
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (c) => ` ${label}: ${c.parsed.y}`,
          },
        },
      },
      scales: {
        x: { grid: { display: false }, ticks: { font: { size: 9 } } },
        y: { grid: { color: 'rgba(56,189,248,0.05)' }, ticks: { font: { size: 9 } } },
      },
    },
  });
}

function updateSvcChart(metric) {
  initServiceChart(metric);
}

// ── AI ACCURACY CHART ────────────────────────────────────────
function initAiAccuracyChart() {
  const ctx = document.getElementById('aiAccuracyChart');
  if (!ctx || AppState.charts.aiAccuracy) return;

  const labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  AppState.charts.aiAccuracy = new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [
        {
          label: 'AI Decisions',
          data: [12400, 14200, 13800, 15600, 14900, 11200, 13400],
          backgroundColor: 'rgba(59,130,246,0.55)',
          borderColor: '#3b82f6',
          borderWidth: 1,
          borderRadius: 4,
        },
        {
          label: 'Auto-resolved',
          data: [11800, 13900, 13200, 15100, 14400, 10800, 12900],
          backgroundColor: 'rgba(34,197,94,0.45)',
          borderColor: '#22c55e',
          borderWidth: 1,
          borderRadius: 4,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'top',
          labels: { boxWidth: 10, font: { size: 10 }, padding: 12 },
        },
      },
      scales: {
        x: { grid: { display: false }, ticks: { font: { size: 10 } } },
        y: {
          grid: { color: 'rgba(56,189,248,0.05)' },
          ticks: { font: { size: 10 } },
        },
      },
    },
  });
}

// ── EXEC HISTORY CHART ───────────────────────────────────────
function initExecHistChart() {
  const ctx = document.getElementById('execHistChart');
  if (!ctx || AppState.charts.execHist) return;

  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  AppState.charts.execHist = new Chart(ctx, {
    type: 'line',
    data: {
      labels: days,
      datasets: [
        {
          label: 'Successful',
          data: [4200, 5100, 4800, 5600, 5200, 3800, 4900],
          borderColor: '#22c55e',
          backgroundColor: 'rgba(34,197,94,0.06)',
          fill: true,
          tension: 0.4,
          pointRadius: 3,
          borderWidth: 2,
        },
        {
          label: 'Failed',
          data: [120, 85, 102, 67, 94, 48, 88],
          borderColor: '#f43f5e',
          backgroundColor: 'rgba(244,63,94,0.06)',
          fill: true,
          tension: 0.4,
          pointRadius: 3,
          borderWidth: 2,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'top',
          labels: { boxWidth: 10, font: { size: 10 }, padding: 12 },
        },
      },
      scales: {
        x: { grid: { display: false }, ticks: { font: { size: 10 } } },
        y: {
          grid: { color: 'rgba(56,189,248,0.05)' },
          ticks: { font: { size: 10 } },
        },
      },
    },
  });
}

// ── ANALYTICS CHARTS ─────────────────────────────────────────
function initAnalyticsCharts() {
  // Growth Chart
  const growthCtx = document.getElementById('growthChart');
  if (growthCtx && !AppState.charts.growth) {
    AppState.charts.growth = new Chart(growthCtx, {
      type: 'line',
      data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
        datasets: [
          {
            label: 'Automations',
            data: [820, 1200, 1640, 2100, 2480, 2720, 2847],
            borderColor: '#38bdf8',
            backgroundColor: 'rgba(56,189,248,0.08)',
            fill: true,
            tension: 0.4,
            pointRadius: 4,
            borderWidth: 2,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { display: false } },
          y: { grid: { color: 'rgba(56,189,248,0.05)' } },
        },
      },
    });
  }

  // Savings Chart
  const savingsCtx = document.getElementById('savingsChart');
  if (savingsCtx && !AppState.charts.savings) {
    AppState.charts.savings = new Chart(savingsCtx, {
      type: 'bar',
      data: {
        labels: ['ITSM', 'Finance', 'HR', 'Compliance', 'Commerce', 'Data'],
        datasets: [{
          data: [480000, 620000, 310000, 190000, 380000, 120000],
          backgroundColor: [
            'rgba(56,189,248,0.6)',
            'rgba(34,197,94,0.6)',
            'rgba(167,139,250,0.6)',
            'rgba(245,158,11,0.6)',
            'rgba(244,63,94,0.6)',
            'rgba(45,212,191,0.6)',
          ],
          borderRadius: 5,
          borderWidth: 0,
        }],
      },
      options: {
        responsive: true,
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { display: false } },
          y: {
            grid: { color: 'rgba(56,189,248,0.05)' },
            ticks: {
              callback: (v) => `₹${(v / 100000).toFixed(1)}L`,
            },
          },
        },
      },
    });
  }

  // Volume Chart (horizontal bar)
  const volCtx = document.getElementById('volumeChart');
  if (volCtx && !AppState.charts.volume) {
    AppState.charts.volume = new Chart(volCtx, {
      type: 'bar',
      data: {
        labels: [
          'Smart Ticket Router',
          'Sentiment Monitor',
          'Invoice Approver',
          'Order Fulfillment',
          'Data Sync',
          'Compliance Scan',
        ],
        datasets: [{
          data: [8420, 11240, 5104, 48240, 9844, 1204],
          backgroundColor: 'rgba(56,189,248,0.5)',
          borderColor: '#38bdf8',
          borderWidth: 1,
          borderRadius: 4,
        }],
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        plugins: { legend: { display: false } },
        scales: {
          x: {
            grid: { color: 'rgba(56,189,248,0.05)' },
            ticks: { font: { size: 9 } },
          },
          y: { grid: { display: false }, ticks: { font: { size: 9 } } },
        },
      },
    });
  }

  // Resolution Time Distribution
  const resCtx = document.getElementById('resolutionChart');
  if (resCtx && !AppState.charts.resolution) {
    AppState.charts.resolution = new Chart(resCtx, {
      type: 'bar',
      data: {
        labels: ['<0.5s', '0.5-1s', '1-2s', '2-5s', '5-10s', '>10s'],
        datasets: [{
          label: 'Tasks',
          data: [18400, 24200, 12400, 8200, 2100, 480],
          backgroundColor: [
            'rgba(34,197,94,0.6)',
            'rgba(56,189,248,0.6)',
            'rgba(167,139,250,0.6)',
            'rgba(245,158,11,0.6)',
            'rgba(244,63,94,0.5)',
            'rgba(244,63,94,0.3)',
          ],
          borderRadius: 5,
          borderWidth: 0,
        }],
      },
      options: {
        responsive: true,
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { display: false } },
          y: { grid: { color: 'rgba(56,189,248,0.05)' } },
        },
      },
    });
  }
}

// ── LIVE UPDATE: THROUGHPUT ──────────────────────────────────
function updateThroughputChart() {
  const chart = AppState.charts.throughput;
  if (!chart) return;

  const newVal = Math.round(100 + Math.random() * 80);
  chart.data.datasets[0].data.push(newVal);
  chart.data.datasets[0].data.shift();
  chart.data.datasets[1].data.push(Math.round(newVal * 0.78));
  chart.data.datasets[1].data.shift();
  chart.update('none');
}
