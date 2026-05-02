const positiveColor = "#10b981";
const negativeColor = "#ef4444";
const totalColor = "#2563eb";
const chartConfigs = [
  {
    name: "Financial",
    canvasId: "chart-financial",
    inputIds: ["revenue", "cogs", "opex"],
    labels: ["Revenue", "COGS", "OPEX"],
    totalLabel: "EBIT",
  },
  {
    name: "Scenario",
    canvasId: "chart-scenario",
    inputIds: ["volume", "price", "fixedCosts"],
    labels: ["Volume", "Price", "Fixed Costs"],
    totalLabel: "Net Impact",
  },
];
const latestRowsByChart = {};

function getValues(inputs) {
  return inputs.map((input) => {
    const parsed = Number(input.value);
    return Number.isFinite(parsed) ? parsed : 0;
  });
}

function drawChart(ctx, canvas, labels, totalLabel, values) {
  const { width, height } = canvas;
  const padding = 40;
  const chartHeight = height - padding * 2 - 20;
  const chartWidth = width - padding * 2;
  const gap = 26;
  const totalBarCount = values.length + 1;
  const barWidth = chartWidth / totalBarCount - gap;
  const runningTotals = [];
  let total = 0;

  values.forEach((value) => {
    const start = total;
    total += value;
    runningTotals.push({ start, end: total, change: value });
  });
  runningTotals.push({ start: 0, end: total, change: total, isTotal: true });

  const totals = runningTotals.flatMap((step) => [step.start, step.end]);
  const minTotal = Math.min(0, ...totals);
  const maxTotal = Math.max(0, ...totals);
  const range = Math.max(maxTotal - minTotal, 1);
  const yForValue = (val) => padding + ((maxTotal - val) / range) * chartHeight;

  ctx.clearRect(0, 0, width, height);

  ctx.strokeStyle = "#d1d5db";
  ctx.lineWidth = 1;
  const zeroY = yForValue(0);
  ctx.beginPath();
  ctx.moveTo(padding, padding);
  ctx.lineTo(padding, height - padding);
  ctx.moveTo(padding, zeroY);
  ctx.lineTo(width - padding, zeroY);
  ctx.stroke();

  runningTotals.forEach((step, index) => {
    const x = padding + index * (barWidth + gap) + 16;
    const yStart = yForValue(step.start);
    const yEnd = yForValue(step.end);
    const y = Math.min(yStart, yEnd);
    const barHeight = Math.max(Math.abs(yEnd - yStart), 2);

    if (step.isTotal) {
      ctx.fillStyle = totalColor;
    } else {
      ctx.fillStyle = step.change >= 0 ? positiveColor : negativeColor;
    }
    ctx.fillRect(x, y, barWidth, barHeight);

    if (!step.isTotal && index < runningTotals.length - 2) {
      const connectorY = yEnd;
      ctx.strokeStyle = "#9ca3af";
      ctx.setLineDash([5, 4]);
      ctx.beginPath();
      ctx.moveTo(x + barWidth, connectorY);
      ctx.lineTo(x + barWidth + gap, connectorY);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    ctx.fillStyle = "#111827";
    ctx.font = "14px Arial";
    ctx.textAlign = "center";
    ctx.fillText(step.isTotal ? totalLabel : labels[index], x + barWidth / 2, height - padding + 20);

    const valueText = step.isTotal
      ? String(step.end)
      : step.change >= 0
        ? `+${step.change}`
        : String(step.change);
    const insideY = y + barHeight / 2 + 5;
    ctx.fillStyle = "#ffffff";
    ctx.fillText(valueText, x + barWidth / 2, insideY);
  });
}

function bindDisplayValue(inputId) {
  const valueEl = document.querySelector(`[data-value-for="${inputId}"]`);
  const input = document.getElementById(inputId);
  if (!valueEl || !input) {
    return;
  }
  valueEl.textContent = input.value;
  input.addEventListener("input", () => {
    valueEl.textContent = input.value;
  });
}

function buildRows(config, values) {
  const rows = config.labels.map((label, index) => ({
    visual: config.name,
    item: label,
    value: values[index],
  }));
  const total = values.reduce((sum, value) => sum + value, 0);
  rows.push({
    visual: config.name,
    item: config.totalLabel,
    value: total,
  });
  return rows;
}

function updateDataTable() {
  const tbody = document.getElementById("data-table-body");
  if (!tbody) {
    return;
  }

  const allRows = chartConfigs.flatMap((config) => latestRowsByChart[config.canvasId] || []);
  tbody.innerHTML = allRows
    .map(
      (row) => `<tr><td>${row.visual}</td><td>${row.item}</td><td>${row.value}</td></tr>`,
    )
    .join("");
}

function copyTableData() {
  const status = document.getElementById("copy-status");
  const allRows = chartConfigs.flatMap((config) => latestRowsByChart[config.canvasId] || []);
  const lines = ["Visual\tItem\tValue", ...allRows.map((row) => `${row.visual}\t${row.item}\t${row.value}`)];
  const text = lines.join("\n");

  navigator.clipboard.writeText(text).then(
    () => {
      if (status) {
        status.textContent = "Copied.";
      }
    },
    () => {
      if (status) {
        status.textContent = "Copy failed. Select table text manually.";
      }
    },
  );
}

function escapeCsvCell(value) {
  const asText = String(value);
  if (asText.includes(",") || asText.includes("\"") || asText.includes("\n")) {
    return `"${asText.replaceAll("\"", "\"\"")}"`;
  }
  return asText;
}

function exportTableAsCsv() {
  const status = document.getElementById("copy-status");
  const allRows = chartConfigs.flatMap((config) => latestRowsByChart[config.canvasId] || []);
  const csvLines = [
    "Visual,Item,Value",
    ...allRows.map(
      (row) => `${escapeCsvCell(row.visual)},${escapeCsvCell(row.item)},${escapeCsvCell(row.value)}`,
    ),
  ];
  const csvContent = csvLines.join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const downloadLink = document.createElement("a");
  downloadLink.href = url;
  downloadLink.download = "waterfall-data.csv";
  downloadLink.click();
  URL.revokeObjectURL(url);

  if (status) {
    status.textContent = "CSV downloaded.";
  }
}

function setupChart(config) {
  const canvas = document.getElementById(config.canvasId);
  const ctx = canvas.getContext("2d");
  const inputs = config.inputIds.map((id) => document.getElementById(id));

  inputs.forEach((input, index) => {
    const inputId = config.inputIds[index];
    bindDisplayValue(inputId);
    input.addEventListener("input", render);
  });

  function render() {
    const values = getValues(inputs);
    drawChart(ctx, canvas, config.labels, config.totalLabel, values);
    latestRowsByChart[config.canvasId] = buildRows(config, values);
    updateDataTable();
  }

  render();
}

chartConfigs.forEach((config) => setupChart(config));

const copyButton = document.getElementById("copy-table-button");
if (copyButton) {
  copyButton.addEventListener("click", copyTableData);
}

const exportCsvButton = document.getElementById("export-csv-button");
if (exportCsvButton) {
  exportCsvButton.addEventListener("click", exportTableAsCsv);
}
