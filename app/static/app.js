/**
 * K-Means, KNN, and DBSCAN Classroom Presentation Simulator & Dashboards
 */

let currentTab = "simulator";
let latestData = null;

// Simulation Player State
let simulationRunning = false;
let simTimer = null;
let currentSimStep = 0;
let simSpeed = 0.5; // Default slow for clear classroom presenting (0.5x)

const SIMULATION_STEPS = [
  {
    phase: "Phase 1: Establishing Baseline Normal Traffic",
    stepLabel: "Step 1 of 6",
    progress: "16.6%",
    trafficType: "normal",
    packetBadge: "🟢 Normal Web Request",
    packetBadgeClass: "bg-emerald-100 text-emerald-800",
    script: `
      <b>🗣️ What to tell your class:</b><br>
      "We begin with normal, legitimate network traffic. Notice how each user connection carries standard byte payloads (between 200 and 1200 bytes) with a low connection count (1 to 5).
      Both K-Means and DBSCAN analyze this incoming traffic without needing pre-labeled datasets — this is completely unsupervised machine learning in action."
    `,
    kmeansStatus: "Distance: 1.15 < 2.45 (Inlier)",
    kmeansClass: "text-blue-700",
    knnStatus: "Neighbor Dist: 0.82 < 2.00 (Normal)",
    knnClass: "text-emerald-700",
    dbscanStatus: "Dense Cluster (Core Point)",
    dbscanClass: "text-purple-700",
  },
  {
    phase: "Phase 2: Demonstrating Distance-Based Check (K-Means & KNN)",
    stepLabel: "Step 2 of 6",
    progress: "33.3%",
    trafficType: "normal",
    packetBadge: "🟢 Routine API Payload",
    packetBadgeClass: "bg-emerald-100 text-emerald-800",
    script: `
      <b>🗣️ What to tell your class:</b><br>
      "Look at the left chart: <b>Distance-Based Detection</b>. 
      K-Means has trained two cluster centroids (<b>C0</b> and <b>C1</b>) representing normal traffic centers. 
      Meanwhile, <b>KNN</b> calculates the mean distance to the 3 nearest neighbors. Because normal packets cluster closely together, both Euclidean distances remain comfortably below the threshold line."
    `,
    kmeansStatus: "Distance: 1.34 < 2.45 (Inlier)",
    kmeansClass: "text-blue-700",
    knnStatus: "Neighbor Dist: 0.95 < 2.00 (Normal)",
    knnClass: "text-emerald-700",
    dbscanStatus: "Dense Cluster (Core Point)",
    dbscanClass: "text-purple-700",
  },
  {
    phase: "Phase 3: Demonstrating Density-Based Check (DBSCAN)",
    stepLabel: "Step 3 of 6",
    progress: "50.0%",
    trafficType: "normal",
    packetBadge: "🟢 Steady Web Stream",
    packetBadgeClass: "bg-emerald-100 text-emerald-800",
    script: `
      <b>🗣️ What to tell your class:</b><br>
      "Now examine the right chart: <b>DBSCAN Check</b>.
      Unlike K-Means, DBSCAN does not assume spherical clusters or fixed centers. Instead, it checks if a packet has at least <b>MinPts = 3</b> neighbors inside a radius of <b>&epsilon; = 1.5</b>. 
      Because this area is densely populated with safe traffic, DBSCAN classifies it as a Core Cluster member."
    `,
    kmeansStatus: "Distance: 1.08 < 2.45 (Inlier)",
    kmeansClass: "text-blue-700",
    knnStatus: "Neighbor Dist: 0.78 < 2.00 (Normal)",
    knnClass: "text-emerald-700",
    dbscanStatus: "Dense Cluster (Core Point)",
    dbscanClass: "text-purple-700",
  },
  {
    phase: "Phase 4: Attack Injected — Reconnaissance Port Scan",
    stepLabel: "Step 4 of 6",
    progress: "66.6%",
    trafficType: "port_scan",
    packetBadge: "🟡 Threat: Port Scan Attack",
    packetBadgeClass: "bg-amber-100 text-amber-800",
    script: `
      <b>🗣️ What to tell your class:</b><br>
      "<b>ATTACK SIMULATION #1!</b> An attacker is running a rapid Port Scan probing multiple ports in seconds.
      Watch how the models react:
      1) In <b>K-Means & KNN</b>: The distance to the nearest centroid and neighbors spikes above the red threshold line!
      2) In <b>DBSCAN</b>: The packet lands in an empty coordinate space with 0 neighbors inside radius &epsilon;. DBSCAN isolates it as <b>Noise (-1)</b>!"
    `,
    kmeansStatus: "⚠️ Outlier (Dist > 2.45 Threshold)",
    kmeansClass: "text-rose-700 font-extrabold",
    knnStatus: "⚠️ Distance Spike (Outlier)",
    knnClass: "text-rose-700 font-extrabold",
    dbscanStatus: "⚠️ Isolated Noise (-1) Flagged",
    dbscanClass: "text-purple-700 font-extrabold",
  },
  {
    phase: "Phase 5: Attack Injected — Massive SYN Flood DoS",
    stepLabel: "Step 5 of 6",
    progress: "83.3%",
    trafficType: "syn_flood",
    packetBadge: "🔴 Critical: SYN Flood Attack",
    packetBadgeClass: "bg-rose-100 text-rose-800",
    script: `
      <b>🗣️ What to tell your class:</b><br>
      "<b>ATTACK SIMULATION #2!</b> A severe Denial-of-Service SYN Flood hits the server: 500 connections with 0 returned bytes!
      Look at the telemetry:
      • <b>K-Means Euclidean distance</b> explodes to over 150 (way above the 2.45 threshold!).
      • <b>KNN distance</b> confirms total isolation from all baseline peers.
      • <b>DBSCAN</b> confirms 0 neighbors in radius &epsilon; and flags it as Noise (-1)!"
    `,
    kmeansStatus: "🚨 Extreme Outlier (Dist > 150)",
    kmeansClass: "text-rose-700 font-extrabold",
    knnStatus: "🚨 Extreme Distance (> 10x normal)",
    knnClass: "text-rose-700 font-extrabold",
    dbscanStatus: "🚨 Noise (-1) Zero Density",
    dbscanClass: "text-purple-700 font-extrabold",
  },
  {
    phase: "Phase 6: Multi-Model Consensus & Threat Neutralization",
    stepLabel: "Step 6 of 6",
    progress: "100%",
    trafficType: "none",
    packetBadge: "🛡️ Automated Defense Triggered",
    packetBadgeClass: "bg-indigo-100 text-indigo-900 font-black",
    script: `
      <b>🗣️ Conclusion for your presentation:</b><br>
      "This brings us to the final consensus: 
      By combining <b>Distance-based algorithms (K-Means & KNN)</b> with <b>Density-based algorithms (DBSCAN)</b>, our security system achieves dual verification without false alarms. 
      Both models independently detected the threat, allowing the automated firewall to drop the malicious packets before they reach internal servers!"
    `,
    kmeansStatus: "✅ Verified Outlier",
    kmeansClass: "text-rose-700 font-bold",
    knnStatus: "✅ Verified Distance Anomaly",
    knnClass: "text-rose-700 font-bold",
    dbscanStatus: "✅ Verified Density Noise (-1)",
    dbscanClass: "text-purple-700 font-bold",
  },
];

