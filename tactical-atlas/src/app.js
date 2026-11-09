const canvas = document.querySelector("#map-canvas");
const ctx = canvas.getContext("2d");
const mapFrame = document.querySelector("#map-frame");
const tooltip = document.querySelector("#tooltip");
const METHOD_DIALOG = document.querySelector("#method-dialog");

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];

const MAP_STYLES = {
  ERANGEL: {
    label: "ERANGEL",
    cn: "北部数据域",
    sea: ["#071b20", "#0a2425"],
    land: ["#1a2a1c", "#223620", "#1c3022"],
    coast: "rgba(116, 178, 142, 0.46)",
    contour: "rgba(116, 151, 102, 0.16)",
    river: "rgba(45, 103, 106, 0.8)",
    road: "rgba(149, 126, 83, 0.64)",
    town: "rgba(216, 184, 112, 0.78)",
    landPath: [
      [82, 180], [145, 105], [270, 78], [385, 108], [472, 82], [605, 70],
      [738, 106], [833, 165], [902, 255], [926, 345], [892, 424], [920, 512],
      [884, 603], [838, 690], [778, 772], [697, 842], [600, 886], [485, 906],
      [365, 880], [255, 826], [168, 740], [120, 632], [92, 520], [72, 410],
      [78, 300]
    ],
    lakes: [
      [[375, 350], [438, 326], [500, 348], [512, 404], [472, 448], [405, 438], [360, 400]],
      [[665, 530], [712, 512], [752, 538], [748, 588], [704, 610], [662, 580]]
    ],
    rivers: [
      [[560, 115], [586, 205], [560, 292], [595, 360], [572, 438], [612, 510], [600, 590], [630, 660], [612, 750], [640, 820]]
    ],
    roads: [
      [[248, 188], [320, 238], [382, 306], [430, 392], [490, 460], [540, 550], [606, 620], [676, 690], [740, 760]],
      [[160, 560], [252, 540], [344, 544], [430, 500], [520, 476], [616, 500], [710, 548], [800, 590]],
      [[430, 170], [430, 260], [406, 332], [366, 404], [336, 488], [286, 558], [246, 630]]
    ],
    towns: [[300, 238], [420, 390], [540, 520], [680, 690], [250, 540], [760, 600], [600, 300]],
    forestPatches: [
      [[205, 230], [300, 180], [360, 260], [330, 342], [238, 330]],
      [[660, 220], [760, 210], [800, 300], [742, 360], [672, 316]],
      [[420, 680], [520, 660], [560, 750], [482, 800], [402, 750]]
    ],
    fields: [
      [[510, 250], [610, 238], [650, 300], [580, 344], [512, 320]],
      [[260, 650], [360, 640], [400, 714], [322, 756], [250, 712]]
    ]
  },
  MIRAMAR: {
    label: "MIRAMAR",
    cn: "沙海数据域",
    sea: ["#071b22", "#0b252c"],
    land: ["#31291c", "#4a3a22", "#3a2e1e"],
    coast: "rgba(196, 156, 99, 0.48)",
    contour: "rgba(178, 140, 83, 0.17)",
    river: "rgba(47, 92, 91, 0.72)",
    road: "rgba(185, 152, 93, 0.6)",
    town: "rgba(228, 193, 121, 0.84)",
    landPath: [
      [95, 255], [165, 165], [270, 122], [380, 135], [480, 108], [605, 132],
      [720, 105], [820, 160], [885, 260], [862, 350], [908, 445], [866, 535],
      [890, 630], [820, 735], [730, 804], [620, 855], [505, 872], [388, 840],
      [272, 796], [190, 716], [138, 620], [112, 515], [82, 410], [70, 330]
    ],
    lakes: [
      [[380, 500], [440, 486], [486, 520], [470, 566], [414, 580], [372, 548]]
    ],
    rivers: [
      [[300, 130], [338, 210], [306, 292], [340, 372], [310, 450], [352, 526], [334, 610], [372, 700], [360, 790]]
    ],
    roads: [
      [[160, 330], [250, 360], [352, 340], [444, 386], [536, 368], [630, 408], [720, 390], [810, 440]],
      [[200, 600], [282, 560], [372, 582], [462, 544], [548, 574], [630, 540], [724, 580], [820, 550]],
      [[470, 160], [490, 252], [540, 332], [560, 424], [612, 502], [606, 590], [650, 680]]
    ],
    towns: [[250, 360], [460, 384], [650, 410], [300, 560], [600, 560], [740, 390], [500, 720]],
    forestPatches: [],
    fields: [
      [[380, 650], [470, 620], [510, 690], [438, 732], [362, 698]],
      [[690, 270], [780, 255], [806, 320], [734, 350], [684, 320]]
    ],
    canyon: [
      [[430, 230], [500, 214], [552, 250], [538, 308], [480, 330], [420, 294]],
      [[620, 650], [700, 630], [742, 680], [708, 734], [632, 726], [600, 686]]
    ]
  }
};

