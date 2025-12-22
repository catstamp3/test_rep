let questions = [];

// Safari リロード対策：localStorage から復元
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
}

document.getElementById('submitBtn').onclick = () => {
  const checked = [...document.querySelectorAll('input[name=choice]:checked')]
    .map(c => Number(c.value))
    .sort();

  const q = questions[current];
  const answer = [...q.answer].sort();

  const isCorrect =
    JSON.stringify(checked) === JSON.stringify(answer);

  let html = isCorrect ? '正解！' : '不正解';

  if (isCorrect) {
    correctCount++;
  }

  if (q.explanation) {
    html += `<div class="explanation">${q.explanation}</div>`;
  }

  document.getElementById('result').innerHTML = html;
  document.getElementById('nextBtn').style.display = 'inline';

  // ==============================
  // ★ ここが今回の本質的な修正点
  // 回答＝その問題は完了 → 次の問題番号を保存
  // ==============================
  localStorage.setItem('currentIndex', current + 1);
  localStorage.setItem('correctCount', correctCount);

  // index 用進捗も毎問更新
  saveProgress();
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

function saveProgress() {
  const progress =
    JSON.parse(localStorage.getItem('quizProgress') || '{}');

  progress[CATEGORY_ID] = {
    correct: correctCount,
    total: questions.length
  };

  localStorage.setItem('quizProgress', JSON.stringify(progress));
}
