let quizData = [];
let currentIndex = 0;
let score = 0;
let userAnswers = JSON.parse(localStorage.getItem('quizAnswers')) || {};
let selectedChoices = [];

fetch('data.json')
  .then(res => res.json())
  .then(data => {
    quizData = data;
    showQuestion(currentIndex);
  });

function showQuestion(index) {
  const container = document.getElementById('quiz-container');
  container.innerHTML = '';
  selectedChoices = [];

  if (index >= quizData.length) {
    showResult();
    return;
  }

  const q = quizData[index];
  const card = document.createElement('div');
  card.className = 'question-card';

  const questionEl = document.createElement('h3');
  questionEl.innerText = q.question;
  card.appendChild(questionEl);

  q.choices.forEach((choice, i) => {
    const btn = document.createElement('button');
    btn.className = 'choice-btn';
    btn.innerText = choice;
    btn.onclick = () => toggleChoice(i, btn);
    card.appendChild(btn);
  });

  const submitBtn = document.createElement('button');
  submitBtn.innerText = '回答確定';
  submitBtn.style.marginTop = '10px';
  submitBtn.onclick = () => showExplanation(q.answer, q.explanation);
  card.appendChild(submitBtn);

  container.appendChild(card);
}

function toggleChoice(i, btn) {
  if (selectedChoices.includes(i)) {
    selectedChoices = selectedChoices.filter(x => x !== i);
    btn.classList.remove('selected');
  } else {
    selectedChoices.push(i);
    btn.classList.add('selected');
  }
}

function showExplanation(correct, explanation) {
  const buttons = document.querySelectorAll('.choice-btn');
  buttons.forEach((btn, i) => {
    if (correct.includes(i)) btn.classList.add('correct');
    if (selectedChoices.includes(i) && !correct.includes(i)) btn.classList.add('wrong');
    btn.disabled = true;
  });

  const isCorrect = correct.length === selectedChoices.length &&
                    correct.every(val => selectedChoices.includes(val));
  if (isCorrect) score++;

  userAnswers[quizData[currentIndex].id] = selectedChoices;
  localStorage.setItem('quizAnswers', JSON.stringify(userAnswers));

  const container = document.getElementById('quiz-container');
  const explanationEl = document.createElement('p');
  explanationEl.style.marginTop = '10px';
  explanationEl.style.fontStyle = 'italic';
  explanationEl.innerText = `解説: ${explanation}`;
  container.appendChild(explanationEl);

  const nextBtn = document.createElement('button');
  nextBtn.innerText = '次の問題へ';
  nextBtn.style.marginTop = '10px';
  nextBtn.onclick = () => {
    currentIndex++;
    showQuestion(currentIndex);
  };
  container.appendChild(nextBtn);
}

function showResult() {
  const container = document.getElementById('quiz-container');
  container.innerHTML = `<h2>得点: ${score} / ${quizData.length}</h2>`;
}