const SECTOR_COLS = "ABCDEFGHIJ";
const LAYER_LABEL = {
  death: { cn: "死亡热区", en: "DEATH HEAT" },
  first: { cn: "首圈中心", en: "FIRST CIRCLE" },
  last: { cn: "决赛圈", en: "FINAL CIRCLE" },
  red: { cn: "红区", en: "RED ZONE" }
};

const state = {
  atlas: null,
  deaths: null,
  deathLoading: false,
  deathError: null,
  map: "ERANGEL",
  layer: "first",
  phase: "all",
  cause: "all",
  view: "heat",
  radius: 34,
  showSectors: true,
  selected: null,
  hover: null,
  baseCanvas: null,
  heatCanvas: null,
  heatKey: "",
  deathCache: new Map()
};

function fmt(n) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(Math.round(n));
}

function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}

function sectorOf(x, y) {
  const col = SECTOR_COLS[clamp(Math.floor(x / 100), 0, 9)];
  const row = clamp(Math.floor(y / 100) + 1, 1, 10);
  return `${col}${row}`;
}

function deathCells() {
  if (!state.deaths) return [];
  const mapData = state.deaths.maps?.[state.map];
  if (!mapData) return [];
  const key = `${state.map}:${state.phase}:${state.cause}`;
  if (state.deathCache.has(key)) return state.deathCache.get(key);

  const phases = state.phase === "all" ? state.deaths.meta.phases : [state.phase];
  const causes = state.cause === "all" ? state.deaths.meta.causes : [state.cause];
  const sums = new Map();

  for (const phase of phases) {
    for (const cause of causes) {
      const cells = mapData.combos?.[phase]?.[cause] || [];
      for (const [x, y, n] of cells) {
        const cellKey = `${x},${y}`;
        sums.set(cellKey, (sums.get(cellKey) || 0) + n);
      }
    }
  }

  const merged = [...sums.entries()].map(([cellKey, n]) => {
    const [gx, gy] = cellKey.split(",").map(Number);
    // death.json uses a 100×100 grid; the map canvas uses 0—1000.
    return [gx * 10 + 5, gy * 10 + 5, n];
  });
  merged.sort((a, b) => a[2] - b[2]);
  state.deathCache.set(key, merged);
  return merged;
}

function layerData() {
  if (state.layer === "death") return deathCells();
  return state.atlas?.maps?.[state.map]?.layers?.[state.layer] || [];
}

function layerStats() {
  if (state.layer === "death") {
    const cells = deathCells();
    let weighted = 0;
    let max = 0;
    for (const [, , n] of cells) {
      weighted += n;
      if (n > max) max = n;
    }
    return { cells: cells.length, weighted, max };
  }
  return state.atlas?.maps?.[state.map]?.stats?.[state.layer] || { cells: 0, weighted: 0, max: 0 };
}

async function ensureDeaths() {
  if (state.deaths || state.deathLoading) return;
  state.deathLoading = true;
  state.deathError = null;
  const status = $("#death-status");
  if (status) {
    status.textContent = "正在加载 65M 条死亡记录的聚合数据…";
    status.classList.remove("is-error");
  }
  try {
    const response = await fetch("./data/deaths.json", { cache: "no-store" });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    state.deaths = await response.json();
    state.deathCache.clear();
    const total = Object.values(state.deaths.maps || {}).reduce(
      (sum, map) => sum + (map.stats?.weighted || 0),
      0
    );
    const countEl = $('[data-count="death"]');
    if (countEl) countEl.textContent = fmt(total);
    if (status) status.textContent = "100×100 网格 · 按时间段/死因聚合；非实时数据";
  } catch (error) {
    console.error("[atlas] deaths load failed", error);
    state.deathError = error;
    if (status) {
      status.textContent = "死亡数据未生成或加载失败；请先运行聚合脚本。";
      status.classList.add("is-error");
    }
  } finally {
    state.deathLoading = false;
  }
}

function heatColor(t) {
  // t: 0..1；teal -> gold -> orange -> red
  const stops = [
    [0, [93, 201, 184]],
    [0.34, [214, 190, 93]],
    [0.68, [235, 152, 63]],
    [1, [226, 87, 72]]
  ];
  let a = stops[0];
  let b = stops[stops.length - 1];
  for (let i = 0; i < stops.length - 1; i += 1) {
    if (t >= stops[i][0] && t <= stops[i + 1][0]) {
      a = stops[i];
      b = stops[i + 1];
      break;
    }
  }
  const f = (t - a[0]) / Math.max(0.0001, b[0] - a[0]);
  const rgb = a[1].map((v, i) => Math.round(v + (b[1][i] - v) * f));
  return rgb;
}