// Tab Switching
function switchTab(tabId) {
  currentTab = tabId;
  const views = {
    simulator: document.getElementById("viewSimulator"),
    dual: document.getElementById("viewDual"),
    kmeans: document.getElementById("viewKmeans"),
    dbscan: document.getElementById("viewDbscan"),
    knn: document.getElementById("viewKnn"),
    matrix: document.getElementById("viewMatrix"),
  };

  const buttons = {
    simulator: document.getElementById("tabBtnSimulator"),
    dual: document.getElementById("tabBtnDual"),
    kmeans: document.getElementById("tabBtnKmeans"),
    dbscan: document.getElementById("tabBtnDbscan"),
    knn: document.getElementById("tabBtnKnn"),
    matrix: document.getElementById("tabBtnMatrix"),
  };

  Object.keys(views).forEach((key) => {
    if (views[key]) {
      if (key === tabId) {
        views[key].classList.remove("hidden");
      } else {
        views[key].classList.add("hidden");
      }
    }

    if (buttons[key]) {
      if (key === tabId) {
        buttons[key].className =
          "tab-btn px-4 py-2.5 font-bold text-sm border-b-2 border-indigo-600 text-indigo-700 flex items-center gap-2 transition bg-indigo-50/50 rounded-t-lg";
      } else {
        buttons[key].className =
          "tab-btn px-4 py-2.5 font-bold text-sm border-b-2 border-transparent text-slate-500 hover:text-slate-800 flex items-center gap-2 transition";
      }
    }
  });

  if (latestData) {
    updateUI(latestData);
  }
}

// 1. Fetch live telemetry from backend
async function loadData() {
  try {
    const res = await fetch("/api/data");
    const data = await res.json();
    latestData = data;
    updateUI(data);
  } catch (err) {
    console.warn("Connection retry...", err);
  }
}

// 2. Main UI Update Router
function updateUI(data) {
  if (!data || !data.history) return;

  if (currentTab === "simulator") {
    renderSimulatorView(data);
  } else if (currentTab === "dual") {
    renderDualOverview(data);
  } else if (currentTab === "kmeans") {
    renderKmeansDashboard(data);
  } else if (currentTab === "dbscan") {
    renderDbscanDashboard(data);
  } else if (currentTab === "knn") {
    renderKnnDashboard(data);
  } else if (currentTab === "matrix") {
    renderMatrixView(data);
  }
}

