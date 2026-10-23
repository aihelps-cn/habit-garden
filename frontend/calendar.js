// 小小成长家 · 花园风格日历热力图
// 渲染按天聚合的积分 / 打卡统计

// 热度等级（花园主题绿色系，比 GitHub 更深沉温暖）
const LEVELS = ['#eef0e8', '#c9d7a8', '#9cb770', '#6a9348', '#3d6b2e'];

function countLevel(count) {
  if (count === 0) return 0;
  if (count <= 2) return 1;
  if (count <= 5) return 2;
  if (count <= 10) return 3;
  return 4;
}

// 生成周视图格子（按周为列，周几为行）
// data: [{date, count, points}] 数组，按日期升序
// days: 要展示的天数（移动端自动缩小）
export function calendarHeatmap(data, days = 365) {
  if (!data?.length) return '<div class="empty">还没有足够的成长记录 🌱</div>';

  // 如果数据比请求天数少，截取最近的
  const slice = data.length > days ? data.slice(data.length - days) : data;

  // 统计
  let totalDays = 0, totalCheckins = 0, totalPoints = 0, maxCount = 0;
  let streak = 0, maxStreak = 0;

  for (let i = slice.length - 1; i >= 0; i--) {
    const d = slice[i];
    if (d.count > 0) {
      totalDays++;
      totalCheckins += d.count;
      totalPoints += d.points;
      if (d.count > maxCount) maxCount = d.count;
    }
  }
  // 最长连续打卡（从后往前数连续 count>0 的最长序列）
  let run = 0;
  for (let i = slice.length - 1; i >= 0; i--) {
    if (slice[i].count > 0) { run++; maxStreak = Math.max(maxStreak, run); }
    else run = 0;
  }

  // 构建网格：从第一天到最后一天，补齐前后空白
  const firstDate = new Date(slice[0].date + 'T00:00:00');
  const lastDate = new Date(slice[slice.length - 1].date + 'T00:00:00');
  // 找到 firstDate 所在周的周一
  const dayOfWeek = firstDate.getDay(); // 0=周日, 1=周一 ...
  const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  const paddingBefore = daysToMonday; // 往前补到周一

  // 补齐到最后一天所在周的周日
  const lastDayOfWeek = lastDate.getDay();
  const daysToSunday = lastDayOfWeek === 0 ? 0 : 7 - lastDayOfWeek;
  const totalCells = paddingBefore + slice.length + daysToSunday;
  const totalWeeks = Math.ceil(totalCells / 7);

  // 构建带 padding 的数组
  const padded = [];
  for (let i = 0; i < paddingBefore; i++) padded.push({ date: '', count: 0, points: 0, padding: true });
  padded.push(...slice);
  for (let i = 0; i < daysToSunday; i++) padded.push({ date: '', count: 0, points: 0, padding: true });

  // 生成月份标签：每周第一列是该周的周一日期，取月份
  const weekMonths = [];
  for (let w = 0; w < totalWeeks; w++) {
    const idx = w * 7;
    const d = padded[idx];
    if (d.date) {
      const dt = new Date(d.date + 'T00:00:00');
      weekMonths.push(`${dt.getMonth() + 1}月`);
    } else if (idx + 6 < padded.length && padded[idx + 6].date) {
      // 如果整周都在 padding（不太可能），取周日
      const dt = new Date(padded[idx + 6].date + 'T00:00:00');
      weekMonths.push(`${dt.getMonth() + 1}月`);
    } else {
      weekMonths.push('');
    }
  }
  // 压缩连续重复的月份标签（只在首次出现时显示）
  const displayMonths = [];
  let lastMonth = '';
  for (const m of weekMonths) {
    if (m && m !== lastMonth) { displayMonths.push(m); lastMonth = m; }
    else displayMonths.push('');
  }

  // 生成单元格（按列优先，每列是一周）
  const cells = [];
  for (let w = 0; w < totalWeeks; w++) {
    for (let dow = 0; dow < 7; dow++) {
      const idx = w * 7 + dow;
      if (idx >= padded.length) break;
      const d = padded[idx];
      const level = d.padding ? 'cal-padding' : `cal-lvl-${countLevel(d.count)}`;
      const title = d.padding ? '' : `${d.date} · ${d.count} 项 · +${d.points} 积分`;
      cells.push(`<div class="cal-cell ${level}" title="${title}" data-date="${d.date || ''}" data-count="${d.count || 0}"></div>`);
    }
  }

  const levelLabels = ['无', '1-2 项', '3-5 项', '6-10 项', '11+ 项'];

  return `
    <section class="calendar-wrap">
      <div class="calendar-stats">
        <div class="cal-stat"><div class="cal-stat-num">${totalCheckins}</div><div class="cal-stat-label">累计打卡</div></div>
        <div class="cal-stat"><div class="cal-stat-num">${totalDays}</div><div class="cal-stat-label">活跃天数</div></div>
        <div class="cal-stat"><div class="cal-stat-num">${totalPoints}</div><div class="cal-stat-label">累计积分</div></div>
        <div class="cal-stat"><div class="cal-stat-num">${maxStreak}</div><div class="cal-stat-label">连续天数 🔥</div></div>
      </div>
      <div class="calendar-grid-wrap">
        <div class="cal-months" style="grid-template-columns:repeat(${totalWeeks},var(--cal-cell))">
          ${displayMonths.map(m => `<div>${m}</div>`).join('')}
        </div>
        <div class="cal-weekdays">
          <span class="cal-wd-label"></span>
          <span>一</span>
          <span class="cal-wd-dim"></span>
          <span>三</span>
          <span class="cal-wd-dim"></span>
          <span>五</span>
          <span class="cal-wd-dim"></span>
        </div>
        <div class="calendar-grid" style="grid-template-columns:repeat(${totalWeeks},var(--cal-cell))">${cells.join('')}</div>
        <div class="cal-legend">
          <span>少</span>
          ${LEVELS.map((c, i) => `<div class="cal-legend-cell" style="background:${c}" title="${levelLabels[i]}"></div>`).join('')}
          <span>多</span>
        </div>
      </div>
    </section>
  `;
}