/* ------------------------------------------------------------------ */
/* 基础地图：原创示意，不使用官方地图素材                            */
/* ------------------------------------------------------------------ */

function drawBase() {
  const style = MAP_STYLES[state.map];
  const off = document.createElement("canvas");
  off.width = 1000;
  off.height = 1000;
  const c = off.getContext("2d");

  // 海面
  const sea = c.createLinearGradient(0, 0, 1000, 1000);
  sea.addColorStop(0, style.sea[0]);
  sea.addColorStop(1, style.sea[1]);
  c.fillStyle = sea;
  c.fillRect(0, 0, 1000, 1000);

  // 海面等高线
  c.save();
  c.strokeStyle = "rgba(121, 182, 163, 0.09)";
  c.lineWidth = 1;
  for (let r = 80; r < 760; r += 54) {
    c.beginPath();
    c.ellipse(500, 500, r * 1.18, r * 0.78, -0.18, 0, Math.PI * 2);
    c.stroke();
  }
  c.restore();

  // 陆地外轮廓
  const land = style.landPath;
  const path = new Path2D();
  path.moveTo(land[0][0], land[0][1]);
  for (let i = 1; i < land.length; i += 1) path.lineTo(land[i][0], land[i][1]);
  path.closePath();

  c.save();
  c.shadowColor = style.coast;
  c.shadowBlur = 24;
  c.fillStyle = style.land[0];
  c.fill(path);
  c.restore();

  const landGradient = c.createLinearGradient(180, 120, 820, 900);
  landGradient.addColorStop(0, style.land[1]);
  landGradient.addColorStop(0.52, style.land[0]);
  landGradient.addColorStop(1, style.land[2]);
  c.fillStyle = landGradient;
  c.fill(path);
  c.strokeStyle = style.coast;
  c.lineWidth = 2;
  c.stroke(path);

  // 只在陆地上绘制地形/道路
  c.save();
  c.clip(path);

  // 地形斑块
  for (const patch of style.forestPatches || []) {
    const p = new Path2D();
    p.moveTo(patch[0][0], patch[0][1]);
    for (let i = 1; i < patch.length; i += 1) p.lineTo(patch[i][0], patch[i][1]);
    p.closePath();
    c.fillStyle = "rgba(53, 92, 53, 0.34)";
    c.fill(p);
    c.strokeStyle = "rgba(101, 138, 86, 0.16)";
    c.stroke(p);
  }
  for (const patch of style.fields || []) {
    const p = new Path2D();
    p.moveTo(patch[0][0], patch[0][1]);
    for (let i = 1; i < patch.length; i += 1) p.lineTo(patch[i][0], patch[i][1]);
    p.closePath();
    c.fillStyle = "rgba(148, 130, 65, 0.14)";
    c.fill(p);
    c.strokeStyle = "rgba(180, 153, 82, 0.2)";
    c.stroke(p);
  }
  for (const patch of style.canyon || []) {
    const p = new Path2D();
    p.moveTo(patch[0][0], patch[0][1]);
    for (let i = 1; i < patch.length; i += 1) p.lineTo(patch[i][0], patch[i][1]);
    p.closePath();
    c.fillStyle = "rgba(45, 34, 23, 0.45)";
    c.fill(p);
    c.strokeStyle = "rgba(202, 152, 83, 0.2)";
    c.stroke(p);
  }

  // 等高线
  c.strokeStyle = style.contour;
  c.lineWidth = 1;
  for (let i = 0; i < 13; i += 1) {
    c.beginPath();
    const w = 180 + i * 34;
    const h = 150 + i * 26;
    c.ellipse(500, 510, w, h, -0.22, 0, Math.PI * 2);
    c.stroke();
  }

  // 水体
  for (const lake of style.lakes) {
    c.beginPath();
    c.moveTo(lake[0][0], lake[0][1]);
    for (let i = 1; i < lake.length; i += 1) c.lineTo(lake[i][0], lake[i][1]);
    c.closePath();
    c.fillStyle = "rgba(22, 70, 74, 0.86)";
    c.fill();
    c.strokeStyle = "rgba(101, 178, 161, 0.35)";
    c.stroke();
  }
  for (const river of style.rivers) {
    c.beginPath();
    c.moveTo(river[0][0], river[0][1]);
    for (let i = 1; i < river.length - 1; i += 1) {
      const midX = (river[i][0] + river[i + 1][0]) / 2;
      const midY = (river[i][1] + river[i + 1][1]) / 2;
      c.quadraticCurveTo(river[i][0], river[i][1], midX, midY);
    }
    c.strokeStyle = style.river;
    c.lineWidth = 5;
    c.lineCap = "round";
    c.stroke();
    c.strokeStyle = "rgba(145, 206, 189, 0.16)";
    c.lineWidth = 1.5;
    c.stroke();
  }

  // 道路
  for (const road of style.roads) {
    c.beginPath();
    c.moveTo(road[0][0], road[0][1]);
    for (let i = 1; i < road.length - 1; i += 1) {
      const midX = (road[i][0] + road[i + 1][0]) / 2;
      const midY = (road[i][1] + road[i + 1][1]) / 2;
      c.quadraticCurveTo(road[i][0], road[i][1], midX, midY);
    }
    c.strokeStyle = "rgba(17, 22, 17, 0.64)";
    c.lineWidth = 4;
    c.stroke();
    c.strokeStyle = style.road;
    c.lineWidth = 1.6;
    c.stroke();
  }

  // 城镇点
  for (const [x, y] of style.towns) {
    c.fillStyle = style.town;
    c.fillRect(x - 2.4, y - 2.4, 4.8, 4.8);
    c.strokeStyle = "rgba(15, 20, 16, 0.9)";
    c.lineWidth = 1;
    c.strokeRect(x - 4, y - 4, 8, 8);
  }

  c.restore();

  // 网格与分区
  c.save();
  c.strokeStyle = "rgba(137, 173, 150, 0.1)";
  c.lineWidth = 1;
  for (let i = 0; i <= 10; i += 1) {
    const p = i * 100;
    c.beginPath();
    c.moveTo(p, 0);
    c.lineTo(p, 1000);
    c.stroke();
    c.beginPath();
    c.moveTo(0, p);
    c.lineTo(1000, p);
    c.stroke();
  }
  if (state.showSectors) {
    c.fillStyle = "rgba(181, 205, 183, 0.34)";
    c.font = "10px ui-monospace, monospace";
    c.textAlign = "center";
    for (let i = 0; i < 10; i += 1) {
      c.fillText(SECTOR_COLS[i], i * 100 + 50, 14);
      c.fillStyle = "rgba(181, 205, 183, 0.2)";
      c.fillText(SECTOR_COLS[i], i * 100 + 50, 990);
      c.fillStyle = "rgba(181, 205, 183, 0.34)";
      c.textAlign = "right";
      c.fillText(String(i + 1), 16, i * 100 + 55);
      c.textAlign = "left";
      c.fillStyle = "rgba(181, 205, 183, 0.2)";
      c.fillText(String(i + 1), 984, i * 100 + 55);
      c.textAlign = "center";
      c.fillStyle = "rgba(181, 205, 183, 0.34)";
    }
    // 浅色分区线，让 10×10 可读
    c.strokeStyle = "rgba(232, 180, 96, 0.08)";
    for (let i = 1; i < 10; i += 1) {
      c.beginPath();
      c.moveTo(i * 100, 20);
      c.lineTo(i * 100, 980);
      c.stroke();
      c.beginPath();
      c.moveTo(20, i * 100);
      c.lineTo(980, i * 100);
      c.stroke();
    }
  }
  c.restore();

  // 海岸高光
  c.save();
  c.strokeStyle = "rgba(126, 199, 168, 0.18)";
  c.lineWidth = 0.8;
  c.setLineDash([4, 12]);
  c.stroke(path);
  c.restore();

  // 角落注记
  c.fillStyle = "rgba(170, 191, 170, 0.30)";
  c.font = "9px ui-monospace, monospace";
  c.fillText(`${style.label} / SCHEMATIC`, 24, 976);

  state.baseCanvas = off;
}