// ============================================================================
// CLASSROOM PRESENTATION SIMULATOR CONTROLLER
// ============================================================================
function applySimulationStep(stepIndex) {
  if (stepIndex < 0) stepIndex = 0;
  if (stepIndex >= SIMULATION_STEPS.length) stepIndex = SIMULATION_STEPS.length - 1;
  currentSimStep = stepIndex;

  const step = SIMULATION_STEPS[currentSimStep];

  document.getElementById("simPhaseLabel").textContent = step.phase;
  document.getElementById("simProgressStep").textContent = step.stepLabel;
  document.getElementById("simProgressBar").style.width = step.progress;

  const badgeEl = document.getElementById("simPacketBadge");
  badgeEl.textContent = step.packetBadge;
  badgeEl.className = `px-3 py-1 rounded-full text-xs font-extrabold ${step.packetBadgeClass}`;

  document.getElementById("simSpeakerScript").innerHTML = step.script;

  document.getElementById("simKmeansStatus").textContent = step.kmeansStatus;
  document.getElementById("simKmeansStatus").className = `text-xs font-extrabold ${step.kmeansClass}`;

  document.getElementById("simKnnStatus").textContent = step.knnStatus;
  document.getElementById("simKnnStatus").className = `text-xs font-extrabold ${step.knnClass}`;

  document.getElementById("simDbscanStatus").textContent = step.dbscanStatus;
  document.getElementById("simDbscanStatus").className = `text-xs font-extrabold ${step.dbscanClass}`;

  // If this step injects traffic, inject it
  if (step.trafficType && step.trafficType !== "none") {
    sendTraffic(step.trafficType, 1);
  } else if (latestData) {
    renderSimulatorView(latestData);
  }
}

function startSimulation() {
  simulationRunning = true;
  updatePlayButtonUI();
  runSimulationLoop();
}

function pauseSimulation() {
  simulationRunning = false;
  if (simTimer) {
    clearTimeout(simTimer);
    simTimer = null;
  }
  updatePlayButtonUI();
}

function togglePlaySimulation() {
  if (simulationRunning) {
    pauseSimulation();
  } else {
    // If at end, loop back to start
    if (currentSimStep >= SIMULATION_STEPS.length - 1) {
      currentSimStep = 0;
    }
    startSimulation();
  }
}

function runSimulationLoop() {
  if (!simulationRunning) return;

  applySimulationStep(currentSimStep);

  const delayMs = Math.round(5000 / simSpeed);

  simTimer = setTimeout(() => {
    if (!simulationRunning) return;
    if (currentSimStep < SIMULATION_STEPS.length - 1) {
      currentSimStep++;
      runSimulationLoop();
    } else {
      pauseSimulation();
    }
  }, delayMs);
}

function nextSimulationStep() {
  pauseSimulation();
  if (currentSimStep < SIMULATION_STEPS.length - 1) {
    applySimulationStep(currentSimStep + 1);
  }
}

function prevSimulationStep() {
  pauseSimulation();
  if (currentSimStep > 0) {
    applySimulationStep(currentSimStep - 1);
  }
}

function restartSimulation() {
  pauseSimulation();
  currentSimStep = 0;
  applySimulationStep(0);
}

function setSimSpeed(speed) {
  simSpeed = speed;
  const spdBtns = {
    0.5: document.getElementById("spd05"),
    1.0: document.getElementById("spd10"),
    2.0: document.getElementById("spd20"),
  };

  [0.5, 1.0, 2.0].forEach((s) => {
    if (spdBtns[s]) {
      if (s === speed) {
        spdBtns[s].className = "px-2.5 py-1.5 rounded text-[11px] font-bold bg-indigo-600 text-white transition";
      } else {
        spdBtns[s].className = "px-2.5 py-1.5 rounded text-[11px] font-bold bg-slate-700 text-slate-300 hover:text-white transition";
      }
    }
  });

  if (simulationRunning) {
    pauseSimulation();
    startSimulation();
  }
}

function updatePlayButtonUI() {
  const icon = document.getElementById("simPlayIcon");
  const text = document.getElementById("simPlayText");
  const btn = document.getElementById("simPlayBtn");

  if (simulationRunning) {
    icon.textContent = "⏸️";
    text.textContent = "Pause Simulation";
    btn.className = "px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-extrabold text-xs shadow transition flex items-center gap-1.5";
  } else {
    icon.textContent = "▶️";
    text.textContent = "Play Simulation";
    btn.className = "px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs shadow transition flex items-center gap-1.5";
  }
}

