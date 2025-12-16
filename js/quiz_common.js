// quiz_common.js（解説表示対応・安定版）

let currentIndex = 0;
let correctCount = 0;
let questions = [];

// DATA_FILE は quiz_xx.html 側で「01_org_user.json」のように定義
fetch(`data/${DATA_FILE}`)
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
    ? "<p style='color:green;'>⭕ 正解！</p>"
    : "<p style='color:red;'>❌ 不正解</p>";

  html += `<p>正解：${correct.map(i => i + 1).join("、")}</p>`;

  // ▼ 解説表示
  if (q.explanation) {
    html += `
      <div class="explanation" style="margin-top:12px;padding:10px;border:1px solid #ccc;">
        <strong>解説</strong><br>
        ${q.explanation.replace(/\n/g, "<br>")}
      </div>
    `;
  }

  // 進捗表示
  html += `<p>${currentIndex + 1}問目 / 全${questions.length}問</p>`;

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