/* ------------------------------------------------------------------ */
/* 热力与点阵                                                         */
/* ------------------------------------------------------------------ */

function buildHeat() {
  const cells = layerData();
  const stats = layerStats();
  const binSize = 40;
  const bins = new Map();

  for (const [x, y, n] of cells) {
    const bx = Math.floor(x / binSize);
    const by = Math.floor(y / binSize);
    const key = `${bx},${by}`;
    const bin = bins.get(key) || { x: 0, y: 0, n: 0, w: 0 };
    bin.x += x * n;
    bin.y += y * n;
    bin.n += n;
    bin.w += n;
    bins.set(key, bin);
  }

  const values = [...bins.values()].map((bin) => ({
    x: bin.x / Math.max(1, bin.w),
    y: bin.y / Math.max(1, bin.w),
    n: bin.n
  }));
  const max = Math.max(1, ...values.map((v) => v.n));

  const heat = document.createElement("canvas");
  heat.width = 1000;
  heat.height = 1000;
  const hc = heat.getContext("2d");
  hc.globalCompositeOperation = "source-over";

  for (const bin of values) {
    const t = clamp(Math.pow(bin.n / max, 0.42), 0, 1);
    const [r, g, b] = heatColor(t);
    const radius = 28 + state.radius * 1.15;
    const alpha = 0.045 + Math.pow(t, 0.7) * 0.38;
    const gradient = hc.createRadialGradient(bin.x, bin.y, 0, bin.x, bin.y, radius);
    gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${alpha})`);
    gradient.addColorStop(0.34, `rgba(${r}, ${g}, ${b}, ${alpha * 0.68})`);
    gradient.addColorStop(0.7, `rgba(${r}, ${g}, ${b}, ${alpha * 0.2})`);
    gradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);
    hc.fillStyle = gradient;
    hc.beginPath();
    hc.arc(bin.x, bin.y, radius, 0, Math.PI * 2);
    hc.fill();
  }

  // 高分位单元加“热核”，避免大范围插值把尖峰抹平。
  const ranked = [...cells].sort((a, b) => b[2] - a[2]).slice(0, 90);
  for (const [x, y, n] of ranked) {
    const t = clamp(Math.pow(n / Math.max(1, stats.max), 0.42), 0, 1);
    const [r, g, b] = heatColor(t);
    const radius = 7 + t * 12;
    const gradient = hc.createRadialGradient(x, y, 0, x, y, radius);
    gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${0.12 + t * 0.34})`);
    gradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);
    hc.fillStyle = gradient;
    hc.beginPath();
    hc.arc(x, y, radius, 0, Math.PI * 2);
    hc.fill();
  }

  state.heatCanvas = heat;
  state.heatKey = `${state.map}:${state.layer}:${state.radius}`;
}

