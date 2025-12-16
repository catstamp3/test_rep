// quiz_common.js（解説対応版）

let currentIndex = 0;
let correctCount = 0;
let questions = [];

// DATA_FILE は quiz_xx.html 側で定義されている前提
fetch(DATA_FILE)
  .then(res => res.json())
  .then(data => {
    questions = data.questions;
    showQuestion();
  });

function showQuestion() {
  const q = questions[currentIndex];
  const container = document.getElementById("quiz-container");

  let html = `
    <h2>Q${q.no}</h2>
    <p>${q.question}</p>
  `;

  q.choices.forEach((choice, index) => {
    html += `
      <label>
        <input type="checkbox" name="choice" value="${index}">
        ${choice}
      </label><br>
    `;
  });

  html += `<button onclick="checkAnswer()">回答する</button>`;
  container.innerHTML = html;
}

function checkAnswer() {
  const q = questions[currentIndex];
  const checked = [...document.querySelectorAll("input[name=choice]:checked")]
    .map(el => Number(el.value))
    .sort();

  const correct = [...q.answer].sort();
  const isCorrect = JSON.stringify(checked) === JSON.stringify(correct);

  if (isCorrect) correctCount++;

  const container = document.getElementById("quiz-container");

  let html = isCorrect
    ? "<p>⭕ 正解！</p>"
    : "<p>❌ 不正解</p>";

  html += `<p>正解：${correct.map(i => i + 1).join("、")}</p>`;

  // ★ 解説表示（あれば）
  if (q.explanation) {
    html += `
      <div class="explanation">
        <strong>解説</strong><br>
        ${q.explanation}
      </div>
    `;
  }

  if (currentIndex === questions.length - 1) {
    html += `<p>${questions.length}問中${correctCount}問正解</p>`;
    html += `<button onclick="location.href='index.html'">トップへ戻る</button>`;
  } else {
    html += `<button onclick="nextQuestion()">次の問題に進む</button>`;
  }

  container.innerHTML = html;
}

function nextQuestion() {
  currentIndex++;
  showQuestion();
}