function renderSimulatorView(data) {
  const km = data.kmeans || { centers: [], threshold: 2.45 };

  // 1. Simulator Left Chart (K-Means & KNN)
  const kmInliersX = [], kmInliersY = [];
  const kmOutliersX = [], kmOutliersY = [];
  const centers = km.centers || [];

  data.history.forEach((p) => {
    if (p.kmeans_outlier || p.knn_outlier) {
      kmOutliersX.push(p.x);
      kmOutliersY.push(p.y);
    } else {
      kmInliersX.push(p.x);
      kmInliersY.push(p.y);
    }
  });

  const simKmTraces = [
    {
      x: kmInliersX,
      y: kmInliersY,
      mode: "markers",
      name: "Normal Traffic",
      marker: { color: "#3b82f6", size: 8, opacity: 0.8 },
    },
    {
      x: kmOutliersX,
      y: kmOutliersY,
      mode: "markers",
      name: "Outlier Detected",
      marker: { color: "#e11d48", size: 12, symbol: "x" },
    },
    {
      x: centers.map((c) => c.x),
      y: centers.map((c) => c.y),
      mode: "markers+text",
      name: "Centroids",
      text: centers.map((c) => `  ★ C${c.cluster}`),
      textposition: "top right",
      textfont: { size: 10, color: "#d97706", weight: "bold" },
      marker: { color: "#f59e0b", size: 14, symbol: "star" },
    },
  ];

  const layout = {
    margin: { t: 15, r: 15, b: 25, l: 25 },
    paper_bgcolor: "#ffffff",
    plot_bgcolor: "#f8fafc",
    xaxis: { title: "src_bytes (scaled)", showgrid: true, zeroline: false },
    yaxis: { title: "dst_bytes (scaled)", showgrid: true, zeroline: false },
    legend: { orientation: "h", y: 1.15, x: 0 },
  };

  Plotly.react("simChartKmeans", simKmTraces, layout, { responsive: true, displayModeBar: false });

  // 2. Simulator Right Chart (DBSCAN)
  const dbClusterX = [], dbClusterY = [];
  const dbNoiseX = [], dbNoiseY = [];

  data.history.forEach((p) => {
    if (p.dbscan_noise || p.dbscan_result === "Noise (-1)") {
      dbNoiseX.push(p.x);
      dbNoiseY.push(p.y);
    } else {
      dbClusterX.push(p.x);
      dbClusterY.push(p.y);
    }
  });

  const simDbTraces = [
    {
      x: dbClusterX,
      y: dbClusterY,
      mode: "markers",
      name: "Core Density Clusters",
      marker: { color: "#10b981", size: 9, opacity: 0.85 },
    },
    {
      x: dbNoiseX,
      y: dbNoiseY,
      mode: "markers",
      name: "Noise (-1)",
      marker: { color: "#9333ea", size: 12, symbol: "x" },
    },
  ];

  Plotly.react("simChartDbscan", simDbTraces, layout, { responsive: true, displayModeBar: false });
}

// ============================================================================
// DUAL OVERVIEW RENDERING
// ============================================================================
function renderDualOverview(data) {
  const km = data.kmeans || { normal: 0, outliers: 0 };
  const db = data.dbscan || { clusters: 0, noise: 0 };

  document.getElementById("dualStatTotal").textContent = data.total;
  document.getElementById("dualStatNormal").textContent = data.normal;
  document.getElementById("dualStatKmOutliers").textContent = km.outliers;
  document.getElementById("dualStatDbNoise").textContent = db.noise;

  // Chart 1: K-Means in Dual View
  const kmInliersX = [], kmInliersY = [];
  const kmOutliersX = [], kmOutliersY = [];
  const centers = km.centers || [];

  data.history.forEach((p) => {
    if (p.kmeans_outlier || p.kmeans_result === "Outlier") {
      kmOutliersX.push(p.x);
      kmOutliersY.push(p.y);
    } else {
      kmInliersX.push(p.x);
      kmInliersY.push(p.y);
    }
  });

  const kmTraces = [
    {
      x: kmInliersX,
      y: kmInliersY,
      mode: "markers",
      name: "Normal Clusters",
      marker: { color: "#2563eb", size: 8, opacity: 0.8 },
    },
    {
      x: kmOutliersX,
      y: kmOutliersY,
      mode: "markers",
      name: "K-Means Outlier",
      marker: { color: "#dc2626", size: 11, symbol: "x" },
    },
    {
      x: centers.map((c) => c.x),
      y: centers.map((c) => c.y),
      mode: "markers+text",
      name: "Centroids (k=2)",
      text: centers.map((c) => `C${c.cluster}`),
      textposition: "top center",
      textfont: { size: 10, color: "#b45309", family: "sans-serif" },
      marker: { color: "#f59e0b", size: 14, symbol: "star" },
    },
  ];

  const chartLayout = {
    margin: { t: 15, r: 15, b: 25, l: 25 },
    paper_bgcolor: "#ffffff",
    plot_bgcolor: "#f8fafc",
    xaxis: { title: "src_bytes (scaled)", showgrid: true, zeroline: false },
    yaxis: { title: "dst_bytes (scaled)", showgrid: true, zeroline: false },
    legend: { orientation: "h", y: 1.15, x: 0 },
  };

  Plotly.react("dualChartKmeans", kmTraces, chartLayout, { responsive: true, displayModeBar: false });

  // Chart 2: DBSCAN in Dual View
  const dbClusterX = [], dbClusterY = [];
  const dbNoiseX = [], dbNoiseY = [];

  data.history.forEach((p) => {
    if (p.dbscan_noise || p.dbscan_result === "Noise (-1)") {
      dbNoiseX.push(p.x);
      dbNoiseY.push(p.y);
    } else {
      dbClusterX.push(p.x);
      dbClusterY.push(p.y);
    }
  });

  const dbTraces = [
    {
      x: dbClusterX,
      y: dbClusterY,
      mode: "markers",
      name: "Dense Cluster",
      marker: { color: "#059669", size: 8, opacity: 0.8 },
    },
    {
      x: dbNoiseX,
      y: dbNoiseY,
      mode: "markers",
      name: "Noise (-1)",
      marker: { color: "#9333ea", size: 11, symbol: "x" },
    },
  ];

  Plotly.react("dualChartDbscan", dbTraces, chartLayout, { responsive: true, displayModeBar: false });

  // Dual Feed Table
  const recent = data.history.slice(-12).reverse();
  const rows = recent.map((p) => {
    const isKmOutlier = p.kmeans_outlier || p.kmeans_result === "Outlier";
    const isDbNoise = p.dbscan_noise || p.dbscan_result === "Noise (-1)";

    const kmBadge = isKmOutlier
      ? `<span class="px-2 py-0.5 rounded bg-red-100 text-red-700 font-bold">⚠️ OUTLIER</span>`
      : `<span class="px-2 py-0.5 rounded bg-blue-100 text-blue-700 font-medium">SAFE</span>`;

    const dbBadge = isDbNoise
      ? `<span class="px-2 py-0.5 rounded bg-purple-100 text-purple-700 font-bold">⚠️ NOISE (-1)</span>`
      : `<span class="px-2 py-0.5 rounded bg-emerald-100 text-emerald-700 font-medium">CLUSTER</span>`;

    const finalBadge = p.is_anomaly
      ? `<span class="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 font-extrabold text-[11px]">🚨 ANOMALY</span>`
      : `<span class="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[11px]">🛡️ NORMAL</span>`;

    return `
      <tr class="hover:bg-slate-50 transition">
        <td class="p-3 font-mono font-bold text-slate-700">${p.id}</td>
        <td class="p-3">${p.type}</td>
        <td class="p-3">${kmBadge}</td>
        <td class="p-3">${dbBadge}</td>
        <td class="p-3">${finalBadge}</td>
      </tr>
    `;
  });

  document.getElementById("dualTableBody").innerHTML = rows.join("");
}