function drawPoints(c) {
  const cells = layerData();
  const stats = layerStats();
  const max = Math.max(1, stats.max || 1);
  c.save();
  c.globalCompositeOperation = "source-over";
  for (const [x, y, n] of cells) {
    const t = clamp(Math.pow(n / max, 0.45), 0, 1);
    const [r, g, b] = heatColor(t);
    c.fillStyle = `rgba(${r}, ${g}, ${b}, ${0.22 + t * 0.52})`;
    c.beginPath();
    c.arc(x, y, 0.8 + t * 2.2, 0, Math.PI * 2);
    c.fill();
  }
  c.restore();
}

function drawSelected(c) {
  if (!state.selected) return;
  const { x, y, n } = state.selected;
  c.save();
  c.strokeStyle = "rgba(255, 226, 155, 0.94)";
  c.lineWidth = 1.5;
  c.setLineDash([4, 4]);
  c.beginPath();
  c.arc(x, y, 16, 0, Math.PI * 2);
  c.stroke();
  c.setLineDash([]);
  c.fillStyle = "rgba(255, 226, 155, 0.95)";
  c.beginPath();
  c.arc(x, y, 3, 0, Math.PI * 2);
  c.fill();
  c.fillStyle = "rgba(7, 17, 15, 0.85)";
  c.fillRect(x + 18, y - 22, 48, 17);
  c.strokeStyle = "rgba(232, 180, 96, 0.5)";
  c.strokeRect(x + 18, y - 22, 48, 17);
  c.fillStyle = "#ffdd9a";
  c.font = "10px ui-monospace, monospace";
  c.textAlign = "left";
  c.fillText(fmt(n), x + 23, y - 10);
  c.restore();
}

function draw() {
  if (!state.baseCanvas) return;
  ctx.clearRect(0, 0, 1000, 1000);
  ctx.drawImage(state.baseCanvas, 0, 0);

  if ((state.view === "heat" || state.view === "both") && state.heatCanvas) {
    ctx.save();
    ctx.globalCompositeOperation = "source-over";
    ctx.globalAlpha = 0.92;
    ctx.drawImage(state.heatCanvas, 0, 0);
    ctx.restore();
  }

  if (state.view === "points" || state.view === "both") drawPoints(ctx);

  // 选中点
  drawSelected(ctx);

  // 细网格框
  ctx.save();
  ctx.strokeStyle = "rgba(232, 180, 96, 0.22)";
  ctx.lineWidth = 2;
  ctx.strokeRect(1, 1, 998, 998);
  ctx.restore();
}

/* ------------------------------------------------------------------ */
/* 统计与解读                                                         */
/* ------------------------------------------------------------------ */

function sectorAggregates(cells) {
  const bins = new Map();
  for (const [x, y, n] of cells) {
    const s = sectorOf(x, y);
    bins.set(s, (bins.get(s) || 0) + n);
  }
  return [...bins.entries()].sort((a, b) => b[1] - a[1]);
}

