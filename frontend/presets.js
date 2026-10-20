// 小小成长家 v3 · 预设库
// 按分类组织的任务模板、奖励模板、鼓励词库和 emoji 集合

// ========== emoji 分类库（替换原来 12 个的硬编码） ==========
export const emojiBank = {
  '学习成长': ['📖','✏️','🧠','🎓','📝','📚','🔤','🔢','🎨','🎹','🎯','🏆','🔬','🗺️','🧩','📐'],
  '家务劳动': ['🧹','🪥','🛏️','🍳','🧼','🧺','🚿','🧽','🪴','🏠','👕','🥣','🧯','🗑️','🧴','🧰'],
  '生活习惯': ['🌅','🥛','🏃','🧘','💧','🌙','💤','😴','🧸','🚶','🤝','💚','🧑‍🤝‍🧑','⏰','🌱','🦷'],
  '奖励/礼物': ['🎁','🍦','📺','💰','🎮','🍰','🎈','🧸','📚','🎨','🎤','🚗','🌸','⭐','💎','🏆'],
  '运动/活动': ['⚽','🏀','🏃','🚴','🏊','🧗','🛷','⛸️','🎾','🏸','🏓','🥊','🧘','🏋️','🎯','⛳'],
};

export const allEmojis = Object.values(emojiBank).flat();

// ========== 鼓励话语库 ==========
export const encouragement = [
  // 温柔短句
  '你太棒了！',
  '又前进了一小步 🌱',
  '坚持就是力量',
  '认真的样子真好看',
  '每一次都值得看见',
  '今天的你，比昨天更棒',
  '一点点努力，开出最美的花',
  '不积跬步，无以至千里',
  '你已经做得很好了',
  '继续加油，未来可期',
  // 更有温度的
  '爸爸妈妈看到你的努力啦 💛',
  '这一份认真，值得大大的赞',
  '好习惯，是送给自己最好的礼物',
  '每天的小坚持，终将变成大收获',
  '你在悄悄长大，我们都看得见',
  '一步一步来，你已经很棒了',
  '每一颗种子，都有属于自己的花期',
  // 适合不同分类的
  '学海无涯，乐在其中 📚',
  '劳动最光荣，你就是家庭的小帮手 🏡',
  '自律让你自由，好习惯让生活更美好 ✨',
];

// ========== 任务预设库 ==========
// 每个预设直接对应后端 taskSchema 的字段
export const taskPresets = [
  // 学习成长
  { name: '阅读课外书 20 分钟', category: '学习成长', icon: '📖', points: 5, note: '你读的每一页，都是通向新世界的门 ✨' },
  { name: '练字 15 分钟', category: '学习成长', icon: '✏️', points: 3, note: '字如其人，一笔一画都藏着用心' },
  { name: '背 5 个英语单词', category: '学习成长', icon: '🔤', points: 3, note: '一天五个，一年就会一千八百多个啦' },
  { name: '完成学校作业', category: '学习成长', icon: '📝', points: 8, note: '专注的你最可爱' },
  { name: '做口算 / 数学练习', category: '学习成长', icon: '🔢', points: 5, note: '数学思维，越练越灵光' },
  { name: '画画 / 做手工', category: '学习成长', icon: '🎨', points: 5, note: '艺术让世界多了一抹色彩 🎨' },
  { name: '练琴 30 分钟', category: '学习成长', icon: '🎹', points: 10, note: '悠扬的旋律，从坚持里生长' },
  { name: '听一段英语音频', category: '学习成长', icon: '🎧', points: 3, note: '磨耳朵，日积月累自然成' },
  { name: '写日记 / 周记', category: '学习成长', icon: '📓', points: 5, note: '记录今天，未来会感谢现在的自己' },
  { name: '复习错题 / 旧知识', category: '学习成长', icon: '🧠', points: 5, note: '温故而知新，知识会更牢固' },
  // 家务劳动
  { name: '整理自己的书桌', category: '家务劳动', icon: '🧹', points: 3, note: '整齐的环境，带来好心情' },
  { name: '叠被子 + 整理床铺', category: '家务劳动', icon: '🛏️', points: 3, note: '整理床铺，是对自己温柔的方式' },
  { name: '刷牙洗脸', category: '家务劳动', icon: '🪥', points: 2, note: '保持干净清爽，从每天两次开始' },
  { name: '帮着摆碗筷', category: '家务劳动', icon: '🥣', points: 3, note: '一起准备一家人的饭菜，很温馨' },
  { name: '倒垃圾', category: '家务劳动', icon: '🗑️', points: 2, note: '小小事情，让家更整洁' },
  { name: '擦桌子 / 餐桌', category: '家务劳动', icon: '🧽', points: 2, note: '饭后的餐桌，交给你啦' },
  { name: '浇花 / 照顾植物', category: '家务劳动', icon: '🪴', points: 2, note: '小植物也需要你的爱 🌱' },
  { name: '洗袜子 / 小衣物', category: '家务劳动', icon: '🧺', points: 3, note: '自己的事情自己做' },
  { name: '打扫自己的房间', category: '家务劳动', icon: '🏠', points: 8, note: '房间整洁，心情也会亮起来' },
  // 生活习惯
  { name: '早睡早起（按时睡觉）', category: '生活习惯', icon: '🌙', points: 5, note: '充足的睡眠，是最好的成长养分' },
  { name: '运动 / 户外活动 30 分钟', category: '生活习惯', icon: '🏃', points: 5, note: '身体动起来，能量满起来' },
  { name: '喝 8 杯水', category: '生活习惯', icon: '💧', points: 2, note: '多喝水，身体会感谢你' },
  { name: '主动打招呼 / 礼貌用语', category: '生活习惯', icon: '🤝', points: 3, note: '礼貌是最温柔的力量' },
  { name: '自己收拾书包 / 准备第二天', category: '生活习惯', icon: '🎒', points: 3, note: '提前准备，从容面对每一天' },
  { name: '关闭电子设备 1 小时', category: '生活习惯', icon: '🚫', points: 5, note: '放下屏幕，去感受真实的世界' },
  { name: '和家人拥抱 / 说谢谢', category: '生活习惯', icon: '💚', points: 3, note: '爱的表达，永远不会嫌多' },
  { name: '每天微笑三次', category: '生活习惯', icon: '😊', points: 1, note: '微笑是最好的魔法' },
];