// ============================================================================
// DEDICATED K-MEANS DASHBOARD RENDERING
// ============================================================================
function renderKmeansDashboard(data) {
  const km = data.kmeans || { normal: 0, outliers: 0, threshold: 2.45, centers: [] };

  document.getElementById("kmThresholdVal").textContent = km.threshold.toFixed(2);
  document.getElementById("kmTotalVal").textContent = data.total;
  document.getElementById("kmNormalVal").textContent = km.normal;
  document.getElementById("kmOutliersVal").textContent = km.outliers;
  document.getElementById("kmCentroidsCount").textContent = km.k || 2;
  
  if (km.centers && km.centers.length >= 2) {
    document.getElementById("kmCentersInfo").textContent = `C0: (${km.centers[0].x}, ${km.centers[0].y}) | C1: (${km.centers[1].x}, ${km.centers[1].y})`;
  }

  const c0X = [], c0Y = [];
  const c1X = [], c1Y = [];
  const outliersX = [], outliersY = [];

  data.history.forEach((p) => {
    const isOutlier = p.kmeans_outlier || p.kmeans_result === "Outlier";
    if (isOutlier) {
      outliersX.push(p.x);
      outliersY.push(p.y);
    } else if (p.cluster === 1) {
      c1X.push(p.x);
      c1Y.push(p.y);
    } else {
      c0X.push(p.x);
      c0Y.push(p.y);
    }
  });

  const centers = km.centers || [];

  const traces = [
    {
      x: c0X,
      y: c0Y,
      mode: "markers",
      name: "Cluster 0 (Inliers)",
      marker: { color: "#3b82f6", size: 9, opacity: 0.8 },
    },
    {
      x: c1X,
      y: c1Y,
      mode: "markers",
      name: "Cluster 1 (Inliers)",
      marker: { color: "#06b6d4", size: 9, opacity: 0.8 },
    },
    {
      x: outliersX,
      y: outliersY,
      mode: "markers",
      name: "Distance Outliers",
      marker: { color: "#e11d48", size: 12, symbol: "x" },
    },
    {
      x: centers.map((c) => c.x),
      y: centers.map((c) => c.y),
      mode: "markers+text",
      name: "Centroids",
      text: centers.map((c) => `  ★ Centroid ${c.cluster}`),
      textposition: "top right",
      textfont: { size: 11, color: "#d97706", family: "sans-serif", weight: "bold" },
      marker: { color: "#f59e0b", size: 16, symbol: "star" },
    },
  ];

  const scatterLayout = {
    margin: { t: 20, r: 20, b: 35, l: 35 },
    paper_bgcolor: "#ffffff",
    plot_bgcolor: "#f8fafc",
    xaxis: { title: "src_bytes (scaled)", showgrid: true, zeroline: false },
    yaxis: { title: "dst_bytes (scaled)", showgrid: true, zeroline: false },
    legend: { orientation: "h", y: 1.15, x: 0 },
  };

  Plotly.react("kmeansDedicatedChart", traces, scatterLayout, { responsive: true, displayModeBar: false });

  // Centroid Distance Deviation Chart
  const recentPackets = data.history.slice(-15);
  const pktIds = recentPackets.map((p) => p.id);
  const distances = recentPackets.map((p) => p.distance || 0.0);
  const barColors = recentPackets.map((p) =>
    (p.kmeans_outlier || p.kmeans_result === "Outlier") ? "#e11d48" : "#3b82f6"
  );

  const barTrace = {
    x: pktIds,
    y: distances,
    type: "bar",
    name: "Distance to Centroid",
    marker: { color: barColors },
  };

  const distLayout = {
    margin: { t: 25, r: 15, b: 35, l: 30 },
    paper_bgcolor: "#ffffff",
    plot_bgcolor: "#f8fafc",
    yaxis: { title: "Euclidean Dist" },
    shapes: [
      {
        type: "line",
        xref: "paper",
        x0: 0,
        x1: 1,
        yref: "y",
        y0: km.threshold,
        y1: km.threshold,
        line: { color: "#e11d48", width: 2, dash: "dash" },
      },
    ],
    annotations: [
      {
        xref: "paper",
        x: 0.95,
        y: km.threshold,
        text: `Threshold (${km.threshold})`,
        showarrow: false,
        font: { size: 10, color: "#e11d48" },
        yshift: 10,
      },
    ],
  };

  Plotly.react("kmeansDistanceChart", [barTrace], distLayout, { responsive: true, displayModeBar: false });

  // K-Means Table
  const rows = [...data.history].reverse().slice(0, 10).map((p) => {
    const isOutlier = p.kmeans_outlier || p.kmeans_result === "Outlier";
    const badge = isOutlier
      ? `<span class="px-2 py-0.5 rounded bg-rose-100 text-rose-700 font-bold">⚠️ OUTLIER</span>`
      : `<span class="px-2 py-0.5 rounded bg-blue-100 text-blue-700 font-semibold">NORMAL INLIER</span>`;

    return `
      <tr class="hover:bg-slate-50 transition">
        <td class="p-3 font-mono font-bold">${p.id}</td>
        <td class="p-3">${p.type}</td>
        <td class="p-3 font-semibold text-slate-700">Cluster ${p.cluster !== undefined ? p.cluster : "-"}</td>
        <td class="p-3 font-mono ${isOutlier ? 'text-rose-600 font-bold' : 'text-slate-600'}">${p.distance !== undefined ? p.distance : "-"}</td>
        <td class="p-3 font-mono text-slate-500">${km.threshold}</td>
        <td class="p-3">${badge}</td>
      </tr>
    `;
  });

  document.getElementById("kmTableBody").innerHTML = rows.join("");
}