function topSectors(cells, limit = 5) {
  return sectorAggregates(cells).slice(0, limit);
}

function topSector(cells) {
  return sectorAggregates(cells)[0]?.[0] || "—";
}

function renderHotList(cells) {
  const list = $("#hot-list");
  const top = topSectors(cells, 5);
  const max = Math.max(1, top[0]?.[1] || 1);
  list.innerHTML = "";
  top.forEach(([sector, value], i) => {
    const li = document.createElement("li");
    li.title = `${sector} · 权重 ${value.toLocaleString("zh-CN")}`;
    li.innerHTML = `
      <span class="rank">${String(i + 1).padStart(2, "0")}</span>
      <span class="sector">${sector}</span>
      <span class="bar" style="width:${Math.max(4, (value / max) * 100)}%"></span>
      <span class="value">${fmt(value)}</span>
    `;
    list.appendChild(li);
  });
}

function renderInsight(cells, stats) {
  const aggregates = sectorAggregates(cells);
  const top = aggregates.slice(0, 5);
  const topShare = top.reduce((s, [, v]) => s + v, 0) / Math.max(1, stats.weighted);
  const first = top[0];
  const layer = state.layer;
  const mapName = state.map === "ERANGEL" ? "Erangel 数据域" : "Miramar 数据域";
  let text = "";
  let note = "";

  if (layer === "death") {
    const phaseLabel = state.phase === "all"
      ? "全部时间段"
      : state.deaths?.meta.phaseLabels?.[state.phase] || state.phase;
    const causeLabel = state.cause === "all"
      ? "全部死因"
      : state.deaths?.meta.causeLabels?.[state.cause] || state.cause;
    text = `${mapName} · ${phaseLabel} · ${causeLabel}：死亡热区最集中在 ${first?.[0] || "—"}；前五扇区合计约 ${(topShare * 100).toFixed(1)}%。它描述的是历史死亡位置，不等于推荐落点，也不能单独解释胜负。`;
    note = "死亡热区包含交火、毒圈、载具、坠落等全部死亡；需要结合圈层、队伍路线和比赛阶段一起读。";
  } else if (layer === "first") {
    text = `${mapName}的首圈中心权重高度集中：${first?.[0] || "—"} 是最热扇区；前五个扇区合计占约 ${(topShare * 100).toFixed(1)}%。这类集中适合做“首圈落点/早期转移”的讨论，但不能直接推导为胜率。`;
    note = "首圈中心是安全区位置，不等于玩家落点；需要结合玩家落点数据才能判断跳点策略。";
  } else if (layer === "last") {
    text = `${mapName}的决赛圈样本更稀疏：${first?.[0] || "—"} 权重最高，前五扇区合计约 ${(topShare * 100).toFixed(1)}%。应优先看“决赛圈可能落在哪些区域”，而不是把单个格子当成固定答案。`;
    note = "决赛圈样本量远小于首圈；区域差异受样本与比赛版本影响，不能当作必然规律。";
  } else {
    text = `${mapName}的红区落点呈现局部集中：${first?.[0] || "—"} 权重最高，前五扇区合计约 ${(topShare * 100).toFixed(1)}%。可用于讨论“转移时如何避开高频红区”，但仍需结合路线和掩体。`;
    note = "红区是随机事件，聚合热区只表示历史频率，不预测下一局的具体落点。";
  }

  $("#insight-text").textContent = text;
  $("#insight-note").textContent = note;
  $("#insight-tag").textContent = `${state.map} / ${LAYER_LABEL[layer].en}`;
}

function renderStats(cells) {
  const stats = layerStats();
  const maxCell = cells.reduce((best, cur) => (cur[2] > (best?.[2] || -1) ? cur : best), null);
  $("#stat-cells").textContent = stats.cells.toLocaleString("zh-CN");
  $("#stat-weight").textContent = fmt(stats.weighted);
  $("#stat-max").textContent = fmt(stats.max);
  $("#stat-sector").textContent = topSector(cells);
  $("#map-eyebrow").textContent = `${state.map} / ${LAYER_LABEL[state.layer].en}`;
  $("#map-title").innerHTML = `${state.map} <span>${MAP_STYLES[state.map].cn}</span>`;
  $("#radius-value").textContent = state.radius;
  if (maxCell) {
    $("#hover-label").textContent = `峰值单元 X ${maxCell[0]} / Y ${maxCell[1]} · ${maxCell[2].toLocaleString("zh-CN")}`;
  }
}

