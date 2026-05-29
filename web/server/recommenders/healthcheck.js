// 保單健檢推薦邏輯
// 1. 分析既有保單 → 計算各類別覆蓋率
// 2. 結合「想加強的方向」→ 產出建議書

const CATEGORY = {
  medical: { label: '醫療險', color: '#dc2626', desc: '住院、手術、實支實付' },
  accident: { label: '意外險', color: '#f59e0b', desc: '意外身故、失能、醫療' },
  life: { label: '壽險', color: '#1e3a5f', desc: '身故 / 全失能保障' },
  cancer: { label: '癌症險', color: '#7c3aed', desc: '癌症診斷、治療給付' },
  critical: { label: '重大疾病險', color: '#ec4899', desc: '中風、心肌梗塞、洗腎等' },
  ltc: { label: '長照險', color: '#06b6d4', desc: '失能長期照護給付' },
  annuity: { label: '退休年金', color: '#10b981', desc: '退休後穩定現金流' },
  saving: { label: '儲蓄理財', color: '#c9a227', desc: '還本型 / 投資型' },
  auto: { label: '車險', color: '#0ea5e9', desc: '強制+任意險' },
  property: { label: '產險', color: '#8b5cf6', desc: '住宅、財物、責任' },
};

// 依年齡推薦的基本盤
function baselineByAge(age) {
  if (age === 'under25' || age === '19-30' || age === '0-18') {
    return ['medical', 'accident', 'life'];
  }
  if (age === '25_40' || age === '31-50') {
    return ['medical', 'accident', 'life', 'critical', 'cancer'];
  }
  if (age === '40_60' || age === '51-65') {
    return ['medical', 'critical', 'cancer', 'ltc', 'annuity'];
  }
  return ['medical', 'ltc', 'annuity'];
}

// 從 policies 計算各類別現有覆蓋（每張保單算一份）
function analyzeCoverage(policies) {
  const counts = {};
  policies.forEach((p) => {
    const t = p.type || 'other';
    counts[t] = (counts[t] || 0) + 1;
  });
  return counts;
}

function calculateAllocation(answers) {
  const policies = answers.policies || [];
  const counts = analyzeCoverage(policies);
  if (Object.keys(counts).length === 0) {
    // 沒有保單 → 顯示「保障空白」
    return { gap_total: 100 };
  }
  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  const alloc = {};
  for (const [k, v] of Object.entries(counts)) {
    if (CATEGORY[k]) alloc[k] = Math.round((v / total) * 100);
  }
  return alloc;
}

