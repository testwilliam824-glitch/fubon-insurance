// 富邦產險推薦邏輯

const BUDGET_MAP = {
  economy: { min: 2500, max: 5000, label: '經濟型（5,000 以下 / 年）' },
  standard: { min: 5000, max: 15000, label: '標準型（5,000-15,000 / 年）' },
  premium: { min: 15000, max: 35000, label: '尊榮型（15,000+ / 年）' },
};

const COLORS = {
  home: { label: '住宅保障', color: '#dc2626' },
  content: { label: '動產保障', color: '#f59e0b' },
  liability: { label: '個人責任', color: '#1e3a5f' },
  accident: { label: '意外傷害', color: '#7c3aed' },
  travel: { label: '旅遊保障', color: '#0ea5e9' },
  mobile: { label: '行動裝置', color: '#10b981' },
  pet: { label: '寵物保障', color: '#ec4899' },
};

function calculateAllocation(answers) {
  const items = answers.property_items || [];
  const coverage = answers.coverage || [];
  const alloc = {};

  if (items.includes('home') || coverage.includes('fire') || coverage.includes('earthquake')) {
    alloc.home = 30;
  }
  if (items.includes('content') || answers.property_value === '100_300' || answers.property_value === 'over_300') {
    alloc.content = 20;
  }
  if (items.includes('liability') || coverage.includes('third_party')) {
    alloc.liability = 15;
  }
  if (items.includes('accident') || coverage.includes('medical')) {
    alloc.accident = 15;
  }
  if (items.includes('travel') || coverage.includes('travel')) {
    alloc.travel = 10;
  }
  if (items.includes('mobile')) alloc.mobile = 5;
  if (items.includes('pet')) alloc.pet = 5;

  if (Object.keys(alloc).length === 0) {
    return { home: 50, liability: 30, accident: 20 };
  }

  const sum = Object.values(alloc).reduce((a, b) => a + b, 0);
  const normalized = {};
  for (const [k, v] of Object.entries(alloc)) {
    normalized[k] = Math.round((v / sum) * 100);
  }
  return normalized;
}

function generateRecommendations(answers) {
  const items = answers.property_items || [];
  const coverage = answers.coverage || [];
  const special = answers.special_items || [];
  const recs = [];

  if (items.includes('home') || answers.home_type === 'apartment' || answers.home_type === 'house') {
    recs.push({
      priority: 'high',
      category: 'home',
      title: '🏠 住宅火災及地震基本險',
      products: ['富邦住宅綜合保險', '擴大地震保險'],
      reason: '台灣地震頻繁，住宅基本保障必備',
      features: ['火災 / 爆炸 / 颱風保障', '地震基本險（150 萬上限）', '建議加保擴大地震險'],
      est_premium: '2,000 - 6,000 / 年',
    });
  }

  if (items.includes('content') || answers.property_value === '100_300' || answers.property_value === 'over_300') {
    recs.push({
      priority: 'medium',
      category: 'content',
      title: '📺 住宅動產綜合保險',
      products: ['富邦動產綜合保險'],
      reason: '家具、家電、3C 用品保障',
      features: ['竊盜損失', '電器毀損', '颱風水災'],
      est_premium: '1,500 - 5,000 / 年',
    });
  }

  if (items.includes('liability') || coverage.includes('third_party')) {
    recs.push({
      priority: 'medium',
      category: 'liability',
      title: '⚖️ 個人責任保險',
      products: ['富邦個人責任綜合保險'],
      reason: '日常生活意外造成他人損害的責任保障',
      features: ['第三人體傷', '第三人財損', '法律訴訟費用'],
      est_premium: '800 - 2,500 / 年',
    });
  }

  if (items.includes('accident') || coverage.includes('medical')) {
    recs.push({
      priority: 'medium',
      category: 'accident',
      title: '🤕 個人意外傷害險',
      products: ['富邦團體傷害保險', '富邦個人意外綜合保險'],
      reason: '24 小時意外保障',
      features: ['意外身故 / 失能', '意外醫療', '住院日額'],
      est_premium: '2,000 - 8,000 / 年',
    });
  }

  if (items.includes('travel') || coverage.includes('travel') || special.includes('frequent_travel')) {
    recs.push({
      priority: special.includes('frequent_travel') ? 'high' : 'low',
      category: 'travel',
      title: '✈️ 旅遊不便險',
      products: ['富邦旅遊綜合保險'],
      reason: '出國旅遊必備保障',
      features: ['班機延誤 / 取消', '行李遺失', '海外醫療'],
      est_premium: '500 - 2,000 / 趟',
    });
  }

  if (items.includes('mobile') || special.includes('electronics')) {
    recs.push({
      priority: 'low',
      category: 'mobile',
      title: '📱 行動裝置 / 3C 險',
      products: ['富邦手機綜合保險'],
      reason: '手機 / 平板 / 筆電意外損壞保障',
      features: ['意外損壞', '進液短路', '螢幕破裂'],
      est_premium: '1,500 - 4,000 / 年',
    });
  }

  if (items.includes('pet')) {
    recs.push({
      priority: 'low',
      category: 'pet',
      title: '🐕 寵物險',
      products: ['富邦寵物綜合保險'],
      reason: '毛小孩醫療費用保障',
      features: ['門診 / 住院', '手術費用', '寵物責任'],
      est_premium: '3,000 - 8,000 / 年',
    });
  }

  if (special.includes('art') || special.includes('jewelry')) {
    recs.push({
      priority: 'high',
      category: 'home',
      title: '💎 高價物品專屬保險',
      products: ['富邦藝術品 / 珠寶綜合保險'],
      reason: '藝術品、珠寶、收藏品需獨立投保',
      features: ['全險式保障', '海內外運送', '展覽風險'],
      est_premium: '依物品價值評估',
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
