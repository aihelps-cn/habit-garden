// 小小成长家 v3 · 金句库
// 诗词、每日英文、励志短句 —— 孩子完成任务时随机展示

// ========== 古诗词（选句，温柔有力量） ==========
export const poetry = [
  '千里之行，始于足下。 ——《老子》',
  '学而时习之，不亦说乎。 ——《论语》',
  '锲而不舍，金石可镂。 ——《荀子》',
  '不积小流，无以成江海。 ——《荀子》',
  '一分耕耘，一分收获。',
  '宝剑锋从磨砺出，梅花香自苦寒来。',
  '世上无难事，只怕有心人。',
  '滴水能穿石，功到自然成。',
  '少壮不努力，老大徒伤悲。 ——《长歌行》',
  '莫等闲，白了少年头，空悲切。 ——岳飞',
  '黑发不知勤学早，白首方悔读书迟。 ——颜真卿',
  '纸上得来终觉浅，绝知此事要躬行。 ——陆游',
  '路漫漫其修远兮，吾将上下而求索。 ——屈原',
  '天生我材必有用，千金散尽还复来。 ——李白',
  '长风破浪会有时，直挂云帆济沧海。 ——李白',
  '山重水复疑无路，柳暗花明又一村。 ——陆游',
  '宝剑锋从磨砺出，梅花香自苦寒来。',
  '不经一番寒彻骨，怎得梅花扑鼻香。',
];

// ========== 每日英文（短句，励志好记） ==========
export const dailyEnglish = [
  'A little progress every day adds up to big results.',
  // 每天一点点进步，积累成大成果。
  'Small steps lead to big dreams.',
  // 小步迈向大梦想。
  'Believe in yourself. You are braver than you know.',
  // 相信自己。你比想象中更勇敢。
  'Every day is a new beginning.',
  // 每一天都是新的开始。
  'Hard work beats talent when talent does not work hard.',
  // 天赋不努力，努力胜天赋。
  'Do not stop until you are proud.',
  // 不停下，直到你自豪。
  'The future depends on what you do today.',
  // 未来取决于今天做什么。
  'It is always too early to give up.',
  // 放弃永远太早。
  'Dream big. Start small. Act now.',
  // 梦想远大，从小开始，现在行动。
  'You are capable of amazing things.',
  // 你能做出了不起的事。
  'Keep going, you are doing great!',
  // 继续，你做得很棒！
  'Be the best version of yourself.',
  // 做最好的自己。
  'Stars cannot shine without darkness.',
  // 没有黑暗，星星不会闪耀。
  'The only way to do great work is to love what you do.',
  // 做出好工作的唯一方法是热爱你所做的。
];

// ========== 金句 / 励志话 ==========
export const goldenQuotes = [
  // 努力与坚持
  '坚持是最简单的优秀。',
  '你今天的努力，是幸运的伏笔。',
  '没有白走的路，每一步都算数。',
  '慢慢来，比较快。',
  // 成长
  '成长不是直线向上，而是螺旋上升。',
  '你正在长成一个了不起的人。',
  '每一个好习惯，都是给自己的一份礼物。',
  // 自信
  '你比自己想象的更厉害。',
  '勇敢地试错，也是一种了不起。',
  '别怕做得不够好，先做起来最重要。',
  // 家人
  '爸爸妈妈为你的每一份努力感到骄傲。',
  '有一个家在你身后，你只管往前跑。',
  '被爱浇灌的孩子，会长成参天大树。',
  // 小小哲理
  '今天能做的事，不要留到明天。',
  '整理好小事情，才能成就大梦想。',
  '认真对待每一件小事，大事自然成。',
  // 治愈系
  '你不需要很厉害才能开始，但你需要开始才能很厉害。',
  '允许自己偶尔停下，休息也是前进的一部分。',
  '你值得被温柔以待，包括来自自己的温柔。',
];

// 全部金句合并（用于随机选一句）
export const allQuotes = [...poetry.map(q => ({ text: q, kind: '📜 诗词' })),
                          ...dailyEnglish.map(q => ({ text: q, kind: '🌍 每日英文' })),
                          ...goldenQuotes.map(q => ({ text: q, kind: '✨ 金句' }))];

// 随机选一句（可以指定只从某类选）
export function randomQuote(kind) {
  let pool = allQuotes;
  if (kind === 'poetry') pool = allQuotes.filter(q => q.kind.includes('诗词'));
  else if (kind === 'english') pool = allQuotes.filter(q => q.kind.includes('英文'));
  else if (kind === 'golden') pool = allQuotes.filter(q => q.kind.includes('金句'));
  return pool[Math.floor(Math.random() * pool.length)];
}

// 返回一段适合在 checkin modal 里展示的 HTML
export function quoteBubble() {
  const q = randomQuote();
  return `<div class="quote-bubble"><span class="quote-kind">${q.kind}</span><p>${q.text}</p></div>`;
}
