function getInputValue(input) {
  const parsed = Number(input.value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function drawPnlChart({ revenue, cogs, opex, ebit }) {
  const canvas = document.getElementById("pnl-chart");
  if (!canvas) {
    return;
  }
  const ctx = canvas.getContext("2d");
  const { width, height } = canvas;

  const padding = 44;
  const chartHeight = height - padding * 2 - 10;
  const chartWidth = width - padding * 2;
  const quarters = ["Q1", "Q2", "Q3", "Q4"];

  const series = [
    { name: "Revenue", values: revenue, color: "#10b981" },
    { name: "COGS", values: cogs, color: "#ef4444" },
    { name: "OPEX", values: opex, color: "#f97316" },
  ];

  const allValues = [...revenue, ...cogs, ...opex, ...ebit, 0];
  const minVal = Math.min(...allValues);
  const maxVal = Math.max(...allValues);
  const range = Math.max(maxVal - minVal, 1);
  const yForValue = (val) => padding + ((maxVal - val) / range) * chartHeight;
  const zeroY = yForValue(0);

  ctx.clearRect(0, 0, width, height);

  ctx.strokeStyle = "#d1d5db";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(padding, padding);
  ctx.lineTo(padding, height - padding);
  ctx.moveTo(padding, zeroY);
  ctx.lineTo(width - padding, zeroY);
  ctx.stroke();

  const groupCount = 4;
  const barCountPerGroup = series.length;
  const groupGap = 28;
  const innerGap = 8;
  const groupWidth = (chartWidth - groupGap * (groupCount - 1)) / groupCount;
  const barWidth = (groupWidth - innerGap * (barCountPerGroup - 1)) / barCountPerGroup;

  series.forEach((s, sIndex) => {
    ctx.fillStyle = s.color;
    for (let q = 0; q < 4; q += 1) {
      const groupX = padding + q * (groupWidth + groupGap);
      const x = groupX + sIndex * (barWidth + innerGap);
      const y = yForValue(s.values[q]);
      const topY = Math.min(y, zeroY);
      const barHeight = Math.max(Math.abs(y - zeroY), 2);
      ctx.fillRect(x, topY, barWidth, barHeight);
    }
  });

  // Quarter labels
  ctx.fillStyle = "#111827";
  ctx.font = "14px Arial";
  ctx.textAlign = "center";
  for (let q = 0; q < 4; q += 1) {
    const groupX = padding + q * (groupWidth + groupGap);
    ctx.fillText(quarters[q], groupX + groupWidth / 2, height - padding + 20);
  }

  // EBIT line
  ctx.strokeStyle = "#2563eb";
  ctx.lineWidth = 2;
  ctx.beginPath();
  for (let q = 0; q < 4; q += 1) {
    const groupX = padding + q * (groupWidth + groupGap);
    const x = groupX + groupWidth / 2;
    const y = yForValue(ebit[q]);
    if (q === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();

  // EBIT points
  ctx.fillStyle = "#2563eb";
  for (let q = 0; q < 4; q += 1) {
    const groupX = padding + q * (groupWidth + groupGap);
    const x = groupX + groupWidth / 2;
    const y = yForValue(ebit[q]);
    ctx.beginPath();
    ctx.arc(x, y, 4, 0, Math.PI * 2);
    ctx.fill();
  }
}

function updatePnlTable() {
  const revenueRow = document.querySelector('tr[data-row="Revenue"]');
  const cogsRow = document.querySelector('tr[data-row="COGS"]');
  const opexRow = document.querySelector('tr[data-row="OPEX"]');
  const ebitRow = document.querySelector('tr[data-row="EBIT"]');

  if (!revenueRow || !cogsRow || !opexRow || !ebitRow) {
    return;
  }

  const revenueInputs = Array.from(revenueRow.querySelectorAll("input"));
  const cogsInputs = Array.from(cogsRow.querySelectorAll("input"));
  const opexInputs = Array.from(opexRow.querySelectorAll("input"));
  const ebitQuarterCells = Array.from(ebitRow.querySelectorAll(".ebit-quarter"));

  let revenueTotal = 0;
  let cogsTotal = 0;
  let opexTotal = 0;
  let ebitTotal = 0;
  const quarters = { revenue: [], cogs: [], opex: [], ebit: [] };

  for (let i = 0; i < 4; i += 1) {
    const revenue = getInputValue(revenueInputs[i]);
    const cogs = getInputValue(cogsInputs[i]);
    const opex = getInputValue(opexInputs[i]);
    const ebit = revenue + cogs + opex;

    ebitQuarterCells[i].textContent = String(ebit);
    revenueTotal += revenue;
    cogsTotal += cogs;
    opexTotal += opex;
    ebitTotal += ebit;

    quarters.revenue.push(revenue);
    quarters.cogs.push(cogs);
    quarters.opex.push(opex);
    quarters.ebit.push(ebit);
  }

  revenueRow.querySelector(".row-total").textContent = String(revenueTotal);
  cogsRow.querySelector(".row-total").textContent = String(cogsTotal);
  opexRow.querySelector(".row-total").textContent = String(opexTotal);
  document.getElementById("ebit-total").textContent = String(ebitTotal);

  drawPnlChart(quarters);
}

const inputs = document.querySelectorAll(".pnl-input");
inputs.forEach((input) => {
  input.addEventListener("input", updatePnlTable);
});

updatePnlTable();