// ============================================================================
// DEDICATED DBSCAN DASHBOARD RENDERING
// ============================================================================
function renderDbscanDashboard(data) {
  const db = data.dbscan || { clusters: 0, noise: 0, eps: 1.5, min_samples: 3 };

  document.getElementById("dbTotalVal").textContent = data.total;
  document.getElementById("dbClusterVal").textContent = db.clusters;
  document.getElementById("dbNoiseVal").textContent = db.noise;

  const purity = data.total > 0 ? ((db.clusters / data.total) * 100).toFixed(1) : 100;
  document.getElementById("dbPurityVal").textContent = `${purity}%`;

  const clusterX = [], clusterY = [];
  const noiseX = [], noiseY = [];

  data.history.forEach((p) => {
    const isNoise = p.dbscan_noise || p.dbscan_result === "Noise (-1)";
    if (isNoise) {
      noiseX.push(p.x);
      noiseY.push(p.y);
    } else {
      clusterX.push(p.x);
      clusterY.push(p.y);
    }
  });

  const dbTraces = [
    {
      x: clusterX,
      y: clusterY,
      mode: "markers",
      name: "Core Density Clusters",
      marker: { color: "#10b981", size: 10, opacity: 0.85 },
    },
    {
      x: noiseX,
      y: noiseY,
      mode: "markers",
      name: "Noise Points (-1)",
      marker: { color: "#9333ea", size: 13, symbol: "x" },
    },
  ];

  const dbLayout = {
    margin: { t: 20, r: 20, b: 35, l: 35 },
    paper_bgcolor: "#ffffff",
    plot_bgcolor: "#f8fafc",
    xaxis: { title: "src_bytes (scaled)", showgrid: true, zeroline: false },
    yaxis: { title: "dst_bytes (scaled)", showgrid: true, zeroline: false },
    legend: { orientation: "h", y: 1.15, x: 0 },
  };

  Plotly.react("dbscanDedicatedChart", dbTraces, dbLayout, { responsive: true, displayModeBar: false });

  // DBSCAN Donut Chart
  const donutTrace = {
    labels: ["Core / Clusters", "Noise (-1)"],
    values: [db.clusters, db.noise],
    type: "pie",
    hole: 0.6,
    marker: {
      colors: ["#10b981", "#9333ea"],
    },
    textinfo: "percent+label",
  };

  const donutLayout = {
    margin: { t: 15, r: 15, b: 15, l: 15 },
    showlegend: false,
    paper_bgcolor: "#ffffff",
    plot_bgcolor: "#ffffff",
  };

  Plotly.react("dbscanDonutChart", [donutTrace], donutLayout, { responsive: true, displayModeBar: false });

  // DBSCAN Table
  const rows = [...data.history].reverse().slice(0, 10).map((p) => {
    const isNoise = p.dbscan_noise || p.dbscan_result === "Noise (-1)";
    const badge = isNoise
      ? `<span class="px-2 py-0.5 rounded bg-purple-100 text-purple-700 font-bold">⚠️ NOISE (-1)</span>`
      : `<span class="px-2 py-0.5 rounded bg-emerald-100 text-emerald-700 font-semibold">DENSE CLUSTER</span>`;

    const labelDisplay = isNoise ? "-1 (Noise)" : `Cluster ${p.dbscan_label !== undefined ? p.dbscan_label : 0}`;
    const densityState = isNoise ? "Low Density (< 3 neighbors)" : "High Density (>= 3 neighbors)";

    return `
      <tr class="hover:bg-slate-50 transition">
        <td class="p-3 font-mono font-bold">${p.id}</td>
        <td class="p-3">${p.type}</td>
        <td class="p-3 font-mono font-semibold ${isNoise ? 'text-purple-600' : 'text-emerald-700'}">${labelDisplay}</td>
        <td class="p-3 text-slate-600">${densityState}</td>
        <td class="p-3">${badge}</td>
      </tr>
    `;
  });

  document.getElementById("dbTableBody").innerHTML = rows.join("");
}