// ========== 奖励预设库 ==========
export const rewardPresets = [
  // 实物 / 活动
  { name: '冰淇淋一个', icon: '🍦', type: 'reward', cost: 20, note: '甜甜的快乐时刻' },
  { name: '看一集动画片', icon: '📺', type: 'reward', cost: 15, note: '专注地享受半小时' },
  { name: '周末一起看电影', icon: '🎬', type: 'reward', cost: 50, note: '家庭电影夜 🎬' },
  { name: '去公园玩耍 2 小时', icon: '🌳', type: 'reward', cost: 30, note: '亲近自然，跑一跑跳一跳' },
  { name: '买一本喜欢的书', icon: '📚', type: 'reward', cost: 40, note: '书是通向世界的窗户' },
  { name: '买一件新玩具', icon: '🧸', type: 'reward', cost: 100, note: '努力换来说说想要什么' },
  { name: '吃一次麦当劳 / 肯德基', icon: '🍔', type: 'reward', cost: 60, note: '偶尔的小快乐' },
  { name: '和爸爸一起打篮球', icon: '🏀', type: 'reward', cost: 30, note: '运动 + 亲子时光 = 双倍快乐' },
  { name: '周末玩电子游戏 1 小时', icon: '🎮', type: 'reward', cost: 25, note: '专注玩，时间到了就停' },
  { name: '可以决定今晚吃什么', icon: '🍽️', type: 'reward', cost: 20, note: '小主人说了算 👑' },
  { name: '去游乐园一次', icon: '🎡', type: 'reward', cost: 200, note: '大大的梦想，小小的脚步' },
  { name: '买喜欢的零食礼包', icon: '🍭', type: 'reward', cost: 30, note: '健康零食，适量就好' },
  // 现金
  { name: '零花钱（现金）', icon: '💰', type: 'cash', cost: 10, note: '1 积分 = 1 元，攒起来也不少啦' },
];

// ========== 工具函数 ==========

// 从词库随机取一句
export function randomEncouragement() {
  return encouragement[Math.floor(Math.random() * encouragement.length)];
}

// 从 emoji 银行随机取一个（按分类）
export function randomEmoji(category) {
  const pool = emojiBank[category] || allEmojis;
  return pool[Math.floor(Math.random() * pool.length)];
}

// 生成一个预设选择器的 HTML（用于前端 modal）
export function presetPickerHtml(title, presets, kind) {
  // 按 category 分组
  const groups = {};
  for (const p of presets) {
    (groups[p.category || '全部'] ||= []).push(p);
  }
  const groupLabels = {
    '学习成长': '📚 学习成长',
    '家务劳动': '🏠 家务劳动',
    '生活习惯': '🌱 生活习惯',
    '奖励': '🎁 奖励',
    '现金': '💰 现金',
    '全部': '✨ 全部',
  };
  let html = `<div class="preset-picker" data-kind="${kind}"><label>${title}</label>`;
  for (const [cat, items] of Object.entries(groups)) {
    html += `<div class="preset-group"><h4>${groupLabels[cat] || cat}</h4>`;
    for (const p of items) {
      const summary = kind === 'task' ? `每日 +${p.points} 分` :
                      kind === 'reward' ? (p.type === 'cash' ? '现金 1:1' : `${p.cost} 积分`) : '';
      html += `<button type="button" class="preset-item" data-action="use-preset" data-kind="${kind}" data-preset="${encodeURIComponent(JSON.stringify(p))}">
        <span class="preset-emoji">${p.icon}</span>
        <span class="preset-info"><strong>${p.name}</strong><small>${summary}</small></span>
      </button>`;
    }
    html += `</div>`;
  }
  html += `</div>`;
  return html;
}
