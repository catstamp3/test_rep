let questions = [];

// ★ Safari リロード対策：localStorage から復元
let current = Number(localStorage.getItem('currentIndex')) || 0;
let correctCount = Number(localStorage.getItem('correctCount')) || 0;

// ★ 回答済み数（回答した問題数）
let answeredCount =
  Number(localStorage.getItem('answeredCount')) || 0;

// ★ この問題をすでに正解したか
let answeredCorrectly =
  localStorage.getItem('answeredCorrectly') === 'true';

// ★ この問題をすでに回答したか（正誤問わず）
let answeredOnce =
  localStorage.getItem('answeredOnce') === 'true';

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
      answeredCount = 0;
      localStorage.removeItem('currentIndex');
      localStorage.removeItem('correctCount');
      localStorage.removeItem('answeredCount');
      localStorage.removeItem('answeredCorrectly');
      localStorage.removeItem('answeredOnce');
    }

    showQuestion();
  });

function updateScore() {
  const scoreEl = document.getElementById('score');
  if (!scoreEl) return;

  scoreEl.textContent =
    `正解数：${correctCount} / ${answeredCount}`;
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
  document.getElementById('topBtn').style.display = 'inline';

  // ★ 問題表示時は未回答・未正解状態
  answeredCorrectly = false;
  answeredOnce = false;
  localStorage.setItem('answeredCorrectly', 'false');
  localStorage.setItem('answeredOnce', 'false');

  updateScore();
}

document.getElementById('submitBtn').onclick = () => {
  // ★ すでに正解済みなら何もしない
  if (answeredCorrectly) return;

  const checked = [...document.querySelectorAll('input[name=choice]:checked')]
    .map(c => Number(c.value))
    .sort();

  const q = questions[current];
  const answer = [...q.answer].sort();

  const isCorrect =
    JSON.stringify(checked) === JSON.stringify(answer);

  // ★ 初回回答時のみ分母を増やす
  if (!answeredOnce) {
    answeredCount++;
    answeredOnce = true;
    localStorage.setItem('answeredCount', answeredCount);
    localStorage.setItem('answeredOnce', 'true');
    localStorage.setItem('currentIndex', current + 1);
  }

  let html = isCorrect
    ? "<p style='color:green;'>⭕ 正解！</p>"
    : "<p style='color:red;'>❌ 不正解</p>";

  if (isCorrect) {
    correctCount++;
    answeredCorrectly = true;

    localStorage.setItem('correctCount', correctCount);
    localStorage.setItem('answeredCorrectly', 'true');
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

  updateScore();
  saveProgress();
};

document.getElementById('nextBtn').onclick = () => {
  current++;

  localStorage.setItem('currentIndex', current);
  localStorage.removeItem('answeredCorrectly');
  localStorage.removeItem('answeredOnce');

  if (current >= questions.length) {
    saveProgress();

    localStorage.removeItem('currentIndex');
    localStorage.removeItem('correctCount');
    localStorage.removeItem('answeredCount');
    localStorage.removeItem('answeredCorrectly');
    localStorage.removeItem('answeredOnce');

    alert(`終了！ ${correctCount}/${answeredCount} 正解`);
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
    total: answeredCount
  };

  localStorage.setItem('quizProgress', JSON.stringify(progress));
}