// ============================================================================
// DEDICATED KNN DISTANCE DASHBOARD RENDERING
// ============================================================================
function renderKnnDashboard(data) {
  const knn = data.knn || { k: 3, threshold: 2.0, normal: 0, outliers: 0 };

  document.getElementById("knnThresholdVal").textContent = knn.threshold.toFixed(2);
  document.getElementById("knnTotalVal").textContent = data.total;
  document.getElementById("knnNormalVal").textContent = knn.normal;
  document.getElementById("knnOutliersVal").textContent = knn.outliers;

  const normalX = [], normalY = [];
  const outlierX = [], outlierY = [];

  data.history.forEach((p) => {
    if (p.knn_outlier) {
      outlierX.push(p.x);
      outlierY.push(p.y);
    } else {
      normalX.push(p.x);
      normalY.push(p.y);
    }
  });

  const knnTraces = [
    {
      x: normalX,
      y: normalY,
      mode: "markers",
      name: "Normal (Close to k-NN)",
      marker: { color: "#10b981", size: 9, opacity: 0.8 },
    },
    {
      x: outlierX,
      y: outlierY,
      mode: "markers",
      name: "k-NN Distance Outlier",
      marker: { color: "#e11d48", size: 12, symbol: "x" },
    },
  ];

  const knnLayout = {
    margin: { t: 20, r: 20, b: 35, l: 35 },
    paper_bgcolor: "#ffffff",
    plot_bgcolor: "#f8fafc",
    xaxis: { title: "src_bytes (scaled)", showgrid: true, zeroline: false },
    yaxis: { title: "dst_bytes (scaled)", showgrid: true, zeroline: false },
    legend: { orientation: "h", y: 1.15, x: 0 },
  };

  Plotly.react("knnDedicatedChart", knnTraces, knnLayout, { responsive: true, displayModeBar: false });

  // KNN Distance Bar Chart
  const recentPackets = data.history.slice(-15);
  const pktIds = recentPackets.map((p) => p.id);
  const dists = recentPackets.map((p) => p.knn_distance || 0.0);
  const barColors = recentPackets.map((p) => (p.knn_outlier ? "#e11d48" : "#10b981"));

  const barTrace = {
    x: pktIds,
    y: dists,
    type: "bar",
    name: "Average k-NN Distance",
    marker: { color: barColors },
  };

  const distLayout = {
    margin: { t: 25, r: 15, b: 35, l: 30 },
    paper_bgcolor: "#ffffff",
    plot_bgcolor: "#f8fafc",
    yaxis: { title: "Mean Distance (k=3)" },
    shapes: [
      {
        type: "line",
        xref: "paper",
        x0: 0,
        x1: 1,
        yref: "y",
        y0: knn.threshold,
        y1: knn.threshold,
        line: { color: "#e11d48", width: 2, dash: "dash" },
      },
    ],
    annotations: [
      {
        xref: "paper",
        x: 0.95,
        y: knn.threshold,
        text: `Threshold (${knn.threshold})`,
        showarrow: false,
        font: { size: 10, color: "#e11d48" },
        yshift: 10,
      },
    ],
  };

  Plotly.react("knnDistanceChart", [barTrace], distLayout, { responsive: true, displayModeBar: false });

  // KNN Table
  const rows = [...data.history].reverse().slice(0, 10).map((p) => {
    const isOutlier = p.knn_outlier;
    const badge = isOutlier
      ? `<span class="px-2 py-0.5 rounded bg-rose-100 text-rose-700 font-bold">⚠️ DISTANCE OUTLIER</span>`
      : `<span class="px-2 py-0.5 rounded bg-emerald-100 text-emerald-700 font-semibold">NORMAL PEER</span>`;

    return `
      <tr class="hover:bg-slate-50 transition">
        <td class="p-3 font-mono font-bold">${p.id}</td>
        <td class="p-3">${p.type}</td>
        <td class="p-3 font-mono ${isOutlier ? 'text-rose-600 font-bold' : 'text-slate-600'}">${p.knn_distance !== undefined ? p.knn_distance : "-"}</td>
        <td class="p-3 font-mono text-slate-500">${knn.threshold}</td>
        <td class="p-3">${badge}</td>
      </tr>
    `;
  });

  document.getElementById("knnTableBody").innerHTML = rows.join("");
}