// 對應建議書內容
const IMPROVEMENT_CARDS = {
  medical: {
    title: '🏥 加強醫療保障',
    products: ['鑫安實在住院醫療終身健康保險', '金享福住院醫療定額終身健康保險附約', '日日心安一年期住院醫療健康保險附約'],
    reason: '健保不給付項目（病房升等、自費藥品、手術耗材）需自費負擔',
    features: ['實支實付雙倍額', '終身保障不調漲', '住院日額補貼'],
    est_premium: '3,000 - 8,000 / 月',
  },
  accident: {
    title: '🤕 補強意外險',
    products: ['新享平安終身保險', '安鑫護意外傷害住院醫療保險附約', '骨力勇意外骨折傷害保險附約'],
    reason: '24 小時意外保障，補強健保不足之處',
    features: ['意外身故 / 失能', '意外醫療', '骨折給付'],
    est_premium: '1,500 - 4,000 / 月',
  },
  life: {
    title: '🛡️ 補齊壽險保障',
    products: ['安享定期壽險', '優世代平準型定期壽險', '富享世代利率變動型終身壽險'],
    reason: '家庭主要收入者必備，保障家人經濟無後顧之憂',
    features: ['身故 / 全失能給付', '保額逐年遞增', '可附加附約'],
    est_premium: '5,000 - 15,000 / 月',
  },
  cancer: {
    title: '🎗️ 加強癌症保障',
    products: ['真馨相守防癌定期健康保險', '豪愛無憂防癌定期健康保險', '精準保護防癌定期健康保險'],
    reason: '癌症治療長期且昂貴，標靶 / 免疫療法多為自費',
    features: ['初次罹癌一次金', '住院日額', '化療 / 放療給付'],
    est_premium: '2,500 - 6,000 / 月',
  },
  critical: {
    title: '⚠️ 補強重大疾病險',
    products: ['金卡安心重大傷病保險', '優卡安心重大傷病健康保險', '醫保安心重大傷病終身健康保險'],
    reason: '中風 / 心肌梗塞 / 洗腎等突發疾病一次性給付',
    features: ['7 項重大疾病一次金', '保額不分期', '可搭配壽險'],
    est_premium: '3,000 - 8,000 / 月',
  },
  ltc: {
    title: '👵 規劃長照險',
    products: ['樂鑫安長期照顧終身健康保險', '和馨長期照顧終身健康保險附約', '連馨滿溢長期照顧終身健康保險'],
    reason: '台灣超高齡社會，長照費用每月可達 4-8 萬',
    features: ['失能扶助金月領', '一次給付', '保證給付期間'],
    est_premium: '5,000 - 12,000 / 月',
  },
  annuity: {
    title: '💰 退休年金規劃',
    products: ['鑫安e生即期年金保險', '金滿富利利率變動型年金保險(甲型)', '新真開心利率變動型年金保險(甲型)'],
    reason: '勞保 + 勞退不足以應付退休生活，需提早規劃',
    features: ['月領年金', '滿期金', '宣告利率分享'],
    est_premium: '8,000 - 20,000 / 月',
  },
  saving: {
    title: '🐷 儲蓄理財方案',
    products: ['珍給利利率變動型增額終身壽險', '月月紅富分紅終身保險', '吉鑽利利率變動型還本終身保險'],
    reason: '兼顧保障與資產累積，強迫儲蓄',
    features: ['保額遞增', '每月生存金', '可保單質借'],
    est_premium: '5,000 - 15,000 / 月',
  },
};

function generateRecommendations(answers) {
  const policies = answers.policies || [];
  const existing = new Set(policies.map((p) => p.type).filter(Boolean));
  const wantToImprove = answers.improvement_areas || [];
  const age = answers.age;
  const baseline = baselineByAge(age);

  const recs = [];
  const seen = new Set();

  // 1. 使用者選擇要加強的方向（最優先）
  wantToImprove.forEach((cat) => {
    if (IMPROVEMENT_CARDS[cat] && !seen.has(cat)) {
      recs.push({
        priority: 'high',
        category: cat,
        ...IMPROVEMENT_CARDS[cat],
      });
      seen.add(cat);
    }
  });

  // 2. 年齡建議的基本盤但目前沒有的
  baseline.forEach((cat) => {
    if (!existing.has(cat) && !seen.has(cat) && IMPROVEMENT_CARDS[cat]) {
      recs.push({
        priority: 'medium',
        category: cat,
        ...IMPROVEMENT_CARDS[cat],
        title: IMPROVEMENT_CARDS[cat].title + '（補齊保障缺口）',
      });
      seen.add(cat);
    }
  });

  // 3. 若什麼都沒選且什麼都沒填 → 給通用建議
  if (recs.length === 0) {
    recs.push({
      priority: 'medium',
      category: 'medical',
      ...IMPROVEMENT_CARDS.medical,
      title: '🏥 建議從醫療保障開始（一般起點）',
    });
  }

  return recs;
}

const BUDGET_MAP = {
  economy: { min: 3000, max: 6000, label: '經濟型（每月 6,000 以下）' },
  standard: { min: 6000, max: 15000, label: '標準型（每月 6,000-15,000）' },
  premium: { min: 15000, max: 35000, label: '尊榮型（每月 15,000+）' },
};

module.exports = {
  generateRecommendations,
  calculateAllocation,
  BUDGET_MAP,
  COLORS: { ...CATEGORY, gap_total: { label: '⚠️ 保障缺口', color: '#ef4444' } },
};
