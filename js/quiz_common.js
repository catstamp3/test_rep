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

  document.getElementById('result').textContent = '';
  document.getElementById('nextBtn').style.display = 'none';
  document.getElementById('topBtn').style.display = 'none';
}

document.getElementById('submitBtn').onclick = () => {
  const checked = [...document.querySelectorAll('input[name=choice]:checked')]
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

  document.getElementById('nextBtn').style.display = 'inline';
  document.getElementById('result').textContent =
  `${currentQuestionIndex + 1}問中 ${correctCount}問正解`;
};

document.getElementById('nextBtn').onclick = () => {
  current++;

  // 最後の問題が終わったら
  if (current >= questions.length) {
    saveProgress();
    showFinalResult();
    submitBtn.style.display = 'none';
    document.getElementById('nextBtn').style.display = 'none';
    document.getElementById('topBtn').style.display = 'inline';
    return;
  }

  showQuestion();
};

document.getElementById('topBtn').onclick = () => {
  location.href = 'index.html'; // リンク切れOK前提
};

function saveProgress() {
  const progress = JSON.parse(localStorage.getItem('quizProgress') || '{}');
  progress[CATEGORY_ID] = {
    correct: correctCount,
    total: questions.length
  };
  localStorage.setItem('quizProgress', JSON.stringify(progress));
}

function showFinalResult() {
  const area = document.getElementById('questionArea');
  area.innerHTML = `
    <h3>結果</h3>
    <p>${questions.length}問中 ${correctCount}問正解</p>
  `;

  document.getElementById('result').textContent = '';
}