// ============================================================================
// MODEL AGREEMENT MATRIX RENDERING
// ============================================================================
function renderMatrixView(data) {
  const cmp = data.comparison || {
    both_safe: 0,
    both_anomaly: 0,
    kmeans_only: 0,
    dbscan_only: 0,
  };

  document.getElementById("matBothSafe").textContent = cmp.both_safe;
  document.getElementById("matBothThreat").textContent = cmp.both_anomaly;
  document.getElementById("matKmOnly").textContent = cmp.kmeans_only;
  document.getElementById("matDbOnly").textContent = cmp.dbscan_only;

  const rows = [...data.history].reverse().slice(0, 12).map((p) => {
    const kmOutlier = p.kmeans_outlier || p.kmeans_result === "Outlier";
    const dbNoise = p.dbscan_noise || p.dbscan_result === "Noise (-1)";
    const knnOutlier = p.knn_outlier;

    let consensus = "";
    if (!kmOutlier && !dbNoise) {
      consensus = `<span class="px-2 py-0.5 rounded bg-emerald-100 text-emerald-700 font-bold">✅ Unanimous Safe</span>`;
    } else if (kmOutlier && dbNoise) {
      consensus = `<span class="px-2 py-0.5 rounded bg-rose-100 text-rose-700 font-bold">🚨 Unanimous Threat</span>`;
    } else {
      consensus = `<span class="px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-bold">⚠️ Split Decision</span>`;
    }

    const finalBadge = p.is_anomaly
      ? `<span class="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 font-extrabold text-[11px]">FLAGGED</span>`
      : `<span class="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[11px]">CLEARED</span>`;

    return `
      <tr class="hover:bg-slate-50 transition">
        <td class="p-3 font-mono font-bold">${p.id}</td>
        <td class="p-3">${p.type}</td>
        <td class="p-3 font-semibold ${kmOutlier ? 'text-rose-600' : 'text-blue-600'}">${kmOutlier ? 'Outlier' : 'Normal'}</td>
        <td class="p-3 font-semibold ${knnOutlier ? 'text-rose-600' : 'text-emerald-600'}">${knnOutlier ? 'Outlier' : 'Normal'}</td>
        <td class="p-3 font-semibold ${dbNoise ? 'text-purple-600' : 'text-emerald-600'}">${dbNoise ? 'Noise (-1)' : 'Cluster'}</td>
        <td class="p-3">${consensus}</td>
        <td class="p-3">${finalBadge}</td>
      </tr>
    `;
  });

  document.getElementById("matrixTableBody").innerHTML = rows.join("");
}

// ============================================================================
// ACTION HANDLERS
// ============================================================================
async function sendTraffic(type, count = 3) {
  try {
    await fetch("/api/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ traffic_type: type, count: count }),
    });
    await loadData();
  } catch (err) {
    console.error("Traffic injection error:", err);
  }
}

async function resetData() {
  try {
    await fetch("/api/reset", { method: "POST" });
    await loadData();
    restartSimulation();
  } catch (err) {
    console.error("Reset error:", err);
  }
}

// Window resize handler
window.addEventListener("resize", () => {
  const chartIds = [
    "simChartKmeans",
    "simChartDbscan",
    "dualChartKmeans",
    "dualChartDbscan",
    "kmeansDedicatedChart",
    "kmeansDistanceChart",
    "dbscanDedicatedChart",
    "dbscanDonutChart",
    "knnDedicatedChart",
    "knnDistanceChart",
  ];
  chartIds.forEach((id) => {
    const el = document.getElementById(id);
    if (el && el.data) {
      Plotly.Plots.resize(el);
    }
  });
});

// Initialization
window.addEventListener("DOMContentLoaded", () => {
  applySimulationStep(0);
  loadData();
  setInterval(() => {
    if (!simulationRunning) {
      loadData();
    }
  }, 2500);
});
