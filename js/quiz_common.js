let questions = [];
let current = 0;
let correctCount = 0;

fetch(`data/${DATA_FILE}`)
  .then(res => res.json())
  .then(data => {
    document.getElementById('categoryTitle').textContent =
      data.categoryTitle;
    questions = data.questions;
    showQuestion();
  });

function updateScore() {
  const scoreEl = document.getElementById('score');
  if (!scoreEl) return;

  scoreEl.textContent =
    `正解数：${correctCount} / ${current + 1}`;
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

  // ★ 回答後にスコア更新
  updateScore();
};

document.getElementById('nextBtn').onclick = () => {
  current++;

  if (current >= questions.length) {
    saveProgress();
    alert(`終了！ ${correctCount}/${questions.length} 正解`);
    location.href = 'index.html'; // リンク切れOK前提
    return;
  }

  showQuestion();
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
