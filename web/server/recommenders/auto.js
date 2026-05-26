// 富邦車險推薦邏輯

const BUDGET_MAP = {
  economy: { min: 5000, max: 10000, label: '經濟型（10,000 以下 / 年）' },
  standard: { min: 10000, max: 30000, label: '標準型（10,000-30,000 / 年）' },
  premium: { min: 30000, max: 60000, label: '尊榮型（30,000+ / 年）' },
};

const COLORS = {
  compulsory: { label: '強制險', color: '#dc2626' },
  body: { label: '車體損失', color: '#1e3a5f' },
  third_party: { label: '第三人責任', color: '#f59e0b' },
  driver: { label: '駕駛人傷害', color: '#7c3aed' },
  theft: { label: '失竊險', color: '#06b6d4' },
  ev: { label: '電動車專屬', color: '#10b981' },
  roadside: { label: '道路救援', color: '#ec4899' },
};

function calculateAllocation(answers) {
  const isEV = answers.vehicle_type === 'electric';
  const isHybrid = answers.vehicle_type === 'hybrid';
  const isMoto = answers.vehicle_type === 'motorcycle';
  const age = answers.vehicle_age;
  const coverage = answers.coverage || [];
  const special = answers.special || [];

  const alloc = { compulsory: 15, third_party: 25 };

  if (age === 'new' || age === 'nearly_new') alloc.body = 35;
  else if (age === 'mid') alloc.body = 20;
  else alloc.body = 10;

  if (coverage.includes('driver_injury') || answers.driving === 'newbie' || answers.driving === 'senior') {
    alloc.driver = 10;
  }

  if (coverage.includes('theft')) alloc.theft = 8;

  if (isEV) {
    alloc.ev = 15;
    alloc.body = Math.max(20, (alloc.body || 0) - 10);
  } else if (isHybrid && (special.includes('ev_battery') || special.includes('ev_charging'))) {
    alloc.ev = 8;
  }

  if (coverage.includes('roadside')) alloc.roadside = 5;

  if (isMoto) {
    return { compulsory: 35, third_party: 40, driver: 25 };
  }

  const sum = Object.values(alloc).reduce((a, b) => a + b, 0);
  const normalized = {};
  for (const [k, v] of Object.entries(alloc)) {
    normalized[k] = Math.round((v / sum) * 100);
  }
  return normalized;
}