function renderAll() {
  if (!state.atlas) return;
  const cells = layerData();
  const stats = layerStats();
  // 更新图层计数
  $$("[data-count]").forEach((el) => {
    const key = el.dataset.count;
    if (key === "death") {
      if (state.deaths) {
        const total = Object.values(state.deaths.maps || {}).reduce(
          (sum, map) => sum + (map.stats?.weighted || 0),
          0
        );
        el.textContent = fmt(total);
      } else if (!state.deathLoading) {
        el.textContent = "—";
      }
      return;
    }
    const s = state.atlas.maps[state.map].stats[key];
    el.textContent = fmt(s.weighted);
  });
  if (!state.baseCanvas || state.baseKey !== `${state.map}:${state.showSectors}`) {
    drawBase();
    state.baseKey = `${state.map}:${state.showSectors}`;
  }
  const heatKey = `${state.map}:${state.layer}:${state.radius}:${state.layer === "death" ? `${state.phase}/${state.cause}` : ""}`;
  if (state.heatKey !== heatKey) buildHeat();
  draw();
  renderStats(cells);
  renderHotList(cells);
  renderInsight(cells, stats);
}

/* ------------------------------------------------------------------ */
/* 交互                                                               */
/* ------------------------------------------------------------------ */

function setMap(map) {
  if (!MAP_STYLES[map]) return;
  state.map = map;
  state.selected = null;
  state.hover = null;
  $$(".map-switch button").forEach((b) => b.classList.toggle("is-active", b.dataset.map === map));
  renderAll();
}

async function setLayer(layer) {
  if (!LAYER_LABEL[layer]) return;
  if (layer === "death") await ensureDeaths();
  if (layer === "death" && !state.deaths) return;
  state.layer = layer;
  state.selected = null;
  state.hover = null;
  $$(".layer-list button").forEach((b) => b.classList.toggle("is-active", b.dataset.layer === layer));
  $("#death-controls").hidden = layer !== "death";
  renderAll();
}

function setPhase(phase) {
  state.phase = phase;
  state.selected = null;
  $$(".phase-chips button").forEach((b) => b.classList.toggle("is-active", b.dataset.phase === phase));
  renderAll();
}

function setCause(cause) {
  state.cause = cause;
  state.selected = null;
  renderAll();
}

function setView(view) {
  state.view = view;
  $$(".segmented button").forEach((b) => b.classList.toggle("is-active", b.dataset.view === view));
  draw();
}

function setRadius(value) {
  state.radius = Number(value);
  $("#radius-value").textContent = state.radius;
  renderAll();
}

function pointerToMap(event) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: ((event.clientX - rect.left) / rect.width) * 1000,
    y: ((event.clientY - rect.top) / rect.height) * 1000
  };
}

function nearestCell(point) {
  const cells = layerData();
  let best = null;
  let bestDist = Infinity;
  const maxDist = 9;
  for (const [x, y, n] of cells) {
    const dx = x - point.x;
    const dy = y - point.y;
    const d = Math.hypot(dx, dy);
    if (d < bestDist && d <= maxDist) {
      bestDist = d;
      best = { x, y, n };
    }
  }
  return best;
}

function updateTooltip(event, cell, point) {
  if (!cell) {
    tooltip.hidden = true;
    $("#coordinate").textContent = `X ${Math.round(point.x)} / Y ${Math.round(point.y)}`;
    $("#hover-label").textContent = "移动指针查看单元计数";
    return;
  }
  tooltip.hidden = false;
  $("#tip-sector").textContent = `SECTOR ${sectorOf(cell.x, cell.y)}`;
  $("#tip-count").textContent = `${cell.n.toLocaleString("zh-CN")} 权重`;
  $("#tip-coord").textContent = `X ${cell.x} / Y ${cell.y}`;
  $("#coordinate").textContent = `X ${cell.x} / Y ${cell.y}`;
  $("#hover-label").textContent = `单元权重 ${cell.n.toLocaleString("zh-CN")}`;
  const frame = mapFrame.getBoundingClientRect();
  const x = clamp(event.clientX - frame.left + 10, 8, frame.width - 150);
  const y = clamp(event.clientY - frame.top, 40, frame.height - 40);
  tooltip.style.left = `${x}px`;
  tooltip.style.top = `${y}px`;
}

let hoverRaf = 0;
canvas.addEventListener("mousemove", (event) => {
  const point = pointerToMap(event);
  if (hoverRaf) return;
  hoverRaf = requestAnimationFrame(() => {
    hoverRaf = 0;
    const cell = nearestCell(point);
    state.hover = cell;
    updateTooltip(event, cell, point);
  });
});

canvas.addEventListener("click", (event) => {
  const point = pointerToMap(event);
  const cell = nearestCell(point);
  if (cell) {
    state.selected = cell;
    draw();
    updateTooltip(event, cell, point);
  }
});

canvas.addEventListener("mouseleave", () => {
  tooltip.hidden = true;
  state.hover = null;
  $("#coordinate").textContent = "X — / Y —";
  $("#hover-label").textContent = "移动指针查看单元计数";
});

