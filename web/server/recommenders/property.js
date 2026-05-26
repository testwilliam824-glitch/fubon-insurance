// 富邦產險推薦邏輯
// 嚴格規則：Q1 (property_items) 為主導，只推使用者明確勾選的項目

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
  premium_item: { label: '高價物品', color: '#c9a227' },
};

function selectedCategories(answers) {
  const items = answers.property_items || [];
  const special = answers.special_items || [];
  const coverage = answers.coverage || [];
  const cats = new Set();
  // Q1 是主要意向 —— 嚴格依勾選
  items.forEach((i) => cats.add(i));
  // 旅遊：常出國 → 自動加入
  if (special.includes('frequent_travel')) cats.add('travel');
  // 高價物品 → 自動加入
  if (special.includes('art') || special.includes('jewelry')) cats.add('premium_item');
  // 高價 3C → 自動加入 mobile
  if (special.includes('electronics')) cats.add('mobile');
  // 第三人責任 coverage → 自動加入責任險（只有當用戶 Q3 勾選）
  if (coverage.includes('third_party') && items.length > 0) cats.add('liability');
  return cats;
}

function calculateAllocation(answers) {
  const cats = selectedCategories(answers);
  if (cats.size === 0) return { liability: 50, accident: 50 };

  const weights = {
    home: 30,
    content: 18,
    liability: 12,
    accident: 14,
    travel: 8,
    mobile: 6,
    pet: 8,
    premium_item: 14,
  };

  const alloc = {};
  for (const c of cats) {
    if (weights[c]) alloc[c] = weights[c];
  }

  const sum = Object.values(alloc).reduce((a, b) => a + b, 0) || 1;
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
  const homeType = answers.home_type;
  const recs = [];

  // 🏠 住宅險 — 只有 Q1 勾「住宅火災 / 地震險」才推
  if (items.includes('home')) {
    const isHouse = homeType === 'house';
    const isRental = homeType === 'rental';
    recs.push({
      priority: 'high',
      category: 'home',
      title: isRental ? '🏠 租屋族財物保障' : '🏠 住宅火災及地震險',
      products: isRental
        ? ['富邦租屋族住宅綜合保險']
        : ['富邦住宅綜合保險', '擴大地震保險'],
      reason: isRental
        ? '租屋族保障自身財物與第三人責任'
        : '台灣地震頻繁，住宅基本保障必備',
      features: isRental
        ? ['竊盜損失', '個人責任', '臨時住宿費']
        : [
            '火災 / 爆炸 / 颱風保障',
            '地震基本險（150 萬上限）',
            isHouse ? '透天獨棟建議加保超額地震' : '建議加保擴大地震險',
          ],
      est_premium: isHouse ? '3,500 - 8,000 / 年' : '2,000 - 6,000 / 年',
    });
  }

  // 📺 動產險
  if (items.includes('content')) {
    const highValue = answers.property_value === '100_300' || answers.property_value === 'over_300';
    recs.push({
      priority: highValue ? 'high' : 'medium',
      category: 'content',
      title: '📺 住宅動產綜合保險',
      products: ['富邦動產綜合保險'],
      reason: highValue
        ? '家中財產逾百萬，動產險可完整保障'
        : '家具、家電、3C 用品保障',
      features: ['竊盜損失', '電器毀損', '颱風水災', '建議保額參考財產總值'],
      est_premium: highValue ? '3,500 - 8,000 / 年' : '1,500 - 4,000 / 年',
    });
  }

  // ⚖️ 責任險
  if (items.includes('liability') || (coverage.includes('third_party') && items.length > 0)) {
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

  // 🤕 意外傷害險
  if (items.includes('accident') || coverage.includes('medical')) {
    recs.push({
      priority: 'high',
      category: 'accident',
      title: '🤕 個人意外傷害險',
      products: ['富邦團體傷害保險', '富邦個人意外綜合保險'],
      reason: '24 小時意外保障，全方位防護',
      features: ['意外身故 / 失能', '意外醫療', '住院日額'],
      est_premium: '2,000 - 8,000 / 年',
    });
  }

  // ✈️ 旅遊險
  if (items.includes('travel') || special.includes('frequent_travel') || coverage.includes('travel')) {
    const isFrequent = special.includes('frequent_travel');
    recs.push({
      priority: isFrequent ? 'high' : 'medium',
      category: 'travel',
      title: isFrequent ? '✈️ 旅遊綜合保險（年度型）' : '✈️ 旅遊不便險',
      products: isFrequent
        ? ['富邦旅遊年度綜合保險']
        : ['富邦旅遊綜合保險'],
      reason: isFrequent
        ? '經常出國，建議年度型方案更划算'
        : '出國旅遊必備保障',
      features: ['班機延誤 / 取消', '行李遺失', '海外醫療', isFrequent ? '一年期保障，多次出國適用' : '單次旅程保障'],
      est_premium: isFrequent ? '6,000 - 12,000 / 年' : '500 - 2,000 / 趟',
    });
  }

  // 📱 行動裝置 / 3C
  if (items.includes('mobile') || special.includes('electronics')) {
    const isHighEnd = special.includes('electronics');
    recs.push({
      priority: 'low',
      category: 'mobile',
      title: isHighEnd ? '📱 高階 3C / 攝影器材險' : '📱 行動裝置險',
      products: ['富邦手機綜合保險', isHighEnd ? '富邦 3C 綜合保險' : null].filter(Boolean),
      reason: '手機 / 平板 / 筆電意外損壞保障',
      features: ['意外損壞', '進液短路', '螢幕破裂', isHighEnd ? '高價設備全險' : '原廠維修'],
      est_premium: isHighEnd ? '3,000 - 8,000 / 年' : '1,500 - 4,000 / 年',
    });
  }

  // 🐕 寵物險
  if (items.includes('pet')) {
    recs.push({
      priority: 'medium',
      category: 'pet',
      title: '🐕 寵物綜合保險',
      products: ['富邦寵物綜合保險'],
      reason: '毛小孩醫療費用保障',
      features: ['門診 / 住院', '手術費用', '寵物責任'],
      est_premium: '3,000 - 8,000 / 年',
    });
  }

  // 💎 高價物品專屬
  if (special.includes('art') || special.includes('jewelry')) {
    recs.push({
      priority: 'high',
      category: 'premium_item',
      title: '💎 高價物品專屬保險',
      products: ['富邦藝術品 / 珠寶綜合保險'],
      reason: '藝術品、珠寶、收藏品需獨立投保',
      features: ['全險式保障', '海內外運送', '展覽風險'],
      est_premium: '依物品價值評估',
    });
  }

  // 沒有任何選擇 → 提供基本建議
  if (recs.length === 0) {
    recs.push({
      priority: 'medium',
      category: 'liability',
      title: '⚖️ 基礎個人責任 + 意外組合（建議起點）',
      products: ['富邦個人責任綜合保險', '富邦個人意外傷害險'],
      reason: '未明確選擇項目，建議從基本責任 + 意外開始',
      features: ['第三人責任', '24 小時意外保障', '可彈性加保其他險種'],
      est_premium: '2,500 - 6,000 / 年',
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