function generateRecommendations(answers) {
  const isEV = answers.vehicle_type === 'electric';
  const isHybrid = answers.vehicle_type === 'hybrid';
  const isMoto = answers.vehicle_type === 'motorcycle';
  const age = answers.vehicle_age;
  const coverage = answers.coverage || [];
  const special = answers.special || [];
  const recs = [];

  recs.push({
    priority: 'high',
    category: 'compulsory',
    title: '🛡️ 強制汽車責任保險（法定必保）',
    products: ['富邦強制汽車責任險'],
    reason: '法律規定必保，車主基本義務',
    features: ['受害人傷害給付', '失能 / 死亡保障', '免責賠付'],
    est_premium: isMoto ? '700 - 1,500 / 年' : '1,500 - 3,000 / 年',
  });

  if (isEV) {
    recs.unshift({
      priority: 'high',
      category: 'ev',
      title: '⚡ 電動車專屬保障方案（優先）',
      products: ['富邦電動車綜合保險', '電池 / 馬達專屬條款'],
      reason: '電池佔車價 40-60%，需獨立保障',
      features: [
        '電池 / 馬達專屬條款',
        '充電設備險（家用充電樁）',
        '平板拖吊（避免底盤電池損壞）',
        '涉水短路保障',
      ],
      est_premium: '8,000 - 25,000 / 年',
    });
  }

  if (age === 'new' || age === 'nearly_new') {
    recs.push({
      priority: 'high',
      category: 'body',
      title: isEV ? '🔋 電動車全險（甲式車體險）' : '🚗 甲式 / 乙式車體損失險',
      products: isEV ? ['富邦電動車甲式車體險'] : ['富邦甲式車體險', '富邦乙式車體險'],
      reason: '新車保值，全險最完整',
      features: ['碰撞 / 傾覆', '火災 / 爆炸', '惡意行為', '不明車輛損害'],
      est_premium: '15,000 - 40,000 / 年',
    });
  } else if (age === 'mid') {
    recs.push({
      priority: 'medium',
      category: 'body',
      title: '🚗 丙式 / 限額車體損失險',
      products: ['富邦丙式車體險', '限額車對車碰撞險'],
      reason: '中齡車經濟型保障',
      features: ['僅理賠車對車碰撞', '保費較低', '基本保障'],
      est_premium: '5,000 - 12,000 / 年',
    });
  } else if (age === 'old') {
    recs.push({
      priority: 'low',
      category: 'body',
      title: '🛠️ 車對車碰撞險（老車適用）',
      products: ['富邦車對車碰撞險'],
      reason: '老車殘值低，建議精簡車體險',
      features: ['僅承保車對車碰撞', '最低保費', '搭配第三人責任'],
      est_premium: '3,000 - 7,000 / 年',
    });
  }

  recs.push({
    priority: 'high',
    category: 'third_party',
    title: '👥 第三人責任險（強烈建議）',
    products: ['富邦第三人責任險', '附加超額責任'],
    reason: '強制險不足部分由任意險補足',
    features: ['體傷 / 死亡', '財損賠償', '建議保額 500 萬以上'],
    est_premium: '3,000 - 10,000 / 年',
  });

  if (answers.driving === 'newbie' || answers.driving === 'senior' || coverage.includes('driver_injury')) {
    recs.push({
      priority: answers.driving === 'newbie' ? 'high' : 'medium',
      category: 'driver',
      title: '🤕 駕駛人傷害險',
      products: ['富邦駕駛人傷害險'],
      reason: '保障駕駛人自身受傷',
      features: ['駕駛人意外保障', '醫療補償', '失能 / 身故'],
      est_premium: '1,500 - 5,000 / 年',
    });
  }

  if (coverage.includes('roadside') || isEV) {
    recs.push({
      priority: 'medium',
      category: 'roadside',
      title: '🛠️ 道路救援服務',
      products: ['富邦道路救援附加條款'],
      reason: isEV ? '電動車需平板拖吊，建議加保' : '故障 / 拋錨救援',
      features: ['免費拖吊', '電瓶救援', '輪胎更換', isEV ? '平板拖車服務' : '24 小時救援'],
      est_premium: '800 - 2,500 / 年',
    });
  }

  if (special.includes('windscreen')) {
    recs.push({
      priority: 'low',
      category: 'body',
      title: '🪟 擋風玻璃單獨理賠險',
      products: ['富邦擋風玻璃險'],
      reason: '玻璃單獨破裂不影響車體險折扣',
      features: ['不影響 NCD', '免自負額', '原廠玻璃'],
      est_premium: '1,500 - 4,000 / 年',
    });
  }

  if (special.includes('replacement') && (age === 'new' || age === 'nearly_new')) {
    recs.push({
      priority: 'medium',
      category: 'body',
      title: '🆕 新車全損置換保障',
      products: ['富邦新車全損置換條款'],
      reason: '新車全損時以新車重置（避免折舊）',
      features: ['全損理賠按新車價', '適用 1 年內新車'],
      est_premium: '2,000 - 5,000 / 年',
    });
  }

  if (isMoto) {
    recs.push({
      priority: 'high',
      category: 'driver',
      title: '🏍️ 機車駕駛人傷害險',
      products: ['富邦機車駕駛人傷害險'],
      reason: '機車事故傷害率高',
      features: ['機車意外保障', '住院日額', '失能補償'],
      est_premium: '800 - 2,000 / 年',
    });
  }

  return recs;
}

module.exports = {
  generateRecommendations,
  calculateAllocation,
  BUDGET_MAP,
  COLORS,
};