$$(".map-switch button").forEach((button) => {
  button.addEventListener("click", () => setMap(button.dataset.map));
});

$$(".layer-list button").forEach((button) => {
  button.addEventListener("click", () => setLayer(button.dataset.layer));
});

$$(".segmented button").forEach((button) => {
  button.addEventListener("click", () => setView(button.dataset.view));
});

$$(".phase-chips button").forEach((button) => {
  button.addEventListener("click", () => setPhase(button.dataset.phase));
});

$("#cause-select").addEventListener("change", (event) => setCause(event.target.value));

$("#radius").addEventListener("input", (event) => setRadius(event.target.value));
$("#show-sectors").addEventListener("change", (event) => {
  state.showSectors = event.target.checked;
  renderAll();
});

$("#reset-btn").addEventListener("click", () => {
  state.map = "ERANGEL";
  state.layer = "first";
  state.phase = "all";
  state.cause = "all";
  state.view = "heat";
  state.radius = 34;
  state.showSectors = true;
  state.selected = null;
  $("#radius").value = 34;
  $("#show-sectors").checked = true;
  $("#cause-select").value = "all";
  $("#death-controls").hidden = true;
  $$(".phase-chips button").forEach((b) => b.classList.toggle("is-active", b.dataset.phase === "all"));
  $$(".map-switch button").forEach((b) => b.classList.toggle("is-active", b.dataset.map === "ERANGEL"));
  $$(".layer-list button").forEach((b) => b.classList.toggle("is-active", b.dataset.layer === "first"));
  $$(".segmented button").forEach((b) => b.classList.toggle("is-active", b.dataset.view === "heat"));
  renderAll();
});

$("#export-btn").addEventListener("click", () => {
  const out = document.createElement("canvas");
  out.width = 1200;
  out.height = 1200;
  const oc = out.getContext("2d");
  oc.fillStyle = "#07100f";
  oc.fillRect(0, 0, 1200, 1200);
  oc.drawImage(canvas, 60, 60, 1000, 1000);
  oc.fillStyle = "rgba(7,16,15,0.82)";
  oc.fillRect(60, 60, 1000, 38);
  oc.fillStyle = "#e8b460";
  oc.font = "16px ui-monospace, monospace";
  oc.fillText(`TACTICAL ATLAS / ${state.map} / ${LAYER_LABEL[state.layer].en}`, 76, 86);
  oc.fillStyle = "rgba(219,231,220,0.58)";
  oc.font = "11px ui-monospace, monospace";
  oc.fillText("Schematic map · aggregate counts · research prototype", 76, 1112);
  oc.fillText(`radius ${state.radius} · generated ${new Date().toISOString().slice(0, 10)}`, 76, 1132);
  out.toBlob((blob) => {
    if (!blob) return;
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `tactical-atlas-${state.map}-${state.layer}.png`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 5000);
  }, "image/png");
});

$("#method-btn").addEventListener("click", () => METHOD_DIALOG.showModal());
$("#method-link").addEventListener("click", () => METHOD_DIALOG.showModal());
METHOD_DIALOG.addEventListener("click", (event) => {
  if (event.target === METHOD_DIALOG) METHOD_DIALOG.close();
});

window.addEventListener("keydown", (event) => {
  if (event.target instanceof HTMLInputElement) return;
  const key = event.key.toLowerCase();
  if (key === "1") setMap("ERANGEL");
  if (key === "2") setMap("MIRAMAR");
  if (key === "q") setLayer("first");
  if (key === "w") setLayer("last");
  if (key === "e") setLayer("red");
  if (key === "h") setView(state.view === "heat" ? "points" : "heat");
  if (key === "escape") {
    state.selected = null;
    draw();
  }
});

/* ------------------------------------------------------------------ */
/* 启动                                                               */
/* ------------------------------------------------------------------ */

async function boot() {
  try {
    const response = await fetch("./data/atlas.json", { cache: "no-store" });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    state.atlas = await response.json();
    state.baseKey = "";
    state.heatKey = "";
    renderAll();
    // 默认视图：首圈 · Erangel
    setMap("ERANGEL");
    setLayer("first");
    window.__ATLAS_READY__ = true;
    window.__ATLAS__ = {
      state,
      setMap,
      setLayer,
      setView,
      setRadius,
      heat: () => state.heatCanvas,
      base: () => state.baseCanvas
    };
  } catch (error) {
    console.error("[atlas] load failed", error);
    $("#hover-label").textContent = "数据加载失败";
    $("#insight-text").textContent = "无法载入 data/atlas.json。请通过本地静态服务器打开，而不是 file:// 双击。";
  }
}

boot();
