let questions = [];

// ★ Safari リロード対策：localStorage から復元
let current = Number(localStorage.getItem('currentIndex')) || 0;
let correctCount = Number(localStorage.getItem('correctCount')) || 0;

fetch(`data/${DATA_FILE}`)
  .then(res => res.json())
  .then(data => {
    document.getElementById('categoryTitle').textContent =
      data.categoryTitle;

    questions = data.questions;

    // 範囲外対策
    if (current >= questions.length) {
      current = 0;
      correctCount = 0;
      localStorage.removeItem('currentIndex');
      localStorage.removeItem('correctCount');
    }

    showQuestion();
  });

// ==============================
// 問題表示
// ==============================
function showQuestion() {
  const q = questions[current];
  const area = document.getElementById('questionArea');

  area.innerHTML = `
    <h3>Q${q.no}. ${q.question}</h3>
    <p class="progress">現在の正解数：${correctCount} / ${questions.length}</p>
  `;

  q.choices.forEach((c, i) => {
    area.innerHTML += `
      <label>
        <input type="checkbox" value="${i}">
        ${c}
      </label><br>
    `;
  });

  document.getElementById('result').textContent = '';
  document.getElementById('nextBtn').style.display = 'none';
}

// ==============================
// 回答確定
// ==============================
document.getElementById('submitBtn').onclick = () => {
  const checked = [...document.querySelectorAll('input[type=checkbox]:checked')]
    .map(c => Number(c.value))
    .sort();

  const answer = [...questions[current].answer].sort();

  const resultEl = document.getElementById('result');

  if (JSON.stringify(checked) === JSON.stringify(answer)) {
    correctCount++;
    resultEl.textContent = '正解！';
  } else {
    resultEl.textContent = '不正解';
  }

  // ★ 進捗保存（Safari対策）
  localStorage.setItem('currentIndex', current);
  localStorage.setItem('correctCount', correctCount);

  // 解説表示（あれば）
  if (questions[current].explanation) {
    resultEl.innerHTML += `<div class="explanation">${questions[current].explanation}</div>`;
  }

  document.getElementById('nextBtn').style.display = 'inline';
};

// ==============================
// 次の問題
// ==============================
document.getElementById('nextBtn').onclick = () => {
  current++;

  // ★ 進捗保存
  localStorage.setItem('currentIndex', current);
  localStorage.setItem('correctCount', correctCount);

  if (current >= questions.length) {
    saveProgress();

    // クイズ終了時は一旦クリア
    localStorage.removeItem('currentIndex');
    localStorage.removeItem('correctCount');

    alert(`終了！ ${questions.length}問中 ${correctCount}問正解`);
    location.href = 'index.html'; // リンク切れOK前提
    return;
  }

  showQuestion();
};

// ==============================
// 学習状況保存（カテゴリ単位）
// ==============================
function saveProgress() {
  const progress = JSON.parse(localStorage.getItem('quizProgress') || '{}');

  progress[CATEGORY_ID] = {
    correct: correctCount,
    total: questions.length
  };

  localStorage.setItem('quizProgress', JSON.stringify(progress));
}
