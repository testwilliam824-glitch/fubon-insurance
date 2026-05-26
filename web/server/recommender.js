// Dispatcher：根據 insurance_type 路由到對應推薦器
const life = require('./recommenders/life');
const property = require('./recommenders/property');
const auto = require('./recommenders/auto');

const DISCLAIMER = {
  life: '本系統推薦僅為初步參考，實際保費、保額、給付條件與適用條款須由富邦人壽合格保險經紀員根據您完整的財務狀況、健康告知與需求面談後規劃。最終商品內容以保單條款為準。',
  property: '本系統推薦僅為初步參考，實際保費、保額、承保條件與適用條款須由富邦產險合格保險經紀員根據您的物件評估、風險勘查與需求面談後規劃。最終商品內容以保單條款為準。',
  auto: '本系統推薦僅為初步參考，實際保費、保額、承保條件須由富邦產險合格保險經紀員根據您的車輛狀況、駕駛紀錄與需求面談後規劃。最終商品內容以保單條款為準。',
};

function buildResponse(answers, mod) {
  const recommendations = mod.generateRecommendations(answers);
  const allocation = mod.calculateAllocation(answers);
  const budgetCfg = mod.BUDGET_MAP[answers.budget] || mod.BUDGET_MAP.standard || mod.BUDGET_MAP.economy;
  const total = Math.round((budgetCfg.min + budgetCfg.max) / 2);
  const allocationDetail = Object.entries(allocation).map(([key, pct]) => ({
    key,
    label: mod.COLORS[key]?.label || key,
    color: mod.COLORS[key]?.color || '#999',
    percent: pct,
    monthly: Math.round((total * pct) / 100),
  }));

  return {
    recommendations,
    allocation: allocationDetail,
    budget: {
      label: budgetCfg.label,
      total_estimate: total,
      min: budgetCfg.min,
      max: budgetCfg.max,
    },
    disclaimer: DISCLAIMER[answers.insurance_type] || DISCLAIMER.life,
  };
}

function generateRecommendations(answers) {
  const type = answers.insurance_type || 'life';
  if (type === 'property') return buildResponse(answers, property);
  if (type === 'auto') return buildResponse(answers, auto);
  // life：保留現有完整邏輯（已自帶 allocation/budget/disclaimer）
  return life.generateRecommendations(answers);
}

module.exports = { generateRecommendations };
