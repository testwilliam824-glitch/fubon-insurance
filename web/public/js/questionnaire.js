(function () {
  const answers = {};
  const params = new URLSearchParams(location.search);
  const lid = params.get('lid');
  if (lid) answers.lid = lid;
  let currentQuestion = 1;
  const totalQuestions = 15;

  const LABELS = {
    age: {
      '0-18': '0-18 歲', '19-30': '19-30 歲', '31-50': '31-50 歲',
      '51-65': '51-65 歲', '66+': '66 歲以上',
    },
    gender: { male: '男性', female: '女性' },
    job: {
      employee: '一般上班族', business_owner: '企業主/自營商',
      professional: '專業人士', sales: '業務/外勤', retired: '已退休',
    },
    income: {
      below_50: '50 萬以下', '50_100': '50 萬-100 萬',
      '100_200': '100 萬-200 萬', '200_500': '200 萬-500 萬', above_500: '500 萬以上',
    },
    asset: {
      below_500: '500 萬以下', '500_1000': '500 萬-1000 萬',
      '1000_3000': '1000 萬-3000 萬', '3000_10000': '3000 萬-1 億', above_10000: '1 億以上',
    },
  };

  function $(sel) { return document.querySelector(sel); }
  function $$(sel) { return Array.from(document.querySelectorAll(sel)); }

  function updateProgress() {
    $('#progressBar').style.width = (currentQuestion / totalQuestions) * 100 + '%';
  }

  function getQuestion(q) { return document.querySelector(`.question[data-q="${q}"]`); }

  function goToQuestion(q) {
    $$('.question').forEach((el) => el.classList.remove('active'));
    getQuestion(q).classList.add('active');
    currentQuestion = q;
    updateProgress();
    $('#nextBtn').textContent = q === totalQuestions ? '查看推薦方案' : '下一題';
    $('#prevBtn').style.display = q === 1 ? 'none' : 'block';
  }

  function bindSingleOptions() {
    $$('.question[data-type="single"]').forEach((qEl) => {
      const key = qEl.dataset.key;
      qEl.querySelectorAll('.option').forEach((opt) => {
        opt.addEventListener('click', () => {
          qEl.querySelectorAll('.option').forEach((o) => o.classList.remove('selected'));
          opt.classList.add('selected');
          opt.querySelector('input').checked = true;
          answers[key] = opt.dataset.value;
          if (currentQuestion < totalQuestions) setTimeout(nextQuestion, 220);
        });
      });
    });
  }

  function bindMultiOptions() {
    $$('.question[data-type="multi"]').forEach((qEl) => {
      qEl.querySelectorAll('.checkbox-item').forEach((item) => {
        item.addEventListener('click', () => {
          const cb = item.querySelector('input');
          cb.checked = !cb.checked;
          item.classList.toggle('checked', cb.checked);
        });
      });
    });
  }

  function collectMulti(qEl) {
    return Array.from(qEl.querySelectorAll('input:checked'))
      .map((cb) => cb.parentElement.dataset.value);
  }

  function validateCurrent() {
    const qEl = getQuestion(currentQuestion);
    const type = qEl.dataset.type;
    if (type === 'single') {
      if (!answers[qEl.dataset.key]) { alert('請選擇一個選項'); return false; }
      return true;
    }
    if (type === 'multi') {
      const vals = collectMulti(qEl);
      if (vals.length === 0) { alert('請至少選擇一個選項'); return false; }
      answers[qEl.dataset.key] = vals;
      return true;
    }
    if (type === 'contact') {
      const name = $('#name').value.trim();
      const phone = $('#phone').value.trim();
      if (!name || !phone) { alert('請填寫姓名和電話'); return false; }
      answers.name = name;
      answers.phone = phone;
      answers.email = $('#email').value.trim();
      answers.contact_time = $('#contact_time').value;
      return true;
    }
    return true;
  }

  function nextQuestion() {
    if (!validateCurrent()) return;
    if (currentQuestion === totalQuestions) return showResult();
    goToQuestion(currentQuestion + 1);
  }

  function prevQuestion() {
    if (currentQuestion > 1) goToQuestion(currentQuestion - 1);
  }

  async function showResult() {
    $('#questionnaire').style.display = 'none';
    $('#result').classList.add('active');
    renderProfileSummary();
    await renderRecommendations();
  }

  function renderProfileSummary() {
    const row = (k, v) => `<div class="profile-item"><span>${k}</span><span>${v || '-'}</span></div>`;
    $('#profileContent').innerHTML = [
      row('年齡', LABELS.age[answers.age]),
      row('性別', LABELS.gender[answers.gender]),
      row('職業', LABELS.job[answers.job]),
      row('年收入', LABELS.income[answers.income]),
      row('資產規模', LABELS.asset[answers.asset]),
    ].join('');
  }

  async function renderRecommendations() {
    let recs = [];
    try {
      const res = await fetch('/api/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(answers),
      });
      const data = await res.json();
      recs = data.recommendations || [];
    } catch (e) {
      console.error('取得推薦失敗', e);
    }

    if (recs.length === 0) {
      $('#recommendations').innerHTML = '<p style="padding:20px;color:#666;">暫無推薦結果，請聯絡我們的顧問。</p>';
      return;
    }

    $('#recommendations').innerHTML = recs.map((rec, i) => `
      <div class="recommendation-card priority-${rec.priority}">
        <span class="badge">${i + 1}</span>
        <h4>${rec.title}</h4>
        <p><strong>適合原因：</strong>${rec.reason}</p>
        <p style="margin-top:10px;"><strong>推薦保單：</strong>${rec.products.join('、')}</p>
        <ul>${rec.features.map((f) => `<li>${f}</li>`).join('')}</ul>
      </div>
    `).join('');
  }

  async function submitForm(e) {
    e.preventDefault();
    const btn = e.currentTarget;
    btn.style.pointerEvents = 'none';
    btn.textContent = '送出中...';
    try {
      const res = await fetch('/api/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(answers),
      });
      if (!res.ok) throw new Error('提交失敗');
      const data = await res.json();
      document.querySelector('.cta-section').style.display = 'none';
      const sec = $('#submitSection');
      sec.classList.add('active');
      $('#formId').textContent = 'FB' + String(data.id).padStart(6, '0');
    } catch (err) {
      alert('提交失敗：' + err.message);
      btn.style.pointerEvents = '';
      btn.textContent = '確認送出諮詢';
    }
  }

  function init() {
    bindSingleOptions();
    bindMultiOptions();
    $('#nextBtn').addEventListener('click', nextQuestion);
    $('#prevBtn').addEventListener('click', prevQuestion);
    $('#submitBtn').addEventListener('click', submitForm);
    $('#prevBtn').style.display = 'none';
    updateProgress();
  }

  init();
})();
