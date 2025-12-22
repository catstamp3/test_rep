let questions = [];

// ★ Safari リロード対策：localStorage から復元
let current = Number(localStorage.getItem('currentIndex')) || 0;
let correctCount = Number(localStorage.getItem('correctCount')) || 0;

// ★ この問題が回答済みかどうか（正解時のみ true）
let isAnswered = false;

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

  // ★ 回答済み数は localStorage に保存された currentIndex を使う
  const answered =
    Number(localStorage.getItem('currentIndex')) || 0;

  scoreEl.textContent =
    `正解数：${correctCount} / ${answered}`;
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

  // ★ 新しい問題を表示したら未回答状態に戻す
  isAnswered = false;

  document.getElementById('result').innerHTML = '';
  document.getElementById('nextBtn').style.display = 'none';
  document.getElementById('topBtn').style.display = 'none';

  updateScore();
}

document.getElementById('submitBtn').onclick = () => {
  // ★ 正解済みの場合のみ再回答不可
  if (isAnswered) return;

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

  if (isCorrect) {
    // ★ 正解した場合のみロック
    isAnswered = true;

    document.getElementById('nextBtn').style.display = 'inline';
    document.getElementById('topBtn').style.display = 'inline';

    // ★ 正解したときだけ進捗保存
    localStorage.setItem('currentIndex', current + 1);
    localStorage.setItem('correctCount', correctCount);

    saveProgress();
  }

  updateScore();
};

document.getElementById('nextBtn').onclick = () => {
  current++;

  localStorage.setItem('currentIndex', current);
  localStorage.setItem('correctCount', correctCount);

  if (current >= questions.length) {
    saveProgress();

    localStorage.removeItem('currentIndex');
    localStorage.removeItem('correctCount');

    alert(`終了！ ${correctCount}/${questions.length} 正解`);
    location.href = 'index.html';
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
