function generateRecommendations(answers) {
  const recommendations = [];

  if (answers.age === '0-18') {
    recommendations.push({
      priority: 'high',
      title: '基礎保障組合',
      products: ['金來寶小額終身壽險', '平安系列意外險', '安心醫療系列附約'],
      reason: '建立終身醫療基礎，早投保享低費率',
      features: ['保費低廉', '終身保障', '醫療附約彈性'],
    });
  } else if (answers.age === '19-30') {
    if (answers.income === 'below_50' || answers.budget === 'below_3000') {
      recommendations.push({
        priority: 'high',
        title: '入門高保障方案',
        products: ['安心好漾定期保險', '平安系列意外險'],
        reason: '年輕時以低保費建立高保障',
        features: ['保費便宜', '高保障額度', '可轉換終身險'],
      });
    } else {
      recommendations.push({
        priority: 'medium',
        title: '青年理財儲蓄方案',
        products: ['珍吉利利率變動型增額終身壽險', '新平準終身壽險'],
        reason: '兼顧保障與資產累積',
        features: ['保障遞增', '保單價值累積', '利率變動分享'],
      });
    }
  } else if (answers.age === '31-50') {
    recommendations.push({
      priority: 'high',
      title: '家庭支柱保障方案',
      products: ['新富享人生還本終身保險', '金享福保本終身健康保險'],
      reason: '家庭主要收入者必備保障',
      features: ['保費返還', '重大疾病保障', '保單質借功能'],
    });
    if (answers.income === '200_500' || answers.income === 'above_500') {
      recommendations.push({
        priority: 'medium',
        title: '資產增值方案',
        products: ['月月吉利利率變動型還本終身保險', '吉鑽利利率變動型還本終身保險'],
        reason: '穩定現金流+資產增值',
        features: ['每月生存金', '宣告利率分享', '保單質借'],
      });
    }
  } else if (answers.age === '51-65') {
    recommendations.push({
      priority: 'high',
      title: '退休準備方案',
      products: ['金萬利終身保險', '金鑽豐利利率變動型還本終身保險'],
      reason: '準備退休收入與長照規劃',
      features: ['滿期金給付', '長照銜接', '年金轉換'],
    });
  } else if (answers.age === '66+') {
    recommendations.push({
      priority: 'high',
      title: '長照與傳承方案',
      products: ['長照險系列', '年金險系列'],
      reason: '退休期醫療保障與資產傳承',
      features: ['長期照護給付', '穩定年金收入', '資產傳承'],
    });
  }

  const isHighAsset =
    answers.income === 'above_500' ||
    answers.asset === '3000_10000' ||
    answers.asset === 'above_10000';

  if (isHighAsset) {
    if (answers.tax_need === 'yes_urgent' || answers.tax_need === 'yes_consider') {
      recommendations.unshift({
        priority: 'high',
        title: '⭐ 高資產節稅傳承方案（優先）',
        products: ['新吉好利利率變動型增額終身壽險', '珍吉利利率變動型增額終身壽險'],
        reason: '將應稅資產轉為保險資產，保險給付免計入遺產',
        features: ['節稅效益顯著', '保額逐年遞增', '指定受益人傳承'],
      });
    }
    if (answers.debt_risk === 'yes_business' || answers.debt_risk === 'yes_professional') {
      recommendations.push({
        priority: 'high',
        title: '資產保護/債務隔離方案',
        products: ['金好運萬能終身壽險(V1)', '吉鑽利利率變動型還本終身壽險'],
        reason: '保險金原則上不得扣押，保護家族資產',
        features: ['債權隔離', '保單價值累積', '質借靈活運用'],
      });
    }
    if (answers.inheritance === 'yes_plan' || answers.inheritance === 'yes_consider') {
      recommendations.push({
        priority: 'medium',
        title: '多世代傳承方案',
        products: ['金來寶小額終身壽險', '新富享人生還本終身保險'],
        reason: '直接指定受益人，跨代傳承節稅',
        features: ['跨代給付', '避免繼承程序', '結合家族信託'],
      });
    }
  }

  if (
    (answers.foreign_currency === 'yes_usd' || answers.foreign_currency === 'yes_aud') &&
    !recommendations.some((r) => r.products.includes('加美利外幣利率變動型增額終身壽險'))
  ) {
    recommendations.push({
      priority: 'low',
      title: '外幣資產配置方案',
      products: ['加美利外幣利率變動型增額終身壽險'],
      reason: '美元/澳幣資產配置，匯率避險+節稅',
      features: ['外幣計價', '資產分散', '節稅傳承'],
    });
  }

  return recommendations;
}

module.exports = { generateRecommendations };
