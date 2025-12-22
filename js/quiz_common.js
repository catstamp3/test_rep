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

    // 範囲外ガード
    if (current >= questions.length) {
      current = 0;
      correctCount = 0;
      localStorage.removeItem('currentIndex');
      localStorage.removeItem('correctCount');
    }

    showQuestion();
  });

function updateScore() {
  const scoreEl = document.getElementById('score');
  if (!scoreEl) return;

  scoreEl.textContent =
    `正解数：${correctCount} / ${current}`;
}

function showQuestion() {
  const q = questions[current];
  const area = document.getElementById('questionArea');

  area.innerHTML = `<h3>Q${q.no}. ${q.question}</h3>`;

  q.choices.forEach((c, i) => {
    area.innerHTML += `
      <label>
        <input type="checkbox" name="choice" value="${i}">
        ${c}
      </label><br>
    `;
  });

  document.getElementById('result').innerHTML = '';
  document.getElementById('nextBtn').style.display = 'none';
  document.getElementById('topBtn').style.display = 'none';

  // ★ 問題表示時点のスコア
  updateScore();
}

document.getElementById('submitBtn').onclick = () => {
  const checked = [...document.querySelectorAll('input[name=choice]:checked')]
    .map(c => Number(c.value))
    .sort();

  const q = questions[current];
  const answer = [...q.answer].sort();

  const isCorrect =
    JSON.stringify(checked) === JSON.stringify(answer);

  let html = isCorrect
    ? "<p style='color:green;'>⭕ 正解！</p>"
    : "<p style='color:red;'>❌ 不正解</p>";

  if (isCorrect) {
    correctCount++;
  }

  // 正解番号表示
  html += `<p>正解：${answer.map(i => i + 1).join('、')}</p>`;

  // 解説（空でもOK）
  if (q.explanation) {
    html += `
      <div class="explanation"
           style="margin-top:10px;padding:8px;border:1px solid #ccc;">
        <strong>解説</strong><br>
        ${q.explanation.replace(/\n/g, "<br>")}
      </div>
    `;
  }

  document.getElementById('result').innerHTML = html;
  document.getElementById('nextBtn').style.display = 'inline';
  document.getElementById('topBtn').style.display = 'inline';

  // ★ 回答後にスコア更新
  current++;
  updateScore();

  // ★ Safari対策：途中状態保存
  localStorage.setItem('currentIndex', current);
  localStorage.setItem('correctCount', correctCount);

  // ★ index 用進捗も毎問更新
  saveProgress();
};

document.getElementById('nextBtn').onclick = () => {

  // ★ Safari対策：進捗保存
  localStorage.setItem('currentIndex', current);
  localStorage.setItem('correctCount', correctCount);

  if (current >= questions.length) {
    saveProgress();

    // 終了時は一時データ削除
    localStorage.removeItem('currentIndex');
    localStorage.removeItem('correctCount');

    alert(`終了！ ${correctCount}/${questions.length} 正解`);
    location.href = 'index.html'; // リンク切れOK前提
    return;
  }

  showQuestion();
};

document.getElementById('topBtn').onclick = () => {
  saveProgress();
  location.href = 'index.html';
  return;
};

function saveProgress() {
  const progress =
    JSON.parse(localStorage.getItem('quizProgress') || '{}');

  progress[CATEGORY_ID] = {
    correct: correctCount,
    total: questions.length
  };

  localStorage.setItem('quizProgress', JSON.stringify(progress));
}
