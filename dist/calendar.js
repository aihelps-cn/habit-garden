// 小小成长家 v3 · GitHub 风格日历热力图
// 渲染按天聚合的积分 / 打卡统计

// 热度等级（与 GitHub 类似的 4 档渐变）
const LEVELS = ['#ebedf0', '#c6e48b', '#7bc96f', '#449d44', '#196127'];

function countLevel(count) {
  if (count === 0) return 0;
  if (count <= 2) return 1;
  if (count <= 5) return 2;
  if (count <= 10) return 3;
  return 4;
}

// 生成周视图格子（类似 GitHub）
// data: [{date, count, points}] 数组，按日期升序
export function calendarHeatmap(data) {
  if (!data?.length) return '<div class="empty">还没有足够的成长记录 🌱</div>';

  // 统计
  let totalDays = 0, totalCheckins = 0, totalPoints = 0, maxCount = 0, bestDay = '';
  let streak = 0, maxStreak = 0;
  const today = new Date().toISOString().slice(0, 10);

  for (let i = data.length - 1; i >= 0; i--) {
    const d = data[i];
    if (d.count > 0) {
      totalDays++;
      totalCheckins += d.count;
      totalPoints += d.points;
      if (d.count > maxCount) { maxCount = d.count; bestDay = d.date; }
      // 连续天数：从今天往前推
      if (d.date === today || (i === data.length - 1 && d.count > 0)) {
        streak++;
        maxStreak = Math.max(maxStreak, streak);
      } else if (streak > 0) {
        streak = 0;
      }
    }
  }
  // 修正 maxStreak：从后往前重新数一次更准确
  let run = 0;
  for (let i = data.length - 1; i >= 0; i--) {
    if (data[i].count > 0) { run++; maxStreak = Math.max(maxStreak, run); }
    else run = 0;
  }

  // 构建网格：从最早日期到今天，按周为列
  const firstDate = new Date(data[0].date + 'T00:00:00');
  // 找到 firstDate 所在周的周一（或周日，GitHub 用周日）
  const padding = firstDate.getDay(); // 0-6，周几到周日的天数
  const padded = [];
  for (let i = 0; i < padding; i++) padded.push({ date: '', count: 0, points: 0, padding: true });
  padded.push(...data);

  const months = new Set();
  const cells = [];
  let monthLabel = '';
  for (let i = 0; i < padded.length; i++) {
    const d = padded[i];
    const isMonday = i % 7 === 0;
    if (isMonday && d.date) {
      const m = new Date(d.date + 'T00:00:00');
      const label = `${m.getMonth() + 1}月`;
      if (label !== monthLabel) {
        cells.push(`<div class="cal-month-label">${label}</div>`);
        monthLabel = label;
      }
    }
    const level = d.padding ? 'cal-padding' : `cal-lvl-${countLevel(d.count)}`;
    const title = d.padding ? '' : `${d.date} · ${d.count} 项 · +${d.points} 积分`;
    cells.push(`<div class="cal-cell ${level}" title="${title}" data-date="${d.date || ''}" data-count="${d.count || 0}"></div>`);
  }

  return `
    <section class="calendar-wrap">
      <div class="calendar-stats">
        <div class="cal-stat"><div class="cal-stat-num">${totalCheckins}</div><div class="cal-stat-label">累计打卡次数</div></div>
        <div class="cal-stat"><div class="cal-stat-num">${totalDays}</div><div class="cal-stat-label">有记录的天数</div></div>
        <div class="cal-stat"><div class="cal-stat-num">${totalPoints}</div><div class="cal-stat-label">累计获得积分</div></div>
        <div class="cal-stat"><div class="cal-stat-num">${maxStreak}</div><div class="cal-stat-label">最长连续打卡天数 🔥</div></div>
      </div>
      <div class="calendar-grid-wrap">
        <div class="cal-weekdays"><span></span><span>一</span><span></span><span>三</span><span></span><span>五</span><span></span></div>
        <div class="cal-months"><div style="flex:${padding/7+1}"></div>${Array.from(months).map(m=>`<div>${m}</div>`).join('')}</div>
        <div class="calendar-grid">${cells.join('')}</div>
        <div class="cal-legend">
          <span>少</span>
          ${LEVELS.map((c,i)=>`<div class="cal-legend-cell" style="background:${c}" title="${i===0?'无':i===1?'1-2':i===2?'3-5':i===3?'6-10':'11+'}项}"></div>`).join('')}
          <span>多</span>
        </div>
      </div>
    </section>
  `;
}
